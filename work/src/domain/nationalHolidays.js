const NATIONAL = new Map([
  ['01-01', 'Confraternizacao Universal'],
  ['04-21', 'Tiradentes'],
  ['05-01', 'Dia do Trabalhador'],
  ['09-07', 'Independencia do Brasil'],
  ['10-12', 'Nossa Senhora Aparecida'],
  ['11-02', 'Finados'],
  ['11-15', 'Proclamacao da Republica'],
  ['11-20', 'Dia Nacional de Zumbi e da Consciencia Negra'],
  ['12-25', 'Natal']
]);

function dateOnly(value) {
  if (value instanceof Date) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  return String(value || '').slice(0, 10);
}

function getNationalHoliday(dateIso) {
  const date = dateOnly(dateIso);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const name = NATIONAL.get(date.slice(5));
  return name ? { data: date, nome: name, abrangencia: 'NACIONAL' } : null;
}

function listNationalHolidays(inicio, fim) {
  const start = String(inicio || '').slice(0, 10);
  const end = String(fim || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) return [];
  const result = [];
  for (let year = Number(start.slice(0, 4)); year <= Number(end.slice(0, 4)); year += 1) {
    for (const [monthDay] of NATIONAL) {
      const holiday = getNationalHoliday(`${year}-${monthDay}`);
      if (holiday.data >= start && holiday.data <= end) result.push(holiday);
    }
  }
  return result.sort((left, right) => left.data.localeCompare(right.data));
}

function isWeeklyRest(programacao) {
  return ['F', 'FXF', 'FOLGA', 'FOLGA_FIXA'].includes(String(programacao || '').toUpperCase());
}

function newHolidayRestErrors(funcionarios = [], existingDays = []) {
  const previous = new Map(existingDays.map((day) => [
    `${day.ESCFUNC_ID || day.escfuncId}|${dateOnly(day.DT || day.data)}`,
    String(day.PROGRAMACAO || day.programacao || '').toUpperCase()
  ]));
  const errors = [];
  for (const funcionario of funcionarios) {
    for (const dia of funcionario.dias || []) {
      const holiday = getNationalHoliday(dia.data || dia.DT);
      if (!holiday || !isWeeklyRest(dia.programacao || dia.PROGRAMACAO)) continue;
      const key = `${funcionario.escfuncId || funcionario.ESCFUNC_ID}|${holiday.data}`;
      if (isWeeklyRest(previous.get(key))) continue;
      errors.push(`${funcionario.nome || funcionario.NOME || funcionario.chapa || funcionario.CHAPA}: ${holiday.data} e feriado nacional (${holiday.nome}); nao use folga semanal. Programe trabalho ou trate o descanso do feriado separadamente.`);
    }
  }
  return errors;
}

module.exports = { getNationalHoliday, listNationalHolidays, isWeeklyRest, newHolidayRestErrors };
