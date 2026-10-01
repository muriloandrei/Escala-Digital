import { useEffect, useState } from 'react';
import { ArrowLeft, Check, MoreVertical, Pencil, Play, Printer, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { deleteJson, getJson, putJson, type User } from '../api';

const VERSION = 2;
const steps = [
  { title: 'Escolha a loja', hint: 'Selecione Loja Escola 10 no filtro da escala.' },
  { title: 'Abra o período', hint: 'Selecione outubro de 2026. A escala vai de 05/10 a 01/11, sempre em semanas completas.' },
  { title: 'Escolha a seção', hint: 'Abra Frente de Caixa nas abas de seção.' },
  { title: 'Escolha a subseção', hint: 'Abra Caixa. As ações seguintes valerão apenas para essa subseção.' },
  { title: 'Distribua uma folga fixa', hint: 'Clique na célula de Maria em 06/10 e registre Folga fixa.' },
  { title: 'Defina um horário fixo', hint: 'Clique na célula de Carlos em 07/10 e confirme um turno de 08:48.' },
  { title: 'Gere a escala', hint: 'Use Gerar escala e confirme a operação para preencher os demais dias.' },
  { title: 'Resolva uma crítica', hint: 'Carlos ficou com seis dias seguidos. Clique em 10/10 e coloque uma folga.' },
  { title: 'Troque o horário', hint: 'Abra o menu de Maria e altere seu horário-base para um turno de 08:48.' },
  { title: 'Transfira de subseção', hint: 'Abra o menu de Ana e agende sua transferência para Padaria Caixa na próxima semana.' },
  { title: 'Salve o rascunho', hint: 'Salve as alterações simuladas para manter a revisão desta subseção.' },
  { title: 'Revise o resultado', hint: 'Confira os fixos, a folga corrigida e a transferência. Depois conclua o tour.' },
] as const;

type Progress = { version: number; stage: number };
type ServerProgress = Progress & { found: boolean; persisted: boolean };
type Modal = 'folga-fixa' | 'horario-fixo' | 'gerar' | 'critica' | 'horario-base' | 'transferir' | null;
type Person = 'Maria Souza' | 'Carlos Prado' | 'Ana Lima';

const people: { name: Person; chapa: string; cargo: string; start: string }[] = [
  { name: 'Maria Souza', chapa: '010.1001', cargo: 'Operadora de Caixa', start: '08:00' },
  { name: 'Carlos Prado', chapa: '010.1002', cargo: 'Operador de Caixa', start: '12:00' },
  { name: 'Ana Lima', chapa: '010.1003', cargo: 'Operadora de Caixa', start: '09:00' },
];

const dates = Array.from({ length: 28 }, (_, index) => new Date(Date.UTC(2026, 9, 5 + index)).toISOString().slice(0, 10));
const weekdays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

function readProgress(key: string): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}') as Partial<Progress>;
    if (saved.version === VERSION && Number.isInteger(saved.stage) && saved.stage! >= 0 && saved.stage! <= steps.length) return saved as Progress;
  } catch { /* O tour continua sem cache local. */ }
  return { version: VERSION, stage: 0 };
}

function minutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
}

function cell(person: Person, date: string, stage: number) {
  if (person === 'Maria Souza' && date === '2026-10-06' && stage >= 5) return { value: 'F', type: 'fixed' };
  if (person === 'Carlos Prado' && date === '2026-10-07' && stage >= 6) return { value: '12:00', type: 'fixed' };
  if (stage < 7) return { value: '–', type: 'empty' };
  if (person === 'Carlos Prado' && date === '2026-10-10' && stage >= 8) return { value: 'F', type: 'rest' };
  const index = dates.indexOf(date);
  if (index % 7 === 6 || (person === 'Ana Lima' && index % 7 === 2)) return { value: 'F', type: 'rest' };
  return { value: person === 'Maria Souza' && stage >= 9 ? '10:00' : people.find((item) => item.name === person)!.start, type: 'work' };
}

