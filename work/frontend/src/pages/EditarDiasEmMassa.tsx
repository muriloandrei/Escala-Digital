import { useMemo, useState } from 'react';
import { ApiError, getJson, postJson, type DiaEscala, type Funcionario } from '../api';
import { createOperationId } from '../operationId';
import { validateStandardHours, type StandardHours } from '../shiftValidation';
import { autofillStandardHours } from '../shiftAutofill';
import { toPayloadDay, type PayloadDay } from './EditarDiaEscala';

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function onlyDate(value: string) { return String(value || '').slice(0, 10); }

function isProtected(day: DiaEscala) {
  return Boolean(day.FIXO_ESCALA || day.AUSENCIA_OBRIGATORIA
    || ['FER', 'AFA'].includes(String(day.PROGRAMACAO || '').toUpperCase()));
}

function workingShift(person: Funcionario, days: DiaEscala[]) {
  const reference = days.find((day) => String(day.PROGRAMACAO || 'TRB').toUpperCase() === 'TRB' && day.HR_ENT1);
  const apprentice = /APRENDIZ/i.test(person.FUNCAO_DESCR || '');
  const values = [person.HR_ENT1 || reference?.HR_ENT1, person.HR_SAI1 || reference?.HR_SAI1,
    person.HR_ENT2 || reference?.HR_ENT2, person.HR_SAI2 || reference?.HR_SAI2];
  if (!values[0] || !values[1] || (!apprentice && (!values[2] || !values[3]))) return null;
  return { hrEnt1: values[0], hrSai1: values[1], hrEnt2: apprentice ? null : values[2], hrSai2: apprentice ? null : values[3] };
}

function issueText(issue: unknown) {
  if (typeof issue === 'string') return issue;
  if (issue && typeof issue === 'object' && 'message' in issue) return String(issue.message);
  return String(issue);
}

function sameHours(day: DiaEscala | undefined, hours: StandardHours) {
  return day?.HR_ENT1 === hours.HR_ENT1 && day.HR_SAI1 === hours.HR_SAI1
    && day.HR_ENT2 === hours.HR_ENT2 && day.HR_SAI2 === hours.HR_SAI2;
}

