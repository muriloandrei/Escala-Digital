import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Flag, RefreshCw, Search, X } from 'lucide-react';
import { getJson, postJson, preferredStore, type Loja, type Secao, type User } from '../api';

type Shift = { programacao?: string | null; hrEnt1?: string | null; hrSai1?: string | null;
  hrEnt2?: string | null; hrSai2?: string | null };
type ReviewStatus = 'PENDENTE' | 'CONFERIDO' | 'CONTESTADO';
type RhRow = {
  eventoId: number; dia: string; loja: number; dataModificacao: string; autor: string;
  colaborador: string; chapa: string; secao: string | null; cargo: string | null;
  anterior: Shift | null; novo: Shift | null; justificativa: string | null;
  status: ReviewStatus; revisor: string | null; vistoEm: string | null;
  motivo: string | null; observacao: string | null; trocaFolga: boolean;
};
type Summary = { total: number; pendentes: number; conferidas: number; contestadas: number;
  conferidas_hoje: number; trocas_folga: number };
const PAGE_SIZE = 50;
const reasons = [
  ['DESCANSO_DOMINICAL', 'Descanso dominical'],
  ['INTERJORNADA', 'Interjornada'],
  ['JUSTIFICATIVA', 'Justificativa insuficiente'],
  ['JORNADA', 'Jornada de trabalho'],
  ['OUTRO', 'Outro motivo'],
] as const;

