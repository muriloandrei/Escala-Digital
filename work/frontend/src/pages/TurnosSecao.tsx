import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search } from 'lucide-react';
import { canCreate, canEdit, getJson, postJson, preferredStore, putJson, type Loja, type Secao, type User } from '../api';

type Turno = {
  ESCSECAOTURNO_ID?: number;
  ESCSECAO_ID: number;
  COD_SECAO?: string;
  DESCR?: string;
  HR_ENT1: string;
  HR_SAI1: string;
  HR_ENT2: string;
  HR_SAI2: string;
  QTDE_COLABORADORES: number;
};
type Form = Pick<Turno, 'ESCSECAO_ID' | 'HR_ENT1' | 'HR_SAI1' | 'HR_ENT2' | 'HR_SAI2' | 'QTDE_COLABORADORES'>;

function minutes(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return NaN;
  const [hours, mins] = value.split(':').map(Number);
  return hours < 24 && mins < 60 ? hours * 60 + mins : NaN;
}

function duration(form: Form) {
  const [entry, breakStart, breakEnd, exit] = [form.HR_ENT1, form.HR_SAI1, form.HR_ENT2, form.HR_SAI2].map(minutes);
  if ([entry, breakStart, breakEnd, exit].some(Number.isNaN) || !(entry < breakStart && breakStart < breakEnd && breakEnd < exit)) return null;
  return { work: breakStart - entry + exit - breakEnd, rest: breakEnd - breakStart };
}

const initial: Form = {
  ESCSECAO_ID: 0, HR_ENT1: '07:30', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:28', QTDE_COLABORADORES: 1,
};

