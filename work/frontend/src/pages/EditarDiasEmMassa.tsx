import { useMemo, useState } from 'react';
import { ApiError, getJson, postJson, type DiaEscala, type Funcionario } from '../api';
import { toPayloadDay, type PayloadDay } from './EditarDiaEscala';

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function onlyDate(value: string) { return String(value || '').slice(0, 10); }

function isProtected(day: DiaEscala) {
  return Boolean(day.FIXO_ESCALA || day.AUSENCIA_OBRIGATORIA || Number(day.OFICIALIZADA) === 1
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

export function EditarDiasEmMassa({ lojaId, mesRef, dates, people, allDays, initialDate, onClose, onSaved }: {
  lojaId: string; mesRef: string; dates: string[]; people: Funcionario[]; allDays: DiaEscala[];
  initialDate: string; onClose: () => void; onSaved: (count: number) => void;
}) {
  const futureDates = dates.filter((date) => date >= today());
  const [date, setDate] = useState(futureDates.includes(initialDate) ? initialDate : futureDates[0] || '');
  const [mode, setMode] = useState<'F' | 'TRB'>('F');
  const [ids, setIds] = useState<number[]>([]);
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
    const day = days.find((item) => onlyDate(item.DT) === date);
    const shift = workingShift(person, days);
    const current = String(day?.PROGRAMACAO || 'TRB').toUpperCase();
    const reason = !day ? 'Sem dia gerado' : date < today() ? 'Dia anterior' : isProtected(day) ? 'Dia protegido'
      : !Number.isInteger(Number(day.REVISAO)) ? 'Sem revisão' : mode === 'F' && current === 'F' ? 'Já em folga'
        : mode === 'TRB' && current === 'TRB' ? 'Já trabalha' : mode === 'TRB' && !shift ? 'Sem horário-base' : '';
    return { person, days, day, shift, reason };
  });
  const eligible = candidates.filter((item) => !item.reason);
  const visible = candidates.filter((item) => `${item.person.CHAPA} ${item.person.NOME}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  const selected = eligible.filter((item) => ids.includes(Number(item.person.ESCFUNC_ID)));

  function selectAllVisible() {
    const available = visible.filter((item) => !item.reason).map((item) => Number(item.person.ESCFUNC_ID));
    setIds((current) => [...new Set([...current, ...available])]);
  }

  async function save() {
    if (busy || uncertain || !date || !selected.length || selected.length > 500) return;
    const note = justification.trim();
    if (note.length < 5 || note.length > 500) { setError('Informe uma justificativa de 5 a 500 caracteres.'); return; }
    if (!crypto.randomUUID) { setError('Este navegador não oferece identificador seguro para confirmar o rascunho.'); return; }
    setBusy(true);
    setIssues([]);
    setError('');
    const changes = new Map<number, PayloadDay>();
    const funcionarios = selected.map(({ person, day, days, shift }) => {
      const changed: PayloadDay = { data: date, programacao: mode,
        hrEnt1: mode === 'F' ? null : shift!.hrEnt1!, hrSai1: mode === 'F' ? null : shift!.hrSai1!,
        hrEnt2: mode === 'F' ? null : shift!.hrEnt2 || null, hrSai2: mode === 'F' ? null : shift!.hrSai2 || null,
        justificativa: note };
      changes.set(Number(person.ESCFUNC_ID), changed);
      return { escfuncId: Number(person.ESCFUNC_ID), revisaoBase: Number(day!.REVISAO), chapa: person.CHAPA,
        nome: person.NOME, funcao: person.FUNCAO_DESCR || null, escsecaoId: person.ESCSECAO_ID,
        escfuncaoId: person.ESCFUNCAO_ID, aprendiz: /APRENDIZ/i.test(person.FUNCAO_DESCR || ''),
        dias: days.map((item) => onlyDate(item.DT) === date ? changed : toPayloadDay(item)) };
    });
    const payload = { lojaId: Number(lojaId), mesRef, operacaoId: crypto.randomUUID(), funcionarios, oficializada: 0 };
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
      if (saved && saved.saved?.length !== selected.length) {
        setUncertain(true);
        throw new Error('A API não confirmou todas as revisões. Recarregue a escala antes de repetir.');
      }
      const readback = await getJson<{ escala: { dias: DiaEscala[] } }>(`/api/escalas/mensal?${new URLSearchParams({ lojaId, mesRef })}`).catch(() => null);
      const confirmed = selected.every(({ person }, index) => {
        const row = readback?.escala.dias.find((item) => Number(item.ESCFUNC_ID) === Number(person.ESCFUNC_ID) && onlyDate(item.DT) === date);
        const actual = row && toPayloadDay(row);
        const expected = changes.get(Number(person.ESCFUNC_ID));
        return actual && expected && (!saved || Number(row.REVISAO) === Number(saved.saved[index].revisao))
          && (['programacao', 'hrEnt1', 'hrSai1', 'hrEnt2', 'hrSai2'] as const).every((key) => actual[key] === expected[key]);
      });
      if (!confirmed) {
        setUncertain(true);
        throw new Error('A leitura de volta não confirmou todos os dias. Recarregue a escala antes de repetir.');
      }
      onSaved(selected.length);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a edição em massa.');
    } finally { setBusy(false); }
  }

  return <div className="confirm-backdrop" role="presentation"><div className="confirm-dialog bulk-editor" role="dialog" aria-modal="true" aria-labelledby="bulk-editor-title">
    <h2 id="bulk-editor-title">Editar dia em massa</h2><p>Somente os colaboradores selecionados nesta seção/subseção terão o dia alterado.</p>
    <div className="bulk-editor-controls"><label>Dia<select value={date} disabled={busy || uncertain || !futureDates.length} onChange={(event) => { setDate(event.target.value); setIds([]); setIssues([]); }}>
      {futureDates.map((item) => <option key={item} value={item}>{new Date(`${item}T00:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</option>)}</select></label>
      <div className="segmented" role="group" aria-label="Programação em massa"><button className={mode === 'F' ? 'selected' : ''} type="button" disabled={busy || uncertain} onClick={() => { setMode('F'); setIds([]); setIssues([]); }}>Folga</button>
        <button className={mode === 'TRB' ? 'selected' : ''} type="button" disabled={busy || uncertain} onClick={() => { setMode('TRB'); setIds([]); setIssues([]); }}>Trabalho</button></div></div>
    {!futureDates.length && <div className="notice error">Não há dias futuros neste período.</div>}
    <label className="bulk-search">Buscar colaborador<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou matrícula" /></label>
    <div className="bulk-select-bar"><span>{selected.length} selecionado(s) · {eligible.length} elegível(is)</span><button type="button" disabled={busy || uncertain} onClick={selectAllVisible}>Selecionar visíveis</button><button type="button" disabled={busy || uncertain} onClick={() => setIds([])}>Limpar</button></div>
    <div className="bulk-people-list">{visible.map(({ person, reason }) => <label key={person.ESCFUNC_ID} className={reason ? 'unavailable' : ''}><input type="checkbox" checked={ids.includes(Number(person.ESCFUNC_ID)) && !reason} disabled={Boolean(reason) || busy || uncertain} onChange={(event) => setIds((current) => event.target.checked ? [...current, Number(person.ESCFUNC_ID)] : current.filter((id) => id !== Number(person.ESCFUNC_ID)))} />
      <span><strong>{person.CHAPA} · {person.NOME}</strong>{reason && <small>{reason}</small>}</span></label>)}</div>
    <label className="bulk-search">Justificativa<input value={justification} maxLength={500} disabled={busy || uncertain} onChange={(event) => setJustification(event.target.value)} placeholder="Motivo da alteração" /></label>
    {!!issues.length && <div className="notice error bulk-issues" role="alert"><strong>Críticas da escala</strong><ul>{issues.slice(0, 10).map((issue, index) => <li key={index}>{issue}</li>)}</ul>{issues.length > 10 && <span>Mais {issues.length - 10} crítica(s).</span>}</div>}
    {error && <div className="notice error" role="alert">{error}</div>}
    <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button><button className="button primary" type="button" disabled={busy || uncertain || !selected.length || selected.length > 500 || !date} onClick={save}>{busy ? 'Validando...' : `Salvar ${selected.length} colaborador(es)`}</button></div>
  </div></div>;
}
