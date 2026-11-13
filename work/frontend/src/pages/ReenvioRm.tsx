import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Send } from 'lucide-react';
import { ApiError, getJson, postJson, preferredStore, type Loja, type User } from '../api';

type Candidate = {
  ESCFUNC_ID: number; CHAPA: string; NOME: string; ESCSECAO_ID: number;
  REVISAO: number; OFICIALIZADA: number; DIAS: number; FOLGAS: number; BLOQUEIO: string | null;
};
type Result = { status: string; error?: string; enviados?: number };

export function ReenvioRm({ user }: { user: User }) {
  const [stores, setStores] = useState<Loja[]>([]);
  const [store, setStore] = useState('');
  const [month, setMonth] = useState(() => new Date().toLocaleDateString('sv-SE').slice(0, 7));
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [period, setPeriod] = useState<{ inicio: string; fim: string } | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<Record<number, Result>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ lojas: Loja[] }>('/api/catalog/lojas', controller.signal)
      .then(({ lojas }) => { setStores(lojas); setStore((current) => current || preferredStore(user, lojas)); })
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); });
    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    setSelected(new Set());
    setResults({});
    setCandidates([]);
    setPeriod(null);
    setError('');
    if (!store || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    getJson<{ candidatos: Candidate[]; periodo: { inicio: string; fim: string } }>(
      `/api/escalas/rm/reenvio-candidatos?${new URLSearchParams({ lojaId: store, mesRef: `${month}-01` })}`,
      controller.signal
    ).then(({ candidatos, periodo }) => { setCandidates(candidatos); setPeriod(periodo); })
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [store, month, reload]);

  const visible = useMemo(() => candidates.filter((item) =>
    `${item.CHAPA} ${item.NOME}`.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR'))
  ), [candidates, search]);
  const eligibleVisible = visible.filter((item) => !item.BLOQUEIO);
  const allVisibleSelected = eligibleVisible.length > 0 && eligibleVisible.every((item) => selected.has(item.ESCFUNC_ID));
  const selection = candidates.filter((item) => selected.has(item.ESCFUNC_ID) && !item.BLOQUEIO);
  const unofficialized = selection.filter((item) => Number(item.OFICIALIZADA) !== 1).length;

  function toggleOne(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelected((current) => {
      const next = new Set(current);
      eligibleVisible.forEach((item) => {
        if (allVisibleSelected) next.delete(item.ESCFUNC_ID); else next.add(item.ESCFUNC_ID);
      });
      return next;
    });
  }

  async function sendSelected() {
    if (busy || !selection.length) return;
    setConfirming(false);
    setBusy(true);
    setDone(0);
    setTotal(selection.length);
    setError('');
    for (const item of selection) {
      try {
        const response = await postJson<{ resultado: { status: string; erros?: string[]; enviados?: number } }>(
          '/api/escalas/rm/reenviar-revisao',
          { lojaId: Number(store), mesRef: `${month}-01`, escfuncId: item.ESCFUNC_ID, revisaoEsperada: Number(item.REVISAO) }
        );
        setResults((current) => ({ ...current, [item.ESCFUNC_ID]: {
          status: response.resultado.status, error: response.resultado.erros?.join('; '), enviados: response.resultado.enviados
        } }));
        if (response.resultado.status === 'ENVIADO') {
          setSelected((current) => { const next = new Set(current); next.delete(item.ESCFUNC_ID); return next; });
        }
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : 'Falha no reenvio.';
        setResults((current) => ({ ...current, [item.ESCFUNC_ID]: { status: 'VERIFICAR', error: message } }));
        if (reason instanceof ApiError && reason.status === 0) {
          setError('Conexão interrompida. Confira os logs do RM antes de repetir este funcionário.');
          break;
        }
      }
      setDone((current) => current + 1);
    }
    setBusy(false);
  }

  return <main className="content directory-page rm-resend-page">
    <div className="page-heading"><div><h1>Reenvio de escalas ao RM</h1>
      <p>Última revisão ativa de cada funcionário, independente da oficialização.</p></div>
      <button className="button secondary" type="button" disabled={busy || loading} onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button>
    </div>
    {error && <div className="notice error" role="alert">{error}</div>}
    <section className="list-surface" aria-label="Reenvio de escalas ao RM">
      <div className="filters rm-resend-filters">
        <label>Loja<select value={store} disabled={busy} onChange={(event) => setStore(event.target.value)}>
          <option value="">Selecione</option>{stores.map((item) => <option key={item.LOJA} value={item.LOJA}>Loja {item.LOJA}{item.NOME ? ` · ${item.NOME}` : ''}</option>)}
        </select></label>
        <label>Competência<input type="month" value={month} disabled={busy} onChange={(event) => setMonth(event.target.value)} /></label>
        <label className="search-field">Funcionário<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou chapa" /></label>
      </div>
      <div className="rm-resend-toolbar">
        <span>{period ? `${period.inicio} a ${period.fim} · ` : ''}{candidates.length} funcionário(s) · {candidates.filter((item) => !item.BLOQUEIO).length} apto(s) · {selected.size} selecionado(s)</span>
        <button className="button primary" type="button" disabled={busy || loading || !selection.length} onClick={() => setConfirming(true)}><Send size={16} /> Reenviar selecionados</button>
      </div>
      {busy && <div className="list-meta" role="status">Processando {done} de {total} funcionário(s)...</div>}
      {loading ? <div className="empty-state" role="status">Consultando revisões...</div>
        : !visible.length ? <div className="empty-state">Nenhuma escala encontrada para o filtro.</div>
          : <div className="table-scroll rm-resend-table"><table><thead><tr>
            <th><input type="checkbox" aria-label="Selecionar funcionários aptos visíveis" disabled={busy || !eligibleVisible.length} checked={allVisibleSelected} onChange={toggleVisible} /></th>
            <th>Funcionário</th><th>Seção</th><th>Revisão</th><th>Escala</th><th>Dias</th><th>Folgas RM</th><th>Resultado</th>
          </tr></thead><tbody>{visible.map((item) => <tr key={item.ESCFUNC_ID}>
            <td><input type="checkbox" aria-label={`Selecionar ${item.NOME}`} checked={selected.has(item.ESCFUNC_ID)} disabled={busy || Boolean(item.BLOQUEIO)} onChange={() => toggleOne(item.ESCFUNC_ID)} /></td>
            <td><strong>{item.NOME}</strong><small>{item.CHAPA}</small></td>
            <td>{item.ESCSECAO_ID}</td><td>{item.REVISAO}</td>
            <td>{Number(item.OFICIALIZADA) === 1 ? 'Oficializada' : 'Não oficializada'}</td>
            <td>{item.DIAS}</td><td>{item.FOLGAS}</td>
            <td className={results[item.ESCFUNC_ID]?.status === 'ENVIADO' ? 'rm-resend-success'
              : results[item.ESCFUNC_ID] || item.BLOQUEIO ? 'rm-resend-problem' : ''}>
              {results[item.ESCFUNC_ID] ? `${results[item.ESCFUNC_ID].status}${results[item.ESCFUNC_ID].error ? ` · ${results[item.ESCFUNC_ID].error}` : ''}` : item.BLOQUEIO || 'Apto'}
            </td>
          </tr>)}</tbody></table></div>}
    </section>
    {confirming && <div className="confirm-backdrop" role="presentation"><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="rm-resend-title">
      <h2 id="rm-resend-title">Reenviar {selection.length} escala(s) ao RM?</h2>
      <p>Serão reconciliadas as folgas da última revisão ativa no período {period?.inicio} a {period?.fim}. {unofficialized} escala(s) ainda não oficializada(s) também serão enviadas. Nenhuma revisão ou oficialização será alterada.</p>
      <div className="confirm-actions"><button className="button secondary" type="button" onClick={() => setConfirming(false)}>Cancelar</button>
        <button className="button primary" type="button" onClick={() => void sendSelected()}>Confirmar reenvio</button></div>
    </div></div>}
  </main>;
}
