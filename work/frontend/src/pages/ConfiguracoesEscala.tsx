import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search } from 'lucide-react';
import { ApiError, canCreate, canEdit, getJson, patchJson, postJson, type User } from '../api';

type Regra = { codigo: string; titulo: string; descricao: string };
type Horario = {
  ESCHORPAD_ID: number; DESCR: string; HR_ENT1: string; HR_SAI1: string; HR_ENT2: string; HR_SAI2: string;
  JORNADA_MINUTOS: number; INTERVALO_MINUTOS: number; STATUS: 'A' | 'I';
};
type Form = Pick<Horario, 'DESCR' | 'HR_ENT1' | 'HR_SAI1' | 'HR_ENT2' | 'HR_SAI2' | 'STATUS'>;
const emptyForm: Form = { DESCR: '', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', STATUS: 'A' };

function minutes(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return NaN;
  const [hours, mins] = value.split(':').map(Number);
  return hours < 24 && mins < 60 ? hours * 60 + mins : NaN;
}

function durations(form: Form) {
  const [start, breakStart, breakEnd, end] = [form.HR_ENT1, form.HR_SAI1, form.HR_ENT2, form.HR_SAI2].map(minutes);
  if ([start, breakStart, breakEnd, end].some(Number.isNaN) || !(start < breakStart && breakStart < breakEnd && breakEnd < end)) return null;
  return { work: breakStart - start + end - breakEnd, interval: breakEnd - breakStart };
}

function formatMinutes(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function RegrasEscala() {
  const [rows, setRows] = useState<Regra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ regras: Regra[] }>('/api/escalas/regras', controller.signal)
      .then((result) => { setRows(result.regras || []); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [reload]);

  return <main className="content directory-page"><div className="page-heading"><div><h1>Regras da escala</h1><p>Critérios vigentes utilizados na validação.</p></div>
    <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button></div>
    {error ? <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div>
      : loading ? <div className="empty-state" role="status">Carregando regras...</div>
        : !rows.length ? <div className="empty-state">Nenhuma regra disponível.</div>
          : <section className="list-surface" aria-label="Regras vigentes"><div className="table-scroll"><table><thead><tr><th>Regra</th><th>Descrição</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.codigo}><td><strong>{row.titulo}</strong><small className="table-subline">{row.codigo}</small></td><td>{row.descricao}</td></tr>)}</tbody></table></div></section>}
    <p className="catalog-note">Estas regras são definidas no código e não podem ser alteradas nesta tela.</p>
  </main>;
}

