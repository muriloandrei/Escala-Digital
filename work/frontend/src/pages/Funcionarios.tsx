import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Pencil, RefreshCw, Search, UserRound, UserRoundX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  canEdit,
  getJson,
  patchJson,
  postJson,
  preferredStore,
  type Funcionario,
  type Loja,
  type User,
} from '../api';

type ShiftForm = {
  employee: Funcionario;
  month: string;
  apply: boolean;
  HR_ENT1: string;
  HR_SAI1: string;
  HR_ENT2: string;
  HR_SAI2: string;
};

type ShiftImpact = { diasAlterados: number; diasManuais: number; possuiEscala: boolean };
type Suspension = { ESCPEND_ID: number; ESCFUNC_ID: number; DT_INICIO: string; DT_FIM?: string | null; TIPO?: string; STATUS: string; JUSTIFICATIVA?: string };

function currentMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

export function Funcionarios({ user }: { user: User }) {
  const [params, setParams] = useSearchParams();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('all');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [shiftForm, setShiftForm] = useState<ShiftForm | null>(null);
  const [shiftImpact, setShiftImpact] = useState<ShiftImpact | null>(null);
  const [shiftError, setShiftError] = useState('');
  const [shiftBusy, setShiftBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [suspendTarget, setSuspendTarget] = useState<Funcionario | null>(null);
  const [closeTarget, setCloseTarget] = useState<Suspension | null>(null);
  const [suspendType, setSuspendType] = useState('AFASTAMENTO');
  const [suspendStart, setSuspendStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [suspendEnd, setSuspendEnd] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendError, setSuspendError] = useState('');
  const [suspendBusy, setSuspendBusy] = useState(false);
  const deepLinkOpened = useRef('');
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
    setSelected(null);
    const query = includeInactive ? '?includeInactive=1' : '';
    Promise.all([
      getJson<{ funcionarios: Funcionario[] }>(`/api/catalog/lojas/${encodeURIComponent(loja)}/funcionarios${query}`, controller.signal),
      getJson<{ suspensoes: Suspension[] }>(`/api/catalog/suspensoes-funcionarios?lojaId=${encodeURIComponent(loja)}`, controller.signal),
    ])
      .then(([data, suspended]) => {
        setFuncionarios(data.funcionarios || []);
        setSuspensions(suspended.suspensoes || []);
        setLoading(false);
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [loja, includeInactive, reload]);

  const sections = useMemo(
    () =>
      [...new Set(funcionarios.map((item) => item.SECAO_DESCR || 'Sem seção'))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR'),
      ),
    [funcionarios],
  );
  const visible = useMemo(
    () =>
      funcionarios.filter((item) => {
        const text =
          `${item.CHAPA} ${item.NOME} ${item.FUNCAO_DESCR || ''} ${item.SUBSECAO_DESCR || ''}`.toLocaleLowerCase(
            'pt-BR',
          );
        return (
          (section === 'all' || (item.SECAO_DESCR || 'Sem seção') === section) &&
          text.includes(search.toLocaleLowerCase('pt-BR').trim())
        );
      }),
    [funcionarios, section, search],
  );
  const detail = funcionarios.find((item) => item.ESCFUNC_ID === selected);
  const detailSuspension = suspensions.find((item) => Number(item.ESCFUNC_ID) === Number(selected) && item.STATUS === 'P');
  const canSuspend = ['ADMIN', 'RH'].includes(user.perfil.toUpperCase());

  async function saveSuspension(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!suspendTarget || suspendBusy) return;
    setSuspendBusy(true);
    setSuspendError('');
    try {
      await postJson(`/api/catalog/lojas/${encodeURIComponent(loja)}/funcionarios/${suspendTarget.ESCFUNC_ID}/suspensoes`, {
        tipo: suspendType, inicio: suspendStart, fim: suspendEnd || null, justificativa: suspendReason.trim(),
      });
      setMessage(`Suspensão de ${suspendTarget.NOME} registrada. A geração futura respeitará o período informado.`);
      setSuspendTarget(null);
      setSuspendReason('');
      setReload((value) => value + 1);
    } catch (reason) {
      setSuspendError(reason instanceof Error ? reason.message : 'Não foi possível registrar a suspensão.');
    } finally {
      setSuspendBusy(false);
    }
  }

  async function closeSuspension() {
    if (!closeTarget || suspendBusy) return;
    setSuspendBusy(true);
    setSuspendError('');
    try {
      await postJson(`/api/catalog/lojas/${encodeURIComponent(loja)}/suspensoes/${closeTarget.ESCPEND_ID}/encerrar`, {});
      setMessage('Suspensão encerrada. Confira o cadastro do RM antes de gerar novamente a escala.');
      setCloseTarget(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setSuspendError(reason instanceof Error ? reason.message : 'Não foi possível encerrar a suspensão.');
    } finally {
      setSuspendBusy(false);
    }
  }

  useEffect(() => {
    const id = params.get('funcionario');
    if (!id || !funcionarios.length || deepLinkOpened.current === `${loja}:${id}`) return;
    const employee = funcionarios.find((item) => String(item.ESCFUNC_ID) === id);
    if (!employee) return;
    deepLinkOpened.current = `${loja}:${id}`;
    setSearch(employee.CHAPA);
    setSelected(employee.ESCFUNC_ID);
    if (canEdit(user, 'escalas') && !employee.DT_DEMISS && !/APRENDIZ/i.test(employee.FUNCAO_DESCR || '')) {
      setShiftForm({
        employee,
        month: /^\d{4}-\d{2}$/.test(params.get('mes') || '') ? params.get('mes')! : currentMonth(),
        apply: true,
        HR_ENT1: employee.HR_ENT1 || '',
        HR_SAI1: employee.HR_SAI1 || '',
        HR_ENT2: employee.HR_ENT2 || '',
        HR_SAI2: employee.HR_SAI2 || '',
      });
    }
  }, [funcionarios, loja, params, user]);

  function openShift(employee: Funcionario) {
    setShiftForm({
      employee,
      month: currentMonth(),
      apply: true,
      HR_ENT1: employee.HR_ENT1 || '',
      HR_SAI1: employee.HR_SAI1 || '',
      HR_ENT2: employee.HR_ENT2 || '',
      HR_SAI2: employee.HR_SAI2 || '',
    });
    setShiftImpact(null);
    setShiftError('');
  }

  function updateShift(patch: Partial<ShiftForm>) {
    setShiftForm((current) => (current ? { ...current, ...patch } : current));
    setShiftImpact(null);
    setShiftError('');
  }

  function shiftPayload(form: ShiftForm) {
    return {
      lojaId: Number(loja),
      escfuncId: Number(form.employee.ESCFUNC_ID),
      mesRef: `${form.month}-01`,
      aplicarNaEscala: form.apply,
      HR_ENT1: form.HR_ENT1,
      HR_SAI1: form.HR_SAI1,
      HR_ENT2: form.HR_ENT2,
      HR_SAI2: form.HR_SAI2,
    };
  }

  async function previewShift() {
    if (!shiftForm) return;
    setShiftBusy(true);
    setShiftError('');
    try {
      const data = await postJson<{ impacto: ShiftImpact }>(
        '/api/escalas/funcionario/horario/preview',
        shiftPayload(shiftForm),
      );
      setShiftImpact(data.impacto);
    } catch (reason) {
      setShiftError(reason instanceof Error ? reason.message : 'Não foi possível validar o horário.');
    } finally {
      setShiftBusy(false);
    }
  }

  async function saveShift() {
    if (!shiftForm || !shiftImpact) return;
    setShiftBusy(true);
    setShiftError('');
    try {
      const result = await patchJson<{ diasAlterados: number }>(
        '/api/escalas/funcionario/horario',
        shiftPayload(shiftForm),
      );
      setMessage(
        `Horário-base de ${shiftForm.employee.NOME} atualizado${result.diasAlterados ? ` · ${result.diasAlterados} dia(s) da escala ajustado(s)` : ''}.`,
      );
      setShiftForm(null);
      setShiftImpact(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setShiftError(reason instanceof Error ? reason.message : 'Não foi possível salvar o horário.');
      setShiftImpact(null);
    } finally {
      setShiftBusy(false);
    }
  }

  return (
    <main className="content directory-page">
      <div className="page-heading">
        <div>
          <h1>Funcionários</h1>
          <p>Cadastro e horários disponíveis para a loja selecionada.</p>
        </div>
        <a className="button secondary" href="/app#/funcionarios">
          <ArrowUpRight size={16} /> Gerenciar na interface atual
        </a>
      </div>
      {message && (
        <div className="notice success" role="status">
          {message}
        </div>
      )}
      <section className="list-surface" aria-label="Funcionários">
        <div className="filters">
          <label>
            Loja
            <select
              value={loja}
              onChange={(event) => {
                setParams({ loja: event.target.value });
                setSection('all');
              }}
            >
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
            Seção
            <select value={section} onChange={(event) => setSection(event.target.value)}>
              <option value="all">Todas</option>
              {sections.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <Search size={17} />
            <span className="sr-only">Buscar funcionário</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, matrícula ou cargo"
            />
          </label>
          <label className="check-filter">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
            />{' '}
            Incluir desligados
          </label>
          <button
            className="button secondary"
            type="button"
            onClick={() => setReload((value) => value + 1)}
            aria-label="Atualizar funcionários"
            title="Atualizar funcionários"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="list-meta">{loading ? 'Carregando...' : `${visible.length} funcionário(s)`}</div>
        {error && (
          <div className="notice error" role="alert">
            {error}{' '}
            <button type="button" onClick={() => setReload((value) => value + 1)}>
              Tentar novamente
            </button>
          </div>
        )}
        {!error && !loading && !visible.length && (
          <div className="empty-state">Nenhum funcionário encontrado.</div>
        )}
        {!error && !loading && !!visible.length && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Matrícula</th>
                  <th>Seção</th>
                  <th>Subseção</th>
                  <th>Cargo</th>
                  <th>Horário-base</th>
                  <th>Situação</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.ESCFUNC_ID}>
                    <td>
                      <strong>{item.NOME}</strong>
                    </td>
                    <td>{item.CHAPA}</td>
                    <td>{item.SECAO_DESCR || '–'}</td>
                    <td>{item.SUBSECAO_DESCR || 'Sem subseção'}</td>
                    <td>{item.FUNCAO_DESCR || '–'}</td>
                    <td>
                      {item.HR_ENT1 && item.HR_SAI2
                        ? `${item.HR_ENT1}–${item.HR_SAI2}`
                        : item.HR_ENT1 && item.HR_SAI1
                          ? `${item.HR_ENT1}–${item.HR_SAI1}`
                          : '–'}
                    </td>
                    <td>{item.DT_DEMISS ? 'Desligado' : suspensions.some((entry) => Number(entry.ESCFUNC_ID) === Number(item.ESCFUNC_ID) && entry.STATUS === 'P') ? 'Suspenso da escala' : 'Ativo'}</td>
                    <td>
                      <button
                        className="text-action"
                        type="button"
                        onClick={() => setSelected(item.ESCFUNC_ID)}
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {detail && (
        <section className="directory-detail" aria-label="Detalhes do funcionário">
          <div className="directory-detail-heading">
            <UserRound size={19} />
            <div>
              <h2>{detail.NOME}</h2>
              <p>
                {detail.CHAPA} · {detail.FUNCAO_DESCR || 'Cargo não informado'}
              </p>
            </div>
            {canEdit(user, 'escalas') &&
              !detail.DT_DEMISS &&
              !/APRENDIZ/i.test(detail.FUNCAO_DESCR || '') && (
                <button type="button" className="button primary" onClick={() => openShift(detail)}>
                  <Pencil size={15} /> Editar horário
                </button>
              )}
            {canSuspend && !detail.DT_DEMISS && !detailSuspension && <button type="button" className="button secondary" onClick={() => {
              setSuspendTarget(detail); setSuspendError('');
            }}><UserRoundX size={15} /> Suspender da escala</button>}
            {canSuspend && detailSuspension && <button type="button" className="button secondary" disabled={suspendBusy} onClick={() => { setSuspendError(''); setCloseTarget(detailSuspension); }}>Encerrar suspensão</button>}
            <button type="button" className="button secondary" onClick={() => setSelected(null)}>
              Fechar
            </button>
          </div>
          <dl>
            {detailSuspension && <div><dt>Suspensão local</dt><dd>{detailSuspension.TIPO || 'Ativa'} · {String(detailSuspension.DT_INICIO).slice(0, 10)}{detailSuspension.DT_FIM ? ` a ${String(detailSuspension.DT_FIM).slice(0, 10)}` : ''}</dd></div>}
            <div>
              <dt>Loja</dt>
              <dd>{detail.LOJA || loja}</dd>
            </div>
            <div>
              <dt>Seção</dt>
              <dd>{detail.SECAO_DESCR || '–'}</dd>
            </div>
            <div>
              <dt>Subseção</dt>
              <dd>{detail.SUBSECAO_DESCR || 'Sem subseção'}</dd>
            </div>
            <div>
              <dt>Entrada</dt>
              <dd>{detail.HR_ENT1 || '–'}</dd>
            </div>
            <div>
              <dt>Saída intervalo</dt>
              <dd>{detail.HR_SAI1 || '–'}</dd>
            </div>
            <div>
              <dt>Retorno</dt>
              <dd>{detail.HR_ENT2 || '–'}</dd>
            </div>
            <div>
              <dt>Saída</dt>
              <dd>{detail.HR_SAI2 || '–'}</dd>
            </div>
          </dl>
          {suspendError && <div className="notice error" role="alert">{suspendError}</div>}
        </section>
      )}
      {suspendTarget && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => {
        if (event.key === 'Escape' && !suspendBusy) setSuspendTarget(null);
      }}><form className="confirm-dialog release-form" role="dialog" aria-modal="true" aria-labelledby="suspension-title" onSubmit={saveSuspension}>
        <h2 id="suspension-title">Suspender {suspendTarget.NOME} da escala</h2>
        <p>Esta é uma suspensão local auditada; não altera o cadastro no RM. A geração respeita o intervalo até a sincronização oficial.</p>
        <label>Motivo<select value={suspendType} onChange={(event) => setSuspendType(event.target.value)}><option value="AFASTAMENTO">Afastamento</option><option value="TRANSFERENCIA">Transferência</option><option value="DESLIGAMENTO">Desligamento</option><option value="OUTRO">Outro</option></select></label>
        <label>Início<input required type="date" value={suspendStart} onChange={(event) => setSuspendStart(event.target.value)} /></label>
        <label>Fim (opcional)<input type="date" min={suspendStart} value={suspendEnd} onChange={(event) => setSuspendEnd(event.target.value)} /></label>
        <label>Justificativa<textarea required minLength={10} maxLength={500} value={suspendReason} onChange={(event) => setSuspendReason(event.target.value)} /></label>
        {suspendError && <div className="notice error" role="alert">{suspendError}</div>}
        <div className="confirm-actions"><button className="button secondary" type="button" disabled={suspendBusy} onClick={() => setSuspendTarget(null)}>Cancelar</button><button className="button primary" type="submit" disabled={suspendBusy || suspendReason.trim().length < 10}>{suspendBusy ? 'Registrando...' : 'Confirmar suspensão'}</button></div>
      </form></div>}
      {closeTarget && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => {
        if (event.key === 'Escape' && !suspendBusy) setCloseTarget(null);
      }}><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="close-suspension-title">
        <h2 id="close-suspension-title">Encerrar suspensão local?</h2>
        <p>O funcionário voltará a ser elegível para gerações futuras. Confirme no RM se o cadastro já está atualizado.</p>
        {suspendError && <div className="notice error" role="alert">{suspendError}</div>}
        <div className="confirm-actions"><button className="button secondary" type="button" disabled={suspendBusy} onClick={() => setCloseTarget(null)}>Cancelar</button><button className="button primary" type="button" disabled={suspendBusy} onClick={closeSuspension}>{suspendBusy ? 'Encerrando...' : 'Confirmar encerramento'}</button></div>
      </div></div>}
      {shiftForm && (
        <div
          className="confirm-backdrop"
          role="presentation"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !shiftBusy) setShiftForm(null);
          }}
        >
          <div
            className="confirm-dialog shift-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shift-title"
          >
            <h2 id="shift-title">Editar horário · {shiftForm.employee.NOME}</h2>
            <p>
              {shiftForm.employee.CHAPA} · {shiftForm.employee.FUNCAO_DESCR || 'Cargo não informado'}
            </p>
            <div className="shift-fields">
              {(['HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'] as const).map((field, index) => (
                <label key={field}>
                  {['Entrada', 'Saída intervalo', 'Retorno', 'Saída'][index]}
                  <input
                    type="time"
                    value={shiftForm[field]}
                    onChange={(event) => updateShift({ [field]: event.target.value })}
                    required
                  />
                </label>
              ))}
            </div>
            <div className="shift-options">
              <label>
                Mês da escala
                <input
                  type="month"
                  value={shiftForm.month}
                  onChange={(event) => updateShift({ month: event.target.value })}
                  required
                />
              </label>
              <label className="check-filter">
                <input
                  type="checkbox"
                  checked={shiftForm.apply}
                  onChange={(event) => updateShift({ apply: event.target.checked })}
                />{' '}
                Aplicar aos dias editáveis da escala
              </label>
            </div>
            {shiftImpact && (
              <div className="shift-impact">
                <strong>Prévia</strong>
                <span>
                  {shiftImpact.possuiEscala
                    ? `${shiftImpact.diasAlterados} dia(s) ajustável(is) neste mês.`
                    : 'Nenhuma escala existente para este mês.'}
                </span>
                <span>{shiftImpact.diasManuais} dia(s) com ajuste manual preservado(s).</span>
              </div>
            )}
            {shiftError && (
              <div className="notice error" role="alert">
                {shiftError}
              </div>
            )}
            <div className="confirm-actions">
              <button
                autoFocus
                className="button secondary"
                type="button"
                disabled={shiftBusy}
                onClick={() => setShiftForm(null)}
              >
                Cancelar
              </button>
              {shiftImpact ? (
                <button className="button primary" type="button" disabled={shiftBusy} onClick={saveShift}>
                  {shiftBusy ? 'Salvando...' : 'Salvar horário'}
                </button>
              ) : (
                <button
                  className="button primary"
                  type="button"
                  disabled={shiftBusy || !shiftForm.month}
                  onClick={previewShift}
                >
                  {shiftBusy ? 'Validando...' : 'Ver prévia'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
