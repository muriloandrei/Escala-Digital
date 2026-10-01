import { useEffect, useState } from 'react';
import { getJson, patchJson, postJson, type Funcionario, type Subsecao } from '../api';

type TransferResult = { destination: string; warning?: string; scheduled?: string };
type ScheduledTransfer = {
  TRANSF_ID: number;
  VIGENCIA: string;
  STATUS: string;
  DESTINO_NOME?: string;
  ERRO?: string;
};

export function TransferirSubsecao({
  lojaId,
  mesRef,
  employee,
  subsecoes,
  initialDestination,
  canRetry = false,
  onClose,
  onTransferred,
}: {
  lojaId: string;
  mesRef?: string;
  employee: Funcionario;
  subsecoes: Subsecao[];
  initialDestination?: string;
  canRetry?: boolean;
  onClose: () => void;
  onTransferred: (result: TransferResult) => void;
}) {
  const destinations = subsecoes.filter(
    (item) => item.STATUS !== 'I' && Number(item.ESCSUBSECAO_ID) !== Number(employee.ESCSUBSECAO_ID),
  );
  const [destination, setDestination] = useState(
    destinations.some((item) => String(item.ESCSUBSECAO_ID) === initialDestination)
      ? initialDestination!
      : String(destinations[0]?.ESCSUBSECAO_ID || ''),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState<TransferResult | null>(null);
  const [vigencia, setVigencia] = useState('IMEDIATO');
  const [scheduled, setScheduled] = useState<ScheduledTransfer[]>([]);

  async function retryTransfer(transfId: number) {
    setBusy(true);
    setError('');
    try {
      await postJson(`/api/catalog/lojas/${encodeURIComponent(lojaId)}/funcionarios/${employee.ESCFUNC_ID}/transferencias/${transfId}/retomar`, {});
      setScheduled((items) => items.map((item) => item.TRANSF_ID === transfId ? { ...item, STATUS: 'P', ERRO: '' } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível retomar a transferência.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ transferencias: ScheduledTransfer[] }>(
      `/api/catalog/lojas/${encodeURIComponent(lojaId)}/funcionarios/${employee.ESCFUNC_ID}/transferencias`,
      controller.signal,
    ).then((data) => setScheduled(data.transferencias || []))
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); });
    return () => controller.abort();
  }, [lojaId, employee.ESCFUNC_ID]);

  async function transfer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destination || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await patchJson<{ agendamento?: { vigencia: string } }>(
        `/api/catalog/lojas/${encodeURIComponent(lojaId)}/funcionarios/${employee.ESCFUNC_ID}/subsecao`,
        {
          ESCSECAO_ID: Number(employee.ESCSECAO_ID),
          ESCSUBSECAO_ID: Number(destination),
          ...(mesRef ? { MES_REF: mesRef } : {}),
          VIGENCIA: vigencia,
        },
      );
      const result: TransferResult = { destination };
      if (response.agendamento) {
        result.scheduled = response.agendamento.vigencia;
        onTransferred(result);
        return;
      }
      try {
        const refreshed = await getJson<{ funcionarios: Funcionario[] }>(
          `/api/catalog/lojas/${encodeURIComponent(lojaId)}/funcionarios`,
        );
        const saved = refreshed.funcionarios.find((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID));
        if (!saved || Number(saved.ESCSUBSECAO_ID) !== Number(destination)) {
          throw new Error('A leitura do cadastro não confirmou a subseção de destino.');
        }
      } catch (reason) {
        result.warning = `A transferência foi enviada, mas não foi possível confirmar o cadastro: ${reason instanceof Error ? reason.message : 'erro desconhecido'}. Atualize antes de tentar novamente.`;
        setWarning(result);
        return;
      }
      if (mesRef) {
        try {
          await postJson('/api/escalas/gerar-secao', {
            lojaId: Number(lojaId),
            mesRef,
            escsecaoId: Number(employee.ESCSECAO_ID),
            escfuncIds: [Number(employee.ESCFUNC_ID)],
          });
        } catch (reason) {
          result.warning = `A subseção foi alterada, mas a escala individual não foi regenerada: ${reason instanceof Error ? reason.message : 'erro desconhecido'}. Revise a escala antes de continuar.`;
          setWarning(result);
          return;
        }
      }
      onTransferred(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível transferir o funcionário.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => {
      if (event.key === 'Escape' && !busy && !warning) onClose();
    }}>
      <form className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="transfer-title" onSubmit={transfer}>
        <h2 id="transfer-title">Transferir {employee.NOME}</h2>
        {warning ? (
          <>
            <div className="notice error" role="alert">{warning.warning}</div>
            <div className="confirm-actions">
              <button className="button primary" type="button" onClick={() => onTransferred(warning)}>Atualizar escala</button>
            </div>
          </>
        ) : (
          <>
            <p>{vigencia === 'IMEDIATO'
              ? `A vinculação muda imediatamente. ${mesRef ? 'A escala deste funcionário será recalculada somente de hoje em diante.' : 'Escalas existentes não serão recalculadas nesta tela.'}`
              : 'A vinculação permanece como está até a data de vigência. Depois, o sistema regerará somente os dias futuros deste funcionário.'}</p>
            <label className="transfer-field">Nova subseção
              <select required value={destination} onChange={(event) => setDestination(event.target.value)} disabled={busy}>
                {!destinations.length && <option value="">Nenhuma subseção disponível</option>}
                {destinations.map((item) => <option key={item.ESCSUBSECAO_ID} value={item.ESCSUBSECAO_ID}>{item.DESCR}</option>)}
              </select>
            </label>
            <label className="transfer-field">A partir de quando?
              <select value={vigencia} onChange={(event) => setVigencia(event.target.value)} disabled={busy || scheduled.some((item) => ['P', 'E', 'F'].includes(item.STATUS))}>
                <option value="IMEDIATO">Imediatamente</option>
                <option value="PROXIMA_SEMANA">Próxima semana completa</option>
                <option value="PROXIMO_MES">Próximo mês operacional</option>
              </select>
            </label>
            {scheduled.filter((item) => ['P', 'E', 'F'].includes(item.STATUS)).map((item) => (
              <div className={item.STATUS === 'F' ? 'notice error' : 'notice warning'} key={item.TRANSF_ID}>
                {item.STATUS === 'F' ? 'Transferência não concluída' : 'Transferência agendada'} para {item.DESTINO_NOME || 'outra subseção'} em {item.VIGENCIA}.
                {item.ERRO && <small className="table-subline">{item.ERRO}</small>}
                {item.STATUS === 'F' && canRetry && <button className="button secondary" type="button" disabled={busy} onClick={() => retryTransfer(item.TRANSF_ID)}>Retomar</button>}
              </div>
            ))}
            {error && <div className="notice error" role="alert">{error}</div>}
            <div className="confirm-actions">
              <button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button>
              <button className="button primary" type="submit" disabled={busy || !destination || scheduled.some((item) => ['P', 'E', 'F'].includes(item.STATUS))}>{busy ? 'Aguarde...' : vigencia === 'IMEDIATO' ? 'Confirmar transferência' : 'Agendar transferência'}</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
