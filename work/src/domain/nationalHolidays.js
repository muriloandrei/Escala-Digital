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

module.exports = { getNationalHoliday, listNationalHolidays };
