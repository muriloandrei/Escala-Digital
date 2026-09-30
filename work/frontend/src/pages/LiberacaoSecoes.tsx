import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { canEdit, getJson, preferredStore, putJson, type Loja, type User } from '../api';

type AccessUser = { USUARIO_ID: number; LOGIN: string; NOME: string; PERFIL: string };
type AccessSection = { ESCSECAO_ID: number; COD_SECAO?: string; DESCR: string; STATUS?: string };
type SectionAccess = {
  tableReady: boolean;
  usuarios: AccessUser[];
  secoes: AccessSection[];
  secoesLiberadas: number[];
  usuarioInvalido?: boolean;
};

export function LiberacaoSecoes({ user }: { user: User }) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loja, setLoja] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [data, setData] = useState<SectionAccess | null>(null);
  const [original, setOriginal] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ lojas: Loja[] }>('/api/catalog/lojas', controller.signal).then((result) => {
      setLojas(result.lojas || []);
      setLoja((current) => current || preferredStore(user, result.lojas || []));
      if (!result.lojas?.length) { setError('Nenhuma loja disponível para consulta.'); setLoading(false); }
    }).catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    if (!loja) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ lojaId: loja });
    if (usuarioId) query.set('usuarioId', usuarioId);
    getJson<SectionAccess>(`/api/acessos/secoes-usuario?${query}`, controller.signal)
      .then((result) => {
        setData(result);
        setOriginal(result.secoesLiberadas || []);
        const activeIds = new Set((result.secoes || []).map((section) => Number(section.ESCSECAO_ID)));
        setSelected((result.secoesLiberadas || []).filter((id) => activeIds.has(Number(id))));
        setLoading(false);
        if (!usuarioId && result.usuarios?.length) setUsuarioId(String(result.usuarios[0].USUARIO_ID));
      }).catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [loja, usuarioId, reload]);

  const sections = useMemo(() => (data?.secoes || []).filter((section) => `${section.COD_SECAO || ''} ${section.DESCR}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim())), [data, search]);
  const originalSet = new Set(original);
  const selectedSet = new Set(selected);
  const added = selected.filter((id) => !originalSet.has(id));
  const removed = original.filter((id) => !selectedSet.has(id));
  const staleLinks = original.filter((id) => !data?.secoes.some((section) => Number(section.ESCSECAO_ID) === Number(id)));
  const dirty = added.length > 0 || removed.length > 0;
  const activeChanges = added.length > 0 || removed.some((id) => !staleLinks.includes(id));
  const activeSelected = selected.filter((id) => data?.secoes.some((section) => Number(section.ESCSECAO_ID) === Number(id)));
  const currentUser = data?.usuarios.find((item) => String(item.USUARIO_ID) === usuarioId);

  async function save() {
    if (!loja || !usuarioId || !data?.tableReady || busy || (!added.length && !removed.length)) return;
    setBusy(true);
    setError('');
    try {
      const response = await putJson<SectionAccess>('/api/acessos/secoes-usuario', {
        USUARIO_ID: Number(usuarioId), LOJA: Number(loja), SECOES: activeSelected,
      });
      const confirmed = [...(response.secoesLiberadas || [])].sort((a, b) => a - b);
      const requested = [...activeSelected].sort((a, b) => a - b);
      if (confirmed.join(',') !== requested.join(',')) throw new Error('A leitura de volta não confirmou todas as seções. Confira antes de repetir.');
      setMessage(`Seções de ${currentUser?.LOGIN || usuarioId} atualizadas para a Loja ${loja}. A sessão do usuário pode precisar ser renovada.`);
      setConfirming(false);
      setReload((value) => value + 1);
    } catch (reason) {
      setConfirming(false);
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar as seções.');
    } finally { setBusy(false); }
  }

  return <main className="content directory-page">
    <div className="page-heading"><div><h1>Liberação de seções</h1><p>Vínculos de usuários com as seções de cada loja.</p></div>
      <button className="button secondary" type="button" disabled={activeChanges} onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button></div>
    {message && <div className="notice success" role="status">{message}</div>}
    {error && <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div>}
    <section className="list-surface" aria-label="Seções por usuário">
      <div className="filters"><label>Loja<select value={loja} disabled={activeChanges} onChange={(event) => { setUsuarioId(''); setLoja(event.target.value); setMessage(''); }}>
        {lojas.map((item) => <option key={item.LOJA} value={item.LOJA}>Loja {item.LOJA}{item.NOME ? ` · ${item.NOME}` : ''}</option>)}
      </select></label><label>Usuário<select value={usuarioId} disabled={activeChanges} onChange={(event) => { setUsuarioId(event.target.value); setMessage(''); }}>
        {!data?.usuarios?.length && <option value="">Nenhum usuário</option>}
        {(data?.usuarios || []).map((item) => <option key={item.USUARIO_ID} value={item.USUARIO_ID}>{item.LOGIN} · {item.NOME}</option>)}
      </select></label><label className="search-field"><Search size={17} /><span className="sr-only">Buscar seção</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar seção" /></label></div>
      {loading ? <div className="empty-state" role="status">Carregando seções...</div> : !data?.tableReady ? <div className="empty-state">O cadastro de vínculos por seção não está disponível neste banco.</div> : data.usuarioInvalido ? <div className="notice error">O usuário selecionado não está vinculado a esta loja.</div> : !currentUser ? <div className="empty-state">Nenhum usuário vinculado à loja.</div> : <>
        <div className="event-summary"><span><strong>{activeSelected.length}</strong> seção(ões) ativas liberada(s) para {currentUser.LOGIN}</span>
          {dirty && <span>{added.length} inclusão(ões) · {removed.length} remoção(ões) não salvas</span>}</div>
        {staleLinks.length > 0 && <div className="notice warning" role="status">{staleLinks.length} vínculo(s) com seção inativa ou fora do catálogo atual ({staleLinks.join(', ')}). Ao salvar, esses vínculos serão removidos da loja selecionada.</div>}
        {currentUser.PERFIL !== 'LIDER' && <div className="event-summary">Este perfil pode ter acesso por loja e perfil; os vínculos desta tela são determinantes para Líder.</div>}
        {!sections.length ? <div className="empty-state">Nenhuma seção encontrada.</div> : <div className="section-access-list">{sections.map((section) => <label key={section.ESCSECAO_ID}>
          <input type="checkbox" disabled={!canEdit(user, 'liberacao-secoes') || busy} checked={selectedSet.has(Number(section.ESCSECAO_ID))} onChange={(event) => setSelected(event.target.checked ? [...selected, Number(section.ESCSECAO_ID)] : selected.filter((id) => id !== Number(section.ESCSECAO_ID)))} />
          <span><strong>{section.COD_SECAO} · {section.DESCR}</strong><small>{section.STATUS === 'I' ? 'Inativa' : 'Ativa'}</small></span>
        </label>)}</div>}
        {canEdit(user, 'liberacao-secoes') && <div className="access-save-bar">{activeChanges && <button className="button secondary" type="button" disabled={busy} onClick={() => setSelected(original.filter((id) => !staleLinks.includes(id)))}>Descartar seleção</button>}<button className="button primary" type="button" disabled={busy || !dirty} onClick={() => setConfirming(true)}>Salvar liberações</button></div>}
      </>}
    </section>
    {confirming && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === 'Escape' && !busy) setConfirming(false); }}><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="sections-confirm-title">
      <h2 id="sections-confirm-title">Atualizar seções de {currentUser?.LOGIN}?</h2><p>Loja {loja}: {added.length} inclusão(ões), {removed.length} remoção(ões). As permissões efetivas dependem também do perfil e da sessão do usuário.</p>
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setConfirming(false)}>Cancelar</button><button className="button primary" type="button" disabled={busy} onClick={save}>{busy ? 'Salvando...' : 'Confirmar alterações'}</button></div>
    </div></div>}
  </main>;
}
