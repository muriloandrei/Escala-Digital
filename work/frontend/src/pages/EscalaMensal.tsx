import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Pencil, Play, Printer, RefreshCw, RotateCcw, Search } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  canEdit,
  getJson,
  postJson,
  type DiaEscala,
  type EscalaMensal,
  type Funcionario,
  type PeriodoOperacional,
  type Secao,
  type Subsecao,
  type User,
} from '../api';
import { EditarDiaEscala } from './EditarDiaEscala';

function iso(value: string | null | undefined) {
  return String(value || '').slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(`${iso(value)}T00:00:00Z`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date);
}

function datesBetween(periodo: PeriodoOperacional) {
  const dates: string[] = [];
  const current = new Date(`${periodo.inicio}T00:00:00Z`);
  const end = new Date(`${periodo.fim}T00:00:00Z`);
  while (current <= end && dates.length < 42) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function weekday(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`))
    .replace('.', '');
}

function kind(dia?: DiaEscala) {
  if (!dia) return 'empty';
  const code = String(dia.PROGRAMACAO || '').toUpperCase();
  if (dia.AUSENCIA_OBRIGATORIA || code === 'FER' || code === 'AFA') return 'absence';
  if (dia.FIXO_ESCALA) return 'fixed';
  if (code && code !== 'TRB') return 'rest';
  return 'work';
}

function hasShift(dia?: DiaEscala) {
  return (
    !!dia && ['work', 'fixed'].includes(kind(dia)) && String(dia.PROGRAMACAO || 'TRB').toUpperCase() === 'TRB'
  );
}

function cellText(dia?: DiaEscala) {
  if (!dia) return '–';
  return hasShift(dia) ? dia.HR_ENT1 || 'TRB' : dia.PROGRAMACAO || 'F';
}

function shiftLabel(dia?: DiaEscala) {
  if (!dia) return 'Sem programação';
  if (!hasShift(dia)) return dia.MOTIVO_AUSENCIA || dia.PROGRAMACAO || 'Folga';
  return [dia.HR_ENT1, dia.HR_SAI1, dia.HR_ENT2, dia.HR_SAI2].filter(Boolean).join(' · ');
}

function sectionLabel(section: Secao) {
  return [section.COD_SECAO, section.DESCR].filter(Boolean).join(' · ');
}

export function EscalaMensal({ user }: { user: User }) {
  const { lojaId, mesRef } = useParams();
  const [params, setParams] = useSearchParams();
  const [escala, setEscala] = useState<EscalaMensal | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoOperacional | null>(null);
  const [catalogSections, setCatalogSections] = useState<Secao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [pendingAction, setPendingAction] = useState<'gerar' | 'resetar' | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [selectedCell, setSelectedCell] = useState<{
    employee: Funcionario;
    date: string;
    day?: DiaEscala;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{ employee: Funcionario; day: DiaEscala } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridPosition = useRef({ left: 0, top: 0 });

  useEffect(() => {
    if (!lojaId || !mesRef) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setSelectedCell(null);
    const monthQuery = new URLSearchParams({ lojaId, mesRef });
    Promise.all([
      getJson<{ escala: EscalaMensal; periodo: PeriodoOperacional }>(
        `/api/escalas/mensal?${monthQuery}`,
        controller.signal,
      ),
      getJson<{ secoes: Secao[] }>(
        `/api/catalog/lojas/${encodeURIComponent(lojaId)}/secoes`,
        controller.signal,
      ),
    ])
      .then(([month, catalog]) => {
        setEscala(month.escala);
        setPeriodo(month.periodo);
        setCatalogSections(catalog.secoes || []);
        setLoading(false);
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [lojaId, mesRef, reload]);

  const sections = useMemo(
    () =>
      (escala?.secoes || []).slice().sort((a, b) => sectionLabel(a).localeCompare(sectionLabel(b), 'pt-BR')),
    [escala],
  );
  const sectionId =
    sections.find((item) => String(item.ESCSECAO_ID) === params.get('secao'))?.ESCSECAO_ID ||
    sections[0]?.ESCSECAO_ID;
  const section = sections.find((item) => item.ESCSECAO_ID === sectionId);
  const sectionCatalog = catalogSections.find((item) => Number(item.ESCSECAO_ID) === Number(sectionId));
  const employees = useMemo(
    () => (escala?.funcionarios || []).filter((item) => Number(item.ESCSECAO_ID) === Number(sectionId)),
    [escala, sectionId],
  );
  const subsections = useMemo(() => {
    return (sectionCatalog?.SUBSECOES || [])
      .filter((item: Subsecao) => item.STATUS !== 'I')
      .map((item: Subsecao) => [String(item.ESCSUBSECAO_ID), item.DESCR] as const)
      .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  }, [sectionCatalog]);
  const subsectionIds = useMemo(() => new Set(subsections.map(([id]) => id)), [subsections]);
  const personSubKey = (person: Funcionario) => {
    const id = String(person.ESCSUBSECAO_ID || '');
    return subsectionIds.has(id) ? id : 'sem';
  };
  const subsection = params.get('subsecao') || 'all';
  const scopePeople = employees.filter((item) => {
    return subsection === 'all' || personSubKey(item) === subsection;
  });
  const scopeName =
    subsection === 'all'
      ? section?.DESCR || 'Seção'
      : subsection === 'sem'
        ? 'Sem subseção'
        : subsections.find(([id]) => id === subsection)?.[1] || 'Subseção';
  const dates = useMemo(() => (periodo ? datesBetween(periodo) : []), [periodo]);
  const view = params.get('visao') === 'diaria' ? 'diaria' : 'mensal';
  const selectedDate = dates.includes(params.get('dia') || '') ? params.get('dia')! : dates[0];
  const daysByEmployee = useMemo(() => {
    const map = new Map<string, Map<string, DiaEscala>>();
    (escala?.dias || []).forEach((day) => {
      const key = String(day.ESCFUNC_ID);
      if (!map.has(key)) map.set(key, new Map());
      map.get(key)!.set(iso(day.DT), day);
    });
    return map;
  }, [escala]);
  const visibleEmployees = useMemo(
    () =>
      employees
        .filter((item) => {
          const subKey = personSubKey(item);
          return (
            (subsection === 'all' || subKey === subsection) &&
            `${item.CHAPA} ${item.NOME} ${item.FUNCAO_DESCR || ''}`
              .toLocaleLowerCase('pt-BR')
              .includes(search.toLocaleLowerCase('pt-BR').trim())
          );
        })
        .sort((a, b) => {
          const firstShift = (person: Funcionario) => {
            const day =
              view === 'diaria'
                ? daysByEmployee.get(String(person.ESCFUNC_ID))?.get(selectedDate)
                : dates
                    .map((date) => daysByEmployee.get(String(person.ESCFUNC_ID))?.get(date))
                    .find((entry) => kind(entry) === 'work');
            return hasShift(day) ? day?.HR_ENT1 || '99:99' : '99:99';
          };
          return firstShift(a).localeCompare(firstShift(b)) || a.NOME.localeCompare(b.NOME, 'pt-BR');
        }),
    [employees, subsection, search, daysByEmployee, dates, selectedDate, view, subsectionIds],
  );

  useLayoutEffect(() => {
    if (!loading && view === 'mensal' && gridRef.current) {
      gridRef.current.scrollLeft = gridPosition.current.left;
      gridRef.current.scrollTop = gridPosition.current.top;
    }
  }, [loading, view, sectionId]);

  function updateFilter(key: string, value: string, resetSubsection = false) {
    if (key === 'secao' || key === 'visao') gridPosition.current = { left: 0, top: 0 };
    const next = new URLSearchParams(params);
    if (value === 'all' || !value) next.delete(key);
    else next.set(key, value);
    if (resetSubsection) next.delete('subsecao');
    setParams(next);
    setSelectedCell(null);
    setActionMessage('');
    setActionError('');
  }

  async function confirmOperation() {
    if (!pendingAction || !lojaId || !mesRef || !sectionId || !scopePeople.length) return;
    const action = pendingAction;
    setActionBusy(true);
    setActionError('');
    try {
      const payload = {
        lojaId: Number(lojaId),
        mesRef,
        escsecaoId: Number(sectionId),
        ...(subsection !== 'all'
          ? { escfuncIds: scopePeople.map((person) => Number(person.ESCFUNC_ID)) }
          : {}),
      };
      const response = await postJson<{
        resultado: { criada?: boolean; resetada?: boolean; funcionarios?: number; criticas?: unknown[] };
      }>(`/api/escalas/${action === 'gerar' ? 'gerar-secao' : 'resetar-secao'}`, payload);
      const count = response.resultado?.funcionarios;
      const critiques = response.resultado?.criticas?.length || 0;
      setActionMessage(
        `${action === 'gerar' ? 'Escala gerada' : 'Escala resetada'} para ${scopeName}${count ? ` · ${count} funcionário(s)` : ''}${critiques ? ` · ${critiques} crítica(s) a revisar` : ''}.`,
      );
      setPendingAction(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível concluir a operação.');
    } finally {
      setActionBusy(false);
    }
  }

  const monthlyTitle = mesRef
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${mesRef}T00:00:00Z`),
      )
    : '';
  const editUrl = `/app#/escala-banco-mensal/${encodeURIComponent(lojaId || '')}/${encodeURIComponent(mesRef || '')}`;

  return (
    <main className="content schedule-page">
      <div className="page-heading">
        <div>
          <Link className="back-link" to="/escalas-liberadas">
            <ArrowLeft size={15} /> Escalas liberadas
          </Link>
          <h1>Escala · Loja {lojaId}</h1>
          <p>
            {monthlyTitle}
            {periodo ? ` · ${formatDate(periodo.inicio)} a ${formatDate(periodo.fim)}` : ''}
            {escala?.status ? ` · ${escala.status}` : ''}
          </p>
        </div>
        <div className="heading-actions">
          <Link
            className="button secondary"
            to={`/escalas/${encodeURIComponent(lojaId || '')}/${encodeURIComponent(mesRef || '')}/imprimir?secao=${sectionId || ''}`}
          >
            <Printer size={16} /> Imprimir
          </Link>
          <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <a className="button primary" href={editUrl}>
            <ArrowUpRight size={16} /> Editar na interface atual
          </a>
        </div>
      </div>
      {loading && (
        <div className="empty-state" role="status">
          Carregando escala...
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
      {actionError && !pendingAction && (
        <div className="notice error" role="alert">
          {actionError}
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="schedule-summary">
            <span>
              <strong>{dates.length}</strong> dias
            </span>
            <span>
              <strong>{sections.length}</strong> seções
            </span>
            <span>
              <strong>{escala?.funcionarios?.length || 0}</strong> funcionários
            </span>
            <span>
              Revisão <strong>{escala?.revisao ?? '–'}</strong>
            </span>
          </div>
          {!sections.length ? (
            <div className="empty-state">Nenhuma seção disponível nesta escala.</div>
          ) : (
            <>
              <div className="scope-tabs" role="tablist" aria-label="Seções da escala">
                {sections.map((item) => (
                  <button
                    key={item.ESCSECAO_ID}
                    role="tab"
                    aria-selected={Number(sectionId) === Number(item.ESCSECAO_ID)}
                    className={Number(sectionId) === Number(item.ESCSECAO_ID) ? 'selected' : ''}
                    onClick={() => updateFilter('secao', String(item.ESCSECAO_ID), true)}
                  >
                    {sectionLabel(item)} <small>{item.FUNCIONARIOS ?? 0}</small>
                  </button>
                ))}
              </div>
              <div className="scope-subtabs" aria-label="Subseções da seção">
                <button
                  className={subsection === 'all' ? 'selected' : ''}
                  onClick={() => updateFilter('subsecao', 'all')}
                >
                  Todos <small>{employees.length}</small>
                </button>
                {subsections.map(([id, name]) => (
                  <button
                    key={id}
                    className={subsection === id ? 'selected' : ''}
                    onClick={() => updateFilter('subsecao', id)}
                  >
                    {name}{' '}
                    <small>{employees.filter((item) => String(item.ESCSUBSECAO_ID) === id).length}</small>
                  </button>
                ))}
                {employees.some((item) => personSubKey(item) === 'sem') && (
                  <button
                    className={subsection === 'sem' ? 'selected' : ''}
                    onClick={() => updateFilter('subsecao', 'sem')}
                  >
                    Sem subseção{' '}
                    <small>{employees.filter((item) => personSubKey(item) === 'sem').length}</small>
                  </button>
                )}
              </div>
              <div className="schedule-toolbar">
                <div>
                  <strong>{sectionLabel(section!)}</strong>
                  <span>{visibleEmployees.length} funcionário(s) nesta visão</span>
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
                <div className="segmented" aria-label="Visão da escala">
                  <button
                    className={view === 'mensal' ? 'selected' : ''}
                    onClick={() => updateFilter('visao', 'mensal')}
                  >
                    Mensal
                  </button>
                  <button
                    className={view === 'diaria' ? 'selected' : ''}
                    onClick={() => updateFilter('visao', 'diaria')}
                  >
                    Diária
                  </button>
                </div>
                {view === 'diaria' && (
                  <label className="day-picker">
                    Dia
                    <select
                      value={selectedDate}
                      onChange={(event) => updateFilter('dia', event.target.value)}
                    >
                      {dates.map((date) => (
                        <option key={date} value={date}>
                          {weekday(date)} {formatDate(date)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              {canEdit(user, 'escalas') && (
                <div className="schedule-actions">
                  <span>
                    Escopo: <strong>{scopeName}</strong> · {scopePeople.length} funcionário(s)
                  </span>
                  <button
                    className="button secondary"
                    type="button"
                    disabled={!scopePeople.length || loading}
                    onClick={() => {
                      setActionError('');
                      setPendingAction('resetar');
                    }}
                  >
                    <RotateCcw size={15} /> Resetar
                  </button>
                  <button
                    className="button primary"
                    type="button"
                    disabled={!scopePeople.length || loading}
                    onClick={() => {
                      setActionError('');
                      setPendingAction('gerar');
                    }}
                  >
                    <Play size={15} /> Gerar escala
                  </button>
                </div>
              )}
              {!visibleEmployees.length ? (
                <div className="empty-state">Nenhum funcionário encontrado neste filtro.</div>
              ) : view === 'mensal' ? (
                <div
                  ref={gridRef}
                  className="schedule-scroll"
                  role="region"
                  aria-label="Grade mensal"
                  tabIndex={0}
                  onScroll={(event) => {
                    gridPosition.current = {
                      left: event.currentTarget.scrollLeft,
                      top: event.currentTarget.scrollTop,
                    };
                  }}
                >
                  <table className="monthly-grid">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="employee-col">
                          Funcionário
                        </th>
                        {dates.map((date, index) => (
                          <th key={date} className={index % 7 === 0 ? 'week-start' : ''}>
                            {weekday(date)}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {dates.map((date, index) => (
                          <th key={date} className={index % 7 === 0 ? 'week-start' : ''}>
                            {date.slice(8, 10)}
                            {date.slice(5, 7) !== mesRef?.slice(5, 7) ? `/${date.slice(5, 7)}` : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEmployees.map((person) => (
                        <tr key={person.ESCFUNC_ID}>
                          <th className="employee-col">
                            <strong>
                              {person.CHAPA} · {person.NOME}
                            </strong>
                            <small>{person.FUNCAO_DESCR || 'Cargo não informado'}</small>
                          </th>
                          {dates.map((date, index) => {
                            const day = daysByEmployee.get(String(person.ESCFUNC_ID))?.get(date);
                            return (
                              <td
                                key={date}
                                className={`${kind(day)} ${index % 7 === 0 ? 'week-start' : ''}`}
                              >
                                <button
                                  type="button"
                                  title={`${person.NOME} · ${formatDate(date)} · ${shiftLabel(day)}`}
                                  aria-label={`${person.NOME}, ${formatDate(date)}, ${shiftLabel(day)}`}
                                  onClick={() => setSelectedCell({ employee: person, date, day })}
                                >
                                  {cellText(day)}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="table-scroll daily-schedule">
                  <table>
                    <thead>
                      <tr>
                        <th>Funcionário</th>
                        <th>Matrícula</th>
                        <th>Cargo</th>
                        <th>Programação</th>
                        <th>Entrada</th>
                        <th>Saída intervalo</th>
                        <th>Retorno</th>
                        <th>Saída</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEmployees.map((person) => {
                        const day = daysByEmployee.get(String(person.ESCFUNC_ID))?.get(selectedDate);
                        return (
                          <tr key={person.ESCFUNC_ID}>
                            <td>
                              <strong>{person.NOME}</strong>
                            </td>
                            <td>{person.CHAPA}</td>
                            <td>{person.FUNCAO_DESCR || '–'}</td>
                            <td>
                              <span className={`day-badge ${kind(day)}`}>{cellText(day)}</span>
                            </td>
                            <td>{hasShift(day) ? day?.HR_ENT1 || '–' : '–'}</td>
                            <td>{hasShift(day) ? day?.HR_SAI1 || '–' : '–'}</td>
                            <td>{hasShift(day) ? day?.HR_ENT2 || '–' : '–'}</td>
                            <td>{hasShift(day) ? day?.HR_SAI2 || '–' : '–'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedCell && view === 'mensal' && (
                <div className="cell-detail">
                  <div>
                    <strong>{selectedCell.employee.NOME}</strong>
                    <span>
                      {selectedCell.employee.CHAPA} · {formatDate(selectedCell.date)}
                    </span>
                  </div>
                  <div>
                    <strong>{cellText(selectedCell.day)}</strong>
                    <span>{shiftLabel(selectedCell.day)}</span>
                  </div>
                  {canEdit(user, 'escalas') &&
                    canEdit(user, 'escalas-funcionarios') &&
                    selectedCell.day &&
                    escala?.status !== 'FINALIZADA' && (
                      <button
                        type="button"
                        className="button primary"
                        onClick={() =>
                          setEditingCell({ employee: selectedCell.employee, day: selectedCell.day! })
                        }
                      >
                        <Pencil size={15} /> Editar dia
                      </button>
                    )}
                  <button type="button" className="button secondary" onClick={() => setSelectedCell(null)}>
                    Fechar
                  </button>
                </div>
              )}
              <div className="schedule-legend">
                <span>
                  <i className="work" /> Trabalho
                </span>
                <span>
                  <i className="rest" /> Folga
                </span>
                <span>
                  <i className="fixed" /> Fixo
                </span>
                <span>
                  <i className="absence" /> Férias / afastamento
                </span>
                <span>
                  <i className="empty" /> Sem programação
                </span>
              </div>
            </>
          )}
        </>
      )}
      {editingCell && lojaId && mesRef && (
        <EditarDiaEscala
          key={`${editingCell.employee.ESCFUNC_ID}-${editingCell.day.DT}`}
          lojaId={lojaId}
          mesRef={mesRef}
          employee={editingCell.employee}
          day={editingCell.day}
          days={(escala?.dias || []).filter(
            (item) => Number(item.ESCFUNC_ID) === Number(editingCell.employee.ESCFUNC_ID),
          )}
          onClose={() => setEditingCell(null)}
          onSaved={() => {
            setEditingCell(null);
            setSelectedCell(null);
            setActionMessage('Rascunho do funcionário salvo e confirmado pela leitura da escala.');
            setReload((value) => value + 1);
          }}
        />
      )}
      {pendingAction && (
        <div
          className="confirm-backdrop"
          role="presentation"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !actionBusy) setPendingAction(null);
          }}
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-confirm-title"
          >
            <h2 id="schedule-confirm-title">
              {pendingAction === 'gerar' ? 'Gerar escala' : 'Resetar escala'}
            </h2>
            <p>
              Loja {lojaId} · {section?.DESCR} · {scopeName} · {scopePeople.length} funcionário(s).
            </p>
            <p>
              {pendingAction === 'gerar'
                ? 'A geração recalcula os dias editáveis deste escopo. Alterações manuais futuras podem ser substituídas.'
                : 'O reset remove os dias gerados deste escopo e restaura folgas fixas, férias e afastamentos protegidos.'}
            </p>
            {actionError && (
              <div className="notice error" role="alert">
                {actionError}
              </div>
            )}
            <div className="confirm-actions">
              <button
                autoFocus
                className="button secondary"
                type="button"
                disabled={actionBusy}
                onClick={() => setPendingAction(null)}
              >
                Cancelar
              </button>
              <button
                className="button primary"
                type="button"
                disabled={actionBusy}
                onClick={confirmOperation}
              >
                {actionBusy
                  ? 'Aguarde...'
                  : pendingAction === 'gerar'
                    ? 'Confirmar geração'
                    : 'Confirmar reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
