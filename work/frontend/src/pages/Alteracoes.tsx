import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, RefreshCw, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getJson,
  preferredStore,
  type EscalaEvento,
  type EventosResumo,
  type Loja,
  type Secao,
  type User,
} from '../api';

const PAGE_SIZE = 100;
const actionNames: Record<string, string> = {
  ALTERAR_DIA: 'Alteração de dia',
  ALTERAR_HORARIO: 'Alteração de horário',
  GERAR_ESCALA: 'Geração de escala',
  RESETAR_ESCALA: 'Reset de escala',
  OFICIALIZAR: 'Oficialização',
  TRANSFERIR_SUBSECAO: 'Transferência de subseção',
};

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function details(event: EscalaEvento) {
  const pairs = Object.entries(event.DETALHE || {}).filter(
    ([, value]) => value !== null && value !== undefined && typeof value !== 'object',
  );
  return pairs
    .map(([key, value]) => `${key.replaceAll('_', ' ').toLocaleLowerCase('pt-BR')}: ${String(value)}`)
    .join(' · ');
}

export function Alteracoes({ user }: { user: User }) {
  const [params, setParams] = useSearchParams();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [eventos, setEventos] = useState<EscalaEvento[]>([]);
  const [resumo, setResumo] = useState<EventosResumo | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const loja = params.get('loja') || preferredStore(user, lojas);
  const mes = params.get('mes') || '';
  const secao = params.get('secao') || '';

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
    getJson<{ secoes: Secao[] }>(`/api/catalog/lojas/${encodeURIComponent(loja)}/secoes`, controller.signal)
      .then((data) => setSecoes(data.secoes || []))
      .catch((reason) => {
        if (reason.name !== 'AbortError') setError(reason.message);
      });
    return () => controller.abort();
  }, [loja]);

  useEffect(() => {
    if (!loja) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ lojaId: loja, limit: String(PAGE_SIZE), offset: String(offset) });
    if (mes) query.set('mesRef', `${mes}-01`);
    if (secao) query.set('escsecaoId', secao);
    getJson<{ eventos: EscalaEvento[]; resumo: EventosResumo | null }>(
      `/api/escalas/eventos?${query}`,
      controller.signal,
    )
      .then((data) => {
        const page = data.eventos || [];
        setEventos((current) => (offset === 0 ? page : [...current, ...page]));
        if (data.resumo) setResumo(data.resumo);
        setHasMore(page.length === PAGE_SIZE);
        setLoading(false);
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [loja, mes, secao, offset, reload]);

  const visible = useMemo(
    () =>
      eventos.filter((item) =>
        `${item.FUNCIONARIO_CHAPA || ''} ${item.FUNCIONARIO_NOME || ''} ${item.SECAO_NOME || ''} ${item.LOGIN} ${item.ACAO}`
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR').trim()),
      ),
    [eventos, search],
  );

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === 'loja') next.delete('secao');
    setParams(next);
    setEventos([]);
    setResumo(null);
    setOffset(0);
  }

  return (
    <main className="content directory-page">
      <div className="page-heading">
        <div>
          <h1>Alterações da escala</h1>
          <p>Movimentações registradas por loja, seção e colaborador.</p>
        </div>
        <a className="button secondary" href="/app#/alteracoes">
          <ArrowUpRight size={16} /> Interface atual
        </a>
      </div>
      <section className="list-surface" aria-label="Alterações da escala">
        <div className="filters">
          <label>
            Loja
            <select value={loja} onChange={(event) => updateFilter('loja', event.target.value)}>
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
          <label>
            Mês
            <input type="month" value={mes} onChange={(event) => updateFilter('mes', event.target.value)} />
          </label>
          <label>
            Seção
            <select value={secao} onChange={(event) => updateFilter('secao', event.target.value)}>
              <option value="">Todas</option>
              {secoes.map((item) => (
                <option key={item.ESCSECAO_ID} value={item.ESCSECAO_ID}>
                  {item.DESCR}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <Search size={17} />
            <span className="sr-only">Buscar alteração</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Funcionário, ação ou usuário"
            />
          </label>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setOffset(0);
              setReload((value) => value + 1);
            }}
            title="Atualizar alterações"
            aria-label="Atualizar alterações"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        {resumo && (
          <div className="event-summary">
            <span>
              <strong>{resumo.total}</strong> alterações
            </span>
            <span>
              <strong>{resumo.colaboradores}</strong> colaboradores
            </span>
            <span>
              <strong>{resumo.manuais}</strong> manuais
            </span>
            <span>
              <strong>{resumo.antes}</strong> antes da oficialização
            </span>
            <span>
              <strong>{resumo.depois}</strong> depois
            </span>
          </div>
        )}
        <div className="list-meta">
          {loading && offset === 0 ? 'Carregando...' : `${visible.length} registro(s) exibido(s)`}
        </div>
        {error && (
          <div className="notice error" role="alert">
            {error}{' '}
            <button type="button" onClick={() => setReload((value) => value + 1)}>
              Tentar novamente
            </button>
          </div>
        )}
        {!loading && !error && !visible.length && (
          <div className="empty-state">Nenhuma alteração encontrada para estes filtros.</div>
        )}
        {!!visible.length && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Funcionário</th>
                  <th>Seção</th>
                  <th>Ação</th>
                  <th>Situação</th>
                  <th>Usuário</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.EVENTO_ID}>
                    <td>{displayDate(item.DT_HR_INCL)}</td>
                    <td>
                      <strong>{item.FUNCIONARIO_NOME || 'Escala / seção'}</strong>
                      <small className="table-subline">{item.FUNCIONARIO_CHAPA || `Loja ${item.LOJA}`}</small>
                    </td>
                    <td>{item.SECAO_NOME || '–'}</td>
                    <td>
                      <strong>{actionNames[item.ACAO] || item.ACAO.replaceAll('_', ' ')}</strong>
                      {details(item) && <small className="table-subline">{details(item)}</small>}
                    </td>
                    <td>{item.SITUACAO.replaceAll('_', ' ')}</td>
                    <td>{item.LOGIN}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && (
          <div className="load-more">
            <button
              type="button"
              className="button secondary"
              disabled={loading}
              onClick={() => setOffset((value) => value + PAGE_SIZE)}
            >
              {loading ? 'Carregando...' : 'Carregar mais'}
            </button>
          </div>
        )}
      </section>
      {mes && (
        <p className="event-link">
          <Link to={`/escalas/${encodeURIComponent(loja)}/${mes}-01`}>
            Abrir escala deste mês <ArrowUpRight size={14} />
          </Link>
        </p>
      )}
    </main>
  );
}