export function TurnosSecao({ user }: { user: User }) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loja, setLoja] = useState('');
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [editing, setEditing] = useState<Turno | 'new' | null>(null);
  const [form, setForm] = useState<Form>(initial);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ lojas: Loja[] }>('/api/catalog/lojas', controller.signal)
      .then((data) => {
        setLojas(data.lojas || []);
        setLoja((current) => current || preferredStore(user, data.lojas || []));
        if (!data.lojas?.length) {
          setError('Nenhuma loja disponível para consulta.');
          setLoading(false);
        }
      })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    if (!loja) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const base = `/api/catalog/lojas/${encodeURIComponent(loja)}`;
    Promise.all([
      getJson<{ secoes: Secao[] }>(`${base}/secoes`, controller.signal),
      getJson<{ turnos: Turno[] }>(`${base}/turnos-secao`, controller.signal),
    ]).then(([sectionData, shiftData]) => {
      setSecoes(sectionData.secoes || []);
      setTurnos(shiftData.turnos || []);
      setLoading(false);
    }).catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [loja, reload]);

  const visible = useMemo(() => turnos.filter((item) =>
    (sectionFilter === 'all' || String(item.ESCSECAO_ID) === sectionFilter) &&
    `${item.COD_SECAO || ''} ${item.DESCR || ''} ${item.HR_ENT1}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim()),
  ), [turnos, sectionFilter, search]);
  const shift = duration(form);
  const valid = Boolean(form.ESCSECAO_ID && Number.isInteger(form.QTDE_COLABORADORES) && form.QTDE_COLABORADORES > 0 &&
    form.QTDE_COLABORADORES <= 500 && shift && shift.work === 528 && shift.rest >= 70);

  function openEditor(turno: Turno | 'new') {
    setEditing(turno);
    setActionError('');
    setForm(turno === 'new' ? { ...initial, ESCSECAO_ID: Number(sectionFilter !== 'all' ? sectionFilter : secoes[0]?.ESCSECAO_ID || 0) } : {
      ESCSECAO_ID: Number(turno.ESCSECAO_ID), HR_ENT1: turno.HR_ENT1, HR_SAI1: turno.HR_SAI1,
      HR_ENT2: turno.HR_ENT2, HR_SAI2: turno.HR_SAI2, QTDE_COLABORADORES: Number(turno.QTDE_COLABORADORES),
    });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !loja || !valid || busy) return;
    setBusy(true);
    setActionError('');
    try {
      const base = `/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao`;
      if (editing === 'new') await postJson(base, form);
      else if (editing.ESCSECAOTURNO_ID) await putJson(`${base}/${editing.ESCSECAOTURNO_ID}`, form);
      else throw new Error('Este turno não possui identificador para edição. Atualize o cadastro antes de continuar.');
      setMessage(editing === 'new' ? 'Turno criado para as próximas gerações.' : 'Turno atualizado para as próximas gerações.');
      setEditing(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível salvar o turno.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="content directory-page">
    <div className="page-heading"><div><h1>Turnos por seção</h1><p>Horários e capacidade usados na distribuição da escala.</p></div>
      <div className="heading-actions"><button type="button" className="button secondary" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button>
        {canCreate(user, 'turnos-secao') && <button type="button" className="button primary" disabled={!secoes.length} onClick={() => openEditor('new')}><Plus size={16} /> Novo turno</button>}</div>
    </div>
    {message && <div className="notice success" role="status">{message}</div>}
    <section className="list-surface" aria-label="Turnos cadastrados">
      <div className="filters">
        <label>Loja<select value={loja} onChange={(event) => { setLoja(event.target.value); setSectionFilter('all'); }}>
          {lojas.map((item) => <option key={item.LOJA} value={item.LOJA}>Loja {item.LOJA}{item.NOME ? ` · ${item.NOME}` : ''}</option>)}
        </select></label>
        <label>Seção<select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}><option value="all">Todas</option>
          {secoes.map((item) => <option key={item.ESCSECAO_ID} value={item.ESCSECAO_ID}>{item.COD_SECAO} · {item.DESCR}</option>)}
        </select></label>
        <label className="search-field"><Search size={17} /><span className="sr-only">Buscar turno</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar seção ou horário" /></label>
      </div>
      {loading ? <div className="empty-state" role="status">Carregando turnos...</div> : error ? <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div> :
        !visible.length ? <div className="empty-state">Nenhum turno encontrado para os filtros selecionados.</div> :
          <div className="table-scroll"><table><thead><tr><th>Seção</th><th>Colaboradores</th><th>Entrada 1</th><th>Saída 1</th><th>Entrada 2</th><th>Saída 2</th><th>Ações</th></tr></thead>
            <tbody>{visible.map((item, index) => <tr key={item.ESCSECAOTURNO_ID || `${item.ESCSECAO_ID}-${index}`}>
              <td><strong>{item.DESCR}</strong><small className="table-subline">{item.COD_SECAO}</small></td>
              <td>{item.QTDE_COLABORADORES}</td><td>{item.HR_ENT1}</td><td>{item.HR_SAI1}</td><td>{item.HR_ENT2}</td><td>{item.HR_SAI2}</td>
              <td>{canEdit(user, 'turnos-secao') && <button type="button" className="icon-action" title={`Editar turno de ${item.DESCR}`} aria-label={`Editar turno de ${item.DESCR}`} onClick={() => openEditor(item)}><Pencil size={16} /></button>}</td>
            </tr>)}</tbody></table></div>}
    </section>
    {editing && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === 'Escape' && !busy) setEditing(null); }}>
      <form className="confirm-dialog shift-dialog" role="dialog" aria-modal="true" aria-labelledby="turno-title" onSubmit={save}>
        <h2 id="turno-title">{editing === 'new' ? 'Novo turno' : `Editar turno · ${editing.DESCR}`}</h2>
        <label className="transfer-field">Seção<select value={form.ESCSECAO_ID} disabled={busy || editing !== 'new'} onChange={(event) => setForm({ ...form, ESCSECAO_ID: Number(event.target.value) })}>
          {secoes.map((item) => <option key={item.ESCSECAO_ID} value={item.ESCSECAO_ID}>{item.COD_SECAO} · {item.DESCR}</option>)}
        </select></label>
        <div className="shift-fields">{(['HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'] as const).map((key, index) => <label key={key}>{['Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2'][index]}
          <input type="time" required value={form[key]} disabled={busy} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}</div>
        <label className="transfer-field">Colaboradores<input type="number" min="1" max="500" required value={form.QTDE_COLABORADORES} disabled={busy} onChange={(event) => setForm({ ...form, QTDE_COLABORADORES: Number(event.target.value) })} /></label>
        <div className="shift-impact">Jornada: {shift ? `${String(Math.floor(shift.work / 60)).padStart(2, '0')}:${String(shift.work % 60).padStart(2, '0')}` : 'horários fora de ordem'} · Intervalo: {shift ? `${String(Math.floor(shift.rest / 60)).padStart(2, '0')}:${String(shift.rest % 60).padStart(2, '0')}` : '—'}
          {!valid && <span>Informe jornada de 08:48 e intervalo mínimo de 01:10.</span>}</div>
        {actionError && <div className="notice error" role="alert">{actionError}</div>}
        <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button><button className="button primary" type="submit" disabled={busy || !valid}>{busy ? 'Salvando...' : 'Salvar turno'}</button></div>
      </form></div>}
  </main>;
}
