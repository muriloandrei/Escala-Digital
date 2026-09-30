import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, RefreshCw, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJson, preferredStore, type Funcionario, type Loja, type Secao, type User } from '../api';

export function Secoes({ user }: { user: User }) {
  const [params, setParams] = useSearchParams();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const loja = params.get('loja') || preferredStore(user, lojas);

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ lojas: Loja[] }>('/api/catalog/lojas', controller.signal)
      .then((data) => setLojas(data.lojas || []))
      .catch((reason) => {
        if (reason.name !== 'AbortError') setError(reason.message);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!loja) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      getJson<{ secoes: Secao[] }>(
        `/api/catalog/lojas/${encodeURIComponent(loja)}/secoes`,
        controller.signal,
      ),
      getJson<{ funcionarios: Funcionario[] }>(
        `/api/catalog/lojas/${encodeURIComponent(loja)}/funcionarios`,
        controller.signal,
      ),
    ])
      .then(([sectionData, peopleData]) => {
        setSecoes(sectionData.secoes || []);
        setFuncionarios(peopleData.funcionarios || []);
        setLoading(false);
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [loja, reload]);

  const counts = useMemo(() => {
    const map = new Map<number, number>();
    funcionarios.forEach((item) => {
      if (item.ESCSECAO_ID) map.set(item.ESCSECAO_ID, (map.get(item.ESCSECAO_ID) || 0) + 1);
    });
    return map;
  }, [funcionarios]);
  const visible = useMemo(
    () =>
      secoes.filter((item) =>
        `${item.COD_SECAO || ''} ${item.DESCR}`
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR').trim()),
      ),
    [secoes, search],
  );

  return (
    <main className="content directory-page">
      <div className="page-heading">
        <div>
          <h1>Seções</h1>
          <p>Estrutura e equipes da loja selecionada.</p>
        </div>
        <a className="button secondary" href="/app#/secoes">
          <ArrowUpRight size={16} /> Gerenciar na interface atual
        </a>
      </div>
      <section className="list-surface" aria-label="Seções">
        <div className="filters">
          <label>
            Loja
            <select value={loja} onChange={(event) => setParams({ loja: event.target.value })}>
              <option value="" disabled>
                Selecione
              </option>
              {lojas.map((item) => (
                <option key={item.LOJA} value={item.LOJA}>
                  Loja {item.LOJA}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <Search size={17} />
            <span className="sr-only">Buscar seção</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Código ou nome da seção"
            />
          </label>
          <button
            className="button secondary"
            type="button"
            onClick={() => setReload((value) => value + 1)}
            aria-label="Atualizar seções"
            title="Atualizar seções"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="list-meta">{loading ? 'Carregando...' : `${visible.length} seção(ões)`}</div>
        {error && (
          <div className="notice error" role="alert">
            {error}{' '}
            <button type="button" onClick={() => setReload((value) => value + 1)}>
              Tentar novamente
            </button>
          </div>
        )}
        {!error && !loading && !visible.length && (
          <div className="empty-state">Nenhuma seção encontrada.</div>
        )}
        {!error && !loading && !!visible.length && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Seção</th>
                  <th>Funcionários ativos</th>
                  <th>Subseções</th>
                  <th>Situação</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.ESCSECAO_ID}>
                    <td>{item.COD_SECAO || '–'}</td>
                    <td>
                      <strong>{item.DESCR}</strong>
                    </td>
                    <td>{counts.get(item.ESCSECAO_ID) || 0}</td>
                    <td>{(item.SUBSECOES || []).filter((sub) => sub.STATUS === 'A').length}</td>
                    <td>{item.STATUS === 'I' ? 'Inativa' : 'Ativa'}</td>
                    <td>
                      <Link
                        className="open-link"
                        to={`/secoes/${encodeURIComponent(loja)}/${item.ESCSECAO_ID}/subsecoes`}
                      >
                        Subseções <ArrowUpRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