export function HorariosPadrao({ user }: { user: User }) {
  const [rows, setRows] = useState<Horario[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<Horario | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [confirmStatus, setConfirmStatus] = useState<Horario | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);
  const preview = useMemo(() => durations(form), [form]);
  const filtered = rows.filter((row) => (status === 'all' || row.STATUS === status)
    && `${row.DESCR} ${row.HR_ENT1} ${row.HR_SAI2}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ horarios: Horario[] }>('/api/catalog/horarios-padrao?includeInactive=1', controller.signal)
      .then((result) => { setRows(result.horarios || []); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [reload]);

  function openEditor(row: Horario | 'new') {
    setEditing(row);
    setForm(row === 'new' ? emptyForm : { DESCR: row.DESCR, HR_ENT1: row.HR_ENT1, HR_SAI1: row.HR_SAI1,
      HR_ENT2: row.HR_ENT2, HR_SAI2: row.HR_SAI2, STATUS: row.STATUS });
    setActionError('');
    setUncertain(false);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || busy || uncertain) return;
    const descr = form.DESCR.trim();
    if (!descr || descr.length > 100 || preview?.work !== 528 || preview?.interval !== 70) {
      setActionError('Informe uma descrição e horários válidos com jornada 08:48 e intervalo 01:10.'); return;
    }
    setBusy(true);
    setActionError('');
    try {
      const payload = { ...form, DESCR: descr, JORNADA_MINUTOS: 528, INTERVALO_MINUTOS: 70 };
      const result = editing === 'new'
        ? await postJson<{ horario: Horario }>('/api/catalog/horarios-padrao', payload)
        : await patchJson<{ horario: Horario }>(`/api/catalog/horarios-padrao/${editing.ESCHORPAD_ID}`, payload);
      if (!result.horario?.ESCHORPAD_ID) throw new Error('A API não confirmou o horário. Confira a lista antes de tentar novamente.');
      setEditing(null);
      setMessage(`Horário ${descr} ${editing === 'new' ? 'criado' : 'atualizado'}.`);
      setReload((value) => value + 1);
    } catch (reason) {
      setUncertain(!(reason instanceof ApiError) || reason.status >= 500);
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível salvar o horário.');
    } finally { setBusy(false); }
  }

  async function toggleStatus() {
    if (!confirmStatus || busy || uncertain) return;
    setBusy(true);
    setActionError('');
    try {
      const next = confirmStatus.STATUS === 'A' ? 'I' : 'A';
      const result = await patchJson<{ horario: Horario }>(`/api/catalog/horarios-padrao/${confirmStatus.ESCHORPAD_ID}`, { STATUS: next });
      if (result.horario?.STATUS !== next) throw new Error('A API não confirmou o status. Confira a lista antes de repetir.');
      setMessage(`Horário ${confirmStatus.DESCR} ${next === 'A' ? 'reativado' : 'inativado'}.`);
      setConfirmStatus(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setUncertain(!(reason instanceof ApiError) || reason.status >= 500);
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível mudar o status.');
    } finally { setBusy(false); }
  }

  return <main className="content directory-page"><div className="page-heading"><div><h1>Horários padrão</h1><p>Modelos de jornada para cadastro de funcionários.</p></div>
    <div className="heading-actions"><button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button>
      {canCreate(user, 'horarios-padrao') && <button className="button primary" type="button" onClick={() => openEditor('new')}><Plus size={16} /> Novo horário</button>}</div></div>
    {message && <div className="notice success" role="status">{message}</div>}
    {error && <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div>}
    <section className="list-surface" aria-label="Horários padrão"><div className="filters"><label className="search-field"><Search size={17} /><span className="sr-only">Buscar horários</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Descrição ou horário" /></label>
      <label className="catalog-status-filter">Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="A">Ativos</option><option value="I">Inativos</option></select></label></div>
      {loading ? <div className="empty-state" role="status">Carregando horários...</div> : !filtered.length ? <div className="empty-state">Nenhum horário encontrado.</div>
        : <div className="table-scroll"><table><thead><tr><th>Descrição</th><th>Entrada</th><th>Intervalo</th><th>Saída</th><th>Jornada</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{filtered.map((row) => <tr key={row.ESCHORPAD_ID}><td><strong>{row.DESCR}</strong></td><td>{row.HR_ENT1}</td><td>{row.HR_SAI1} – {row.HR_ENT2}</td><td>{row.HR_SAI2}</td><td>{formatMinutes(Number(row.JORNADA_MINUTOS || 0))}</td><td>{row.STATUS === 'A' ? 'Ativo' : 'Inativo'}</td>
            <td className="catalog-actions">{canEdit(user, 'horarios-padrao') && <><button className="icon-action" type="button" title={`Editar ${row.DESCR}`} aria-label={`Editar ${row.DESCR}`} onClick={() => openEditor(row)}><Pencil size={16} /></button>
              <button className="button secondary" type="button" onClick={() => { setActionError(''); setUncertain(false); setConfirmStatus(row); }}>{row.STATUS === 'A' ? 'Inativar' : 'Reativar'}</button></>}</td></tr>)}</tbody></table></div>}
    </section>
    {editing && <div className="confirm-backdrop" role="presentation"><form className="confirm-dialog shift-dialog" role="dialog" aria-modal="true" aria-labelledby="horario-editor-title" onSubmit={save}>
      <h2 id="horario-editor-title">{editing === 'new' ? 'Novo horário padrão' : `Editar ${editing.DESCR}`}</h2>
      <div className="shift-fields"><label className="catalog-full-field">Descrição<input required maxLength={100} value={form.DESCR} disabled={busy || uncertain} onChange={(event) => setForm({ ...form, DESCR: event.target.value })} /></label>
        {(['HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'] as const).map((field, index) => <label key={field}>{['Entrada', 'Saída para intervalo', 'Retorno do intervalo', 'Saída'][index]}<input required type="time" value={form[field]} disabled={busy || uncertain} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>)}</div>
      <div className="shift-impact"><strong>{preview ? `Jornada ${formatMinutes(preview.work)} · intervalo ${formatMinutes(preview.interval)}` : 'Horários fora de ordem'}</strong><span>Exigidos: jornada 08:48 e intervalo 01:10.</span></div>
      {actionError && <div className="notice error" role="alert">{actionError}{uncertain && ' Confira a lista antes de repetir.'}</div>}
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button><button className="button primary" type="submit" disabled={busy || uncertain || preview?.work !== 528 || preview?.interval !== 70}>{busy ? 'Salvando...' : 'Salvar horário'}</button></div>
    </form></div>}
    {confirmStatus && <div className="confirm-backdrop" role="presentation"><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="horario-status-title">
      <h2 id="horario-status-title">{confirmStatus.STATUS === 'A' ? 'Inativar' : 'Reativar'} {confirmStatus.DESCR}?</h2><p>A alteração afeta a disponibilidade deste modelo no cadastro.</p>
      {actionError && <div className="notice error" role="alert">{actionError}{uncertain && ' Confira a lista antes de repetir.'}</div>}
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setConfirmStatus(null)}>Cancelar</button><button className="button primary" type="button" disabled={busy || uncertain} onClick={toggleStatus}>{busy ? 'Salvando...' : 'Confirmar'}</button></div>
    </div></div>}
  </main>;
}

type Classificacao = 'FOLGA' | 'FERIAS' | 'AFASTAMENTO' | 'OUTROS';
type TipoDescanso = { ESCTIPODESC_ID: number; DESCR: string; SIGLA: string; CLASSIFICACAO: Classificacao; STATUS: 'A' | 'I' };
type TipoForm = Pick<TipoDescanso, 'DESCR' | 'SIGLA' | 'CLASSIFICACAO' | 'STATUS'>;
const emptyTipo: TipoForm = { DESCR: '', SIGLA: '', CLASSIFICACAO: 'OUTROS', STATUS: 'A' };
const classificacoes: { value: Classificacao; label: string }[] = [
  { value: 'FOLGA', label: 'Folga' }, { value: 'FERIAS', label: 'Férias' },
  { value: 'AFASTAMENTO', label: 'Afastamento' }, { value: 'OUTROS', label: 'Outros' },
];

export function TiposDescanso({ user }: { user: User }) {
  const [rows, setRows] = useState<TipoDescanso[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<TipoDescanso | 'new' | null>(null);
  const [form, setForm] = useState<TipoForm>(emptyTipo);
  const [confirmStatus, setConfirmStatus] = useState<TipoDescanso | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);
  const filtered = rows.filter((row) => (status === 'all' || row.STATUS === status)
    && `${row.DESCR} ${row.SIGLA} ${row.CLASSIFICACAO}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ tipos: TipoDescanso[] }>('/api/catalog/tipos-descanso?includeInactive=1', controller.signal)
      .then((result) => { setRows(result.tipos || []); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [reload]);

  function openEditor(row: TipoDescanso | 'new') {
    setEditing(row);
    setForm(row === 'new' ? emptyTipo : { DESCR: row.DESCR, SIGLA: row.SIGLA,
      CLASSIFICACAO: row.CLASSIFICACAO, STATUS: row.STATUS });
    setActionError('');
    setUncertain(false);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || busy || uncertain) return;
    const descr = form.DESCR.trim();
    const sigla = form.SIGLA.trim().toUpperCase();
    if (!descr || descr.length > 100 || !sigla || sigla.length > 3) {
      setActionError('Informe um motivo e uma sigla de até 3 caracteres.'); return;
    }
    setBusy(true);
    setActionError('');
    try {
      const payload = { ...form, DESCR: descr, SIGLA: sigla };
      const result = editing === 'new'
        ? await postJson<{ tipo: TipoDescanso }>('/api/catalog/tipos-descanso', payload)
        : await patchJson<{ tipo: TipoDescanso }>(`/api/catalog/tipos-descanso/${editing.ESCTIPODESC_ID}`, payload);
      if (!result.tipo?.ESCTIPODESC_ID) throw new Error('A API não confirmou o tipo. Confira a lista antes de tentar novamente.');
      setEditing(null);
      setMessage(`Tipo ${descr} ${editing === 'new' ? 'criado' : 'atualizado'}.`);
      setReload((value) => value + 1);
    } catch (reason) {
      setUncertain(!(reason instanceof ApiError) || reason.status >= 500);
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível salvar o tipo.');
    } finally { setBusy(false); }
  }

  async function toggleStatus() {
    if (!confirmStatus || busy || uncertain) return;
    setBusy(true);
    setActionError('');
    try {
      const next = confirmStatus.STATUS === 'A' ? 'I' : 'A';
      const result = await patchJson<{ tipo: TipoDescanso }>(`/api/catalog/tipos-descanso/${confirmStatus.ESCTIPODESC_ID}`, { STATUS: next });
      if (result.tipo?.STATUS !== next) throw new Error('A API não confirmou o status. Confira a lista antes de repetir.');
      setMessage(`Tipo ${confirmStatus.DESCR} ${next === 'A' ? 'reativado' : 'inativado'}.`);
      setConfirmStatus(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setUncertain(!(reason instanceof ApiError) || reason.status >= 500);
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível mudar o status.');
    } finally { setBusy(false); }
  }

  return <main className="content directory-page"><div className="page-heading"><div><h1>Tipos de descanso</h1><p>Motivos disponíveis para identificação das ausências.</p></div>
    <div className="heading-actions"><button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button>
      {canCreate(user, 'tipos-descanso') && <button className="button primary" type="button" onClick={() => openEditor('new')}><Plus size={16} /> Novo tipo</button>}</div></div>
    {message && <div className="notice success" role="status">{message}</div>}
    {error && <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div>}
    <section className="list-surface" aria-label="Tipos de descanso"><div className="filters"><label className="search-field"><Search size={17} /><span className="sr-only">Buscar tipos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Motivo, sigla ou classificação" /></label>
      <label className="catalog-status-filter">Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="A">Ativos</option><option value="I">Inativos</option></select></label></div>
      {loading ? <div className="empty-state" role="status">Carregando tipos...</div> : !filtered.length ? <div className="empty-state">Nenhum tipo encontrado.</div>
        : <div className="table-scroll"><table><thead><tr><th>Motivo</th><th>Sigla</th><th>Classificação</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{filtered.map((row) => <tr key={row.ESCTIPODESC_ID}><td><strong>{row.DESCR}</strong></td><td>{row.SIGLA}</td><td>{classificacoes.find((item) => item.value === row.CLASSIFICACAO)?.label || row.CLASSIFICACAO}</td><td>{row.STATUS === 'A' ? 'Ativo' : 'Inativo'}</td>
            <td className="catalog-actions">{canEdit(user, 'tipos-descanso') && <><button className="icon-action" type="button" title={`Editar ${row.DESCR}`} aria-label={`Editar ${row.DESCR}`} onClick={() => openEditor(row)}><Pencil size={16} /></button>
              <button className="button secondary" type="button" onClick={() => { setActionError(''); setUncertain(false); setConfirmStatus(row); }}>{row.STATUS === 'A' ? 'Inativar' : 'Reativar'}</button></>}</td></tr>)}</tbody></table></div>}
    </section>
    {editing && <div className="confirm-backdrop" role="presentation"><form className="confirm-dialog shift-dialog" role="dialog" aria-modal="true" aria-labelledby="tipo-editor-title" onSubmit={save}>
      <h2 id="tipo-editor-title">{editing === 'new' ? 'Novo tipo de descanso' : `Editar ${editing.DESCR}`}</h2>
      <div className="shift-fields"><label className="catalog-full-field">Motivo<input required maxLength={100} value={form.DESCR} disabled={busy || uncertain} onChange={(event) => setForm({ ...form, DESCR: event.target.value })} /></label>
        <label>Sigla<input required maxLength={3} value={form.SIGLA} disabled={busy || uncertain} onChange={(event) => setForm({ ...form, SIGLA: event.target.value.toUpperCase() })} /></label>
        <label>Classificação<select value={form.CLASSIFICACAO} disabled={busy || uncertain} onChange={(event) => setForm({ ...form, CLASSIFICACAO: event.target.value as Classificacao })}>{classificacoes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>
      <p className="catalog-note">Férias e afastamentos na escala continuam sendo trazidos apenas pela integração.</p>
      {actionError && <div className="notice error" role="alert">{actionError}{uncertain && ' Confira a lista antes de repetir.'}</div>}
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button><button className="button primary" type="submit" disabled={busy || uncertain}>{busy ? 'Salvando...' : 'Salvar tipo'}</button></div>
    </form></div>}
    {confirmStatus && <div className="confirm-backdrop" role="presentation"><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="tipo-status-title">
      <h2 id="tipo-status-title">{confirmStatus.STATUS === 'A' ? 'Inativar' : 'Reativar'} {confirmStatus.DESCR}?</h2><p>A alteração afeta a disponibilidade deste motivo no cadastro.</p>
      {actionError && <div className="notice error" role="alert">{actionError}{uncertain && ' Confira a lista antes de repetir.'}</div>}
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setConfirmStatus(null)}>Cancelar</button><button className="button primary" type="button" disabled={busy || uncertain} onClick={toggleStatus}>{busy ? 'Salvando...' : 'Confirmar'}</button></div>
    </div></div>}
  </main>;
}