export function Treinamento({ user }: { user: User }) {
  const key = `escala:treinamento:v${VERSION}:${user.sub}`;
  const [stage, setStage] = useState(() => readProgress(key).stage);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [persisted, setPersisted] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [store, setStore] = useState('');
  const [period, setPeriod] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [menu, setMenu] = useState<{ person: Person; left: number; top: number } | null>(null);
  const [transferDestination, setTransferDestination] = useState('');
  const [transferWhen, setTransferWhen] = useState('');
  const [times, setTimes] = useState(['12:00', '16:00', '17:10', '21:58']);
  const [formError, setFormError] = useState('');
  const completed = stage >= steps.length;

  useEffect(() => {
    const controller = new AbortController();
    getJson<ServerProgress>('/api/auth/treinamento', controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;
      const local = readProgress(key).stage;
      if (!result.persisted) {
        setStage(local);
        setProgressError('O progresso está apenas neste navegador até a migration do treinamento ser aplicada.');
      } else if (!result.found && local > 0) {
        try {
          const imported = await putJson<ServerProgress>('/api/auth/treinamento', { stage: local });
          if (!controller.signal.aborted) { setStage(imported.stage); setPersisted(true); }
        } catch {
          if (!controller.signal.aborted) { setStage(local); setProgressError('A sincronização do progresso falhou; ele permanece neste navegador.'); }
        }
      } else {
        setStage(result.stage);
        setPersisted(true);
        try { localStorage.setItem(key, JSON.stringify({ version: VERSION, stage: result.stage })); } catch { /* Cache opcional. */ }
      }
      if (!controller.signal.aborted) setLoading(false);
    }).catch((reason) => {
      if (reason.name !== 'AbortError') { setProgressError('Não foi possível consultar o progresso. O tour continuará neste navegador.'); setLoading(false); }
    });
    return () => controller.abort();
  }, [key]);

  async function advance() {
    if (busy) return;
    const next = Math.min(stage + 1, steps.length);
    setBusy(true);
    setProgressError('');
    try {
      const confirmed = persisted ? await putJson<ServerProgress>('/api/auth/treinamento', { stage: next }) : null;
      const current = confirmed?.stage ?? next;
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
      setStore('');
      setPeriod('');
      setModal(null);
      setMenu(null);
      setTransferDestination('');
      setTransferWhen('');
      try { localStorage.removeItem(key); } catch { /* Cache opcional. */ }
    } catch (reason) {
      setProgressError(reason instanceof Error ? reason.message : 'Não foi possível reiniciar o treinamento.');
    } finally { setBusy(false); }
  }

  function openCell(person: Person, date: string) {
    if (stage === 4 && person === 'Maria Souza' && date === '2026-10-06') setModal('folga-fixa');
    if (stage === 5 && person === 'Carlos Prado' && date === '2026-10-07') { setTimes(['12:00', '16:00', '17:10', '21:58']); setModal('horario-fixo'); }
    if (stage === 7 && person === 'Carlos Prado' && date === '2026-10-10') setModal('critica');
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
    if (modal === 'horario-fixo' || modal === 'horario-base') {
      const [entry, intervalStart, intervalEnd, exit] = times.map(minutes);
      if (![entry, intervalStart, intervalEnd, exit].every(Number.isFinite) || intervalStart - entry + exit - intervalEnd !== 528 || intervalEnd - intervalStart < 60) {
        setFormError('O turno deve somar 08:48 de trabalho e ter intervalo de pelo menos 01:00.');
        return;
      }
    }
    if (modal === 'transferir' && (transferDestination !== 'padaria' || transferWhen !== 'proxima')) {
      setFormError('Selecione Padaria Caixa e a próxima semana para concluir esta etapa.');
      return;
    }
    void advance();
  }

  function updateTime(index: number, value: string) {
    setTimes((current) => current.map((time, position) => position === index ? value : time));
    setFormError('');
  }

  if (loading) return <main className="content schedule-page"><div className="empty-state" role="status">Carregando treinamento...</div></main>;

  return (
    <main className="content schedule-page training-tour">
      <div className="page-heading"><div><Link className="back-link" to="/escalas-liberadas"><ArrowLeft size={15} /> Escalas liberadas</Link><h1>Escala · Loja Escola 10</h1><p>Outubro de 2026 · 05/10/2026 a 01/11/2026 · AGENDADA</p></div><div className="heading-actions"><button className="button secondary" type="button" disabled><Printer size={16} /> Imprimir</button><button className="button secondary" type="button" disabled={busy} onClick={restart}><RotateCcw size={16} /> Reiniciar tour</button></div></div>
      <div className="simulation-banner"><ShieldCheck size={18} /><span><strong>Treinamento · Loja Escola 10</strong> · Dados fictícios. Nenhuma escala, funcionário ou vínculo real será alterado.</span></div>
      {progressError && <div className="notice warning" role="status">{progressError}</div>}
      <section className="tour-guide" aria-live="polite">{completed ? <><div><span className="eyebrow">Tour concluído</span><h2>Pronto para trabalhar na escala</h2><p>Você praticou fixos, geração, correção, horário-base, transferência e rascunho em uma escala simulada.</p></div><Link className="button primary" to="/escalas-liberadas">Abrir escalas reais</Link></> : <><div><span className="eyebrow">Etapa {stage + 1} de {steps.length}</span><h2>{steps[stage].title}</h2><p>{steps[stage].hint}</p></div><div className="tour-progress" aria-label={`${stage} de ${steps.length} etapas concluídas`}><span>{stage}/{steps.length}</span><div><i style={{ width: `${stage / steps.length * 100}%` }} /></div></div></>}</section>
      <div className="schedule-summary"><span><strong>28</strong> dias</span><span><strong>1</strong> seção</span><span><strong>3</strong> funcionários</span><span>Revisão <strong>{stage >= 11 ? '2' : '1'}</strong></span></div>
      <div className="tour-filters"><label data-tour={stage === 0 ? 'active' : undefined}>Loja<select value={stage > 0 ? '10' : store} disabled={stage !== 0 || busy} onChange={(event) => { setStore(event.target.value); if (event.target.value === '10') void advance(); }}><option value="">Selecione</option><option value="10">Loja Escola 10</option></select></label><label data-tour={stage === 1 ? 'active' : undefined}>Período<select value={stage > 1 ? '2026-10' : period} disabled={stage !== 1 || busy} onChange={(event) => { setPeriod(event.target.value); if (event.target.value === '2026-10') void advance(); }}><option value="">Selecione</option><option value="2026-10">Outubro 2026 · 05/10 a 01/11</option></select></label></div>
      <div className="scope-tabs" role="tablist" aria-label="Seções da escala"><button type="button" role="tab" aria-selected={stage >= 3} className={stage >= 3 ? 'selected' : ''} data-tour={stage === 2 ? 'active' : undefined} disabled={stage !== 2 || busy} onClick={() => void advance()}>03.02.002 · Frente de Caixa <small>3</small></button></div>
      <div className="scope-subtabs" aria-label="Subseções da seção"><button type="button" className={stage >= 4 ? '' : 'selected'} disabled>Todos <small>3</small></button><button type="button" className={stage >= 4 ? 'selected' : ''} data-tour={stage === 3 ? 'active' : undefined} disabled={stage !== 3 || busy} onClick={() => void advance()}>Caixa <small>3</small></button><button type="button" disabled>Padaria Caixa <small>{stage >= 10 ? '1' : '0'}</small></button></div>
      <div className="schedule-toolbar"><div><strong>03.02.002 · Frente de Caixa</strong><span>3 funcionário(s) nesta visão</span></div><label className="search-field"><Search size={16} /><span className="sr-only">Buscar funcionário</span><input placeholder="Buscar funcionário" disabled /></label><div className="segmented" aria-label="Visão da escala"><button className="selected" type="button">Mensal</button><button type="button" disabled>Diária</button></div></div>
      <div className="schedule-actions"><span>Escopo: <strong>Caixa</strong> · 3 funcionário(s)</span><button className="button secondary" type="button" disabled><RotateCcw size={15} /> Resetar</button><button className="button primary" type="button" data-tour={stage === 6 ? 'active' : undefined} disabled={stage !== 6 || busy} onClick={() => setModal('gerar')}><Play size={15} /> Gerar escala</button></div>
      <div className="schedule-scroll" role="region" aria-label="Grade mensal de treinamento" tabIndex={0}><table className="monthly-grid"><thead><tr><th rowSpan={2} className="employee-col">Funcionário</th>{dates.map((date, index) => <th key={date} className={index % 7 === 0 ? 'week-start' : ''}>{weekdays[index % 7]}</th>)}</tr><tr>{dates.map((date, index) => <th key={date} className={index % 7 === 0 ? 'week-start' : ''}>{date.slice(8)}{date.slice(5, 7) === '11' ? '/11' : ''}</th>)}</tr></thead><tbody>{people.map((person) => <tr key={person.chapa}><th className="employee-col"><strong>{person.chapa} · {person.name}</strong><small>{person.cargo}{person.name === 'Ana Lima' && stage >= 10 ? ' · Padaria Caixa a partir de 12/10' : ''}</small><button type="button" className="person-menu-trigger" title={`Ações de ${person.name}`} aria-label={`Ações de ${person.name}`} data-tour={(stage === 8 && person.name === 'Maria Souza') || (stage === 9 && person.name === 'Ana Lima') ? 'active' : undefined} disabled={busy || !((stage === 8 && person.name === 'Maria Souza') || (stage === 9 && person.name === 'Ana Lima'))} onClick={(event) => openMenu(event, person.name)}><MoreVertical size={16} /></button></th>{dates.map((date, index) => { const entry = cell(person.name, date, stage); const target = (stage === 4 && person.name === 'Maria Souza' && date === '2026-10-06') || (stage === 5 && person.name === 'Carlos Prado' && date === '2026-10-07') || (stage === 7 && person.name === 'Carlos Prado' && date === '2026-10-10'); return <td key={date} className={`${entry.type} ${index % 7 === 0 ? 'week-start' : ''}`}><button type="button" data-tour={target ? 'active' : undefined} disabled={!target || busy} title={`${person.name} · ${date}`} onClick={() => openCell(person.name, date)}>{entry.value}</button></td>; })}</tr>)}</tbody></table></div>
      {stage === 7 && <div className="notice warning" role="status"><strong>Crítica simulada:</strong> Carlos trabalhou seis dias consecutivos. Revise o dia 10/10.</div>}
      <div className="schedule-legend"><span><i className="work" /> Trabalho</span><span><i className="rest" /> Folga</span><span><i className="fixed" /> Fixo</span><span><i className="absence" /> Férias / afastamento</span><span><i className="empty" /> Sem programação</span></div>
      {stage >= 10 && <div className="tour-footer"><span>{stage >= 11 ? <><Check size={16} /> Rascunho simulado salvo. A seção real permanece intacta.</> : 'As alterações desta subseção estão prontas para revisão.'}</span>{!completed && <button className="button primary" type="button" data-tour="active" disabled={busy} onClick={() => void advance()}>{stage === 10 ? 'Salvar rascunho' : 'Concluir treinamento'}</button>}</div>}
      {menu && createPortal(<div className="person-menu-layer" onClick={() => setMenu(null)}><div className="person-menu-popover" role="menu" style={{ left: menu.left, top: menu.top }} onClick={(event) => event.stopPropagation()}><button type="button" role="menuitem" disabled>Ver detalhes</button><button type="button" role="menuitem" onClick={() => { setMenu(null); setFormError(''); if (stage === 8) { setTimes(['10:00', '14:00', '15:10', '19:58']); setModal('horario-base'); } else setModal('transferir'); }}>{stage === 8 ? 'Editar horário-base' : 'Transferir de subseção'}</button></div></div>, document.body)}
      {modal && <div className="confirm-backdrop" onClick={() => { if (!busy) setModal(null); }}><div className="confirm-dialog tour-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-modal-title" onClick={(event) => event.stopPropagation()}><h2 id="tour-modal-title">{modal === 'folga-fixa' ? 'Adicionar fixo · Maria Souza · 06/10' : modal === 'horario-fixo' ? 'Adicionar horário fixo · Carlos Prado · 07/10' : modal === 'gerar' ? 'Gerar escala · Caixa' : modal === 'critica' ? 'Editar dia · Carlos Prado · 10/10' : modal === 'horario-base' ? 'Editar horário-base · Maria Souza' : 'Transferir Ana Lima'}</h2>
        {(modal === 'folga-fixa' || modal === 'critica') && <label>{modal === 'folga-fixa' ? 'Tipo de fixo' : 'Programação'}<select defaultValue={modal === 'folga-fixa' ? 'folga-fixa' : 'folga'}><option value={modal === 'folga-fixa' ? 'folga-fixa' : 'folga'}>{modal === 'folga-fixa' ? 'Folga fixa' : 'Folga'}</option></select></label>}
        {(modal === 'horario-fixo' || modal === 'horario-base') && <><p>Turno de 08:48 de trabalho com intervalo mínimo de 01:00.</p><div className="tour-time-grid">{['Entrada', 'Saída intervalo', 'Retorno', 'Última saída'].map((label, index) => <label key={label}>{label}<input type="time" value={times[index]} onInput={(event) => updateTime(index, event.currentTarget.value)} onChange={(event) => updateTime(index, event.target.value)} /></label>)}</div></>}
        {modal === 'gerar' && <p>Os dias editáveis de Caixa serão preenchidos. Folgas e horários fixos permanecem protegidos.</p>}
        {modal === 'transferir' && <><label>Nova subseção<select value={transferDestination} onChange={(event) => setTransferDestination(event.target.value)}><option value="">Selecione</option><option value="padaria">Padaria Caixa</option></select></label><label>A partir de quando?<select value={transferWhen} onChange={(event) => setTransferWhen(event.target.value)}><option value="">Selecione</option><option value="proxima">Próxima semana · 12/10</option></select></label><p>Transferências entre seções diferentes são atualizadas pelo RM; este exercício pratica a transferência de subseção.</p></>}
        {formError && <div className="notice error" role="alert">{formError}</div>}
        <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => { setModal(null); setFormError(''); }}>Cancelar</button><button className="button primary" type="button" disabled={busy} onClick={confirmModal}><Pencil size={15} /> {modal === 'gerar' ? 'Confirmar geração' : modal === 'transferir' ? 'Confirmar transferência' : 'Salvar'}</button></div>
      </div></div>}
    </main>
  );
}
