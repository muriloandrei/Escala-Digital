import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJson } from '../api';

type Section = {
  escsecaoId: number; secao: string; codigo: string; funcionarios: number;
  previstos: number; preenchidos: number; percentual: number; criticas: number;
  completa: boolean; oficializada: boolean;
};
type Group = Section & { partes: Section[] };

export function ProgressoEscalaModal({ lojaId, mesRef, onClose }: {
  lojaId: string; mesRef: string; onClose: () => void;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ progresso: { grupos: Group[] } }>(`/api/escalas/progresso?${new URLSearchParams({ lojaId, mesRef })}`, controller.signal)
      .then(({ progresso }) => { setGroups(progresso.grupos); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [lojaId, mesRef, reload]);

  return createPortal(<div className="confirm-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <div className="confirm-dialog progress-dialog" role="dialog" aria-modal="true" aria-labelledby="progress-title">
      <div className="progress-modal-head">
        <div><h2 id="progress-title">Progresso da escala · Loja {lojaId}</h2><span>{mesRef.slice(0, 7)}</span></div>
        <div className="progress-modal-actions">
          <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button>
          <button ref={closeButton} className="icon-action" type="button" title="Fechar progresso" aria-label="Fechar progresso" onClick={onClose}><X size={18} /></button>
        </div>
      </div>
      {error && <div className="notice error" role="alert">{error}</div>}
      {loading ? <div className="empty-state" role="status">Carregando progresso...</div>
        : !groups.length ? <div className="empty-state">Nenhuma seção ativa com funcionários nesta escala.</div>
          : <div className="progress-list">{groups.map((section) => <div className="progress-row" key={section.escsecaoId}>
            <div className="progress-row-heading"><strong>{section.codigo} · {section.secao}</strong><span>{section.oficializada ? 'Oficializada' : section.completa ? 'Concluída' : 'Em andamento'}</span></div>
            <progress className={section.oficializada ? 'official' : ''} max="100" value={section.percentual} aria-label={`Progresso de ${section.secao}: ${section.percentual}%`} />
            <div className="progress-row-meta"><span>{section.percentual}% · {section.preenchidos}/{section.previstos} dias · {section.funcionarios} funcionário(s)</span>
              {section.criticas > 0 && <span className="progress-critique">{section.criticas} crítica(s)</span>}
              {section.partes.length === 1 && <Link onClick={onClose} to={`/escalas/${lojaId}/${mesRef}?secao=${section.escsecaoId}`}>Abrir seção</Link>}</div>
            {section.partes.length > 1 && <div className="progress-parts">{section.partes.map((part) => <div className="progress-part" key={part.escsecaoId}>
              <span>{part.codigo} · {part.secao}</span>
              <span>{part.oficializada ? 'Oficializada' : `${part.percentual}% · ${part.preenchidos}/${part.previstos} dias`}</span>
              <Link onClick={onClose} to={`/escalas/${lojaId}/${mesRef}?secao=${part.escsecaoId}`}>Abrir seção</Link>
            </div>)}</div>}
          </div>)}</div>}
    </div>
  </div>, document.body);
}