function rowKey(row: RhRow) { return `${row.eventoId}|${row.dia}`; }
function dateLabel(value: string, withTime = false) {
  const date = new Date(withTime ? value : `${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR', withTime
    ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' });
}
function ShiftValue({ value, highlighted = false }: { value: Shift | null; highlighted?: boolean }) {
  const code = String(value?.programacao || '').toUpperCase();
  if (!value) return <span className="rh-shift-empty">Sem programação</span>;
  if (code && code !== 'TRB') return <span className={`rh-shift-code ${highlighted ? 'is-new' : ''}`}>{code === 'F' || code === 'FXF' ? 'FOLGA' : code}</span>;
  const times = [value.hrEnt1, value.hrSai1, value.hrEnt2, value.hrSai2].filter(Boolean);
  return times.length ? <span className={`rh-shift-times ${highlighted ? 'is-new' : ''}`}>{times.join(' / ')}</span>
    : <span className="rh-shift-empty">Sem horário</span>;
}

export function RetificacoesRh({ user }: { user: User }) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [loja, setLoja] = useState('');
  const [mes, setMes] = useState(() => new Date().toLocaleDateString('sv-SE').slice(0, 7));
  const [secao, setSecao] = useState('');
  const [status, setStatus] = useState<'PENDENTE' | 'CONFERIDO' | 'CONTESTADO' | 'TODOS'>('PENDENTE');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [trocaFolga, setTrocaFolga] = useState(false);
  const [conferidasHoje, setConferidasHoje] = useState(false);
  const [offset, setOffset] = useState(0);
  const [reload, setReload] = useState(0);
  const [rows, setRows] = useState<RhRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contest, setContest] = useState<RhRow | null>(null);
  const [reason, setReason] = useState('DESCANSO_DOMINICAL');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ lojas: Loja[] }>('/api/catalog/lojas', controller.signal).then((data) => {
      setLojas(data.lojas || []);
      setLoja((current) => current || preferredStore(user, data.lojas || []));
    }).catch((cause) => { if (cause.name !== 'AbortError') setError(cause.message); });
    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    if (!loja) return;
    const controller = new AbortController();
    getJson<{ secoes: Secao[] }>(`/api/catalog/lojas/${encodeURIComponent(loja)}/secoes`, controller.signal)
      .then((data) => setSecoes(data.secoes || []))
      .catch((cause) => { if (cause.name !== 'AbortError') setError(cause.message); });
    return () => controller.abort();
  }, [loja]);

  useEffect(() => {
    const timer = window.setTimeout(() => { setOffset(0); setSelected(new Set()); setDebouncedSearch(search.trim()); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!loja || !mes) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ lojaId: loja, mesRef: `${mes}-01`, status,
      limit: String(PAGE_SIZE), offset: String(offset) });
    if (secao) query.set('escsecaoId', secao);
    if (debouncedSearch) query.set('search', debouncedSearch);
    if (trocaFolga) query.set('trocaFolga', 'true');
    if (conferidasHoje) query.set('conferidasHoje', 'true');
    setLoading(true);
    setError('');
    getJson<{ rows: RhRow[]; summary: Summary }>(`/api/escalas/retificacoes-rh?${query}`, controller.signal)
      .then((data) => { setRows(data.rows || []); setSummary(data.summary); setLoading(false); })
      .catch((cause) => { if (cause.name !== 'AbortError') { setError(cause.message); setLoading(false); } });
    return () => controller.abort();
  }, [loja, mes, secao, status, debouncedSearch, trocaFolga, conferidasHoje, offset, reload]);

  const pendingRows = useMemo(() => rows.filter((row) => row.status === 'PENDENTE'), [rows]);
  const allSelected = pendingRows.length > 0 && pendingRows.every((row) => selected.has(rowKey(row)));

  function changeFilter(change: () => void) {
    change(); setOffset(0); setSelected(new Set()); setMessage('');
  }
  function chooseKpi(kind: 'PENDENTE' | 'TODOS' | 'FOLGA' | 'HOJE') {
    changeFilter(() => {
      setStatus(kind === 'FOLGA' ? 'TODOS' : kind === 'HOJE' ? 'CONFERIDO' : kind);
      setTrocaFolga(kind === 'FOLGA'); setConferidasHoje(kind === 'HOJE');
    });
  }
  function toggleOne(row: RhRow) {
    const next = new Set(selected);
    const key = rowKey(row);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelected(next);
  }
  function toggleAll() {
    const next = new Set(selected);
    if (allSelected) pendingRows.forEach((row) => next.delete(rowKey(row)));
    else pendingRows.forEach((row) => next.add(rowKey(row)));
    setSelected(next);
  }
  async function review(items: RhRow[], nextStatus: 'CONFERIDO' | 'CONTESTADO') {
    if (!items.length || busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await postJson('/api/escalas/retificacoes-rh/conferir', {
        lojaId: Number(loja), items: items.map((row) => ({ eventoId: row.eventoId, dia: row.dia })),
        status: nextStatus,
        ...(nextStatus === 'CONTESTADO' ? { motivo: reason, observacao: notes.trim() } : {}),
      });
      setMessage(nextStatus === 'CONFERIDO' ? `${items.length} retificação(ões) conferida(s).` : 'Contestação registrada.');
      setContest(null); setSelected(new Set()); setOffset(0); setReload((value) => value + 1);
      window.dispatchEvent(new Event('rh-retificacoes-updated'));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível registrar a conferência.'); }
    finally { setBusy(false); }
  }

  const selectedRows = rows.filter((row) => selected.has(rowKey(row)) && row.status === 'PENDENTE');
  return <main className="content directory-page rh-review-page">
    <div className="page-heading"><div><h1>Controle de Retificações (RH)</h1><p>Gerencie e valide as alterações de escala realizadas após a oficialização.</p></div></div>
    <div className="rh-review-filters" aria-label="Filtros de retificações">
      <label>Loja<select value={loja} onChange={(event) => changeFilter(() => { setLoja(event.target.value); setSecao(''); })}>
        {lojas.map((item) => <option key={item.LOJA} value={item.LOJA}>Loja {item.LOJA}{item.NOME ? ` · ${item.NOME}` : ''}</option>)}
      </select></label>
      <label>Mês<input type="month" value={mes} onChange={(event) => changeFilter(() => setMes(event.target.value))} /></label>
      <label>Seção<select value={secao} onChange={(event) => changeFilter(() => setSecao(event.target.value))}>
        <option value="">Todas</option>{secoes.map((item) => <option key={item.ESCSECAO_ID} value={item.ESCSECAO_ID}>{item.DESCR}</option>)}
      </select></label>
      <label>Status<select value={status} onChange={(event) => changeFilter(() => { setStatus(event.target.value as typeof status); setTrocaFolga(false); setConferidasHoje(false); })}>
        <option value="PENDENTE">Pendente</option><option value="CONFERIDO">Conferido</option><option value="CONTESTADO">Contestado</option><option value="TODOS">Todos</option>
      </select></label>
      <label className="rh-review-search">Buscar<span><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Funcionário, chapa ou autor" /></span></label>
      <button type="button" className="icon-action" title="Atualizar retificações" aria-label="Atualizar retificações" onClick={() => setReload((value) => value + 1)}><RefreshCw size={17} /></button>
    </div>
    <div className="rh-review-kpis" aria-label="Indicadores de retificações">
      <button type="button" className={status === 'PENDENTE' && !trocaFolga ? 'active' : ''} onClick={() => chooseKpi('PENDENTE')}><span>Pendentes de visto</span><strong className="alert">{summary?.pendentes ?? '—'}</strong></button>
      <button type="button" className={status === 'TODOS' && !trocaFolga ? 'active' : ''} onClick={() => chooseKpi('TODOS')}><span>Retificações no mês</span><strong>{summary?.total ?? '—'}</strong></button>
      <button type="button" className={trocaFolga ? 'active' : ''} onClick={() => chooseKpi('FOLGA')}><span>Trocas de folga / DSR</span><strong>{summary?.trocas_folga ?? '—'}</strong></button>
      <button type="button" className={conferidasHoje ? 'active' : ''} onClick={() => chooseKpi('HOJE')}><span>Conferidas hoje</span><strong className="success">{summary?.conferidas_hoje ?? '—'}</strong></button>
    </div>
    <section className="list-surface rh-review-list" aria-label="Fila de retificações">
      <div className="rh-review-actions"><div><label><input type="checkbox" checked={allSelected} disabled={!pendingRows.length || busy} onChange={toggleAll} /> Selecionar pendentes nesta página</label><span>{selected.size} selecionada(s)</span></div>
        <button type="button" className="button primary" disabled={!selectedRows.length || busy} onClick={() => review(selectedRows, 'CONFERIDO')}><Check size={15} /> Marcar selecionadas como conferidas</button></div>
      {message && <div className="notice success" role="status">{message}</div>}
      {error && <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div>}
      <div className="rh-review-table-scroll"><table><thead><tr><th aria-label="Selecionar" /><th>Modificação / autor</th><th>Colaborador / seção</th><th>Dia afetado</th><th>De</th><th>Para</th><th>Justificativa</th><th>Status / ação</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={rowKey(row)}>
          <td><input type="checkbox" aria-label={`Selecionar ${row.colaborador} em ${dateLabel(row.dia)}`} checked={selected.has(rowKey(row))} disabled={row.status !== 'PENDENTE' || busy} onChange={() => toggleOne(row)} /></td>
          <td><strong>{dateLabel(row.dataModificacao, true)}</strong><small>{row.autor}</small></td>
          <td><strong>{row.colaborador}</strong><small>{row.chapa} · {row.secao || 'Sem seção'}{row.cargo ? ` · ${row.cargo}` : ''}</small></td>
          <td><strong>{dateLabel(row.dia)}</strong>{new Date(`${row.dia}T12:00:00`).getDay() === 0 && <small className="rh-review-sunday">Domingo</small>}</td>
          <td><ShiftValue value={row.anterior} /></td><td><ShiftValue value={row.novo} highlighted />{row.trocaFolga && <small className="rh-review-rest-tag">Troca de folga</small>}</td>
          <td className="rh-review-reason">{row.justificativa || <span className="rh-shift-empty">Não informada</span>}</td>
          <td>{row.status === 'PENDENTE' ? <div className="rh-review-state"><span className="rh-review-badge pending">Pendente</span><span className="rh-review-row-actions"><button type="button" className="icon-action" title="Dar visto" aria-label={`Dar visto em ${row.colaborador} no dia ${dateLabel(row.dia)}`} disabled={busy} onClick={() => review([row], 'CONFERIDO')}><Check size={17} /></button><button type="button" className="icon-action contest" title="Contestar" aria-label={`Contestar alteração de ${row.colaborador} no dia ${dateLabel(row.dia)}`} disabled={busy} onClick={() => { setContest(row); setReason('DESCANSO_DOMINICAL'); setNotes(''); setError(''); }}><Flag size={16} /></button></span></div>
            : <div className="rh-review-state"><span className={`rh-review-badge ${row.status === 'CONFERIDO' ? 'done' : 'contested'}`}>{row.status === 'CONFERIDO' ? 'Conferido' : 'Contestado'}</span><small>{row.revisor ? `por ${row.revisor}` : ''}{row.vistoEm ? ` · ${dateLabel(row.vistoEm, true)}` : ''}</small>{row.motivo && <small>{reasons.find(([code]) => code === row.motivo)?.[1] || row.motivo}</small>}{row.observacao && <small title={row.observacao}>{row.observacao}</small>}</div>}</td>
        </tr>)}</tbody></table>
        {!loading && !rows.length && <div className="empty-state">Nenhuma retificação encontrada para os filtros selecionados.</div>}
        {loading && <div className="list-meta" role="status">Carregando retificações...</div>}
      </div>
      <div className="rh-review-pagination"><span>{rows.length} registro(s) nesta página · Página {Math.floor(offset / PAGE_SIZE) + 1}</span><div><button type="button" className="icon-action" title="Página anterior" aria-label="Página anterior" disabled={offset === 0 || loading} onClick={() => { setOffset(Math.max(0, offset - PAGE_SIZE)); setSelected(new Set()); }}><ChevronLeft size={17} /></button><button type="button" className="icon-action" title="Próxima página" aria-label="Próxima página" disabled={rows.length < PAGE_SIZE || loading} onClick={() => { setOffset(offset + PAGE_SIZE); setSelected(new Set()); }}><ChevronRight size={17} /></button></div></div>
    </section>
    {contest && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === 'Escape' && !busy) setContest(null); }}><form className="confirm-dialog rh-review-dialog" role="dialog" aria-modal="true" aria-labelledby="rh-contest-title" onSubmit={(event) => { event.preventDefault(); review([contest], 'CONTESTADO'); }}>
      <div className="rh-review-dialog-heading"><h2 id="rh-contest-title">Contestar retificação</h2><button type="button" className="icon-action" title="Fechar" aria-label="Fechar" disabled={busy} onClick={() => setContest(null)}><X size={18} /></button></div>
      <p><strong>{contest.colaborador}</strong> · {dateLabel(contest.dia)} · {contest.secao}</p>
      <label>Motivo<select value={reason} disabled={busy} onChange={(event) => setReason(event.target.value)}>{reasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Observações<textarea value={notes} maxLength={500} rows={4} disabled={busy} onChange={(event) => setNotes(event.target.value)} placeholder="Descreva o ponto a revisar" /></label>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="confirm-actions"><button type="button" className="button secondary" disabled={busy} onClick={() => setContest(null)}>Cancelar</button><button type="submit" className="button primary" disabled={busy}>{busy ? 'Registrando...' : 'Registrar contestação'}</button></div>
    </form></div>}
  </main>;
}
