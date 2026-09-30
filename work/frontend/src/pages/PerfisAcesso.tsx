import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { getJson, patchJson } from '../api';

type PermissionKey = 'PODE_VISUALIZAR' | 'PODE_CRIAR' | 'PODE_EDITAR' | 'PODE_EXCLUIR' | 'PODE_REPROCESSAR' | 'PODE_ADMINISTRAR';
type Permission = { PAGINA: string; PODE_OFICIALIZAR?: number } & Record<PermissionKey, number>;
type Profile = { PERFIL_ID: number; NOME: string; DESCR: string | null; STATUS: 'A' | 'I'; PERMISSOES: Permission[] };
type Page = { key: string; label: string };
const columns: { key: PermissionKey; label: string }[] = [
  { key: 'PODE_VISUALIZAR', label: 'Ver' }, { key: 'PODE_CRIAR', label: 'Criar' },
  { key: 'PODE_EDITAR', label: 'Editar' }, { key: 'PODE_EXCLUIR', label: 'Excluir' },
  { key: 'PODE_REPROCESSAR', label: 'Reprocessar' }, { key: 'PODE_ADMINISTRAR', label: 'Administrar' },
];
function restrictedByServer(profile: string, page: string) {
  if (profile !== 'ADMIN' && page === 'historico') return true;
  return ['LIDER', 'OPERADOR'].includes(profile) && ['acessos', 'roles', 'liberacao-secoes'].includes(page);
}

