import { Fragment, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJson, putJson, type Loja } from '../api';

type Store = Loja & { OFICIALIZACAO_HABILITADA?: number };
type SectionProgress = { escsecaoId: number; codigo: string; secao: string; funcionarios: number; percentual: number; oficializada: boolean };
type ProgressGroup = SectionProgress & { partes: SectionProgress[] };
type StoreProgress = { secoes: SectionProgress[]; grupos: ProgressGroup[] };
const PAGE_SIZE = 8;

export function OficializacaoLojas() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [month, setMonth] = useState(() => new Date().toLocaleDateString('sv-SE').slice(0, 7));
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState<Record<number, StoreProgress>>({});
  const [progressErrors, setProgressErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ lojas: Store[] }>('/api/catalog/lojas', controller.signal)
      .then(({ lojas }) => { setStores(lojas); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [reload]);

  const filtered = useMemo(() => stores.filter((store) =>
    `${store.LOJA} ${store.NOME || ''}`.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))
  ), [stores, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page]);

  useEffect(() => {
    const controller = new AbortController();
    setProgress({});
    setProgressErrors({});
    async function loadPage() {
      for (let index = 0; index < visible.length; index += 2) {
        await Promise.all(visible.slice(index, index + 2).map(async (store) => {
          try {
            const { progresso } = await getJson<{ progresso: StoreProgress }>(
              `/api/escalas/progresso?${new URLSearchParams({ lojaId: String(store.LOJA), mesRef: `${month}-01`, includeEmpty: '1' })}`,
              controller.signal,
            );
            if (!controller.signal.aborted) setProgress((current) => ({ ...current, [store.LOJA]: progresso }));
          } catch (reason) {
            if (!controller.signal.aborted) setProgressErrors((current) => ({ ...current,
              [store.LOJA]: reason instanceof Error ? reason.message : 'Falha na consulta.' }));
          }
        }));
        if (controller.signal.aborted) break;
      }
    }
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(month) && visible.length) void loadPage();
    return () => controller.abort();
  }, [visible, month, reload]);

  async function toggle(store: Store) {
    if (busy !== null) return;
    setBusy(store.LOJA);
    setError('');
    try {
      const habilitada = Number(store.OFICIALIZACAO_HABILITADA) !== 1;
      await putJson('/api/escalas/oficializacao-loja', { lojaId: Number(store.LOJA), habilitada });
      setStores((current) => current.map((item) => item.LOJA === store.LOJA
        ? { ...item, OFICIALIZACAO_HABILITADA: habilitada ? 1 : 0 } : item));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar a loja.'); }
    finally { setBusy(null); }
  }

  return <main className="content directory-page"><div className="page-heading"><div><h1>Oficialização por loja</h1><p>Acompanhamento das seções e disponibilidade da oficialização.</p></div>
    <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    <div className="officialization-filters">
      <label>Mês da escala<input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setPage(0); }} /></label>
      <label>Loja<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Número ou nome" /></label>
    </div>
    <section className="list-surface" aria-label="Relatório de oficialização por seção">
      {loading ? <div className="empty-state" role="status">Carregando lojas...</div> : <div className="table-scroll"><table className="officialization-table"><thead><tr><th>Loja / seção</th><th>Funcionários</th><th>Situação</th><th>Oficialização</th></tr></thead>
        <tbody>{visible.map((store) => {
          const result = progress[store.LOJA];
          const failure = progressErrors[store.LOJA];
          const staffed = result?.secoes.filter((section) => section.funcionarios > 0) || [];
          const situation = failure ? 'Falha na consulta' : !result ? 'Consultando...'
            : !staffed.length ? 'Sem seções com funcionários'
              : staffed.every((section) => section.oficializada) ? 'Oficializada' : 'Em andamento';
          return <Fragment key={store.LOJA}>
            <tr className="officialization-store"><th scope="row">Loja {store.LOJA}{store.NOME ? ` · ${store.NOME}` : ''}</th><td>{result ? staffed.reduce((sum, section) => sum + section.funcionarios, 0) : '–'}</td><td>{situation}</td><td>
              <label className="store-toggle"><input type="checkbox" checked={Number(store.OFICIALIZACAO_HABILITADA) === 1} disabled={busy !== null}
                onChange={() => toggle(store)} /> Habilitada</label>
            </td></tr>
            {failure && <tr><td colSpan={4} className="officialization-message" role="alert">{failure}</td></tr>}
            {result?.grupos.map((group) => <Fragment key={group.escsecaoId}>
              <tr><td className="officialization-section">{group.partes.length > 1 ? `${group.codigo} · ${group.secao}` : <Link to={`/escalas/${store.LOJA}/${month}-01?secao=${group.escsecaoId}`}>{group.codigo} · {group.secao}</Link>}</td><td>{group.funcionarios}</td><td><span className={`officialization-status ${group.oficializada ? 'complete' : 'pending'}`}>{!group.funcionarios ? 'Sem funcionários' : group.oficializada ? 'Oficializada' : `${group.percentual}% preenchida`}</span></td><td>–</td></tr>
              {group.partes.length > 1 && group.partes.map((part) => <tr key={part.escsecaoId}><td className="officialization-part"><Link to={`/escalas/${store.LOJA}/${month}-01?secao=${part.escsecaoId}`}>{part.codigo} · {part.secao}</Link></td><td>{part.funcionarios}</td><td><span className={`officialization-status ${part.oficializada ? 'complete' : 'pending'}`}>{!part.funcionarios ? 'Sem funcionários' : part.oficializada ? 'Oficializada' : `${part.percentual}% preenchida`}</span></td><td>–</td></tr>)}
            </Fragment>)}
          </Fragment>;
        })}</tbody></table></div>}
    </section>
    {!loading && filtered.length > PAGE_SIZE && <nav className="officialization-pages" aria-label="Páginas do relatório">
      <button className="button secondary" type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Anterior</button>
      <span>Página {page + 1} de {pageCount} · {filtered.length} lojas</span>
      <button className="button secondary" type="button" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)}>Próxima</button>
    </nav>}
  </main>;
}
