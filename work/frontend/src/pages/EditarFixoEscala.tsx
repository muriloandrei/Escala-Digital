import { useState } from 'react';
import { getJson, postJson, type DiaEscala, type EscalaMensal, type FixoEscala, type Funcionario } from '../api';
import { validateStandardHours, type StandardHours } from '../shiftValidation';
import { validate12x36Hours } from '../shiftValidation';
import { isDutyDay12x36 } from '../workRegime';
import { autofillStandardHours } from '../shiftAutofill';
import { ShiftProfileSelect } from '../ShiftProfileSelect';
import { apprenticeHoursFromStart, autofillApprenticeHours, validateApprenticeHours } from '../apprenticeHours';

export function EditarFixoEscala({
  lojaId, mesRef, employee, date, existing, generatedDay, reference, holidayName, domingo6hHabilitado = false, onClose, onSaved,
}: {
  lojaId: string;
  mesRef: string;
  employee: Funcionario;
  date: string;
  existing?: FixoEscala;
  generatedDay?: DiaEscala;
  reference?: DiaEscala;
  holidayName?: string;
  domingo6hHabilitado?: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const workDay = generatedDay?.PROGRAMACAO === 'TRB' ? generatedDay : reference;
  const apprentice = /APRENDIZ/i.test(employee.FUNCAO_DESCR || '');
  const plantao12x36 = employee.REGIME_ESCALA === '12X36';
  const diaPlantao = plantao12x36 && isDutyDay12x36(employee.DT_ANCORA_12X36 || '', date);
  const domingo6h = !plantao12x36 && domingo6hHabilitado && new Date(`${date}T12:00:00`).getDay() === 0 && !apprentice;
  const [profile, setProfile] = useState({ work: plantao12x36 ? 660 : domingo6h ? 360 : 528, interval: plantao12x36 ? 60 : 70 });
  const [mode, setMode] = useState<'FXF' | 'TRB'>(existing?.PROGRAMACAO === 'TRB' || plantao12x36 && diaPlantao ? 'TRB' : 'FXF');
  const [hours, setHours] = useState<StandardHours>(() => {
    if (apprentice) return apprenticeHoursFromStart((existing?.PROGRAMACAO === 'TRB' ? existing.HR_ENT1 : workDay?.HR_ENT1) || employee.HR_ENT1 || '08:00')
      || apprenticeHoursFromStart('08:00')!;
    const base = {
      HR_ENT1: existing?.PROGRAMACAO === 'TRB' ? existing.HR_ENT1 || '' : workDay?.HR_ENT1 || '',
      HR_SAI1: existing?.PROGRAMACAO === 'TRB' ? existing.HR_SAI1 || '' : workDay?.HR_SAI1 || '',
      HR_ENT2: existing?.PROGRAMACAO === 'TRB' ? existing.HR_ENT2 || '' : workDay?.HR_ENT2 || '',
      HR_SAI2: existing?.PROGRAMACAO === 'TRB' ? existing.HR_SAI2 || '' : workDay?.HR_SAI2 || '',
    };
    return domingo6h ? autofillStandardHours(base, 'HR_ENT1', base.HR_ENT1 || '08:00', 360) || base : base;
  });
  const [justification, setJustification] = useState(existing?.JUSTIFICATIVA || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const base = {
    lojaId: Number(lojaId), mesRef, escfuncId: Number(employee.ESCFUNC_ID),
    escsecaoId: Number(generatedDay?.ESCSECAO_ID_ESCALA || employee.ESCSECAO_ID_ESCALA || existing?.ESCSECAO_ID || employee.ESCSECAO_ID), DT: date,
  };

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || uncertain) return;
    const invalid = mode === 'TRB' ? plantao12x36 ? validate12x36Hours(hours)
      : apprentice ? validateApprenticeHours(hours) : validateStandardHours(hours, profile.work, profile.interval) : '';
    if (invalid) { setError(invalid); return; }
    setBusy(true);
    setError('');
    try {
      await postJson('/api/escalas/fixos', {
        ...base, PROGRAMACAO: mode,
        ...(mode === 'TRB' ? { ...hours, HR_ENT2: apprentice ? null : hours.HR_ENT2,
          HR_SAI2: apprentice ? null : hours.HR_SAI2 } : {}),
        JUSTIFICATIVA: justification.trim() || null,
      });
      try {
        const { escala } = await getJson<{ escala: EscalaMensal }>(
          `/api/escalas/mensal?${new URLSearchParams({ lojaId, mesRef })}`,
        );
        const fixo = escala.fixos?.find((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID)
          && String(item.DT).slice(0, 10) === date);
        const dia = escala.dias.find((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID)
          && String(item.DT).slice(0, 10) === date);
        const expectedHours = mode === 'TRB' ? hours : {
          HR_ENT1: 'FXF', HR_SAI1: 'FXF', HR_ENT2: 'FXF', HR_SAI2: 'FXF',
        };
        if (!fixo || fixo.PROGRAMACAO !== mode
          || (generatedDay && (!dia || dia.PROGRAMACAO !== mode))
          || (mode === 'TRB' && (['HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'] as const)
            .some((key) => (fixo[key] || null) !== (expectedHours[key] || null)
              || (generatedDay && (dia?.[key] || null) !== (expectedHours[key] || null))))) {
          throw new Error('A leitura de volta não confirmou o horário.');
        }
      } catch {
        setUncertain(true);
        throw new Error('Não foi possível confirmar a atualização na escala. Recarregue antes de tentar novamente.');
      }
      onSaved(`${mode === 'FXF' ? 'Folga fixa salva.' : 'Horário fixo salvo.'}${Number(generatedDay?.OFICIALIZADA) === 1 ? ' Reoficialização necessária.' : ''}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o fixo.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!existing || busy || uncertain) return;
    setBusy(true);
    setError('');
    try {
      const result = await postJson<{ result: { removed: boolean } }>('/api/escalas/fixos/remover', {
        ...base, escsecaoId: Number(existing.ESCSECAO_ID),
      });
      if (!result.result?.removed) throw new Error('O fixo não foi encontrado. Atualize a escala.');
      const { escala } = await getJson<{ escala: EscalaMensal }>(
        `/api/escalas/mensal?${new URLSearchParams({ lojaId, mesRef })}`,
      );
      const fixed = escala.fixos?.some((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID)
        && String(item.DT).slice(0, 10) === date);
      const day = escala.dias.find((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID)
        && String(item.DT).slice(0, 10) === date);
      const expected = existing.PROGRAMACAO === 'TRB' ? 'TRB' : 'F';
      if (fixed || (generatedDay && (!day || day.PROGRAMACAO !== expected))) {
        setUncertain(true);
        throw new Error('A remoção não foi confirmada na escala. Recarregue antes de tentar novamente.');
      }
      onSaved(generatedDay ? `Fixo removido; dia convertido em ${expected === 'F' ? 'folga' : 'trabalho'} normal.${Number(generatedDay.OFICIALIZADA) === 1 ? ' Reoficialização necessária.' : ''}` : 'Fixo removido; o dia será preenchido na geração da escala.');
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
    {Number(generatedDay?.OFICIALIZADA) === 1 && <div className="notice warning" role="status">Esta alteração criará uma nova revisão. A escala precisará ser oficializada novamente.</div>}
    {holidayName && <div className="notice warning" role="status">Feriado nacional: {holidayName}.</div>}
    {plantao12x36 && <div className="notice" role="status">{diaPlantao ? 'Dia de plantão 12x36.' : 'Dia de descanso 12x36.'}</div>}
    <div className="segmented day-editor-mode" role="group" aria-label="Tipo de fixo">
      <button type="button" className={mode === 'FXF' ? 'selected' : ''} disabled={plantao12x36 && diaPlantao} onClick={() => { setMode('FXF'); setError(''); }}>Folga fixa</button>
      <button type="button" className={mode === 'TRB' ? 'selected' : ''} disabled={plantao12x36 && !diaPlantao} onClick={() => { setMode('TRB'); setError(''); }}>Horário fixo</button>
    </div>
    {mode === 'TRB' && <div className="day-editor-times">
      {!apprentice && !plantao12x36 && <ShiftProfileSelect sundayOnly={domingo6h} postStore={Number(lojaId) >= 700 && Number(lojaId) <= 799} onSelect={(item) => {
        setProfile({ work: item.JORNADA_MINUTOS, interval: item.INTERVALO_MINUTOS });
        setHours({ HR_ENT1: item.HR_ENT1, HR_SAI1: item.HR_SAI1, HR_ENT2: item.HR_ENT2, HR_SAI2: item.HR_SAI2 });
        setError('');
      }} />}
      {(apprentice ? [['HR_ENT1', 'Entrada'], ['HR_SAI1', 'Saída']] as const
        : [['HR_ENT1', 'Entrada'], ['HR_SAI1', 'Saída intervalo'], ['HR_ENT2', 'Retorno'], ['HR_SAI2', 'Saída']] as const)
        .map(([key, label]) => <label key={key}>{label}<input type="time" required value={hours[key]} onChange={(event) => { const next = apprentice
          ? autofillApprenticeHours(key as 'HR_ENT1' | 'HR_SAI1', event.target.value)
          : autofillStandardHours(hours, key, event.target.value, profile.work, profile.interval);
          if (next) { setHours(next); setError(''); }
          else setError(apprentice ? 'Não foi possível ajustar o horário mantendo 05:15 de trabalho.' : 'Não foi possível manter a jornada e o intervalo selecionados.'); }} /></label>)}
    </div>}
    <label className="day-editor-justification">Justificativa<input maxLength={500} value={justification} onChange={(event) => setJustification(event.target.value)} placeholder="Opcional" /></label>
    {error && <div className="notice error" role="alert">{error}</div>}
    <div className="confirm-actions">
      {existing && <button className="button secondary" type="button" disabled={busy || uncertain} onClick={remove}>Remover fixo</button>}
      <button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button>
      <button className="button primary" type="submit" disabled={busy || uncertain}>{busy ? 'Salvando...' : 'Salvar fixo'}</button>
    </div>
  </form></div>;
}
