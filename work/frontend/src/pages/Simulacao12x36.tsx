import { useEffect, useMemo, useState } from 'react';
import { Pencil, Play, RefreshCw } from 'lucide-react';
import { getJson, patchJson, postJson, putJson, type Funcionario } from '../api';
import { validate12x36Hours } from '../shiftValidation';
import { isWeekStart } from '../scheduleWeeks';

type Hours = { HR_ENT1: string; HR_SAI1: string; HR_ENT2: string; HR_SAI2: string };
type SimDay = Hours & { ESCFUNC_ID: number; DIA: string; DT_ANCORA: string; PROGRAMACAO: 'TRB' | 'F' };
type Editor = { person: Funcionario; date?: string; anchor: string; hours: Hours };

const defaultHours: Hours = { HR_ENT1: '07:00', HR_SAI1: '12:30', HR_ENT2: '13:30', HR_SAI2: '19:00' };
const hourFields: [keyof Hours, string][] = [
  ['HR_ENT1', 'Entrada'], ['HR_SAI1', 'Saída intervalo'],
  ['HR_ENT2', 'Retorno'], ['HR_SAI2', 'Saída'],
];

function dayOfWeek(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`)).replace('.', '');
}

export function Simulacao12x36({ lojaId, mesRef, escsecaoId, dates, people, scopePeople, canEdit }: {
  lojaId: number; mesRef: string; escsecaoId: number; dates: string[];
  people: Funcionario[]; scopePeople: Funcionario[]; canEdit: boolean;
}) {
  const [days, setDays] = useState<SimDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);
  const [confirmGenerate, setConfirmGenerate] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const query = new URLSearchParams({ lojaId: String(lojaId), mesRef, escsecaoId: String(escsecaoId) });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ dias: SimDay[] }>(`/api/escalas/simulacao-12x36?${query}`, controller.signal)
      .then((result) => { setDays(result.dias || []); setLoading(false); })
      .catch((reason) => {
        if (reason.name === 'AbortError') return;
        setError(reason instanceof Error ? reason.message : 'Não foi possível ler a simulação.');
        setLoading(false);
      });
    return () => controller.abort();
  }, [lojaId, mesRef, escsecaoId, reload]);

  const byEmployee = useMemo(() => {
    const map = new Map<number, Map<string, SimDay>>();
    for (const day of days) {
      const id = Number(day.ESCFUNC_ID);
      if (!map.has(id)) map.set(id, new Map());
      map.get(id)!.set(day.DIA, day);
    }
    return map;
  }, [days]);
  const counts = dates.map((date) => {
    const work = people.filter((person) => byEmployee.get(Number(person.ESCFUNC_ID))?.get(date)?.PROGRAMACAO === 'TRB').length;
    const rest = people.filter((person) => byEmployee.get(Number(person.ESCFUNC_ID))?.get(date)?.PROGRAMACAO === 'F').length;
    return { work, rest };
  });

  async function generate() {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await postJson<{ resultado: { funcionarios: number } }>('/api/escalas/simulacao-12x36/gerar', {
        lojaId, mesRef, escsecaoId, escfuncIds: scopePeople.map((person) => Number(person.ESCFUNC_ID)),
      });
      setMessage(`Simulação gerada para ${response.resultado.funcionarios} funcionário(s).`);
      setConfirmGenerate(false);
      setReload((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível gerar a simulação.');
    } finally { setBusy(false); }
  }

  function openEditor(person: Funcionario, date?: string) {
    const saved = byEmployee.get(Number(person.ESCFUNC_ID));
    const day = date ? saved?.get(date) : saved?.values().next().value as SimDay | undefined;
    setEditor({ person, date, anchor: day?.DT_ANCORA || dates[0],
      hours: day ? { HR_ENT1: day.HR_ENT1, HR_SAI1: day.HR_SAI1, HR_ENT2: day.HR_ENT2, HR_SAI2: day.HR_SAI2 } : defaultHours });
    setError('');
  }

  async function saveEditor() {
    if (!editor) return;
    const invalid = validate12x36Hours(editor.hours);
    if (invalid) { setError(invalid); return; }
    setBusy(true); setError(''); setMessage('');
    const payload = { lojaId, mesRef, escsecaoId, escfuncId: Number(editor.person.ESCFUNC_ID), hours: editor.hours };
    try {
      if (editor.date) {
        await patchJson('/api/escalas/simulacao-12x36/dia', { ...payload, date: editor.date });
        setMessage(`Plantão de ${editor.person.NOME} ajustado.`);
      } else {
        await putJson('/api/escalas/simulacao-12x36/funcionario', { ...payload, anchor: editor.anchor });
        setMessage(`Padrão 12x36 de ${editor.person.NOME} atualizado.`);
      }
      setEditor(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a simulação.');
    } finally { setBusy(false); }
  }

  return <section className="schedule-regime schedule-simulation" aria-label="Simulação 12x36">
    <div className="schedule-regime-heading"><strong>Simulação 12x36</strong><span>Teste · sem oficialização ou envio ao RM · {people.length} funcionário(s)</span></div>
    <div className="schedule-actions">
      <span>Mesmo quadro da escala 5x2 · {scopePeople.length} funcionário(s) no escopo</span>
      <button className="button secondary" type="button" title="Atualizar simulação" disabled={busy} onClick={() => setReload((value) => value + 1)}><RefreshCw size={15} /> Atualizar</button>
      {canEdit && <button className="button primary" type="button" disabled={busy || !scopePeople.length} onClick={() => setConfirmGenerate(true)}><Play size={15} /> Gerar simulação</button>}
    </div>
    {message && <div className="notice success" role="status">{message}</div>}
    {error && !editor && <div className="notice error" role="alert">{error}</div>}
    {loading ? <div className="empty-state" role="status">Carregando simulação...</div>
      : !people.length ? <div className="empty-state">Nenhum funcionário encontrado neste filtro.</div>
      : <div className="schedule-scroll" role="region" aria-label="Grade mensal da simulação 12x36" tabIndex={0}>
        <table className="monthly-grid">
          <thead>
            <tr className="monthly-count-row"><th className="employee-col">Folgas</th>{counts.map((item, index) => <th key={dates[index]} className={isWeekStart(dates[index], index) ? 'week-start' : ''}>{item.rest} F</th>)}</tr>
            <tr className="monthly-count-row"><th className="employee-col">Trabalhando</th>{counts.map((item, index) => <th key={dates[index]} className={isWeekStart(dates[index], index) ? 'week-start' : ''}>{item.work} T</th>)}</tr>
            <tr><th rowSpan={2} className="employee-col">Funcionário</th>{dates.map((date, index) => <th key={date} className={isWeekStart(date, index) ? 'week-start' : ''}>{dayOfWeek(date)}</th>)}</tr>
            <tr>{dates.map((date, index) => <th key={date} className={isWeekStart(date, index) ? 'week-start' : ''}>{date.slice(8)}{date.slice(5, 7) !== mesRef.slice(5, 7) ? `/${date.slice(5, 7)}` : ''}</th>)}</tr>
          </thead>
          <tbody>{people.map((person) => <tr key={person.ESCFUNC_ID}>
            <th className="employee-col"><strong>{person.CHAPA} · {person.NOME}</strong><small>{person.FUNCAO_DESCR || 'Cargo não informado'}</small>
              {canEdit && <button type="button" className="person-menu-trigger" title={`Ajustar padrão 12x36 de ${person.NOME}`} aria-label={`Ajustar padrão 12x36 de ${person.NOME}`} onClick={() => openEditor(person)}><Pencil size={15} /></button>}
            </th>
            {dates.map((date, index) => {
              const day = byEmployee.get(Number(person.ESCFUNC_ID))?.get(date);
              return <td key={date} className={`${day?.PROGRAMACAO === 'F' ? 'rest' : day ? 'work' : 'empty'} ${isWeekStart(date, index) ? 'week-start' : ''}`}>
                <button type="button" disabled={!canEdit || !day || day.PROGRAMACAO !== 'TRB'}
                  title={day?.PROGRAMACAO === 'TRB' ? `${day.HR_ENT1} · ${day.HR_SAI1} · ${day.HR_ENT2} · ${day.HR_SAI2}` : day?.PROGRAMACAO === 'F' ? 'Descanso 12x36' : 'Não gerado'}
                  onClick={() => openEditor(person, date)}>{day?.PROGRAMACAO === 'TRB' ? day.HR_ENT1 : day?.PROGRAMACAO || '–'}</button>
              </td>;
            })}
          </tr>)}</tbody>
        </table>
      </div>}
    {confirmGenerate && <div className="confirm-backdrop"><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="sim-generate-title">
      <h2 id="sim-generate-title">Gerar simulação 12x36</h2>
      <p>A simulação será refeita para {scopePeople.length} funcionário(s) deste escopo. Ajustes anteriores desses funcionários serão substituídos. A escala 5x2 não será alterada.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setConfirmGenerate(false)}>Cancelar</button><button className="button primary" type="button" disabled={busy} onClick={generate}>Confirmar geração</button></div>
    </div></div>}
    {editor && <div className="confirm-backdrop"><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="sim-edit-title">
      <h2 id="sim-edit-title">{editor.date ? `Plantão ${editor.date}` : 'Padrão 12x36'} · {editor.person.NOME}</h2>
      {!editor.date && <label className="sim-field">Primeiro dia de plantão<input type="date" min={dates[0]} max={dates[dates.length - 1]} value={editor.anchor} onChange={(event) => setEditor({ ...editor, anchor: event.target.value })} /></label>}
      {!editor.date && <p>A mudança do padrão recria todos os dias simulados deste funcionário.</p>}
      <div className="sim-hours">{hourFields.map(([field, label]) => <label className="sim-field" key={field}>{label}<input type="time" value={editor.hours[field]} onChange={(event) => setEditor({ ...editor, hours: { ...editor.hours, [field]: event.target.value } })} /></label>)}</div>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setEditor(null)}>Cancelar</button><button className="button primary" type="button" disabled={busy} onClick={saveEditor}>Salvar</button></div>
    </div></div>}
  </section>;
}