export function EditarDiasEmMassa({ lojaId, mesRef, dates, people, allDays, initialDate, holidays, onClose, onSaved }: {
  lojaId: string; mesRef: string; dates: string[]; people: Funcionario[]; allDays: DiaEscala[];
  holidays: Record<string, string>;
  initialDate: string; onClose: () => void; onSaved: (count: number) => void;
}) {
  const futureDates = dates.filter((date) => date >= today());
  const [selectedDates, setSelectedDates] = useState<string[]>([futureDates.includes(initialDate) ? initialDate : futureDates[0]].filter(Boolean));
  const [mode, setMode] = useState<'F' | 'TRB' | 'HORARIO' | 'TROCA'>('F');
  const [hours, setHours] = useState<StandardHours>({ HR_ENT1: '08:00', HR_SAI1: '12:30', HR_ENT2: '13:40', HR_SAI2: '17:58' });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [justification, setJustification] = useState('');
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [error, setError] = useState('');

  const daysByPerson = useMemo(() => {
    const map = new Map<number, DiaEscala[]>();
    for (const day of allDays) {
      const id = Number(day.ESCFUNC_ID);
      const list = map.get(id) || [];
      list.push(day);
      map.set(id, list);
    }
    return map;
  }, [allDays]);
  const candidates = people.map((person) => {
    const days = daysByPerson.get(Number(person.ESCFUNC_ID)) || [];
    const targetDays = selectedDates.map((date) => days.find((item) => onlyDate(item.DT) === date));
    const shift = workingShift(person, days);
    const revisions = new Set(targetDays.map((day) => Number(day?.REVISAO)));
    const needsChange = targetDays.some((day) => mode === 'HORARIO'
      ? !sameHours(day, hours) : String(day?.PROGRAMACAO || '').toUpperCase() !== mode);
    const swapReady = selectedDates.length === 2 && targetDays.filter((day) => String(day?.PROGRAMACAO || '').toUpperCase() === 'TRB').length === 1
      && targetDays.filter((day) => String(day?.PROGRAMACAO || '').toUpperCase() === 'F').length === 1;
    const reason = !selectedDates.length ? 'Selecione um dia'
      : mode === 'TROCA' && !swapReady ? 'Escolha uma folga e um dia de trabalho'
      : targetDays.some((day) => !day) ? 'Dia sem escala gerada'
        : targetDays.some((day) => isProtected(day!)) ? 'Dia protegido na seleção'
          : revisions.size !== 1 || !Number.isInteger(Number(targetDays[0]?.REVISAO)) ? 'Revisões divergentes'
            : mode === 'HORARIO' && /APRENDIZ/i.test(person.FUNCAO_DESCR || '') ? 'Horário de aprendiz é fixo'
              : mode === 'HORARIO' && targetDays.some((day) => String(day?.PROGRAMACAO || '').toUpperCase() !== 'TRB') ? 'Dia sem trabalho na seleção'
                : mode !== 'TROCA' && !needsChange ? mode === 'F' ? 'Já em folga nos dias' : mode === 'TRB' ? 'Já trabalha nos dias' : 'Já usa este horário'
                  : (mode === 'TRB' || mode === 'TROCA') && !shift ? 'Sem horário-base' : '';
    return { person, days, targetDays, shift, reason };
  });
  const eligible = candidates.filter((item) => !item.reason);
  const visible = candidates.filter((item) => `${item.person.CHAPA} ${item.person.NOME}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  const selected = eligible.find((item) => Number(item.person.ESCFUNC_ID) === selectedId);
  const selectedDays = daysByPerson.get(Number(selectedId)) || [];

  function toggleDate(date: string) {
    if (busy || uncertain) return;
    if (!selectedDates.includes(date) && selectedDates.length >= (mode === 'TROCA' ? 2 : 7)) {
      setError(mode === 'TROCA' ? 'Escolha apenas os dois dias da troca.' : 'Selecione no máximo 7 dias por operação.');
      return;
    }
    setSelectedDates((current) => current.includes(date) ? current.filter((item) => item !== date) : [...current, date].sort());
    setIssues([]);
    setError('');
  }

  async function save() {
    if (busy || uncertain || !selectedDates.length || !selected) return;
    if (mode === 'HORARIO') {
      const invalid = validateStandardHours(hours);
      if (invalid) { setError(invalid); return; }
    }
    const note = justification.trim();
    if (note.length < 5 || note.length > 500) { setError('Informe uma justificativa de 5 a 500 caracteres.'); return; }
    let operacaoId: string;
    try { operacaoId = createOperationId(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Identificador indisponível.'); return; }
    setBusy(true);
    setIssues([]);
    setError('');
    const changes = new Map<number, Map<string, PayloadDay>>();
    const funcionarios = [selected].map(({ person, targetDays, days, shift }) => {
      const changed = new Map<string, PayloadDay>();
      const swapWork = mode === 'TROCA' ? targetDays.find((day) => String(day?.PROGRAMACAO || '').toUpperCase() === 'TRB') : null;
      for (const day of targetDays) {
        if (mode === 'HORARIO' ? sameHours(day, hours) : mode !== 'TROCA' && String(day!.PROGRAMACAO || '').toUpperCase() === mode) continue;
        const date = onlyDate(day!.DT);
        const nextMode = mode === 'TROCA' ? String(day!.PROGRAMACAO || '').toUpperCase() === 'TRB' ? 'F' : 'TRB' : mode === 'HORARIO' ? 'TRB' : mode;
        changed.set(date, { data: date, programacao: nextMode,
          hrEnt1: nextMode === 'F' ? null : mode === 'HORARIO' ? hours.HR_ENT1 : swapWork?.HR_ENT1 || shift!.hrEnt1!,
          hrSai1: nextMode === 'F' ? null : mode === 'HORARIO' ? hours.HR_SAI1 : swapWork?.HR_SAI1 || shift!.hrSai1!,
          hrEnt2: nextMode === 'F' ? null : mode === 'HORARIO' ? hours.HR_ENT2 : swapWork?.HR_ENT2 || shift!.hrEnt2 || null,
          hrSai2: nextMode === 'F' ? null : mode === 'HORARIO' ? hours.HR_SAI2 : swapWork?.HR_SAI2 || shift!.hrSai2 || null,
          justificativa: note });
      }
      changes.set(Number(person.ESCFUNC_ID), changed);
      return { escfuncId: Number(person.ESCFUNC_ID), revisaoBase: Number(targetDays[0]!.REVISAO), chapa: person.CHAPA,
        nome: person.NOME, funcao: person.FUNCAO_DESCR || null, escsecaoId: person.ESCSECAO_ID,
        escfuncaoId: person.ESCFUNCAO_ID, aprendiz: /APRENDIZ/i.test(person.FUNCAO_DESCR || ''),
        dias: days.map((item) => changed.get(onlyDate(item.DT)) || toPayloadDay(item)) };
    });
    const payload = { lojaId: Number(lojaId), mesRef, operacaoId, funcionarios, oficializada: 0 };
    try {
      const validation = await postJson<{ ok: boolean; errors: unknown[] }>('/api/escalas/validar', payload);
      if (!validation.ok) { setIssues((validation.errors || []).map(issueText)); return; }
      let saved: { saved: { escfuncId?: number; revisao: number }[] } | null = null;
      try {
        saved = await postJson('/api/escalas/funcionarios/revisao', payload);
      } catch (reason) {
        if (reason instanceof ApiError && reason.status < 500) throw reason;
        const confirmation = await getJson<{ confirmada: boolean }>(`/api/escalas/operacoes/${payload.operacaoId}?${new URLSearchParams({ lojaId, mesRef })}`).catch(() => null);
        if (!confirmation?.confirmada) {
          setUncertain(true);
          throw new Error('Não foi possível confirmar a gravação. Recarregue a escala antes de tentar novamente.');
        }
      }
      if (saved && saved.saved?.length !== 1) {
        setUncertain(true);
        throw new Error('A API não confirmou todas as revisões. Recarregue a escala antes de repetir.');
      }
      const readback = await getJson<{ escala: { dias: DiaEscala[] } }>(`/api/escalas/mensal?${new URLSearchParams({ lojaId, mesRef })}`).catch(() => null);
      const confirmedDays = new Map<string, DiaEscala>();
      for (const day of readback?.escala.dias || []) confirmedDays.set(`${day.ESCFUNC_ID}:${onlyDate(day.DT)}`, day);
      const confirmed = [...(changes.get(Number(selected.person.ESCFUNC_ID)) || new Map()).entries()].every(([date, expected]) => {
          const row = confirmedDays.get(`${selected.person.ESCFUNC_ID}:${date}`);
          const actual = row && toPayloadDay(row);
          return actual && (!saved || Number(row.REVISAO) === Number(saved.saved[0].revisao))
            && (['programacao', 'hrEnt1', 'hrSai1', 'hrEnt2', 'hrSai2'] as const).every((key) => actual[key] === expected[key]);
      });
      if (!confirmed) {
        setUncertain(true);
        throw new Error('A leitura de volta não confirmou todos os dias. Recarregue a escala antes de repetir.');
      }
      onSaved(1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a edição em massa.');
    } finally { setBusy(false); }
  }

  return <div className="confirm-backdrop" role="presentation"><div className="confirm-dialog bulk-editor" role="dialog" aria-modal="true" aria-labelledby="bulk-editor-title">
    <h2 id="bulk-editor-title">Editar distribuição</h2><p>Selecione um funcionário e os dias que deseja alterar.</p>
    <label className="bulk-search">Buscar funcionário<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou matrícula" /></label>
    <div className="bulk-people-list">{visible.map(({ person }) => <label key={person.ESCFUNC_ID}><input type="radio" name="bulk-employee" checked={selectedId === Number(person.ESCFUNC_ID)} disabled={busy || uncertain} onChange={() => { setSelectedId(Number(person.ESCFUNC_ID)); setSelectedDates([]); setIssues([]); setError(''); }} /><span><strong>{person.CHAPA} · {person.NOME}</strong></span></label>)}</div>
    <div className="bulk-editor-controls"><div className="segmented" role="group" aria-label="Programação"><button className={mode === 'F' ? 'selected' : ''} type="button" disabled={busy || uncertain} onClick={() => { setMode('F'); setSelectedDates([]); setIssues([]); }}>Folga</button>
        <button className={mode === 'TRB' ? 'selected' : ''} type="button" disabled={busy || uncertain} onClick={() => { setMode('TRB'); setSelectedDates([]); setIssues([]); }}>Trabalho</button>
        <button className={mode === 'HORARIO' ? 'selected' : ''} type="button" disabled={busy || uncertain} onClick={() => { setMode('HORARIO'); setSelectedDates([]); setIssues([]); }}>Horário</button>
        <button className={mode === 'TROCA' ? 'selected' : ''} type="button" disabled={busy || uncertain} onClick={() => { setMode('TROCA'); setSelectedDates([]); setIssues([]); }}>Trocar folga</button></div></div>
    {mode === 'HORARIO' && <div className="bulk-hours">
      {([['HR_ENT1', 'Entrada'], ['HR_SAI1', 'Saída intervalo'], ['HR_ENT2', 'Retorno'], ['HR_SAI2', 'Saída']] as const).map(([key, label]) =>
        <label key={key}>{label}<input type="time" value={hours[key]} disabled={busy || uncertain} onChange={(event) => { const next = autofillStandardHours(hours, key, event.target.value); if (next) { setHours(next); setError(''); setIssues([]); } else setError('O horário não cabe no mesmo dia mantendo 08:48 de trabalho e 01:10 de intervalo.'); }} /></label>)}
      <span>Jornada do dia: 08:48. O horário-base do funcionário não muda.</span>
    </div>}
    {!futureDates.length && <div className="notice error">Não há dias futuros neste período.</div>}
    <fieldset className="bulk-dates" disabled={busy || uncertain || !selectedId}><legend>Dias ({selectedDates.length}/{mode === 'TROCA' ? 2 : 7})</legend><div className="bulk-calendar">
      {dates.map((item) => { const day = selectedDays.find((entry) => onlyDate(entry.DT) === item); const code = String(day?.PROGRAMACAO || '').toUpperCase(); const protectedDay = day && isProtected(day); return <button key={item} type="button" className={`${selectedDates.includes(item) ? 'selected' : ''} ${code === 'TRB' ? 'work' : code ? 'rest' : ''}`} disabled={item < today() || !day || Boolean(protectedDay)} aria-pressed={selectedDates.includes(item)} title={`${item}${holidays[item] ? ` · ${holidays[item]}` : ''}${protectedDay ? ' · protegido' : ''}`} onClick={() => toggleDate(item)}><small>{new Date(`${item}T00:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'short' })}</small><strong>{item.slice(8)}/{item.slice(5, 7)}</strong><span>{code === 'TRB' ? day?.HR_ENT1 || 'TRB' : code || '–'}</span></button>; })}
    </div></fieldset>
    {selectedId && !selected && selectedDates.length > 0 && <div className="notice warning">{candidates.find((item) => Number(item.person.ESCFUNC_ID) === selectedId)?.reason}</div>}
    <label className="bulk-search">Justificativa<input value={justification} maxLength={500} disabled={busy || uncertain} onChange={(event) => setJustification(event.target.value)} placeholder="Motivo da alteração" /></label>
    {!!issues.length && <div className="notice error bulk-issues" role="alert"><strong>Críticas da escala</strong><ul>{issues.slice(0, 10).map((issue, index) => <li key={index}>{issue}</li>)}</ul>{issues.length > 10 && <span>Mais {issues.length - 10} crítica(s).</span>}</div>}
    {error && <div className="notice error" role="alert">{error}</div>}
    <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button><button className="button primary" type="button" disabled={busy || uncertain || !selected || !selectedDates.length} onClick={save}>{busy ? 'Validando...' : `Salvar ${selectedDates.length} dia(s)`}</button></div>
  </div></div>;
}
