import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, RefreshCw, Search, Users } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getJson, type Funcionario, type Secao, type Subsecao } from '../api';

export function Subsecoes() {
  const { lojaId, secaoId } = useParams();
  const [params, setParams] = useSearchParams();
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [subsecoes, setSubsecoes] = useState<Subsecao[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const selected = params.get('subsecao') || 'sem';

  useEffect(() => {
    if (!lojaId || !secaoId) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const base = `/api/catalog/lojas/${encodeURIComponent(lojaId)}`;
    Promise.all([
      getJson<{ secoes: Secao[] }>(`${base}/secoes`, controller.signal),
      getJson<{ subsecoes: Subsecao[] }>(
        `${base}/secoes/${encodeURIComponent(secaoId)}/subsecoes?includeInactive=1`,
        controller.signal,
      ),
      getJson<{ funcionarios: Funcionario[] }>(`${base}/funcionarios`, controller.signal),
    ])
      .then(([sectionData, subData, peopleData]) => {
        setSecoes(sectionData.secoes || []);
        setSubsecoes(subData.subsecoes || []);
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
  }, [lojaId, secaoId, reload]);

  const secao = secoes.find((item) => String(item.ESCSECAO_ID) === secaoId);
  const sectionPeople = useMemo(
    () => funcionarios.filter((item) => String(item.ESCSECAO_ID) === secaoId),
    [funcionarios, secaoId],
  );
  const selectedSub = subsecoes.find((item) => String(item.ESCSUBSECAO_ID) === selected);
  const scopedPeople = sectionPeople.filter((item) =>
    selected === 'sem'
      ? !item.ESCSUBSECAO_ID ||
        !subsecoes.some((sub) => Number(sub.ESCSUBSECAO_ID) === Number(item.ESCSUBSECAO_ID))
      : String(item.ESCSUBSECAO_ID) === selected,
  );
  const visiblePeople = scopedPeople.filter((item) =>
    `${item.CHAPA} ${item.NOME} ${item.FUNCAO_DESCR || ''}`
      .toLocaleLowerCase('pt-BR')
      .includes(search.toLocaleLowerCase('pt-BR').trim()),
  );
  const unassigned = sectionPeople.filter(
    (item) =>
      !item.ESCSUBSECAO_ID ||
      !subsecoes.some((sub) => Number(sub.ESCSUBSECAO_ID) === Number(item.ESCSUBSECAO_ID)),
  ).length;

  return (
    <main className="content directory-page">
      <div className="page-heading">
        <div>
          <Link className="back-link" to={`/secoes?loja=${encodeURIComponent(lojaId || '')}`}>
            <ArrowLeft size={15} /> Seções
          </Link>
          <h1>Subseções · {secao?.DESCR || 'Seção'}</h1>
          <p>
            Loja {lojaId} · {sectionPeople.length} funcionário(s) ativo(s)
          </p>
        </div>
        <div className="heading-actions">
          <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <a className="button primary" href={`/app#/secoes/${secaoId}/subsecoes`}>
            <ArrowUpRight size={16} /> Gerenciar na interface atual
          </a>
        </div>
      </div>
      {loading && (
        <div className="empty-state" role="status">
          Carregando subseções...
        </div>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}{' '}
          <button type="button" onClick={() => setReload((value) => value + 1)}>
            Tentar novamente
          </button>
        </div>
      )}
      {!loading && !error && (
        <div className="subsection-layout">
          <aside className="list-surface subsection-list" aria-label="Subseções">
            <div className="subsection-list-title">
              <strong>Subseções</strong>
              <span>{subsecoes.length}</span>
            </div>
            <button
              type="button"
              className={selected === 'sem' ? 'subsection-item selected' : 'subsection-item'}
              onClick={() => setParams({ subsecao: 'sem' })}
            >
              <span>
                Sem subseção<small>Funcionários ainda não vinculados ou em subseções não cadastradas</small>
              </span>
              <b>{unassigned}</b>
            </button>
            {subsecoes.map((item) => (
              <button
                type="button"
                key={item.ESCSUBSECAO_ID}
                className={
                  selected === String(item.ESCSUBSECAO_ID) ? 'subsection-item selected' : 'subsection-item'
                }
                onClick={() => setParams({ subsecao: String(item.ESCSUBSECAO_ID) })}
              >
                <span>
                  {item.DESCR}
                  <small>{item.STATUS === 'I' ? 'Inativa' : 'Ativa'}</small>
                </span>
                <b>
                  {
                    sectionPeople.filter(
                      (person) => Number(person.ESCSUBSECAO_ID) === Number(item.ESCSUBSECAO_ID),
                    ).length
                  }
                </b>
              </button>
            ))}
          </aside>
          <section className="list-surface subsection-people" aria-label="Funcionários da subseção">
            <div className="subsection-people-heading">
              <div>
                <h2>{selectedSub?.DESCR || 'Sem subseção'}</h2>
                <span>
                  <Users size={15} /> {scopedPeople.length} funcionário(s)
                </span>
              </div>
              <label className="search-field">
                <Search size={16} />
                <span className="sr-only">Buscar funcionário</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar funcionário"
                />
              </label>
            </div>
            {!visiblePeople.length ? (
              <div className="empty-state">Nenhum funcionário encontrado nesta subseção.</div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Funcionário</th>
                      <th>Matrícula</th>
                      <th>Cargo</th>
                      <th>Horário-base</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePeople.map((item) => (
                      <tr key={item.ESCFUNC_ID}>
                        <td>
                          <strong>{item.NOME}</strong>
                        </td>
                        <td>{item.CHAPA}</td>
                        <td>{item.FUNCAO_DESCR || '–'}</td>
                        <td>
                          {item.HR_ENT1 && item.HR_SAI2
                            ? `${item.HR_ENT1}–${item.HR_SAI2}`
                            : item.HR_ENT1 || '–'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
