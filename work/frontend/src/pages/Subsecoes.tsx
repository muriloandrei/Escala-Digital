import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  ArrowRightLeft,
  Users,
  X,
} from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  canEdit,
  deleteJson,
  getJson,
  patchJson,
  postJson,
  putJson,
  type Funcionario,
  type Secao,
  type Subsecao,
  type User,
} from '../api';
import { TransferirSubsecao } from './TransferirSubsecao';

export function Subsecoes({ user }: { user: User }) {
  const { lojaId, secaoId } = useParams();
  const [params, setParams] = useSearchParams();
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [subsecoes, setSubsecoes] = useState<Subsecao[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Subsecao | null>(null);
  const [transferTarget, setTransferTarget] = useState<Funcionario | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [unlinkTarget, setUnlinkTarget] = useState<Funcionario | null>(null);
  const requestedSub = params.get('subsecao');
  const selected = requestedSub === 'sem' || subsecoes.some((item) => String(item.ESCSUBSECAO_ID) === requestedSub)
    ? requestedSub || 'sem'
    : 'sem';

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
  const canManage = canEdit(user, 'escalas') && /frente de caixa/i.test(secao?.DESCR || '');
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
  const linkCandidates = sectionPeople.filter((item) =>
    !/APRENDIZ/i.test(item.FUNCAO_DESCR || '') &&
    String(item.ESCSUBSECAO_ID) !== selected &&
    `${item.CHAPA} ${item.NOME} ${item.FUNCAO_DESCR || ''}`.toLocaleLowerCase('pt-BR')
      .includes(linkSearch.toLocaleLowerCase('pt-BR').trim()),
  );

  const base = `/api/catalog/lojas/${encodeURIComponent(lojaId || '')}/secoes/${encodeURIComponent(secaoId || '')}/subsecoes`;

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    const descr = name.trim();
    if (!descr || descr.length > 100) {
      setActionError('Informe um nome de até 100 caracteres.');
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      if (editingId) {
        const current = subsecoes.find((item) => item.ESCSUBSECAO_ID === editingId);
        await putJson(`${base}/${editingId}`, { DESCR: descr, STATUS: current?.STATUS || 'A' });
        setActionMessage('Subseção atualizada.');
      } else {
        const result = await postJson<{ subsecao: Subsecao }>(base, { DESCR: descr });
        if (result.subsecao?.ESCSUBSECAO_ID) setParams({ subsecao: String(result.subsecao.ESCSUBSECAO_ID) });
        setActionMessage('Subseção criada.');
      }
      setCreating(false);
      setEditingId(null);
      setName('');
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível salvar a subseção.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(item: Subsecao) {
    setBusy(true);
    setActionError('');
    try {
      const status = item.STATUS === 'I' ? 'A' : 'I';
      await putJson(`${base}/${item.ESCSUBSECAO_ID}`, { DESCR: item.DESCR, STATUS: status });
      setActionMessage(`Subseção ${status === 'A' ? 'ativada' : 'inativada'}.`);
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível alterar o status.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setActionError('');
    try {
      await deleteJson(`${base}/${deleteTarget.ESCSUBSECAO_ID}`);
      if (selected === String(deleteTarget.ESCSUBSECAO_ID)) setParams({ subsecao: 'sem' });
      setActionMessage('Subseção excluída. Os funcionários vinculados ficaram sem subseção.');
      setDeleteTarget(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível excluir a subseção.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmUnlink() {
    if (!unlinkTarget || !lojaId) return;
    setBusy(true);
    setActionError('');
    try {
      await patchJson(`/api/catalog/lojas/${encodeURIComponent(lojaId)}/funcionarios/${unlinkTarget.ESCFUNC_ID}/subsecao`, {
        ESCSECAO_ID: Number(secaoId), ESCSUBSECAO_ID: null, VIGENCIA: 'IMEDIATO',
      });
      setUnlinkTarget(null);
      setActionMessage('Funcionário movido para Sem subseção. Escalas já gravadas não foram alteradas.');
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível desvincular o funcionário.');
    } finally {
      setBusy(false);
    }
  }

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
      {actionMessage && (
        <div className="notice success" role="status">
          {actionMessage}
        </div>
      )}
      {actionError && (
        <div className="notice error" role="alert">
          {actionError}
        </div>
      )}
      {!loading && !error && (
        <div className="subsection-layout">
          <aside className="list-surface subsection-list" aria-label="Subseções">
            <div className="subsection-list-title">
              <strong>Subseções</strong>
              <span>{subsecoes.length}</span>
            </div>
            {canManage && (
              <div className="subsection-add">
                <button
                  className="button primary"
                  type="button"
                  disabled={busy || creating}
                  onClick={() => {
                    setCreating(true);
                    setEditingId(null);
                    setName('');
                    setActionError('');
                  }}
                >
                  <Plus size={15} /> Nova subseção
                </button>
              </div>
            )}
            {creating && (
              <form className="subsection-inline-form" onSubmit={saveName}>
                <input
                  autoFocus
                  value={name}
                  maxLength={100}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nome da subseção"
                  aria-label="Nome da nova subseção"
                />
                <button
                  type="submit"
                  title="Salvar subseção"
                  aria-label="Salvar subseção"
                  disabled={busy || !name.trim()}
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  title="Cancelar"
                  aria-label="Cancelar nova subseção"
                  disabled={busy}
                  onClick={() => setCreating(false)}
                >
                  <X size={16} />
                </button>
              </form>
            )}
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
              <div
                key={item.ESCSUBSECAO_ID}
                className={
                  selected === String(item.ESCSUBSECAO_ID) ? 'subsection-row selected' : 'subsection-row'
                }
              >
                {editingId === item.ESCSUBSECAO_ID ? (
                  <form className="subsection-inline-form" onSubmit={saveName}>
                    <input
                      autoFocus
                      value={name}
                      maxLength={100}
                      onChange={(event) => setName(event.target.value)}
                      aria-label={`Nome de ${item.DESCR}`}
                    />
                    <button
                      type="submit"
                      title="Salvar"
                      aria-label={`Salvar ${item.DESCR}`}
                      disabled={busy || !name.trim()}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      title="Cancelar"
                      aria-label={`Cancelar edição de ${item.DESCR}`}
                      disabled={busy}
                      onClick={() => setEditingId(null)}
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      className="subsection-item"
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
                    {canManage && (
                      <div className="subsection-row-actions">
                        <button
                          type="button"
                          className={`subsection-toggle ${item.STATUS !== 'I' ? 'on' : ''}`}
                          role="switch"
                          aria-checked={item.STATUS !== 'I'}
                          aria-label={`${item.STATUS === 'I' ? 'Ativar' : 'Inativar'} ${item.DESCR}`}
                          title={`${item.STATUS === 'I' ? 'Ativar' : 'Inativar'} subseção`}
                          disabled={busy}
                          onClick={() => toggleStatus(item)}
                        >
                          <span />
                        </button>
                        <button
                          type="button"
                          title="Editar subseção"
                          aria-label={`Editar ${item.DESCR}`}
                          disabled={busy}
                          onClick={() => {
                            setEditingId(item.ESCSUBSECAO_ID);
                            setCreating(false);
                            setName(item.DESCR);
                            setActionError('');
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title="Excluir subseção"
                          aria-label={`Excluir ${item.DESCR}`}
                          disabled={busy}
                          onClick={() => {
                            setDeleteTarget(item);
                            setActionError('');
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
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
              {canManage && selectedSub?.STATUS === 'A' && <button className="button primary" type="button" onClick={() => { setLinkSearch(''); setLinkOpen(true); }}><Plus size={15} /> Vincular funcionário</button>}
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
                      {canManage && <th><span className="sr-only">Ações</span></th>}
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
                        {canManage && <td>
                          {!/APRENDIZ/i.test(item.FUNCAO_DESCR || '') && (
                            <button type="button" className="icon-action" title={`Transferir ${item.NOME}`} aria-label={`Transferir ${item.NOME}`} onClick={() => setTransferTarget(item)}>
                              <ArrowRightLeft size={16} />
                            </button>
                          )}
                          {selected !== 'sem' && <button type="button" className="icon-action" title={`Remover ${item.NOME} da subseção`} aria-label={`Remover ${item.NOME} da subseção`} onClick={() => setUnlinkTarget(item)}><X size={16} /></button>}
                        </td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
      {deleteTarget && (
        <div
          className="confirm-backdrop"
          role="presentation"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !busy) setDeleteTarget(null);
          }}
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-subsection-title"
          >
            <h2 id="delete-subsection-title">Excluir {deleteTarget.DESCR}?</h2>
            <p>
              Os funcionários vinculados ficarão sem subseção. A exclusão não apaga os dias já gravados da
              escala.
            </p>
            <div className="confirm-actions">
              <button
                className="button secondary"
                type="button"
                autoFocus
                disabled={busy}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button className="button primary" type="button" disabled={busy} onClick={confirmDelete}>
                {busy ? 'Aguarde...' : 'Excluir subseção'}
              </button>
            </div>
          </div>
        </div>
      )}
      {transferTarget && lojaId && (
        <TransferirSubsecao
          lojaId={lojaId}
          employee={transferTarget}
          subsecoes={subsecoes}
          initialDestination={selected !== 'sem' ? selected : undefined}
          onClose={() => setTransferTarget(null)}
          onTransferred={({ destination, warning }) => {
            setTransferTarget(null);
            setParams({ subsecao: destination });
            setActionMessage(warning || 'Funcionário transferido de subseção.');
            setReload((value) => value + 1);
          }}
        />
      )}
      {linkOpen && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => {
        if (event.key === 'Escape') setLinkOpen(false);
      }}><div className="confirm-dialog link-dialog" role="dialog" aria-modal="true" aria-labelledby="link-title">
        <h2 id="link-title">Vincular funcionário · {selectedSub?.DESCR}</h2>
        <label className="search-field"><Search size={16} /><span className="sr-only">Buscar funcionário</span><input autoFocus value={linkSearch} onChange={(event) => setLinkSearch(event.target.value)} placeholder="Nome ou matrícula" /></label>
        <div className="link-candidates">{linkCandidates.length ? linkCandidates.map((item) => <button type="button" key={item.ESCFUNC_ID} onClick={() => { setLinkOpen(false); setTransferTarget(item); }}><strong>{item.CHAPA} · {item.NOME}</strong><small>{item.SUBSECAO_DESCR || 'Sem subseção'}</small></button>) : <p>Nenhum funcionário encontrado.</p>}</div>
        <div className="confirm-actions"><button className="button secondary" type="button" onClick={() => setLinkOpen(false)}>Cancelar</button></div>
      </div></div>}
      {unlinkTarget && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) setUnlinkTarget(null);
      }}><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="unlink-title">
        <h2 id="unlink-title">Remover {unlinkTarget.NOME} da subseção?</h2><p>O funcionário ficará em Sem subseção. Os dias de escala já gravados serão preservados.</p>
        {actionError && <div className="notice error" role="alert">{actionError}</div>}
        <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={() => setUnlinkTarget(null)}>Cancelar</button><button className="button primary" type="button" disabled={busy} onClick={confirmUnlink}>{busy ? 'Removendo...' : 'Confirmar remoção'}</button></div>
      </div></div>}
    </main>
  );
}
