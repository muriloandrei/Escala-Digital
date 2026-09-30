import { useEffect, useMemo, useState } from 'react';
import { History, RefreshCw, Search } from 'lucide-react';
import { getJson, preferredStore, type Loja, type User } from '../api';

type HistoricoItem = {
  AUDITORIA_ID?: number;
  DT_HR_INCL?: string;
  ACAO?: string;
  LOJA?: number;
  MES_REF?: string;
  REVISAO?: number;
  NOME_USUARIO?: string;
  LOGIN?: string;
  DETALHE?: string;
};

function displayDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
  }).format(date);
}

function detailText(value?: string) {
  if (!value) return 'Sem detalhes.';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function Historico({ user }: { user: User }) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loja, setLoja] = useState('');
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<HistoricoItem[]>([]);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      .catch((reason) => {
        if (reason.name !== 'AbortError') {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    if (!loja || !/^\d{4}-\d{2}$/.test(month)) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setRows([]);
    const query = new URLSearchParams({ lojaId: loja, mesRef: `${month}-01` });
    getJson<{ historico: HistoricoItem[]; indisponivel?: boolean }>(`/api/escalas/historico?${query}`, controller.signal)
      .then((data) => {
        if (data.indisponivel) throw new Error('Histórico de auditoria indisponível.');
        setRows([...(data.historico || [])].sort((a, b) =>
          String(b.DT_HR_INCL || '').localeCompare(String(a.DT_HR_INCL || '')) ||
          Number(b.AUDITORIA_ID || 0) - Number(a.AUDITORIA_ID || 0),
        ));
        setLoading(false);
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [loja, month, reload]);

  const filtered = useMemo(() => {
    const term = search.toLocaleLowerCase('pt-BR').trim();
    return rows.filter((item) => !term || `${item.ACAO || ''} ${item.NOME_USUARIO || ''} ${item.LOGIN || ''} ${item.DETALHE || ''}`
      .toLocaleLowerCase('pt-BR').includes(term));
  }, [rows, search]);

  return (
    <main className="content directory-page">
      <div className="page-heading">
        <div><h1>Histórico administrativo</h1><p>Registros de auditoria da loja e do mês selecionados.</p></div>
        <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>
      <section className="list-surface" aria-label="Histórico de auditoria">
        <div className="filters">
          <label>Loja
            <select value={loja} onChange={(event) => { setLoja(event.target.value); setLimit(100); }}>
              {lojas.map((item) => <option key={item.LOJA} value={item.LOJA}>Loja {item.LOJA}{item.NOME ? ` · ${item.NOME}` : ''}</option>)}
            </select>
          </label>
          <label>Mês
            <input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setLimit(100); }} />
          </label>
          <label className="search-field"><Search size={17} /><span className="sr-only">Buscar no histórico</span>
            <input value={search} onChange={(event) => { setSearch(event.target.value); setLimit(100); }} placeholder="Ação, usuário ou detalhe" />
          </label>
        </div>
        {loading ? <div className="empty-state" role="status">Carregando histórico...</div>
          : error ? <div className="notice error" role="alert">Histórico indisponível: {error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div>
            : !filtered.length ? <div className="empty-state">Nenhum registro encontrado para os filtros selecionados.</div>
              : <>
                <div className="event-summary"><span><History size={15} /> <strong>{filtered.length}</strong> registro(s)</span></div>
                <div className="table-scroll"><table>
                  <thead><tr><th>Data</th><th>Ação</th><th>Loja / mês</th><th>Revisão</th><th>Usuário</th><th>Detalhes</th></tr></thead>
                  <tbody>{filtered.slice(0, limit).map((item, index) => <tr key={item.AUDITORIA_ID || `${item.DT_HR_INCL}-${index}`}>
                    <td>{displayDate(item.DT_HR_INCL)}</td>
                    <td><strong>{item.ACAO || '—'}</strong></td>
                    <td>Loja {item.LOJA || loja}<small className="table-subline">{item.MES_REF ? String(item.MES_REF).slice(0, 7) : month}</small></td>
                    <td>{item.REVISAO ?? '—'}</td>
                    <td>{item.NOME_USUARIO || item.LOGIN || 'Sistema'}</td>
                    <td><details className="history-details"><summary>Ver detalhes</summary><pre>{detailText(item.DETALHE)}</pre></details></td>
                  </tr>)}</tbody>
                </table></div>
                {filtered.length > limit && <div className="load-more"><button className="button secondary" type="button" onClick={() => setLimit((value) => value + 100)}>Mostrar mais</button></div>}
              </>}
      </section>
    </main>
  );
}
