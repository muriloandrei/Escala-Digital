import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Printer, Search } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  getJson,
  type DiaEscala,
  type EscalaMensal,
  type Funcionario,
  type PeriodoOperacional,
  type User,
} from '../api';
import { compareEmployeesByShift } from '../scheduleOrder';

type Mode = 'mensal' | 'semanal' | 'diario' | 'periodo';
type Format = 'juntos' | 'cargos' | 'colaborador';
type Sheet = { title: string; dates: string[]; people: Funcionario[]; individual: boolean };

const modeNames: Record<Mode, string> = {
  mensal: 'Mensal',
  semanal: 'Semanal',
  diario: 'Diário',
  periodo: 'Período',
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function weekday(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`))
    .replace('.', '');
}

function dateRange(start: string, end: string) {
  const result: string[] = [];
  const date = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (date <= last && result.length < 42) {
    result.push(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return result;
}

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function dayKind(day?: DiaEscala) {
  if (!day) return 'empty';
  const code = String(day.PROGRAMACAO || '').toUpperCase();
  if (day.AUSENCIA_OBRIGATORIA || code === 'FER' || code === 'AFA') return 'absence';
  if (day.FIXO_ESCALA) return 'fixed';
  if (code && code !== 'TRB') return 'rest';
  return 'work';
}

function dayText(day: DiaEscala | undefined, compact: boolean) {
  if (!day) return '–';
  if (['rest', 'absence'].includes(dayKind(day))) {
    return day.PROGRAMACAO || 'F';
  }
  const first = day.HR_ENT1 || '';
  const last = day.HR_SAI2 || day.HR_SAI1 || '';
  return compact ? first || 'TRB' : [first, last].filter(Boolean).join('–') || 'TRB';
}

function SelectList({
  label,
  items,
  excluded,
  onToggle,
  onAll,
  search,
  onSearch,
}: {
  label: string;
  items: { key: string; label: string }[];
  excluded: Set<string>;
  onToggle: (key: string) => void;
  onAll: (selected: boolean) => void;
  search: string;
  onSearch: (value: string) => void;
}) {
  const selected = items.filter((item) => !excluded.has(item.key)).length;
  const visible = items.filter((item) =>
    item.label.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
  );
  return (
    <div className="print-filter-group">
      <strong>{label}</strong>
      <details className="print-select">
        <summary>
          {selected} de {items.length} selecionados
        </summary>
        <div className="print-select-menu">
          <label className="print-search">
            <Search size={14} />
            <span className="sr-only">Filtrar {label.toLowerCase()}</span>
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Filtrar..."
            />
          </label>
          <div className="print-select-actions">
            <button type="button" onClick={() => onAll(true)}>
              Selecionar todos
            </button>
            <button type="button" onClick={() => onAll(false)}>
              Remover todos
            </button>
          </div>
          <div className="print-select-options">
            {visible.map((item) => (
              <label key={item.key}>
                <input
                  type="checkbox"
                  checked={!excluded.has(item.key)}
                  onChange={() => onToggle(item.key)}
                />
                <span title={item.label}>{item.label}</span>
              </label>
            ))}
            {!visible.length && <p>Nenhum resultado.</p>}
          </div>
        </div>
      </details>
    </div>
  );
}

function PrintSheet({
  sheet,
  page,
  total,
  section,
  store,
  status,
  user,
  days,
}: {
  sheet: Sheet;
  page: number;
  total: number;
  section: string;
  store: string;
  status: string;
  user: User;
  days: Map<string, Map<string, DiaEscala>>;
}) {
  const compact = sheet.dates.length > 14;
  const printedAt = new Date().toLocaleString('pt-BR');
  const getDay = (person: Funcionario, date: string) => days.get(String(person.ESCFUNC_ID))?.get(date);
  const heads = sheet.dates.map((date) => (
    <th key={date} className={date.endsWith('01') ? 'print-month-start' : ''}>
      {date.slice(8, 10)}
      {date.slice(5, 7) !== sheet.dates[0]?.slice(5, 7) ? `/${date.slice(5, 7)}` : ''}
      <small>{weekday(date)}</small>
    </th>
  ));
  return (
    <article className={`print-sheet ${compact ? 'compact' : ''}`}>
      <header className="print-sheet-header">
        <div>
          <h2>Escala de Trabalho · {sheet.title}</h2>
          <span>
            Loja {store.padStart(4, '0')} · {section}
          </span>
        </div>
        <div>
          <strong>
            Período: {dateLabel(sheet.dates[0])} a {dateLabel(sheet.dates[sheet.dates.length - 1])}
          </strong>
          <span>
            Status: {status || '–'} · Impresso em {printedAt}
          </span>
        </div>
        <img src="/assets/escala-inteligente-logo-transparent.png" alt="Escala Inteligente" />
      </header>
      {sheet.individual ? (
        <div className="print-individual-list">
          {sheet.people.map((person) => (
            <section className="print-person" key={person.ESCFUNC_ID}>
              <div className="print-person-heading">
                <strong>
                  {person.CHAPA} | {person.NOME}
                </strong>
                <span>{person.FUNCAO_DESCR || 'Cargo não informado'}</span>
                <span>Ass.: _____________________________________</span>
              </div>
              <table className="print-grid">
                <thead>
                  <tr>
                    <th>Dia</th>
                    {heads}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{compact ? 'Entrada' : 'Entrada–saída'}</th>
                    {sheet.dates.map((date) => {
                      const day = getDay(person, date);
                      return (
                        <td key={date} className={dayKind(day)}>
                          {dayText(day, compact)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </section>
          ))}
        </div>
      ) : (
        <table className="print-grid">
          <thead>
            <tr>
              <th className="print-person-col">Matrícula | Funcionário · Cargo · Ass.</th>
              {heads}
            </tr>
          </thead>
          <tbody>
            {sheet.people.map((person) => (
              <tr key={person.ESCFUNC_ID}>
                <th className="print-person-col">
                  <strong>
                    {person.CHAPA} | {person.NOME}
                  </strong>
                  <span>{person.FUNCAO_DESCR || 'Cargo não informado'}</span>
                  <em>Ass.: _____________________</em>
                </th>
                {sheet.dates.map((date) => {
                  const day = getDay(person, date);
                  return (
                    <td key={date} className={dayKind(day)}>
                      {dayText(day, compact)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Trabalhando</th>
              {sheet.dates.map((date) => (
                <td key={date}>
                  {
                    sheet.people.filter(
                      (person) =>
                        ['work', 'fixed'].includes(dayKind(getDay(person, date))) && !!getDay(person, date),
                    ).length
                  }
                </td>
              ))}
            </tr>
            <tr>
              <th>Folga / ausência</th>
              {sheet.dates.map((date) => (
                <td key={date}>
                  {
                    sheet.people.filter((person) =>
                      ['rest', 'absence'].includes(dayKind(getDay(person, date))),
                    ).length
                  }
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      )}
      <footer className="print-sheet-footer">
        <span>
          Página {page} de {total}
        </span>
        <span>
          Impresso por {user.nome || user.login} em {printedAt}
        </span>
      </footer>
    </article>
  );
}

export function ImprimirEscala({ user }: { user: User }) {
  const { lojaId = '', mesRef = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>('mensal');
  const [format, setFormat] = useState<Format>('juntos');
  const [data, setData] = useState<{ escala: EscalaMensal; periodo: PeriodoOperacional } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [excludedRoles, setExcludedRoles] = useState<Set<string>>(new Set());
  const [excludedPeople, setExcludedPeople] = useState<Set<string>>(new Set());
  const [roleSearch, setRoleSearch] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const previous = document.title;
    document.title = `Visao ${modeNames[mode]} Loja ${lojaId} ${mesRef.slice(0, 7)}`;
    return () => {
      document.title = previous;
    };
  }, [mode, lojaId, mesRef]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getJson<{ escala: EscalaMensal; periodo: PeriodoOperacional }>(
      `/api/escalas/mensal?${new URLSearchParams({ lojaId, mesRef })}`,
      controller.signal,
    )
      .then((result) => {
        setData(result);
        setDay(result.periodo.inicio);
        setFrom(result.periodo.inicio);
        setTo(result.periodo.fim);
        setLoading(false);
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [lojaId, mesRef]);

  const sections = data?.escala.secoes || [];
  const sectionId =
    sections.find((item) => String(item.ESCSECAO_ID) === params.get('secao'))?.ESCSECAO_ID ||
    sections[0]?.ESCSECAO_ID;
  const section = sections.find((item) => item.ESCSECAO_ID === sectionId);
  const people = useMemo(
    () =>
      (data?.escala.funcionarios || [])
        .filter((person) => Number(person.ESCSECAO_ID) === Number(sectionId)),
    [data, sectionId],
  );
  const roles = useMemo(
    () =>
      [...new Set(people.map((person) => person.FUNCAO_DESCR || 'Cargo não informado'))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR'),
      ),
    [people],
  );
  const roleItems = roles.map((role) => ({ key: role, label: role }));
  const personItems = people
    .filter((person) => !excludedRoles.has(person.FUNCAO_DESCR || 'Cargo não informado'))
    .map((person) => ({ key: String(person.ESCFUNC_ID), label: `${person.CHAPA} | ${person.NOME}` }));
  const allDates = useMemo(() => (data ? dateRange(data.periodo.inicio, data.periodo.fim) : []), [data]);
  const weeks = useMemo(() => chunks(allDates, 7), [allDates]);
  const selectedDates =
    mode === 'semanal'
      ? weeks[week] || []
      : mode === 'diario'
        ? allDates.filter((date) => date === day)
        : mode === 'periodo'
          ? allDates.filter((date) => date >= from && date <= to)
          : allDates;
  const daysByPerson = useMemo(() => {
    const result = new Map<string, Map<string, DiaEscala>>();
    (data?.escala.dias || []).forEach((entry) => {
      const id = String(entry.ESCFUNC_ID);
      if (!result.has(id)) result.set(id, new Map());
      result.get(id)!.set(String(entry.DT).slice(0, 10), entry);
    });
    return result;
  }, [data]);
  const selectedPeople = people
    .filter((person) =>
      !excludedRoles.has(person.FUNCAO_DESCR || 'Cargo não informado') &&
      !excludedPeople.has(String(person.ESCFUNC_ID)))
    .sort((a, b) => compareEmployeesByShift(a, b, daysByPerson, selectedDates));
  const sheets = useMemo(() => {
    if (!selectedDates.length || !selectedPeople.length) return [];
    const groups =
      format === 'cargos'
        ? roles
            .filter((role) => !excludedRoles.has(role))
            .map((role) => ({
              name: role,
              people: selectedPeople.filter(
                (person) => (person.FUNCAO_DESCR || 'Cargo não informado') === role,
              ),
            }))
        : [{ name: '', people: selectedPeople }];
    const result: Sheet[] = [];
    groups.forEach((group) => {
      // Two collaborators per sheet keeps weekly and individual reports intact in the PDF.
      const pageSize =
        format === 'colaborador' || mode === 'semanal' || mode === 'periodo'
          ? 2
          : mode === 'diario'
            ? 24
            : 16;
      chunks(group.people, pageSize).forEach((batch) => {
        result.push({
          title: `${modeNames[mode]}${group.name ? ` · ${group.name}` : ''}`,
          dates: selectedDates,
          people: batch,
          individual: format === 'colaborador',
        });
      });
    });
    return result;
  }, [format, mode, roles, selectedPeople, selectedDates, excludedRoles]);

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function switchSection(id: string) {
    setParams({ secao: id });
    setExcludedRoles(new Set());
    setExcludedPeople(new Set());
    setRoleSearch('');
    setPersonSearch('');
  }

  return (
    <main className="content print-page">
      <div className="page-heading print-page-heading">
        <div>
          <Link
            className="back-link"
            to={`/escalas/${encodeURIComponent(lojaId)}/${encodeURIComponent(mesRef)}${sectionId ? `?secao=${sectionId}` : ''}`}
          >
            <ArrowLeft size={15} /> Voltar à escala
          </Link>
          <h1>Imprimir escala</h1>
          <p>
            Loja {lojaId} · {section?.DESCR || 'Selecione uma seção'} ·{' '}
            {data ? `${dateLabel(data.periodo.inicio)} a ${dateLabel(data.periodo.fim)}` : ''}
          </p>
        </div>
        <button
          className="button primary"
          type="button"
          disabled={!sheets.length}
          onClick={() => window.print()}
        >
          <Printer size={16} /> Imprimir agora
        </button>
      </div>
      {loading && (
        <div className="empty-state" role="status">
          Carregando escala...
        </div>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="print-layout">
          <aside className="print-controls" aria-label="Configuração de impressão">
            <div className="print-modes" role="group" aria-label="Tipo de relatório">
              {(['mensal', 'semanal', 'diario', 'periodo'] as const).map((item) => (
                <button
                  key={item}
                  className={mode === item ? 'selected' : ''}
                  type="button"
                  aria-pressed={mode === item}
                  onClick={() => setMode(item)}
                >
                  {modeNames[item]}
                </button>
              ))}
            </div>
            <div className="print-controls-body">
              <label className="print-filter-group">
                <strong>Seção</strong>
                <select value={sectionId || ''} onChange={(event) => switchSection(event.target.value)}>
                  {sections.map((item) => (
                    <option key={item.ESCSECAO_ID} value={item.ESCSECAO_ID}>
                      {item.COD_SECAO ? `${item.COD_SECAO} · ` : ''}
                      {item.DESCR}
                    </option>
                  ))}
                </select>
              </label>
              <SelectList
                label="Cargos"
                items={roleItems}
                excluded={excludedRoles}
                search={roleSearch}
                onSearch={setRoleSearch}
                onToggle={(key) => toggleSet(setExcludedRoles, key)}
                onAll={(selected) => setExcludedRoles(new Set(selected ? [] : roles))}
              />
              <SelectList
                label="Colaboradores"
                items={personItems}
                excluded={excludedPeople}
                search={personSearch}
                onSearch={setPersonSearch}
                onToggle={(key) => toggleSet(setExcludedPeople, key)}
                onAll={(selected) =>
                  setExcludedPeople(new Set(selected ? [] : personItems.map((item) => item.key)))
                }
              />
              {mode === 'semanal' && (
                <label className="print-filter-group">
                  <strong>Semana</strong>
                  <select value={week} onChange={(event) => setWeek(Number(event.target.value))}>
                    {weeks.map((dates, index) => (
                      <option key={dates[0]} value={index}>
                        {dateLabel(dates[0])} a {dateLabel(dates[dates.length - 1])}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {mode === 'diario' && (
                <label className="print-filter-group">
                  <strong>Dia</strong>
                  <select value={day} onChange={(event) => setDay(event.target.value)}>
                    {allDates.map((date) => (
                      <option key={date} value={date}>
                        {weekday(date)} · {dateLabel(date)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {mode === 'periodo' && (
                <div className="print-date-range">
                  <label className="print-filter-group">
                    <strong>De</strong>
                    <input
                      type="date"
                      min={allDates[0]}
                      max={allDates[allDates.length - 1]}
                      value={from}
                      onChange={(event) => setFrom(event.target.value)}
                    />
                  </label>
                  <label className="print-filter-group">
                    <strong>Até</strong>
                    <input
                      type="date"
                      min={allDates[0]}
                      max={allDates[allDates.length - 1]}
                      value={to}
                      onChange={(event) => setTo(event.target.value)}
                    />
                  </label>
                </div>
              )}
              <fieldset className="print-format">
                <legend>Formato</legend>
                {(
                  [
                    ['juntos', 'Colaboradores juntos'],
                    ['cargos', 'Cargos separados'],
                    ['colaborador', 'Por colaborador'],
                  ] as const
                ).map(([value, title]) => (
                  <label key={value} className={format === value ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="print-format"
                      value={value}
                      checked={format === value}
                      onChange={() => setFormat(value)}
                    />
                    {title}
                  </label>
                ))}
              </fieldset>
            </div>
            <div className="print-controls-footer">
              {selectedPeople.length} colaborador(es) · {sheets.length} página(s)
            </div>
          </aside>
          <section className="print-preview" aria-label="Prévia da impressão">
            {!sections.length || !selectedPeople.length || !selectedDates.length ? (
              <div className="empty-state">Nenhum dado para imprimir com os filtros selecionados.</div>
            ) : (
              sheets.map((sheet, index) => (
                <PrintSheet
                  key={`${sheet.title}-${index}`}
                  sheet={sheet}
                  page={index + 1}
                  total={sheets.length}
                  store={lojaId}
                  section={section?.DESCR || ''}
                  status={data?.escala.status || ''}
                  user={user}
                  days={daysByPerson}
                />
              ))
            )}
          </section>
        </div>
      )}
    </main>
  );
}
