const FIELD_MAP = [
  ['hrEnt1', 'HR_ENT1'],
  ['hrSai1', 'HR_SAI1'],
  ['hrEnt2', 'HR_ENT2'],
  ['hrSai2', 'HR_SAI2'],
  ['programacao', 'PROGRAMACAO']
];

function normalizeDate(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value || '').slice(0, 10);
}

function readValue(row, lowerKey, upperKey) {
  return row?.[lowerKey] ?? row?.[upperKey] ?? row?.[lowerKey.toUpperCase()] ?? row?.[upperKey.toLowerCase()] ?? null;
}

function normalizeScheduleDay(row = {}) {
  const normalized = { data: normalizeDate(readValue(row, 'data', 'DT')) };
  for (const [lowerKey, upperKey] of FIELD_MAP) {
    const value = readValue(row, lowerKey, upperKey);
    normalized[lowerKey] = value === undefined || value === null ? null : String(value).trim().toUpperCase();
  }
  normalized.justificativa = readValue(row, 'justificativa', 'JUSTIFICATIVA') || null;
  return normalized;
}

function sameScheduleDay(previous, current) {
  return FIELD_MAP.every(([key]) => (previous?.[key] || null) === (current?.[key] || null));
}

function buildDiaAlteracoes(diasAnteriores = [], diasNovos = []) {
  const anterioresPorData = new Map(
    diasAnteriores
      .map(normalizeScheduleDay)
      .filter((dia) => dia.data)
      .map((dia) => [dia.data, dia])
  );

  return diasNovos
    .map(normalizeScheduleDay)
    .filter((dia) => dia.data)
    .map((novo) => {
      const anterior = anterioresPorData.get(novo.data) || null;
      if (anterior && sameScheduleDay(anterior, novo)) return null;
      return {
        data: novo.data,
        anterior: anterior ? Object.fromEntries(FIELD_MAP.map(([key]) => [key, anterior[key]])) : null,
        novo: Object.fromEntries(FIELD_MAP.map(([key]) => [key, novo[key]])),
        justificativa: novo.justificativa || null
      };
    })
    .filter(Boolean);
}

module.exports = {
  buildDiaAlteracoes,
  normalizeScheduleDay
};
