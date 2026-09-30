import { useEffect, useState } from 'react';
import { Pencil, RefreshCw, Search } from 'lucide-react';
import { getJson, patchJson, type Loja, type User } from '../api';

type UsuarioAcesso = {
  USUARIO_ID: number;
  LOGIN: string;
  NOME: string;
  PERFIL: string;
  STATUS: 'A' | 'I';
  LOJAS: number[];
};
type Perfil = { PERFIL_ID: number; NOME: string; STATUS: 'A' | 'I' };
type Listing = {
  usuarios: UsuarioAcesso[];
  pagination: { page: number; total: number; totalPages: number; pageSize: number };
};

export function Acessos({ user }: { user: User }) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [rows, setRows] = useState<UsuarioAcesso[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Listing['pagination']>({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [editing, setEditing] = useState<UsuarioAcesso | null>(null);
  const [form, setForm] = useState<Pick<UsuarioAcesso, 'NOME' | 'PERFIL' | 'STATUS' | 'LOJAS'>>({ NOME: '', PERFIL: '', STATUS: 'A', LOJAS: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);
  const storeOptions = editing ? [
    ...lojas,
    ...editing.LOJAS.filter((id) => !lojas.some((store) => Number(store.LOJA) === id)).map((id) => ({ LOJA: id, NOME: 'Não encontrada no catálogo atual' })),
  ] : lojas;

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getJson<{ lojas: Loja[] }>('/api/catalog/lojas', controller.signal),
      getJson<{ perfis: Perfil[] }>('/api/acessos/perfis', controller.signal),
    ]).then(([storeData, profileData]) => {
      setLojas(storeData.lojas || []);
      setPerfis(profileData.perfis || []);
    }).catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), pageSize: '20', search: query });
    getJson<Listing>(`/api/acessos/usuarios?${params}`, controller.signal)
      .then((data) => { setRows(data.usuarios || []); setPagination(data.pagination); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [page, query, reload]);

  function openEditor(person: UsuarioAcesso) {
    setEditing(person);
    setForm({ NOME: person.NOME, PERFIL: person.PERFIL, STATUS: person.STATUS, LOJAS: [...person.LOJAS] });
    setActionError('');
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || busy) return;
    const name = form.NOME.trim();
    if (!name || name.length > 100) { setActionError('Informe um nome de até 100 caracteres.'); return; }
    if (String(editing.USUARIO_ID) === String(user.sub) && (form.PERFIL !== editing.PERFIL || form.STATUS !== editing.STATUS)) {
      setActionError('Não altere o próprio perfil ou status nesta tela.');
      return;
    }
    const sameStores = [...form.LOJAS].sort((a, b) => a - b).join(',') === [...editing.LOJAS].sort((a, b) => a - b).join(',');
    const changes = {
      ...(name !== editing.NOME ? { NOME: name } : {}),
      ...(form.PERFIL !== editing.PERFIL ? { PERFIL: form.PERFIL } : {}),
      ...(form.STATUS !== editing.STATUS ? { STATUS: form.STATUS } : {}),
      ...(!sameStores ? { LOJAS: form.LOJAS } : {}),
    };
    if (!Object.keys(changes).length) { setEditing(null); return; }
    setBusy(true);
    setActionError('');
    try {
      const result = await patchJson<{ usuario: UsuarioAcesso }>(`/api/acessos/usuarios/${editing.USUARIO_ID}`, changes);
      if (!result.usuario || Number(result.usuario.USUARIO_ID) !== Number(editing.USUARIO_ID)) throw new Error('A API não confirmou o usuário atualizado.');
      setMessage(`Cadastro de ${editing.LOGIN} atualizado. Uma sessão já aberta pode manter permissões anteriores até renovar a autenticação.`);
      setEditing(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível atualizar o usuário.');
    } finally { setBusy(false); }
  }

  return <main className="content directory-page">
    <div className="page-heading"><div><h1>Usuários e acessos</h1><p>Perfis e lojas vinculadas aos usuários.</p></div>
      <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button></div>
    {message && <div className="notice success" role="status">{message}</div>}
    <section className="list-surface" aria-label="Usuários">
      <form className="filters" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search.trim()); }}>
        <label className="search-field"><Search size={17} /><span className="sr-only">Buscar usuários</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou login" /></label>
        <button className="button secondary" type="submit">Buscar</button>
      </form>
      {loading ? <div className="empty-state" role="status">Carregando usuários...</div> : error ? <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div> :
        !rows.length ? <div className="empty-state">Nenhum usuário encontrado.</div> : <>
          <div className="event-summary"><span><strong>{pagination.total}</strong> usuário(s)</span></div>
          <div className="table-scroll"><table><thead><tr><th>Usuário</th><th>Perfil</th><th>Lojas</th><th>Status</th><th>Ações</th></tr></thead><tbody>
            {rows.map((person) => <tr key={person.USUARIO_ID}>
              <td><strong>{person.NOME}</strong><small className="table-subline">{person.LOGIN}</small></td>
              <td>{person.PERFIL}</td><td>{person.LOJAS.length ? person.LOJAS.join(', ') : 'Sem loja vinculada'}</td><td>{person.STATUS === 'A' ? 'Ativo' : 'Inativo'}</td>
              <td><button type="button" className="icon-action" title={`Editar ${person.LOGIN}`} aria-label={`Editar ${person.LOGIN}`} onClick={() => openEditor(person)}><Pencil size={16} /></button></td>
            </tr>)}</tbody></table></div>
          {pagination.totalPages > 1 && <div className="access-pagination"><button className="button secondary" type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</button>
            <span>Página {page} de {pagination.totalPages}</span><button className="button secondary" type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Próxima</button></div>}
        </>}
    </section>
    {editing && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === 'Escape' && !busy) setEditing(null); }}>
      <form className="confirm-dialog access-dialog" role="dialog" aria-modal="true" aria-labelledby="access-title" onSubmit={save}>
        <h2 id="access-title">Editar {editing.LOGIN}</h2>
        <div className="access-form-grid"><label>Nome<input required maxLength={100} value={form.NOME} disabled={busy} onChange={(event) => setForm({ ...form, NOME: event.target.value })} /></label>
          <label>Perfil<select value={form.PERFIL} disabled={busy} onChange={(event) => setForm({ ...form, PERFIL: event.target.value })}>
            {!perfis.some((perfil) => perfil.NOME === editing.PERFIL) && <option value={editing.PERFIL}>{editing.PERFIL} · perfil legado</option>}
            {perfis.filter((perfil) => perfil.STATUS === 'A' || perfil.NOME === editing.PERFIL).map((perfil) => <option key={perfil.PERFIL_ID} value={perfil.NOME}>{perfil.NOME}</option>)}
          </select></label></div>
        <label className="access-status"><input type="checkbox" checked={form.STATUS === 'A'} disabled={busy} onChange={(event) => setForm({ ...form, STATUS: event.target.checked ? 'A' : 'I' })} /> Usuário ativo</label>
        <fieldset className="access-stores"><legend>Lojas vinculadas</legend><div>{storeOptions.map((store) => <label key={store.LOJA}><input type="checkbox" checked={form.LOJAS.includes(Number(store.LOJA))} disabled={busy} onChange={(event) => setForm({ ...form, LOJAS: event.target.checked ? [...form.LOJAS, Number(store.LOJA)] : form.LOJAS.filter((value) => value !== Number(store.LOJA)) })} /> Loja {store.LOJA}{store.NOME ? ` · ${store.NOME}` : ''}</label>)}</div></fieldset>
        {actionError && <div className="notice error" role="alert">{actionError}</div>}
        <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button><button className="button primary" type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'}</button></div>
      </form></div>}
  </main>;
}
