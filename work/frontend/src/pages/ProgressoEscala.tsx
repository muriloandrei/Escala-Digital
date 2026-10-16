import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getJson } from '../api';

type Section = {
  escsecaoId: number; secao: string; codigo: string; funcionarios: number;
  previstos: number; preenchidos: number; percentual: number; criticas: number;
  completa: boolean; oficializada: boolean;
};

export function ProgressoEscala() {
  const { lojaId, mesRef } = useParams();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!lojaId || !mesRef) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ progresso: { secoes: Section[] } }>(`/api/escalas/progresso?${new URLSearchParams({ lojaId, mesRef })}`, controller.signal)
      .then(({ progresso }) => { setSections(progresso.secoes); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [lojaId, mesRef, reload]);

  return <main className="content directory-page">
    <div className="page-heading"><div>
      <Link className="back-link" to={`/escalas/${lojaId}/${mesRef}`}><ArrowLeft size={15} /> Escala</Link>
      <h1>Progresso da escala · Loja {lojaId}</h1>
      <p>{mesRef?.slice(0, 7)}</p>
    </div><button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    {loading ? <div className="empty-state" role="status">Carregando progresso...</div>
      : !sections.length ? <div className="empty-state">Nenhuma seção ativa com funcionários nesta escala.</div>
        : <div className="list-surface progress-list">{sections.map((section) => <div className="progress-row" key={section.escsecaoId}>
          <div className="progress-row-heading"><strong>{section.codigo} · {section.secao}</strong><span>{section.oficializada ? 'Oficializada' : section.completa ? 'Concluída' : 'Em andamento'}</span></div>
          <progress className={section.oficializada ? 'official' : ''} max="100" value={section.percentual} aria-label={`Progresso de ${section.secao}: ${section.percentual}%`} />
          <div className="progress-row-meta"><span>{section.percentual}% · {section.preenchidos}/{section.previstos} dias · {section.funcionarios} funcionário(s)</span>
            {section.criticas > 0 && <span className="progress-critique">{section.criticas} crítica(s)</span>}
            <Link to={`/escalas/${lojaId}/${mesRef}?secao=${section.escsecaoId}`}>Abrir seção</Link></div>
        </div>)}</div>}
  </main>;
}
