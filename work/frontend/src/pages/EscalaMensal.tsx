import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown, MoreVertical, Pencil, Play, Printer, RefreshCw, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  canEdit,
  ApiError,
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
import { TransferirSubsecao } from './TransferirSubsecao';
import { EditarFixoEscala } from './EditarFixoEscala';
import { EditarDiasEmMassa } from './EditarDiasEmMassa';
import { EditarHorarioBase } from './EditarHorarioBase';
import { createOperationId } from '../operationId';
import { quickShift } from '../quickShift';
import { nextFixedState } from '../quickFixedCycle';

function iso(value: string | null | undefined) {
  return String(value || '').slice(0, 10);
}

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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

function timeSegment(start?: string | null, end?: string | null) {
  const minutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  if (!start || !end || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return null;
  const from = minutes(start);
  const to = minutes(end);
  if (to <= from) return null;
  const left = Math.max(0, Math.min(100, (from - 300) / 1140 * 100));
  const right = Math.max(left, Math.min(100, (to - 300) / 1140 * 100));
  return { left: `${left}%`, width: `${right - left}%` };
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
  const code = String(dia.PROGRAMACAO || 'F').toUpperCase();
  return hasShift(dia) ? dia.HR_ENT1 || 'TRB' : code === 'FXF' ? 'F' : code;
}

function shiftLabel(dia?: DiaEscala) {
  if (!dia) return 'Sem programação';
  if (!hasShift(dia)) return dia.MOTIVO_AUSENCIA || (String(dia.PROGRAMACAO || '').toUpperCase() === 'FXF' ? 'Folga fixa' : dia.PROGRAMACAO) || 'Folga';
  return [dia.HR_ENT1, dia.HR_SAI1, dia.HR_ENT2, dia.HR_SAI2].filter(Boolean).join(' · ');
}

function sectionLabel(section: Secao) {
  return [section.COD_SECAO, section.DESCR].filter(Boolean).join(' · ');
}

type CritiqueGroup = {
  escsecaoId: number;
  escsubsecaoId: number | null;
  secao: string;
  subsecao: string;
  criticas: string[];
  marcadores: { escfuncId: number; datas: string[]; mensagem: string }[];
};

export function EscalaMensal({ user }: { user: User }) {
  const { lojaId, mesRef } = useParams();
  const [params, setParams] = useSearchParams();
  const [escala, setEscala] = useState<EscalaMensal | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoOperacional | null>(null);
  const [holidays, setHolidays] = useState<Record<string, string>>({});
  const [catalogSections, setCatalogSections] = useState<Secao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [pendingAction, setPendingAction] = useState<'gerar' | 'resetar' | 'oficializar' | null>(null);
  const [individualTarget, setIndividualTarget] = useState<Funcionario | null>(null);
  const [transferTarget, setTransferTarget] = useState<Funcionario | null>(null);
  const [shiftTarget, setShiftTarget] = useState<Funcionario | null>(null);
  const [personMenu, setPersonMenu] = useState<{ employee: Funcionario; left: number; top: number } | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [scopeCritiques, setScopeCritiques] = useState<string[]>([]);
  const [critiqueGroups, setCritiqueGroups] = useState<CritiqueGroup[]>([]);
  const [scopeCritiquesLoading, setScopeCritiquesLoading] = useState(false);
  const [scopeCritiquesError, setScopeCritiquesError] = useState('');
  const [selectedCell, setSelectedCell] = useState<{
    employee: Funcionario;
    date: string;
    day?: DiaEscala;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{ employee: Funcionario; day: DiaEscala } | null>(null);
  const [fixedCell, setFixedCell] = useState<{ employee: Funcionario; date: string } | null>(null);
  const [bulkEditing, setBulkEditing] = useState(false);
  const [quickBusy, setQuickBusy] = useState(false);
  const quickBusyRef = useRef(false);
  const clickTimer = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridPosition = useRef({ left: 0, top: 0 });

  useEffect(() => () => { if (clickTimer.current !== null) window.clearTimeout(clickTimer.current); }, []);

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

  useEffect(() => {
    if (!periodo) return;
    const controller = new AbortController();
    getJson<{ feriados: { data: string; nome: string }[] }>(`/api/escalas/feriados?${new URLSearchParams({ inicio: periodo.inicio, fim: periodo.fim })}`, controller.signal)
      .then(({ feriados }) => setHolidays(Object.fromEntries(feriados.map((item) => [item.data, item.nome]))))
      .catch((reason) => { if (reason.name !== 'AbortError') setHolidays({}); });
    return () => controller.abort();
  }, [periodo]);

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
      .map((item: Subsecao) => [String(item.ESCSUBSECAO_ID), item.STATUS === 'I' ? `${item.DESCR} (inativa)` : item.DESCR] as const)
      .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  }, [sectionCatalog]);
  const subsectionIds = useMemo(() => new Set(subsections.map(([id]) => id)), [subsections]);
  const personSubKey = (person: Funcionario) => {
    const id = String(person.ESCSUBSECAO_ID || '');
    return subsectionIds.has(id) ? id : 'sem';
  };
  const subsection = params.get('subsecao') || 'all';
  const personFilter = params.get('funcionario');
  const scopeName =
    personFilter
      ? employees.find((item) => String(item.ESCFUNC_ID) === personFilter)?.NOME || 'Funcionário'
      : subsection === 'all'
      ? section?.DESCR || 'Seção'
      : subsection === 'sem'
        ? 'Sem subseção'
        : subsections.find(([id]) => id === subsection)?.[1] || 'Subseção';
  const dates = useMemo(() => (periodo ? datesBetween(periodo) : []), [periodo]);
  const periodHolidays = useMemo(() => dates.filter((date) => holidays[date]).map((date) => ({ date, name: holidays[date] })), [dates, holidays]);
  const critiqueMarkers = useMemo(() => {
    const byEmployee = new Map<number, { row: string[]; dates: Map<string, string[]> }>();
    for (const group of critiqueGroups) {
      for (const marker of group.marcadores || []) {
        if (!byEmployee.has(marker.escfuncId)) byEmployee.set(marker.escfuncId, { row: [], dates: new Map() });
        const entry = byEmployee.get(marker.escfuncId)!;
        if (!marker.datas.length) entry.row.push(marker.mensagem);
        for (const date of marker.datas) {
          if (!entry.dates.has(date)) entry.dates.set(date, []);
          entry.dates.get(date)!.push(marker.mensagem);
        }
      }
    }
    return byEmployee;
  }, [critiqueGroups]);
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
  const daySubKey = (day: DiaEscala) => {
    const id = String(day.ESCSUBSECAO_ID || '');
    return subsectionIds.has(id) ? id : 'sem';
  };
  const memberOfSubsection = (person: Funcionario, target: string, date?: string) => {
    if (target === 'all') return true;
    const personDays = daysByEmployee.get(String(person.ESCFUNC_ID));
    if (!personDays?.size) return personSubKey(person) === target;
    if (date) {
      const day = personDays.get(date);
      return day ? daySubKey(day) === target : false;
    }
    return [...personDays.values()].some((day) => daySubKey(day) === target);
  };
  const scopePeople = employees.filter((item) =>
    memberOfSubsection(item, subsection) &&
    (!personFilter || String(item.ESCFUNC_ID) === personFilter));
  const scopeIdsKey = scopePeople.map((person) => Number(person.ESCFUNC_ID)).sort((a, b) => a - b).join(',');
  useEffect(() => setCritiqueGroups([]), [lojaId, mesRef]);
  useEffect(() => {
    if (!lojaId || !mesRef || !sectionId || !escala) {
      setScopeCritiques([]);
      setCritiqueGroups([]);
      setScopeCritiquesLoading(false);
      setScopeCritiquesError('');
      return;
    }
    const controller = new AbortController();
    setScopeCritiques([]);
    setScopeCritiquesLoading(true);
    setScopeCritiquesError('');
    getJson<{ criticas: string[]; grupos: CritiqueGroup[] }>(`/api/escalas/criticas?${new URLSearchParams({
      lojaId, mesRef, escsecaoId: String(sectionId), ...(scopeIdsKey ? { escfuncIds: scopeIdsKey } : {}),
    })}`, controller.signal)
      .then(({ criticas, grupos }) => {
        setScopeCritiques(scopeIdsKey ? criticas : []);
        setCritiqueGroups(grupos || []);
        setScopeCritiquesLoading(false);
      })
      .catch((reason) => {
        if (reason.name === 'AbortError') return;
        setCritiqueGroups([]);
        setScopeCritiquesError(reason instanceof Error ? reason.message : 'Não foi possível verificar as críticas.');
        setScopeCritiquesLoading(false);
      });
    return () => controller.abort();
  }, [lojaId, mesRef, sectionId, scopeIdsKey, escala]);
  const mixedSubsectionScope = subsection !== 'all' && scopePeople.some((person) => {
    const personDays = daysByEmployee.get(String(person.ESCFUNC_ID));
    return personDays && [...personDays.values()].some((day) => daySubKey(day) !== subsection);
  });
  const visibleEmployees = useMemo(
    () =>
      employees
        .filter((item) => {
          return (
            memberOfSubsection(item, subsection, view === 'diaria' ? selectedDate : undefined) &&
            (!personFilter || String(item.ESCFUNC_ID) === personFilter) &&
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
    [employees, subsection, personFilter, search, daysByEmployee, dates, selectedDate, view, subsectionIds],
  );
  const coverage = useMemo(() => dates.map((date) => {
    let working = 0;
    let rests = 0;
    for (const person of visibleEmployees) {
      const day = daysByEmployee.get(String(person.ESCFUNC_ID))?.get(date);
      if (day && (subsection === 'all' || daySubKey(day) === subsection)) {
        if (hasShift(day)) working += 1;
        else if (kind(day) === 'rest' || kind(day) === 'fixed') rests += 1;
      } else if (!day) {
        const fixed = escala?.fixos?.find((item) => Number(item.ESCFUNC_ID) === Number(person.ESCFUNC_ID) && iso(item.DT) === date);
        if (fixed?.PROGRAMACAO === 'TRB') working += 1;
        else if (fixed) rests += 1;
      }
    }
    return { working, rests, quality: visibleEmployees.length ? Math.round(working / visibleEmployees.length * 100) : null };
  }), [dates, visibleEmployees, daysByEmployee, subsection, subsectionIds, escala]);

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
    if (key === 'secao' || key === 'subsecao') next.delete('funcionario');
    setParams(next);
    setSelectedCell(null);
    setActionMessage('');
    setActionError('');
  }

  async function confirmOperation() {
    if (!pendingAction || !lojaId || !mesRef || !sectionId || !scopePeople.length) return;
    if (mixedSubsectionScope) {
      setActionError('Esta subseção possui funcionário transferido durante o mês. Use a visão da seção para operações no mês inteiro.');
      return;
    }
    const action = pendingAction;
    setActionBusy(true);
    setActionError('');
    try {
      const payload = {
        lojaId: Number(lojaId),
        mesRef,
        escsecaoId: Number(sectionId),
        escfuncIds: scopePeople.map((person) => Number(person.ESCFUNC_ID)),
      };
      if (action === 'oficializar') {
        const response = await postJson<{ affectedRows: number; rm?: { status?: string } }>(
          '/api/escalas/oficializar', payload,
        );
        setActionMessage(`${scopeName} oficializada · ${response.affectedRows} dia(s). Envio RM: ${response.rm?.status || 'a verificar'}.`);
      } else {
        const response = await postJson<{
          resultado: { criada?: boolean; resetada?: boolean; funcionarios?: number; criticas?: unknown[] };
        }>(`/api/escalas/${action === 'gerar' ? 'gerar-secao' : 'resetar-secao'}`, payload);
        const count = response.resultado?.funcionarios;
        const critiques = response.resultado?.criticas?.length || 0;
        setActionMessage(
          `${action === 'gerar' ? 'Escala gerada' : 'Escala resetada'} para ${scopeName}${count ? ` · ${count} funcionário(s)` : ''}${critiques ? ` · ${critiques} crítica(s) a revisar` : ''}.`,
        );
      }
      setPendingAction(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível concluir a operação.');
    } finally {
      setActionBusy(false);
    }
  }

  async function generateIndividual() {
    if (!individualTarget || !lojaId || !mesRef) return;
    setActionBusy(true);
    setActionError('');
    try {
      const response = await postJson<{ resultado: { criticas?: unknown[] } }>(
        '/api/escalas/gerar-secao', {
          lojaId: Number(lojaId), mesRef,
          escsecaoId: Number(individualTarget.ESCSECAO_ID),
          escfuncIds: [Number(individualTarget.ESCFUNC_ID)],
        },
      );
      setActionMessage(`Escala de ${individualTarget.NOME} gerada${response.resultado?.criticas?.length ? ` · ${response.resultado.criticas.length} crítica(s) a revisar` : ''}.`);
      setIndividualTarget(null);
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível gerar a escala individual.');
    } finally {
      setActionBusy(false);
    }
  }

  function openPersonMenu(event: React.MouseEvent<HTMLButtonElement>, employee: Funcionario) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPersonMenu({
      employee,
      left: Math.max(8, Math.min(rect.right - 8, window.innerWidth - 225)),
      top: rect.bottom + 154 > window.innerHeight ? Math.max(8, rect.top - 154) : rect.bottom + 4,
    });
  }

  async function quickToggle(employee: Funcionario, date: string, day?: DiaEscala) {
    if (!lojaId || !mesRef || quickBusyRef.current || !canEdit(user, 'escalas') || !canEdit(user, 'escalas-funcionarios') || date < localToday() || escala?.status === 'FINALIZADA') return;
    if (day?.AUSENCIA_OBRIGATORIA || ['FER', 'AFA'].includes(String(day?.PROGRAMACAO || '').toUpperCase())) return;
    const existingFixed = escala?.fixos?.find((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID) && iso(item.DT) === date);
    if (day?.FIXO_ESCALA && day) {
      if (Number(day.OFICIALIZADA) === 1) setActionError('O dia fixo oficializado precisa ser revisado antes de alterar o fixo.');
      else setFixedCell({ employee, date });
      return;
    }
    const nextFixed = day ? null : nextFixedState(existingFixed?.PROGRAMACAO);
    const nextRest = day ? hasShift(day) : nextFixed === 'FXF';
    quickBusyRef.current = true; setQuickBusy(true); setActionError('');
    try {
      if (!day) {
        const base = { lojaId: Number(lojaId), mesRef, escfuncId: Number(employee.ESCFUNC_ID), escsecaoId: Number(employee.ESCSECAO_ID), DT: date };
        if (nextFixed === 'TRB') {
          await postJson('/api/escalas/fixos', { ...base, PROGRAMACAO: 'TRB', ...quickShift(employee), JUSTIFICATIVA: 'Distribuição rápida na grade' });
        } else if (!nextFixed) {
          const result = await postJson<{ result: { removed: boolean } }>('/api/escalas/fixos/remover', base);
          if (!result.result?.removed) throw new Error('O fixo não foi encontrado. Atualize a escala.');
        } else await postJson('/api/escalas/fixos', { ...base, PROGRAMACAO: 'FXF', JUSTIFICATIVA: 'Distribuição rápida na grade' });
        const readback = await getJson<{ escala: EscalaMensal }>(`/api/escalas/mensal?${new URLSearchParams({ lojaId, mesRef })}`).catch(() => null);
        const recorded = readback?.escala.fixos?.find((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID) && iso(item.DT) === date);
        if (!readback || (nextFixed ? recorded?.PROGRAMACAO !== nextFixed : Boolean(recorded))) {
          throw new Error('A leitura de volta não confirmou o fixo. Atualize a escala antes de tentar novamente.');
        }
        setEscala(readback.escala);
      } else {
        if (!Number.isInteger(Number(day.REVISAO))) throw new Error('Revisão do funcionário indisponível. Atualize a escala.');
        const personDays = (escala?.dias || []).filter((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID));
        const reference = personDays.find(hasShift);
        const apprentice = /APRENDIZ/i.test(employee.FUNCAO_DESCR || '');
        const hours = quickShift(employee, reference);
        const changed = { data: date, programacao: nextRest ? 'F' : 'TRB',
          hrEnt1: nextRest ? null : hours.HR_ENT1, hrSai1: nextRest ? null : hours.HR_SAI1,
          hrEnt2: nextRest ? null : hours.HR_ENT2, hrSai2: nextRest ? null : hours.HR_SAI2,
          justificativa: 'Alteração rápida na grade' };
        const payload = { lojaId: Number(lojaId), mesRef, operacaoId: createOperationId(), oficializada: 0, edicaoRapida: true,
          funcionarios: [{ escfuncId: Number(employee.ESCFUNC_ID), revisaoBase: Number(day.REVISAO),
            chapa: employee.CHAPA, nome: employee.NOME, funcao: employee.FUNCAO_DESCR || null,
            escsecaoId: employee.ESCSECAO_ID, escfuncaoId: employee.ESCFUNCAO_ID,
            aprendiz: apprentice,
            dias: [changed] }] };
        let saved: { saved?: { revisao: number }[]; criticas?: string[] } | null = null;
        try { saved = await postJson('/api/escalas/funcionarios/revisao', payload); }
        catch (reason) {
          if (reason instanceof ApiError && reason.status < 500) throw reason;
          const confirmation = await getJson<{ confirmada: boolean }>(`/api/escalas/operacoes/${payload.operacaoId}?${new URLSearchParams({ lojaId, mesRef })}`).catch(() => null);
          if (!confirmation?.confirmada) throw new Error('Não foi possível confirmar a gravação. Atualize a escala antes de tentar novamente.');
        }
        if (saved && saved.saved?.length !== 1) throw new Error('A revisão não foi confirmada. Atualize a escala antes de tentar novamente.');
        const readback = await getJson<{ escala: EscalaMensal }>(`/api/escalas/mensal?${new URLSearchParams({ lojaId, mesRef })}`).catch(() => null);
        const recorded = readback?.escala.dias.find((item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID) && iso(item.DT) === date);
        if (!recorded || String(recorded.PROGRAMACAO || '').toUpperCase() !== changed.programacao || (saved && Number(recorded.REVISAO) !== Number(saved.saved?.[0]?.revisao))) {
          throw new Error('A leitura de volta não confirmou o dia. Atualize a escala antes de tentar novamente.');
        }
        setEscala(readback!.escala);
      }
      setActionMessage(`${employee.NOME}: ${day ? nextRest ? 'folga' : 'trabalho' : nextFixed === 'FXF' ? 'folga fixa' : nextFixed === 'TRB' ? 'horário fixo' : 'dia vazio'} atualizado.${Number(day?.OFICIALIZADA) === 1 ? ' Reoficialização necessária.' : ''}`);
    } catch (reason) { setActionError(reason instanceof Error ? reason.message : 'Não foi possível alterar o dia.'); }
    finally { quickBusyRef.current = false; setQuickBusy(false); }
  }

  function clickDay(employee: Funcionario, date: string, day?: DiaEscala) {
    if (clickTimer.current !== null) window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      if (canEdit(user, 'escalas') && canEdit(user, 'escalas-funcionarios')) void quickToggle(employee, date, day);
      else setSelectedCell({ employee, date, day });
    }, 260);
  }

  function doubleClickDay(employee: Funcionario, date: string, day?: DiaEscala) {
    if (clickTimer.current !== null) window.clearTimeout(clickTimer.current);
    clickTimer.current = null;
    if (!canEdit(user, 'escalas') || !canEdit(user, 'escalas-funcionarios') || escala?.status === 'FINALIZADA') { setSelectedCell({ employee, date, day }); return; }
    if (day && !day.FIXO_ESCALA && !day.AUSENCIA_OBRIGATORIA && !['FER', 'AFA'].includes(String(day.PROGRAMACAO || '').toUpperCase())) setEditingCell({ employee, day });
    else if (date >= localToday() && Number(day?.OFICIALIZADA) !== 1 && !day?.AUSENCIA_OBRIGATORIA && !['FER', 'AFA'].includes(String(day?.PROGRAMACAO || '').toUpperCase())) setFixedCell({ employee, date });
    else setSelectedCell({ employee, date, day });
  }

  const monthlyTitle = mesRef
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${mesRef}T00:00:00Z`),
      )
    : '';
  const editUrl = `/app#/escala-banco-mensal/${encodeURIComponent(lojaId || '')}/${encodeURIComponent(mesRef || '')}`;
  const scopeIds = new Set(scopePeople.map((person) => Number(person.ESCFUNC_ID)));
  const scopedDays = (escala?.dias || []).filter((day) =>
    scopeIds.has(Number(day.ESCFUNC_ID)) && (subsection === 'all' || daySubKey(day) === subsection));
  const scopeOfficial = scopedDays.length > 0 && scopedDays.every((day) => Number(day.OFICIALIZADA) === 1);
  const scopeHasOfficial = scopedDays.some((day) => Number(day.OFICIALIZADA) === 1);

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
      {scopeCritiquesError && <div className="notice error" role="alert">Não foi possível verificar as críticas: {scopeCritiquesError}</div>}
      {!loading && !error && critiqueGroups.map((group) => (
        <details className="notice error schedule-critiques" key={`${group.escsecaoId}-${group.escsubsecaoId ?? 'sem'}`}>
          <summary>
            <strong>Críticas da {group.secao} - {group.subsecao} · {group.criticas.length}</strong>
            <ChevronDown size={17} aria-hidden="true" />
          </summary>
          <ul>{group.criticas.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
        </details>
      ))}
      {!loading && !error && periodHolidays.length > 0 && (
        <div className="notice warning schedule-holidays" role="note">
          <strong>Feriados do período</strong>
          <ul>{periodHolidays.map(({ date, name }) => <li key={date}><time dateTime={date}>{weekday(date)} · {formatDate(date)}</time><span>{name}</span></li>)}</ul>
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
                    <small>{employees.filter((item) => memberOfSubsection(item, id)).length}</small>
                  </button>
                ))}
                {employees.some((item) => memberOfSubsection(item, 'sem')) && (
                  <button
                    className={subsection === 'sem' ? 'selected' : ''}
                    onClick={() => updateFilter('subsecao', 'sem')}
                  >
                    Sem subseção{' '}
                    <small>{employees.filter((item) => memberOfSubsection(item, 'sem')).length}</small>
                  </button>
                )}
              </div>
              <div className="schedule-toolbar">
                <div>
                  <strong>{sectionLabel(section!)}</strong>
                  <span>{visibleEmployees.length} funcionário(s) nesta visão</span>
                </div>
                {personFilter && <button className="button secondary" type="button" onClick={() => {
                  const next = new URLSearchParams(params);
                  next.delete('funcionario');
                  setParams(next);
                }}>Mostrar toda a seção</button>}
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
                          {weekday(date)} {formatDate(date)}{holidays[date] ? ` · ${holidays[date]}` : ''}
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
                  {mixedSubsectionScope && <span title="Operações por subseção com transferência no mês exigem recorte por data.">Transferência no mês: operações em lote disponíveis na seção inteira</span>}
                  {canEdit(user, 'escalas-funcionarios') && <button className="button secondary" type="button" disabled={!scopePeople.length || loading || mixedSubsectionScope || escala?.status === 'FINALIZADA'} onClick={() => setBulkEditing(true)}><Pencil size={15} /> Editar vários</button>}
                  <button
                    className="button secondary"
                    type="button"
                    disabled={!scopePeople.length || loading || mixedSubsectionScope || scopeHasOfficial}
                    title={scopeHasOfficial ? 'Escopo com dias oficializados não pode ser resetado. Edite os dias e oficialize novamente.' : undefined}
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
                    disabled={!scopePeople.length || loading || mixedSubsectionScope || scopeHasOfficial}
                    title={scopeHasOfficial ? 'Escopo com dias oficializados não pode ser gerado novamente. Edite os dias e oficialize novamente.' : undefined}
                    onClick={() => {
                      setActionError('');
                      setPendingAction('gerar');
                    }}
                  >
                    <Play size={15} /> Gerar escala
                  </button>
                  {user.perfil === 'ADMIN' && !scopeOfficial && scopedDays.length > 0 && (
                    <button className="button secondary" type="button" disabled={loading || mixedSubsectionScope || scopeCritiquesLoading || !!scopeCritiquesError || scopeCritiques.length > 0} title={scopeCritiques.length ? 'Resolva as críticas deste escopo antes de oficializar' : undefined} onClick={() => {
                      setActionError('');
                      setPendingAction('oficializar');
                    }}><ShieldCheck size={15} /> Oficializar</button>
                  )}
                  {scopeOfficial && <span>Escopo oficializado</span>}
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
                      <tr className="monthly-coverage-row"><th className="employee-col">Qualidade (%)</th>{coverage.map((item, index) => <th key={dates[index]} className={index % 7 === 0 ? 'week-start' : ''} title={`${item.working} trabalhando, ${item.rests} em folga`}>{item.quality === null ? '–' : `${item.quality}%`}</th>)}</tr>
                      <tr className="monthly-count-row"><th className="employee-col">Folgas</th>{coverage.map((item, index) => <th key={dates[index]} className={index % 7 === 0 ? 'week-start' : ''}><span className="rest-count">{item.rests} F</span></th>)}</tr>
                      <tr className="monthly-count-row"><th className="employee-col">Trabalhando</th>{coverage.map((item, index) => <th key={dates[index]} className={index % 7 === 0 ? 'week-start' : ''}><span className="work-count">{item.working} T</span></th>)}</tr>
                      <tr>
                        <th rowSpan={2} className="employee-col">
                          Funcionário
                        </th>
                        {dates.map((date, index) => (
                          <th key={date} className={`${index % 7 === 0 ? 'week-start' : ''} ${holidays[date] ? 'holiday-date' : ''}`} title={holidays[date] || undefined}>
                            {weekday(date)}{holidays[date] ? ' *' : ''}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {dates.map((date, index) => (
                          <th key={date} className={`${index % 7 === 0 ? 'week-start' : ''} ${holidays[date] ? 'holiday-date' : ''}`} title={holidays[date] || undefined}>
                            {date.slice(8, 10)}
                            {date.slice(5, 7) !== mesRef?.slice(5, 7) ? `/${date.slice(5, 7)}` : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEmployees.map((person) => (
                        <tr key={person.ESCFUNC_ID}>
                          <th className={`employee-col${critiqueMarkers.get(Number(person.ESCFUNC_ID))?.row.length ? ' critical' : ''}`} title={critiqueMarkers.get(Number(person.ESCFUNC_ID))?.row.join('\n') || undefined}>
                            <strong>
                              {person.CHAPA} · {person.NOME}
                            </strong>
                            <small>{person.FUNCAO_DESCR || 'Cargo não informado'}</small>
                            <button type="button" className="person-menu-trigger" title={`Ações de ${person.NOME}`} aria-label={`Ações de ${person.NOME}`} onClick={(event) => openPersonMenu(event, person)}><MoreVertical size={16} /></button>
                          </th>
                          {dates.map((date, index) => {
                            const dayCritiques = critiqueMarkers.get(Number(person.ESCFUNC_ID))?.dates.get(date) || [];
                            const scheduled = daysByEmployee.get(String(person.ESCFUNC_ID))?.get(date);
                            const day = scheduled && (subsection === 'all' || daySubKey(scheduled) === subsection)
                              ? scheduled : undefined;
                            const fixed = !day && escala?.fixos?.find((item) => Number(item.ESCFUNC_ID) === Number(person.ESCFUNC_ID) && iso(item.DT) === date);
                            return (
                              <td
                                key={date}
                                className={`${fixed ? 'fixed' : kind(day)} ${index % 7 === 0 ? 'week-start' : ''} ${dayCritiques.length ? 'critical' : ''}`}
                              >
                                <button
                                  type="button"
                                  title={`${person.NOME} · ${formatDate(date)}${holidays[date] ? ` · Feriado: ${holidays[date]}` : ''} · ${fixed ? fixed.PROGRAMACAO === 'TRB' ? 'Trabalho fixo' : 'Folga fixa' : shiftLabel(day)}${dayCritiques.length ? `\nCríticas: ${dayCritiques.join('\n')}` : ''}`}
                                  aria-label={`${person.NOME}, ${formatDate(date)}, ${fixed ? fixed.PROGRAMACAO === 'TRB' ? 'Trabalho fixo' : 'Folga fixa' : shiftLabel(day)}${dayCritiques.length ? `, ${dayCritiques.length} crítica(s)` : ''}`}
                                  disabled={quickBusy || Boolean(scheduled && !day)}
                                  onClick={() => clickDay(person, date, day)}
                                  onDoubleClick={() => doubleClickDay(person, date, day)}
                                >
                                  {fixed ? fixed.PROGRAMACAO === 'TRB' ? fixed.HR_ENT1 || 'TRB' : 'F' : cellText(day)}
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
                  <div className="daily-summary"><strong>{weekday(selectedDate)} · {formatDate(selectedDate)}</strong><span>{coverage[dates.indexOf(selectedDate)]?.working || 0} trabalhando</span><span>{coverage[dates.indexOf(selectedDate)]?.rests || 0} em folga</span>{holidays[selectedDate] && <span>Feriado: {holidays[selectedDate]}</span>}</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Funcionário</th>
                        <th className="daily-distribution-head"><span>Distribuição do dia</span><div className="daily-time-axis" aria-hidden="true"><span>05h</span><span>11h</span><span>17h</span><span>23h</span></div></th>
                        <th><span className="sr-only">Ações</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEmployees.map((person) => {
                        const dayCritiques = critiqueMarkers.get(Number(person.ESCFUNC_ID))?.dates.get(selectedDate) || [];
                        const rowCritiques = critiqueMarkers.get(Number(person.ESCFUNC_ID))?.row || [];
                        const day = daysByEmployee.get(String(person.ESCFUNC_ID))?.get(selectedDate);
                        const fixed = !day && escala?.fixos?.find((item) => Number(item.ESCFUNC_ID) === Number(person.ESCFUNC_ID) && iso(item.DT) === selectedDate);
                        return (
                          <tr key={person.ESCFUNC_ID} className={dayCritiques.length || rowCritiques.length ? 'critical' : ''} title={[...rowCritiques, ...dayCritiques].join('\n') || undefined}>
                            <td className="daily-employee"><strong>{person.NOME}</strong><small>{person.CHAPA} · {person.FUNCAO_DESCR || 'Cargo não informado'}</small></td>
                            <td><button className="daily-distribution" type="button" disabled={quickBusy} onClick={() => clickDay(person, selectedDate, day)} onDoubleClick={() => doubleClickDay(person, selectedDate, day)} aria-label={`${person.NOME}, ${formatDate(selectedDate)}, ${fixed ? fixed.PROGRAMACAO === 'TRB' ? 'Trabalho fixo' : 'Folga fixa' : shiftLabel(day)}${dayCritiques.length ? `, ${dayCritiques.length} crítica(s)` : ''}`}>
                              <div className="daily-shift-track" aria-hidden="true">{hasShift(day) && <>{timeSegment(day?.HR_ENT1, day?.HR_SAI1) && <span style={timeSegment(day?.HR_ENT1, day?.HR_SAI1)!} />}{timeSegment(day?.HR_ENT2, day?.HR_SAI2) && <span style={timeSegment(day?.HR_ENT2, day?.HR_SAI2)!} />}</>}</div>
                              <span className="daily-shift-times">{hasShift(day) ? shiftLabel(day) : fixed ? fixed.PROGRAMACAO === 'TRB' ? fixed.HR_ENT1 || 'Trabalho fixo' : 'Folga fixa' : shiftLabel(day)}</span>
                            </button></td>
                            <td><button type="button" className="icon-action" title={`Ações de ${person.NOME}`} aria-label={`Ações de ${person.NOME}`} onClick={(event) => openPersonMenu(event, person)}><MoreVertical size={16} /></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedCell && (
                <div className="cell-detail">
                  {holidays[selectedCell.date] && <span className="holiday-warning" role="status">Feriado nacional: {holidays[selectedCell.date]}.</span>}
                  {Boolean(critiqueMarkers.get(Number(selectedCell.employee.ESCFUNC_ID))?.dates.get(selectedCell.date)?.length) && (
                    <div className="cell-critiques" role="alert">
                      <strong>Críticas deste dia</strong>
                      <ul>{critiqueMarkers.get(Number(selectedCell.employee.ESCFUNC_ID))!.dates.get(selectedCell.date)!.map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}</ul>
                    </div>
                  )}
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
                    !selectedCell.day.FIXO_ESCALA &&
                    !selectedCell.day.AUSENCIA_OBRIGATORIA &&
                    !['FER', 'AFA'].includes(String(selectedCell.day.PROGRAMACAO || '').toUpperCase()) &&
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
                  {canEdit(user, 'escalas') && selectedCell.date >= localToday() &&
                    !selectedCell.day?.AUSENCIA_OBRIGATORIA &&
                    !['FER', 'AFA'].includes(String(selectedCell.day?.PROGRAMACAO || '').toUpperCase()) &&
                    Number(selectedCell.day?.OFICIALIZADA) !== 1 &&
                    <button type="button" className="button secondary" onClick={() => setFixedCell({ employee: selectedCell.employee, date: selectedCell.date })}>
                      <Pencil size={15} /> {selectedCell.day?.FIXO_ESCALA ? 'Editar fixo' : 'Adicionar fixo'}
                    </button>}
                  <button type="button" className="button secondary" onClick={() => setSelectedCell(null)}>
                    Fechar
                  </button>
                </div>
              )}
              <div className="schedule-legend">
                <span>
                  <i className="critical" /> Crítica
                </span>
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
      {personMenu && createPortal(
        <div className="person-menu-layer" onClick={() => setPersonMenu(null)} onKeyDown={(event) => {
          if (event.key === 'Escape') setPersonMenu(null);
        }}>
          <div className="person-menu-popover" role="menu" style={{ left: personMenu.left, top: personMenu.top }} onClick={(event) => event.stopPropagation()}>
            <button type="button" role="menuitem" onClick={() => {
              const day = dates.map((date) => daysByEmployee.get(String(personMenu.employee.ESCFUNC_ID))?.get(date)).find(Boolean);
              if (day) setSelectedCell({ employee: personMenu.employee, date: iso(day.DT), day });
              setPersonMenu(null);
            }}>Ver detalhes</button>
            {canEdit(user, 'escalas-funcionarios') && !/APRENDIZ/i.test(personMenu.employee.FUNCAO_DESCR || '') && <button type="button" role="menuitem" onClick={() => { setShiftTarget(personMenu.employee); setPersonMenu(null); }}>Editar horário-base</button>}
            {canEdit(user, 'escalas') && !Array.from(daysByEmployee.get(String(personMenu.employee.ESCFUNC_ID))?.values() || []).some((day) => Number(day.OFICIALIZADA) === 1) && <button type="button" role="menuitem" onClick={() => {
              setIndividualTarget(personMenu.employee);
              setPersonMenu(null);
            }}>Gerar escala individual</button>}
            {canEdit(user, 'escalas') && !/APRENDIZ/i.test(personMenu.employee.FUNCAO_DESCR || '') && !Array.from(daysByEmployee.get(String(personMenu.employee.ESCFUNC_ID))?.values() || []).some((day) => Number(day.OFICIALIZADA) === 1) && <button type="button" role="menuitem" onClick={() => {
              setTransferTarget(personMenu.employee);
              setPersonMenu(null);
            }}>Transferir de subseção</button>}
          </div>
        </div>, document.body,
      )}
      {transferTarget && lojaId && mesRef && <TransferirSubsecao
        lojaId={lojaId} mesRef={mesRef} employee={transferTarget}
        subsecoes={sectionCatalog?.SUBSECOES || []}
        canRetry={user.perfil === 'ADMIN'}
        onClose={() => setTransferTarget(null)}
        onTransferred={({ destination, warning, scheduled }) => {
          setTransferTarget(null);
          setReload((value) => value + 1);
          if (!scheduled) updateFilter('subsecao', destination);
          setActionMessage(warning || (scheduled ? `Transferência agendada para ${scheduled}. A escala atual não foi alterada.` : 'Funcionário transferido e escala individual regenerada.'));
        }}
      />}
      {shiftTarget && lojaId && mesRef && <EditarHorarioBase key={`${shiftTarget.ESCFUNC_ID}-${mesRef}`} employee={shiftTarget} lojaId={lojaId} initialMonth={mesRef.slice(0, 7)} currentDay={Array.from(daysByEmployee.get(String(shiftTarget.ESCFUNC_ID))?.values() || []).find((day) => hasShift(day) && iso(day.DT) >= localToday())} onClose={() => setShiftTarget(null)} onSaved={(message) => { setShiftTarget(null); setActionMessage(message); setReload((value) => value + 1); }} />}
      {individualTarget && <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => {
        if (event.key === 'Escape' && !actionBusy) setIndividualTarget(null);
      }}><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="individual-title">
        <h2 id="individual-title">Gerar escala de {individualTarget.NOME}</h2>
        <p>Os dias editáveis deste funcionário serão recalculados. Os demais funcionários não serão gravados novamente.</p>
        {actionError && <div className="notice error" role="alert">{actionError}</div>}
        <div className="confirm-actions"><button className="button secondary" type="button" disabled={actionBusy} onClick={() => setIndividualTarget(null)}>Cancelar</button><button className="button primary" type="button" disabled={actionBusy} onClick={generateIndividual}>{actionBusy ? 'Gerando...' : 'Confirmar geração'}</button></div>
      </div></div>}
      {editingCell && lojaId && mesRef && (
        <EditarDiaEscala
          key={`${editingCell.employee.ESCFUNC_ID}-${editingCell.day.DT}`}
          lojaId={lojaId}
          mesRef={mesRef}
          employee={editingCell.employee}
          day={editingCell.day}
          holidayName={holidays[iso(editingCell.day.DT)]}
          days={(escala?.dias || []).filter(
            (item) => Number(item.ESCFUNC_ID) === Number(editingCell.employee.ESCFUNC_ID),
          )}
          onClose={() => setEditingCell(null)}
          onSaved={() => {
            setEditingCell(null);
            setSelectedCell(null);
            setActionMessage(`Rascunho do funcionário salvo e confirmado pela leitura da escala.${Number(editingCell.day.OFICIALIZADA) === 1 ? ' Reoficialização necessária.' : ''}`);
            setReload((value) => value + 1);
          }}
        />
      )}
      {bulkEditing && lojaId && mesRef && <EditarDiasEmMassa
        lojaId={lojaId} mesRef={mesRef} dates={dates} people={scopePeople} allDays={escala?.dias || []} holidays={holidays}
        initialDate={selectedDate} onClose={() => setBulkEditing(false)}
        onSaved={(count) => { setBulkEditing(false); setSelectedCell(null); setActionMessage(`${count} colaborador(es) atualizados; revisão confirmada pela leitura da escala.`); setReload((value) => value + 1); }}
      />}
      {fixedCell && lojaId && mesRef && <EditarFixoEscala
        lojaId={lojaId} mesRef={mesRef} employee={fixedCell.employee} date={fixedCell.date}
        holidayName={holidays[fixedCell.date]}
        existing={escala?.fixos?.find((item) => Number(item.ESCFUNC_ID) === Number(fixedCell.employee.ESCFUNC_ID) && iso(item.DT) === fixedCell.date)}
        reference={(escala?.dias || []).find((item) => Number(item.ESCFUNC_ID) === Number(fixedCell.employee.ESCFUNC_ID) && hasShift(item))}
        onClose={() => setFixedCell(null)}
        onSaved={(message) => { setFixedCell(null); setSelectedCell(null); setActionMessage(message); setReload((value) => value + 1); }}
      />}
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
              {pendingAction === 'gerar' ? 'Gerar escala' : pendingAction === 'resetar' ? 'Resetar escala' : 'Oficializar escala'}
            </h2>
            <p>
              Loja {lojaId} · {section?.DESCR} · {scopeName} · {scopePeople.length} funcionário(s).
            </p>
            <p>
              {pendingAction === 'oficializar'
                ? 'A oficialização deste escopo aprova a revisão atual e inicia o envio ao RM. As demais seções e subseções continuam editáveis.'
                : pendingAction === 'gerar'
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
                    : pendingAction === 'resetar'
                      ? 'Confirmar reset'
                      : 'Confirmar oficialização'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
