import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, MoreVertical, Pencil, Play, Printer, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import { createPortal } from 'react-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Link } from 'react-router-dom';
import { deleteJson, getJson, putJson, type User } from '../api';
import { autofillStandardHours } from '../shiftAutofill';
import { validateStandardHours, type StandardHours } from '../shiftValidation';

const VERSION = 3;
const steps = [
  { title: 'Abra uma escala liberada', hint: 'Na lista da loja, clique em Abrir Escala. Os dados deste exercício são fictícios.' },
  { title: 'Escolha a seção', hint: 'Abra Frente de Caixa. A grade mostra a seção selecionada.' },
  { title: 'Escolha a subseção', hint: 'Abra Caixa. As ações seguintes afetam somente essa subseção.' },
  { title: 'Primeiro clique: folga fixa', hint: 'Clique uma vez no dia vazio de Maria para distribuir uma folga fixa.' },
  { title: 'Segundo clique: trabalho fixo', hint: 'Clique de novo no mesmo dia. A folga fixa vira horário fixo.' },
  { title: 'Terceiro clique: limpar', hint: 'Clique uma terceira vez no mesmo dia para remover o fixo e deixar o campo vazio.' },
  { title: 'Edição com dois cliques', hint: 'Dê dois cliques no dia de Carlos. No editor, escolha horário fixo e ajuste o turno.' },
  { title: 'Gere a escala', hint: 'Confirme a geração para preencher os dias restantes, preservando os fixos.' },
  { title: 'Troque trabalho por folga', hint: 'Depois de gerar, um clique no dia trabalhado muda para folga.' },
  { title: 'Troque folga por trabalho', hint: 'Clique no mesmo dia novamente. Após a geração, não há um terceiro estado vazio.' },
  { title: 'Edite com dois cliques', hint: 'Dê dois cliques em um dia gerado para escolher folga ou trabalho no editor.' },
  { title: 'Edite vários dias', hint: 'Abra Editar vários, selecione um funcionário e pratique distribuir folga e trabalho.' },
  { title: 'Altere o horário-base', hint: 'No menu de Maria, ajuste o horário do mês vigente. O sistema mantém 08:48 de trabalho e 01:10 de intervalo.' },
  { title: 'Transfira de subseção', hint: 'No menu de Ana, transfira para Padaria Caixa. A transferência é imediata.' },
  { title: 'Salve o rascunho', hint: 'Salve as mudanças simuladas para consolidar a revisão da subseção.' },
  { title: 'Conheça a impressão', hint: 'Abra Imprimir e explore os formatos antes de concluir o treinamento.' },
] as const;

type Progress = { version: number; stage: number };
type ServerProgress = Progress & { found: boolean; persisted: boolean };
type Modal = 'horario-fixo' | 'gerar' | 'dia' | 'varios' | 'horario-base' | 'transferir' | 'imprimir' | null;
type Person = 'Maria Souza' | 'Carlos Prado' | 'Ana Lima';

const people: { name: Person; chapa: string; cargo: string; start: string }[] = [
  { name: 'Maria Souza', chapa: '010.1001', cargo: 'Operadora de Caixa', start: '08:00' },
  { name: 'Carlos Prado', chapa: '010.1002', cargo: 'Operador de Caixa', start: '12:00' },
  { name: 'Ana Lima', chapa: '010.1003', cargo: 'Operadora de Caixa', start: '09:00' },
];

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function firstMonday(year: number, month: number) { const date = new Date(year, month, 1); date.setDate(date.getDate() + ((8 - date.getDay()) % 7)); return date; }
function trainingPeriod() {
  const now = new Date();
  let year = now.getFullYear(); let month = now.getMonth();
  let start = firstMonday(year, month); let next = firstMonday(year, month + 1);
  if (next.getTime() - now.getTime() < 10 * 86400000) {
    const following = new Date(year, month + 1, 1);
    year = following.getFullYear(); month = following.getMonth();
    start = firstMonday(year, month); next = firstMonday(year, month + 1);
  }
  const dates: string[] = [];
  for (const date = new Date(start); date < next; date.setDate(date.getDate() + 1)) dates.push(dateKey(date));
  return { dates, monthLabel: new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    firstEditable: Math.min(Math.max(1, dates.findIndex((date) => date >= dateKey(now)) + 1), dates.length - 9) };
}
const { dates, monthLabel, firstEditable } = trainingPeriod();
const fixedDate = dates[firstEditable];
const modalDate = dates[firstEditable + 1];
const workDates = dates.slice(firstEditable + 3).filter((date) => ![0, 3].includes(new Date(`${date}T12:00:00`).getDay()));
const generatedDate = workDates[0];
const detailedDate = workDates[1];
const bulkDate = workDates[2];
const formatDate = (date: string) => `${date.slice(8)}/${date.slice(5, 7)}`;
const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const initialHours: StandardHours = { HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };

