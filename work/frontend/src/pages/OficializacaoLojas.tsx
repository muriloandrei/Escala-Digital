import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getJson, putJson, type Loja } from '../api';

type Store = Loja & { OFICIALIZACAO_HABILITADA?: number };

export function OficializacaoLojas() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ lojas: Store[] }>('/api/catalog/lojas', controller.signal)
      .then(({ lojas }) => { setStores(lojas); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [reload]);

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

  return <main className="content directory-page"><div className="page-heading"><div><h1>Oficialização por loja</h1><p>Controle de disponibilidade da oficialização.</p></div>
    <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    <section className="list-surface" aria-label="Oficialização por loja">
      {loading ? <div className="empty-state" role="status">Carregando lojas...</div> : <div className="table-scroll"><table><thead><tr><th>Loja</th><th>Oficialização</th></tr></thead>
        <tbody>{stores.map((store) => <tr key={store.LOJA}><td>Loja {store.LOJA}{store.NOME ? ` · ${store.NOME}` : ''}</td><td>
          <label className="store-toggle"><input type="checkbox" checked={Number(store.OFICIALIZACAO_HABILITADA) === 1} disabled={busy !== null}
            onChange={() => toggle(store)} /> Habilitada</label>
        </td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
