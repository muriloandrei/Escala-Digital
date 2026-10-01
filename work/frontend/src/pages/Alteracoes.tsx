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
  type Subsecao,
  type User,
} from '../api';

const PAGE_SIZE = 100;
const actionNames: Record<string, string> = {
  EDITAR_DIA_ESCALA: 'Alteração de dia',
  EDITAR_HORARIO_ESCALA: 'Alteração de horário',
  EDITAR_HORARIO_BASE: 'Horário-base',
  EDITAR_ESCALA_FUNCIONARIO: 'Escala individual',
  GERAR_ESCALA_SECAO: 'Geração de escala',
  RESETAR_ESCALA_SECAO: 'Reset de escala',
  OFICIALIZAR_ESCALA: 'Oficialização',
  INATIVAR_ESCALA: 'Inativação da escala',
  SALVAR_FIXO_ESCALA: 'Folga ou horário fixo',
  REMOVER_FIXO_ESCALA: 'Remoção de fixo',
  SINCRONIZAR_FUNCIONARIO_RM: 'Sincronização RM',
  CRIAR_PENDENCIA_FUNCIONARIO: 'Suspensão operacional',
  ENCERRAR_PENDENCIA_FUNCIONARIO: 'Encerramento de suspensão',
  ATUALIZAR_FUNCIONARIO: 'Atualização de funcionário',
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

function scheduleValue(value: unknown) {
  if (!value || typeof value !== 'object') return 'Sem programação';
  const day = value as Record<string, unknown>;
  if (day.programacao && day.programacao !== 'TRB') return String(day.programacao);
  return [day.hrEnt1, day.hrSai1, day.hrEnt2, day.hrSai2].filter(Boolean).join(' / ') || 'Sem horário';
}

function EventDetails({ event }: { event: EscalaEvento }) {
  const detail = event.DETALHE;
  if (!detail || !Object.keys(detail).length) return null;
  const changes = Array.isArray(detail.alteracoes) ? detail.alteracoes : [];
  return (
    <details className="event-details">
      <summary>Ver alterações</summary>
      {changes.length > 0 ? (
        <div className="event-change-list">
          {changes.map((entry, index) => {
            const change = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {};
            return (
              <div key={`${String(change.data || '')}-${index}`}>
                <strong>{String(change.data || 'Dia')}</strong>
                <span>{scheduleValue(change.anterior)} → {scheduleValue(change.novo)}</span>
                {Boolean(change.justificativa) && <small>Justificativa: {String(change.justificativa)}</small>}
              </div>
            );
          })}
        </div>
      ) : (
        <pre>{JSON.stringify(detail, null, 2)}</pre>
      )}
    </details>
  );
}

export function Alteracoes({ user }: { user: User }) {
  const [params, setParams] = useSearchParams();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [subsecoes, setSubsecoes] = useState<Subsecao[]>([]);
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
  const subsecao = params.get('subsecao') || '';
  const acao = params.get('acao') || '';
  const origem = params.get('origem') || '';
  const situacao = params.get('situacao') || '';
  const login = params.get('login') || '';
  const funcionario = params.get('funcionario') || '';

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
    if (!loja || !secao) { setSubsecoes([]); return; }
    const controller = new AbortController();
    getJson<{ subsecoes: Subsecao[] }>(
      `/api/catalog/lojas/${encodeURIComponent(loja)}/secoes/${encodeURIComponent(secao)}/subsecoes?includeInactive=1`,
      controller.signal,
    ).then((data) => setSubsecoes(data.subsecoes || []))
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); });
    return () => controller.abort();
  }, [loja, secao]);

  useEffect(() => {
    if (!loja) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ lojaId: loja, limit: String(PAGE_SIZE), offset: String(offset) });
    if (mes) query.set('mesRef', `${mes}-01`);
    if (secao) query.set('escsecaoId', secao);
    if (subsecao) query.set('escsubsecaoId', subsecao);
    if (acao) query.set('acao', acao);
    if (origem) query.set('origem', origem);
    if (situacao) query.set('situacao', situacao);
    if (login) query.set('login', login);
    if (funcionario) query.set('funcionario', funcionario);
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
  }, [loja, mes, secao, subsecao, acao, origem, situacao, login, funcionario, offset, reload]);

  const visible = useMemo(
    () =>
      eventos.filter((item) =>
        `${item.FUNCIONARIO_CHAPA || ''} ${item.FUNCIONARIO_NOME || ''} ${item.SECAO_NOME || ''} ${item.SUBSECAO_NOME || ''} ${item.LOGIN} ${item.ACAO}`
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
    if (key === 'loja' || key === 'secao') next.delete('subsecao');
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
          <label>
            Subseção
            <select value={subsecao} disabled={!secao} onChange={(event) => updateFilter('subsecao', event.target.value)}>
              <option value="">Todas</option>
              {subsecoes.map((item) => <option key={item.ESCSUBSECAO_ID} value={item.ESCSUBSECAO_ID}>{item.DESCR}{item.STATUS === 'I' ? ' (inativa)' : ''}</option>)}
            </select>
          </label>
          <label>
            Ação
            <select value={acao} onChange={(event) => updateFilter('acao', event.target.value)}>
              <option value="">Todas</option>
              {Object.entries(actionNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Origem
            <select value={origem} onChange={(event) => updateFilter('origem', event.target.value)}>
              <option value="">Todas</option>
              <option value="USUARIO">Usuário</option>
              <option value="SISTEMA">Sistema</option>
            </select>
          </label>
          <label>
            Situação
            <select value={situacao} onChange={(event) => updateFilter('situacao', event.target.value)}>
              <option value="">Todas</option>
              <option value="CRIACAO">Criação</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="POS_OFICIALIZACAO">Após oficialização</option>
              <option value="OFICIALIZADA">Oficializada</option>
              <option value="CADASTRO">Cadastro</option>
            </select>
          </label>
          <label>
            Funcionário
            <input value={funcionario} onChange={(event) => updateFilter('funcionario', event.target.value)} placeholder="Nome ou matrícula" />
          </label>
          <label>
            Autor
            <input value={login} onChange={(event) => updateFilter('login', event.target.value)} placeholder="Login" />
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
        {subsecao && <p className="event-filter-note">Eventos anteriores ao registro de subseção na auditoria não aparecem neste filtro.</p>}
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
                    <td>{item.SECAO_NOME || '–'}{item.SUBSECAO_NOME && <small className="table-subline">{item.SUBSECAO_NOME}</small>}</td>
                    <td>
                      <strong>{actionNames[item.ACAO] || item.ACAO.replaceAll('_', ' ')}</strong>
                      {details(item) && <small className="table-subline">{details(item)}</small>}
                      <EventDetails event={item} />
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