function readProgress(key: string): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}') as Partial<Progress>;
    if (saved.version === VERSION && Number.isInteger(saved.stage) && saved.stage! >= 0 && saved.stage! <= steps.length) return saved as Progress;
  } catch { /* O tour continua sem cache local. */ }
  return { version: VERSION, stage: 0 };
}

function cell(person: Person, date: string, stage: number) {
  if (stage < 8) {
    if (person === 'Maria Souza' && date === fixedDate && (stage === 4 || stage === 5))
      return stage === 4 ? { value: 'F', type: 'fixed' } : { value: '08:00', type: 'fixed' };
    if (person === 'Carlos Prado' && date === modalDate && stage >= 7) return { value: '12:00', type: 'fixed' };
    return { value: '–', type: 'empty' };
  }
  if (person === 'Carlos Prado' && date === modalDate) return { value: '12:00', type: 'fixed' };
  if (person === 'Carlos Prado' && date === generatedDate && stage === 9) return { value: 'F', type: 'rest' };
  if (person === 'Maria Souza' && date === detailedDate && stage >= 11) return { value: 'F', type: 'rest' };
  if (person === 'Ana Lima' && date === bulkDate && stage >= 12) return { value: 'F', type: 'rest' };
  const index = dates.indexOf(date);
  if (index % 7 === 6 || (person === 'Ana Lima' && index % 7 === 2)) return { value: 'F', type: 'rest' };
  return { value: person === 'Maria Souza' && stage >= 13 ? '09:00' : people.find((item) => item.name === person)!.start, type: 'work' };
}

