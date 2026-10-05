import { useState } from 'react';
import { postJson, type DiaEscala, type FixoEscala, type Funcionario } from '../api';
import { validateStandardHours, type StandardHours } from '../shiftValidation';

export function EditarFixoEscala({
  lojaId, mesRef, employee, date, existing, reference, holidayName, onClose, onSaved,
}: {
  lojaId: string;
  mesRef: string;
  employee: Funcionario;
  date: string;
  existing?: FixoEscala;
  reference?: DiaEscala;
  holidayName?: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [mode, setMode] = useState<'FXF' | 'TRB'>(existing?.PROGRAMACAO === 'TRB' ? 'TRB' : 'FXF');
  const [hours, setHours] = useState<StandardHours>({
    HR_ENT1: existing?.PROGRAMACAO === 'TRB' ? existing.HR_ENT1 || '' : reference?.HR_ENT1 || '',
    HR_SAI1: existing?.PROGRAMACAO === 'TRB' ? existing.HR_SAI1 || '' : reference?.HR_SAI1 || '',
    HR_ENT2: existing?.PROGRAMACAO === 'TRB' ? existing.HR_ENT2 || '' : reference?.HR_ENT2 || '',
    HR_SAI2: existing?.PROGRAMACAO === 'TRB' ? existing.HR_SAI2 || '' : reference?.HR_SAI2 || '',
  });
  const [justification, setJustification] = useState(existing?.JUSTIFICATIVA || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const apprentice = /APRENDIZ/i.test(employee.FUNCAO_DESCR || '');
  const base = {
    lojaId: Number(lojaId), mesRef, escfuncId: Number(employee.ESCFUNC_ID),
    escsecaoId: Number(employee.ESCSECAO_ID), DT: date,
  };

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (holidayName && mode === 'FXF') { setError(`Feriado nacional (${holidayName}): folga fixa não pode ser lançada nesta data.`); return; }
    const invalid = mode === 'TRB' ? validateStandardHours(hours) : '';
    if (invalid) { setError(invalid); return; }
    setBusy(true);
    setError('');
    try {
      await postJson('/api/escalas/fixos', {
        ...base, PROGRAMACAO: mode,
        ...(mode === 'TRB' ? hours : {}),
        JUSTIFICATIVA: justification.trim() || null,
      });
      onSaved(mode === 'FXF' ? 'Folga fixa salva.' : 'Horário fixo salvo.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o fixo.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!existing || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await postJson<{ result: { removed: boolean } }>('/api/escalas/fixos/remover', base);
      if (!result.result?.removed) throw new Error('O fixo não foi encontrado. Atualize a escala.');
      onSaved('Fixo removido.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível remover o fixo.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => {
    if (event.key === 'Escape' && !busy) onClose();
  }}><form className="confirm-dialog day-editor" role="dialog" aria-modal="true" aria-labelledby="fixed-title" onSubmit={save}>
    <h2 id="fixed-title">{existing ? 'Editar fixo' : 'Adicionar fixo'} · {new Date(`${date}T00:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</h2>
    <p><strong>{employee.NOME}</strong> · {employee.CHAPA}</p>
    {holidayName && <div className="notice warning" role="status">Feriado nacional: {holidayName}. Não lance folga fixa neste dia.</div>}
    <div className="segmented day-editor-mode" role="group" aria-label="Tipo de fixo">
      <button type="button" className={mode === 'FXF' ? 'selected' : ''} disabled={Boolean(holidayName)} onClick={() => { setMode('FXF'); setError(''); }}>Folga fixa</button>
      {!apprentice && <button type="button" className={mode === 'TRB' ? 'selected' : ''} onClick={() => { setMode('TRB'); setError(''); }}>Horário fixo</button>}
    </div>
    {mode === 'TRB' && <div className="day-editor-times">
      {([['HR_ENT1', 'Entrada'], ['HR_SAI1', 'Saída intervalo'], ['HR_ENT2', 'Retorno'], ['HR_SAI2', 'Saída']] as const).map(([key, label]) => <label key={key}>{label}<input type="time" required value={hours[key]} onChange={(event) => { setHours((current) => ({ ...current, [key]: event.target.value })); setError(''); }} /></label>)}
    </div>}
    <label className="day-editor-justification">Justificativa<input maxLength={500} value={justification} onChange={(event) => setJustification(event.target.value)} placeholder="Opcional" /></label>
    {error && <div className="notice error" role="alert">{error}</div>}
    <div className="confirm-actions">
      {existing && <button className="button secondary" type="button" disabled={busy} onClick={remove}>Remover fixo</button>}
      <button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button>
      <button className="button primary" type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar fixo'}</button>
    </div>
  </form></div>;
}
