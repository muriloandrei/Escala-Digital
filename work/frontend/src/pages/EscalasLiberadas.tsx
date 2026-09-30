import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, RefreshCw, Search } from 'lucide-react';
import { getJson, type Loja, type ResumoEscala, type User } from '../api';

const months = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function dateKey(value: string | undefined) {
  return value ? String(value).slice(0, 10) : '';
}

function monthLabel(value: string) {
  const key = dateKey(value);
  const index = Number(key.slice(5, 7)) - 1;
  return index >= 0 && index < 12 ? `${months[index]} ${key.slice(0, 4)}` : key;
}

function displayDate(value: string | undefined) {
  const key = dateKey(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(0, 4)}` : '—';
}

export function EscalasLiberadas({ user }: { user: User }) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [escalas, setEscalas] = useState<ResumoEscala[]>([]);
  const [loja, setLoja] = useState('all');
  const [mes, setMes] = useState('all');
  const [ano, setAno] = useState('all');
  const [status, setStatus] = useState('all');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      getJson<{ lojas: Loja[] }>('/api/catalog/lojas', controller.signal),
      getJson<{ escalas: ResumoEscala[] }>('/api/escalas/resumo', controller.signal),
    ])
      .then(([storeData, scheduleData]) => {
        setLojas(storeData.lojas || []);
        setEscalas(scheduleData.escalas || []);
        setLoading(false);
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [reload]);

  const years = useMemo(
    () =>
      [...new Set(escalas.map((item) => dateKey(item.MES_REF).slice(0, 4)).filter(Boolean))].sort().reverse(),
    [escalas],
  );
  const visible = useMemo(
    () =>
      escalas.filter((item) => {
        const key = dateKey(item.MES_REF);
        const text = `${item.LOJA} ${monthLabel(key)} ${item.STATUS || ''}`.toLocaleLowerCase('pt-BR');
        return (
          (loja === 'all' || String(item.LOJA) === loja) &&
          (mes === 'all' || key.slice(5, 7) === mes) &&
          (ano === 'all' || key.slice(0, 4) === ano) &&
          (status === 'all' || item.STATUS === status) &&
          text.includes(busca.toLocaleLowerCase('pt-BR').trim())
        );
      }),
    [escalas, loja, mes, ano, status, busca],
  );

  return (
    <main className="content">
      <div className="page-heading">
        <div>
          <h1>Escalas liberadas</h1>
          <p>Consulte as escalas disponiveis para o seu perfil.</p>
        </div>
        <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>
      <section className="list-surface" aria-label="Escalas liberadas">
        <div className="filters">
          <label className="search-field">
            <Search size={17} />
            <span className="sr-only">Buscar escalas</span>
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar loja, mes ou status"
            />
          </label>
          <label>
            Loja
            <select value={loja} onChange={(event) => setLoja(event.target.value)}>
              <option value="all">Todas as lojas</option>
              {lojas.map((item) => (
                <option key={item.LOJA} value={item.LOJA}>
                  Loja {item.LOJA}
                  {item.NOME ? ` · ${item.NOME}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mes
            <select value={mes} onChange={(event) => setMes(event.target.value)}>
              <option value="all">Todos</option>
              {months.map((name, index) => (
                <option key={name} value={String(index + 1).padStart(2, '0')}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ano
            <select value={ano} onChange={(event) => setAno(event.target.value)}>
              <option value="all">Todos</option>
              {years.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Todos</option>
              {[...new Set(escalas.map((item) => item.STATUS).filter(Boolean))].sort().map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="list-meta">
          {loading ? 'Carregando...' : `${visible.length} escala(s) encontrada(s)`}
        </div>
        {error && (
          <div className="notice error" role="alert">
            {error}{' '}
            <button type="button" onClick={() => setReload((value) => value + 1)}>
              Tentar novamente
            </button>
          </div>
        )}
        {!error && !loading && !visible.length && (
          <div className="empty-state">
            {escalas.length
              ? 'Nenhuma escala corresponde aos filtros.'
              : 'Nenhuma escala liberada para as secoes do seu perfil.'}
          </div>
        )}
        {!error && !loading && !!visible.length && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Loja</th>
                  <th>Status</th>
                  <th>Oficializacao</th>
                  <th>Secoes</th>
                  <th>Funcionarios</th>
                  <th>Modificada em</th>
                  <th>Modificada por</th>
                  <th>
                    <span className="sr-only">Acoes</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const key = dateKey(item.MES_REF);
                  const official = Number(item.OFICIALIZADA) === 1;
                  const partial = !official && Number(item.OFICIALIZADA_ALGUMA) === 1;
                  return (
                    <tr key={`${item.LOJA}-${key}`}>
                      <td>
                        <strong>{monthLabel(key)}</strong>
                        <small>{displayDate(key)}</small>
                      </td>
                      <td>Loja {item.LOJA}</td>
                      <td>
                        <span className="status">{item.STATUS}</span>
                      </td>
                      <td>{official ? 'Sim' : partial ? 'Parcial' : 'Nao'}</td>
                      <td>{item.SECOES ?? 0}</td>
                      <td>{item.FUNCIONARIOS ?? 0}</td>
                      <td>{displayDate(item.MODIFICADA_EM)}</td>
                      <td>{item.MODIFICADO_POR || 'Sistema'}</td>
                      <td>
                        <a
                          className="open-link"
                          href={`/app#/escala-banco-mensal/${encodeURIComponent(item.LOJA)}/${encodeURIComponent(key)}`}
                          aria-label={`Abrir escala da loja ${item.LOJA} de ${monthLabel(key)}`}
                        >
                          <ArrowUpRight size={17} /> Abrir
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="access-note">
        Conectado como {user.perfil}. Os dados exibidos seguem as permissoes da sua sessao.
      </p>
    </main>
  );
}