export function PerfisAcesso() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ perfis: Profile[]; paginas: Page[] }>('/api/acessos/perfis', controller.signal)
      .then((data) => {
        setProfiles(data.perfis || []);
        setPages(data.paginas || []);
        setSelectedId((current) => data.perfis?.some((profile) => profile.PERFIL_ID === current)
          ? current : data.perfis?.find((profile) => profile.NOME !== 'ADMIN')?.PERFIL_ID || data.perfis?.[0]?.PERFIL_ID || null);
        setLoading(false);
      }).catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [reload]);

  const selected = profiles.find((item) => item.PERFIL_ID === selectedId) || null;
  useEffect(() => {
    setDraft(selected ? { ...selected, PERMISSOES: selected.PERMISSOES.map((item) => ({ ...item })) } : null);
    setActionError('');
  }, [selected]);
  const locked = selected?.NOME === 'ADMIN';
  const changes = useMemo(() => {
    if (!selected || !draft) return 0;
    let count = Number(selected.DESCR !== draft.DESCR) + Number(selected.STATUS !== draft.STATUS);
    for (const original of selected.PERMISSOES) {
      const edited = draft.PERMISSOES.find((item) => item.PAGINA === original.PAGINA);
      count += columns.filter(({ key }) => Number(edited?.[key]) !== Number(original[key])).length;
    }
    return count;
  }, [selected, draft]);

  function togglePermission(page: string, key: PermissionKey) {
    setDraft((current) => current ? {
      ...current,
      PERMISSOES: current.PERMISSOES.map((item) => item.PAGINA === page ? { ...item, [key]: Number(!item[key]) } : item),
    } : current);
  }

  async function save() {
    if (!selected || !draft || !changes || busy || locked) return;
    setBusy(true);
    setActionError('');
    try {
      await patchJson(`/api/acessos/perfis/${selected.PERFIL_ID}`, {
        NOME: selected.NOME, DESCR: draft.DESCR, STATUS: draft.STATUS,
        PERMISSOES: draft.PERMISSOES.map((item) => ({
          ...item, PODE_OFICIALIZAR: 0,
        })),
      });
      setConfirming(false);
      setMessage(`Perfil ${selected.NOME} atualizado. Usuários com sessão aberta podem precisar renovar a autenticação.`);
      setReload((value) => value + 1);
    } catch (reason) {
      setConfirming(false);
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível salvar o perfil.');
    } finally { setBusy(false); }
  }

  return <main className="content directory-page">
    <div className="page-heading"><div><h1>Perfis de acesso</h1><p>Permissões cadastradas; restrições da API prevalecem.</p></div>
      <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button></div>
    {message && <div className="notice success" role="status">{message}</div>}
    {error && <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div>}
    {actionError && <div className="notice error" role="alert">{actionError}</div>}
    {loading ? <div className="empty-state" role="status">Carregando perfis...</div> : !profiles.length ? <div className="empty-state">Nenhum perfil cadastrado.</div> :
      <div className="profile-layout"><aside className="profile-list" aria-label="Perfis">
        {profiles.map((profile) => <button type="button" key={profile.PERFIL_ID} className={profile.PERFIL_ID === selectedId ? 'selected' : ''} onClick={() => {
          if (profile.PERFIL_ID === selectedId) return;
          if (changes) setDiscardTarget(profile.PERFIL_ID);
          else setSelectedId(profile.PERFIL_ID);
        }}>
          <ShieldCheck size={16} /><span>{profile.NOME}<small>{profile.STATUS === 'A' ? 'Ativo' : 'Inativo'}</small></span>
        </button>)}
      </aside><section className="profile-detail" aria-label="Permissões do perfil">
        {draft && <><div className="profile-detail-heading"><div><h2>{draft.NOME}</h2><p>{locked ? 'As permissões do Admin são fixadas pelo servidor.' : `${changes} alteração(ões) pendente(s)`}</p></div>
          {!locked && <button className="button primary" type="button" disabled={!changes || busy} onClick={() => setConfirming(true)}>Salvar perfil</button>}</div>
          <div className="profile-fields"><label>Descrição<input maxLength={100} value={draft.DESCR || ''} disabled={locked || busy} onChange={(event) => setDraft({ ...draft, DESCR: event.target.value })} /></label>
            <label className="access-status"><input type="checkbox" checked={draft.STATUS === 'A'} disabled={locked || busy} onChange={(event) => setDraft({ ...draft, STATUS: event.target.checked ? 'A' : 'I' })} /> Perfil ativo</label></div>
          <div className="table-scroll"><table className="permission-table"><thead><tr><th>Área</th>{columns.map(({ key, label }) => <th key={key}>{label}</th>)}</tr></thead>
            <tbody>{pages.map((page) => {
              const permission = draft.PERMISSOES.find((item) => item.PAGINA === page.key);
              const restricted = restrictedByServer(draft.NOME, page.key);
              return <tr key={page.key}><td><strong>{page.label}</strong>{restricted && <small className="table-subline">Bloqueado pela API</small>}</td>{columns.map(({ key, label }) => <td key={key}><input type="checkbox" aria-label={`${label} · ${page.label}`} title={restricted ? 'A API bloqueia esta área para o perfil' : undefined} checked={restricted ? false : Boolean(permission?.[key])} disabled={locked || busy || !permission || restricted} onChange={() => togglePermission(page.key, key)} /></td>)}</tr>;
            })}</tbody></table></div>
        </>}
      </section></div>}
    {confirming && draft && selected && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === 'Escape' && !busy) setConfirming(false); }}><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-confirm-title">
      <h2 id="profile-confirm-title">Salvar permissões de {selected.NOME}?</h2><p>{changes} alteração(ões) serão aplicadas ao perfil. Usuários ligados podem precisar renovar a sessão para receber as novas permissões.</p>
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setConfirming(false)}>Cancelar</button><button className="button primary" type="button" disabled={busy} onClick={save}>{busy ? 'Salvando...' : 'Confirmar alterações'}</button></div>
    </div></div>}
    {discardTarget !== null && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === 'Escape') setDiscardTarget(null); }}><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="discard-profile-title">
      <h2 id="discard-profile-title">Descartar alterações?</h2><p>As alterações não salvas deste perfil serão perdidas.</p>
      <div className="confirm-actions"><button className="button secondary" type="button" onClick={() => setDiscardTarget(null)}>Continuar editando</button><button className="button primary" type="button" onClick={() => { setSelectedId(discardTarget); setDiscardTarget(null); }}>Descartar e trocar</button></div>
    </div></div>}
  </main>;
}