export function Treinamento({ user, onComplete }: { user: User; onComplete?: () => void }) {
  const key = `escala:treinamento:v${VERSION}:${user.sub}`;
  const [stage, setStage] = useState(() => readProgress(key).stage);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [persisted, setPersisted] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [menu, setMenu] = useState<{ person: Person; left: number; top: number } | null>(null);
  const [transferDestination, setTransferDestination] = useState('');
  const [times, setTimes] = useState<StandardHours>(initialHours);
  const [fixedMode, setFixedMode] = useState<'FXF' | 'TRB'>('FXF');
  const [dayMode, setDayMode] = useState<'TRB' | 'F'>('TRB');
  const [bulkPerson, setBulkPerson] = useState('');
  const [bulkRest, setBulkRest] = useState(false);
  const [bulkWork, setBulkWork] = useState(false);
  const [formError, setFormError] = useState('');
  const [printView, setPrintView] = useState('Mensal');
  const completed = stage >= steps.length;

  useEffect(() => {
    if (loading || completed || modal) return;
    let tour: ReturnType<typeof driver> | null = null;
    const timer = window.setTimeout(() => {
      const element = menu
        ? document.querySelector<HTMLElement>('.person-menu-popover button:not(:disabled)')
        : document.querySelector<HTMLElement>('.training-tour [data-tour="active"]');
      if (!element) return;
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      tour = driver({
        allowClose: false,
        showButtons: [],
        disableActiveInteraction: false,
        stagePadding: 6,
        stageRadius: 5,
        overlayOpacity: 0.68,
        popoverClass: 'escala-training-popover',
      });
      tour.highlight({ element, popover: {
        title: `Etapa ${stage + 1} de ${steps.length} · ${steps[stage].title}`,
        description: steps[stage].hint,
        side: 'bottom',
        align: 'start',
      } });
    }, 80);
    return () => { window.clearTimeout(timer); tour?.destroy(); };
  }, [loading, completed, modal, menu, stage]);

  useEffect(() => {
    const controller = new AbortController();
    getJson<ServerProgress>('/api/auth/treinamento', controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;
      if (!result.persisted) {
        setProgressError('A migration do treinamento precisa ser aplicada para salvar o progresso.');
      } else {
        setStage(result.stage);
        setPersisted(true);
        try { localStorage.setItem(key, JSON.stringify({ version: VERSION, stage: result.stage })); } catch { /* Cache opcional. */ }
      }
      if (!controller.signal.aborted) setLoading(false);
    }).catch((reason) => {
      if (reason.name !== 'AbortError') { setProgressError('Não foi possível consultar o progresso. Tente recarregar a página.'); setLoading(false); }
    });
    return () => controller.abort();
  }, [key]);

  async function advance() {
    if (busy) return;
    if (!persisted) { setProgressError('Sem conexão com o progresso do servidor. Recarregue a página antes de continuar.'); return; }
    const next = Math.min(stage + 1, steps.length);
    setBusy(true);
    setProgressError('');
    try {
      const confirmed = await putJson<ServerProgress>('/api/auth/treinamento', { stage: next });
      const current = confirmed.stage;
      setStage(current);
      setModal(null);
      setMenu(null);
      setFormError('');
      try { localStorage.setItem(key, JSON.stringify({ version: VERSION, stage: current })); } catch { /* Cache opcional. */ }
    } catch (reason) {
      setProgressError(reason instanceof Error ? reason.message : 'Não foi possível salvar o progresso.');
    } finally { setBusy(false); }
  }

  async function restart() {
    if (busy) return;
    setBusy(true);
    setProgressError('');
    try {
      if (persisted) await deleteJson<ServerProgress>('/api/auth/treinamento');
      setStage(0);
      setModal(null);
      setMenu(null);
      setTransferDestination('');
      setFixedMode('FXF'); setDayMode('TRB');
      setBulkPerson(''); setBulkRest(false); setBulkWork(false);
      try { localStorage.removeItem(key); } catch { /* Cache opcional. */ }
    } catch (reason) {
      setProgressError(reason instanceof Error ? reason.message : 'Não foi possível reiniciar o treinamento.');
    } finally { setBusy(false); }
  }

  function openCell(person: Person, date: string, doubleClick: boolean) {
    if (stage >= 3 && stage <= 5 && person === 'Maria Souza' && date === fixedDate && !doubleClick) void advance();
    if (stage === 6 && person === 'Carlos Prado' && date === modalDate && doubleClick) {
      setTimes({ HR_ENT1: '12:00', HR_SAI1: '16:00', HR_ENT2: '17:10', HR_SAI2: '21:58' }); setFixedMode('FXF'); setModal('horario-fixo');
    }
    if ((stage === 8 || stage === 9) && person === 'Carlos Prado' && date === generatedDate && !doubleClick) void advance();
    if (stage === 10 && person === 'Maria Souza' && date === detailedDate && doubleClick) { setDayMode('TRB'); setModal('dia'); }
  }

  function openMenu(event: React.MouseEvent<HTMLButtonElement>, person: Person) {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({
      person,
      left: Math.max(8, Math.min(rect.right - 8, window.innerWidth - 218)),
      top: rect.bottom + 105 > window.innerHeight ? Math.max(8, rect.top - 105) : rect.bottom + 4,
    });
  }

  function confirmModal() {
    if (modal === 'horario-fixo' && fixedMode !== 'TRB') { setFormError('Selecione Horário fixo para praticar a edição.'); return; }
    if (modal === 'dia' && dayMode !== 'F') { setFormError('Selecione Folga no editor para distribuir o descanso.'); return; }
    if (modal === 'horario-fixo' || modal === 'horario-base') {
      const invalid = validateStandardHours(times);
      if (invalid) { setFormError(invalid); return; }
      if (modal === 'horario-base' && times.HR_ENT1 === initialHours.HR_ENT1) { setFormError('Altere a entrada de Maria para praticar o cálculo automático.'); return; }
    }
    if (modal === 'varios' && (!bulkPerson || !bulkRest || !bulkWork)) { setFormError('Selecione o funcionário e pratique uma folga e um dia de trabalho.'); return; }
    if (modal === 'transferir' && transferDestination !== 'padaria') { setFormError('Selecione Padaria Caixa para transferir agora.'); return; }
    void advance();
  }

  function updateTime(field: keyof StandardHours, value: string) {
    const next = autofillStandardHours(times, field, value);
    if (next) { setTimes(next); setFormError(''); }
    else setFormError('O horário não cabe no mesmo dia mantendo 08:48 de trabalho e 01:10 de intervalo.');
  }

  if (loading) return <main className="content schedule-page"><div className="empty-state" role="status">Carregando treinamento...</div></main>;

  return (
    <main className="content schedule-page training-tour">
      <div className="page-heading"><div>{stage > 0 && <Link className="back-link" to="/escalas-liberadas"><ArrowLeft size={15} /> Escalas liberadas</Link>}<h1>{stage === 0 ? 'Escalas liberadas' : 'Escala · Loja Escola 10'}</h1><p>{stage === 0 ? 'Escalas disponíveis para a loja' : `${monthLabel} · ${formatDate(dates[0])} a ${formatDate(dates[dates.length - 1])} · AGENDADA`}</p></div><div className="heading-actions">{stage > 0 && <button className="button secondary" type="button" data-tour={stage === 15 ? 'active' : undefined} disabled={stage !== 15 || busy} onClick={() => setModal('imprimir')}><Printer size={16} /> Imprimir</button>}<button className="button secondary" type="button" disabled={busy} onClick={restart}><RotateCcw size={16} /> Reiniciar tour</button></div></div>
      <div className="simulation-banner"><ShieldCheck size={18} /><span><strong>Treinamento · Loja Escola 10</strong> · Dados fictícios. Nenhuma escala, funcionário ou vínculo real será alterado.</span></div>
      {progressError && <div className="notice warning" role="status">{progressError}</div>}
      <section className="tour-guide" aria-live="polite">{completed ? <><div><span className="eyebrow">Tour concluído</span><h2>Pronto para trabalhar na escala</h2><p>Você praticou fixos, edição rápida e detalhada, horários, transferência imediata e rascunho.</p></div>{onComplete ? <button className="button primary" type="button" onClick={onComplete}>Abrir escalas reais</button> : <Link className="button primary" to="/escalas-liberadas">Abrir escalas reais</Link>}</> : <><div><span className="eyebrow">Etapa {stage + 1} de {steps.length}</span><h2>{steps[stage].title}</h2><p>{steps[stage].hint}</p></div><div className="tour-progress" aria-label={`${stage} de ${steps.length} etapas concluídas`}><span>{stage}/{steps.length}</span><div><i style={{ width: `${stage / steps.length * 100}%` }} /></div></div></>}</section>
      {stage === 0 ? <section className="list-surface" aria-label="Escalas liberadas de treinamento"><div className="filters"><label className="search-field"><Search size={17} /><input value="Loja Escola 10" readOnly aria-label="Buscar escalas" /></label></div><div className="table-scroll"><table><thead><tr><th>Período</th><th>Loja</th><th>Status</th><th>Seções</th><th>Ações</th></tr></thead><tbody><tr><td>{monthLabel}<small>{formatDate(dates[0])} a {formatDate(dates[dates.length - 1])}</small></td><td>Loja Escola 10</td><td>AGENDADA</td><td>Frente de Caixa</td><td><button className="open-link" type="button" data-tour="active" disabled={busy} onClick={() => void advance()}><ArrowUpRight size={16} /> Abrir Escala</button></td></tr></tbody></table></div></section> : <>
      <div className="schedule-summary"><span><strong>{dates.length}</strong> dias</span><span><strong>1</strong> seção</span><span><strong>3</strong> funcionários</span><span>Revisão <strong>{stage >= 15 ? '2' : '1'}</strong></span></div>
      <div className="scope-tabs" role="tablist" aria-label="Seções da escala"><button type="button" role="tab" aria-selected={stage >= 2} className={stage >= 2 ? 'selected' : ''} data-tour={stage === 1 ? 'active' : undefined} disabled={stage !== 1 || busy} onClick={() => void advance()}>03.02.002 · Frente de Caixa <small>3</small></button></div>
      <div className="scope-subtabs" aria-label="Subseções da seção"><button type="button" className={stage >= 2 ? 'selected' : ''} data-tour={stage === 2 ? 'active' : undefined} disabled={stage !== 2 || busy} onClick={() => void advance()}>Caixa <small>{stage >= 14 ? '2' : '3'}</small></button><button type="button" disabled>Padaria Caixa <small>{stage >= 14 ? '1' : '0'}</small></button></div>
      <div className="schedule-toolbar"><div><strong>03.02.002 · Frente de Caixa</strong><span>{stage >= 14 ? '2' : '3'} funcionário(s) nesta visão</span></div><label className="search-field"><Search size={16} /><span className="sr-only">Buscar funcionário</span><input placeholder="Buscar funcionário" disabled /></label><div className="segmented" aria-label="Visão da escala"><button className="selected" type="button">Mensal</button><button type="button" disabled>Diária</button></div></div>
      <div className="schedule-actions"><span>Escopo: <strong>Caixa</strong> · {stage >= 14 ? '2' : '3'} funcionário(s)</span><button className="button secondary" type="button" data-tour={stage === 11 ? 'active' : undefined} disabled={stage !== 11 || busy} onClick={() => setModal('varios')}><Pencil size={15} /> Editar vários</button><button className="button secondary" type="button" disabled><RotateCcw size={15} /> Resetar</button><button className="button primary" type="button" data-tour={stage === 7 ? 'active' : undefined} disabled={stage !== 7 || busy} onClick={() => setModal('gerar')}><Play size={15} /> Gerar escala</button></div>
      <div className="schedule-scroll" role="region" aria-label="Grade mensal de treinamento" tabIndex={0}><table className="monthly-grid"><thead><tr><th rowSpan={2} className="employee-col">Funcionário</th>{dates.map((date, index) => <th key={date} className={index % 7 === 0 ? 'week-start' : ''}>{weekdays[new Date(`${date}T12:00:00`).getDay()]}</th>)}</tr><tr>{dates.map((date, index) => <th key={date} className={index % 7 === 0 ? 'week-start' : ''}>{date.slice(8)}{date.slice(5, 7) !== dates[0].slice(5, 7) ? `/${date.slice(5, 7)}` : ''}</th>)}</tr></thead><tbody>{people.filter((person) => stage < 14 || person.name !== 'Ana Lima').map((person) => <tr key={person.chapa}><th className="employee-col"><strong>{person.chapa} · {person.name}</strong><small>{person.cargo}</small><button type="button" className="person-menu-trigger" title={`Ações de ${person.name}`} aria-label={`Ações de ${person.name}`} data-tour={(stage === 12 && person.name === 'Maria Souza') || (stage === 13 && person.name === 'Ana Lima') ? 'active' : undefined} disabled={busy || !((stage === 12 && person.name === 'Maria Souza') || (stage === 13 && person.name === 'Ana Lima'))} onClick={(event) => openMenu(event, person.name)}><MoreVertical size={16} /></button></th>{dates.map((date, index) => { const entry = cell(person.name, date, stage); const target = (stage >= 3 && stage <= 5 && person.name === 'Maria Souza' && date === fixedDate) || (stage === 6 && person.name === 'Carlos Prado' && date === modalDate) || ((stage === 8 || stage === 9) && person.name === 'Carlos Prado' && date === generatedDate) || (stage === 10 && person.name === 'Maria Souza' && date === detailedDate); return <td key={date} className={`${entry.type} ${index % 7 === 0 ? 'week-start' : ''}`}><button type="button" data-tour={target ? 'active' : undefined} disabled={!target || busy} title={`${person.name} · ${date}${stage === 6 || stage === 10 ? ' · dois cliques' : ''}`} onClick={() => { if (stage !== 6 && stage !== 10) openCell(person.name, date, false); }} onDoubleClick={() => { if (stage === 6 || stage === 10) openCell(person.name, date, true); }}>{entry.value}</button></td>; })}</tr>)}</tbody></table></div>
      <div className="schedule-legend"><span><i className="work" /> Trabalho</span><span><i className="rest" /> Folga</span><span><i className="fixed" /> Fixo</span><span><i className="absence" /> Férias / afastamento</span><span><i className="empty" /> Sem programação</span></div>
      {stage >= 14 && <div className="tour-footer"><span>{stage >= 15 ? <><Check size={16} /> Rascunho simulado salvo. A seção real permanece intacta.</> : 'As alterações desta subseção estão prontas para revisão.'}</span>{stage === 14 && <button className="button primary" type="button" data-tour="active" disabled={busy} onClick={() => void advance()}>Salvar rascunho</button>}</div>}
      </>}
      {menu && createPortal(<div className="person-menu-layer" onClick={() => setMenu(null)}><div className="person-menu-popover" role="menu" style={{ left: menu.left, top: menu.top }} onClick={(event) => event.stopPropagation()}><button type="button" role="menuitem" disabled>Ver detalhes</button><button type="button" role="menuitem" onClick={() => { setMenu(null); setFormError(''); if (stage === 12) { setTimes(initialHours); setModal('horario-base'); } else setModal('transferir'); }}>{stage === 12 ? 'Editar horário-base' : 'Transferir de subseção'}</button></div></div>, document.body)}
      {modal && <div className="confirm-backdrop" onClick={() => { if (!busy) setModal(null); }}><div className="confirm-dialog tour-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-modal-title" onClick={(event) => event.stopPropagation()}><h2 id="tour-modal-title">{modal === 'horario-fixo' ? `Adicionar fixo · Carlos Prado · ${formatDate(modalDate)}` : modal === 'gerar' ? 'Gerar escala · Caixa' : modal === 'dia' ? `Editar dia · Maria Souza · ${formatDate(detailedDate)}` : modal === 'varios' ? 'Editar distribuição' : modal === 'horario-base' ? 'Editar horário-base · Maria Souza' : modal === 'imprimir' ? 'Imprimir escala · Loja Escola 10' : 'Transferir Ana Lima'}</h2>
        {modal === 'horario-fixo' && <div className="segmented" role="group" aria-label="Tipo de fixo"><button type="button" className={fixedMode === 'FXF' ? 'selected' : ''} onClick={() => setFixedMode('FXF')}>Folga fixa</button><button type="button" className={fixedMode === 'TRB' ? 'selected' : ''} onClick={() => setFixedMode('TRB')}>Horário fixo</button></div>}
        {modal === 'dia' && <div className="segmented" role="group" aria-label="Programação do dia"><button type="button" className={dayMode === 'TRB' ? 'selected' : ''} onClick={() => setDayMode('TRB')}>Trabalho</button><button type="button" className={dayMode === 'F' ? 'selected' : ''} onClick={() => setDayMode('F')}>Folga</button></div>}
        {(modal === 'horario-base' || (modal === 'horario-fixo' && fixedMode === 'TRB')) && <><p>08:48 de trabalho e 01:10 de intervalo. Você pode alterar a entrada, a saída e o início ou fim do almoço.</p>{modal === 'horario-base' && <p>Mês vigente: <strong>{monthLabel}</strong>. Meses anteriores não podem ser editados.</p>}<div className="tour-time-grid">{(['HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'] as const).map((field, index) => <label key={field}>{['Entrada', 'Saída intervalo', 'Retorno', 'Última saída'][index]}<input type="time" value={times[field]} onChange={(event) => updateTime(field, event.target.value)} /></label>)}</div></>}
        {modal === 'gerar' && <p>Os dias editáveis de Caixa serão preenchidos. Folgas e horários fixos permanecem protegidos.</p>}
        {modal === 'varios' && <><label>Funcionário<select value={bulkPerson} onChange={(event) => setBulkPerson(event.target.value)}><option value="">Selecione</option><option value="ana">010.1003 · Ana Lima</option></select></label><div className="segmented" role="group" aria-label="Programação"><button type="button" className={bulkRest ? 'selected' : ''} onClick={() => setBulkRest(true)}>Folga · {formatDate(bulkDate)}</button><button type="button" className={bulkWork ? 'selected' : ''} onClick={() => setBulkWork(true)}>Trabalho · {formatDate(workDates[3])}</button></div><p>Na escala real, selecione o funcionário, o tipo e os dias antes de salvar cada distribuição.</p></>}
        {modal === 'transferir' && <><label>Nova subseção<select value={transferDestination} onChange={(event) => setTransferDestination(event.target.value)}><option value="">Selecione</option><option value="padaria">Padaria Caixa</option></select></label><p>Vigência: <strong>Imediata</strong>. Ana sairá de Caixa assim que a transferência for confirmada. Transferências entre seções diferentes seguem o cadastro do RM.</p></>}
        {modal === 'imprimir' && <><div className="segmented" role="group" aria-label="Visão da impressão">{['Mensal', 'Semanal', 'Diário', 'Período'].map((view) => <button key={view} type="button" className={printView === view ? 'selected' : ''} onClick={() => setPrintView(view)}>{view}</button>)}</div><div className="tour-print-preview"><strong>Escala de Trabalho · {printView}</strong><span>Loja Escola 10 · Caixa · {monthLabel}</span><div className="tour-print-row">Funcionário <span>{formatDate(dates[0])}</span><span>{formatDate(dates[1])}</span><span>{formatDate(dates[2])}</span></div><div className="tour-print-row">Maria Souza <span>08:00</span><span>F</span><span>09:00</span></div><div className="tour-print-row">Carlos Prado <span>12:00</span><span>12:00</span><span>12:00</span></div></div><p>Prévia fictícia. Nenhum documento será enviado à impressora.</p></>}
        {formError && <div className="notice error" role="alert">{formError}</div>}
        <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => { setModal(null); setFormError(''); }}>Cancelar</button><button className="button primary" type="button" disabled={busy} onClick={confirmModal}>{modal === 'imprimir' ? <><Check size={15} /> Concluir treinamento</> : <><Pencil size={15} /> {modal === 'gerar' ? 'Confirmar geração' : modal === 'transferir' ? 'Transferir agora' : 'Salvar'}</>}</button></div>
      </div></div>}
    </main>
  );
}
