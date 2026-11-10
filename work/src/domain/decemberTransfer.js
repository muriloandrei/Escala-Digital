const START = '2026-12-01';
const END = '2026-12-06';

function isTransferDate(date) {
  return date >= START && date <= END;
}

function sameDay(left, right) {
  return ['PROGRAMACAO', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2']
    .every((key) => String(left[key] || '') === String(right[key] || ''));
}

function planDecemberTransfer({ november = [], december = [], novemberFixes = [], decemberFixes = [] }) {
  const source = november.flatMap((item) => item.days || []).filter((day) => isTransferDate(day.DT));
  const fixes = novemberFixes.filter((day) => isTransferDate(day.DT));
  if (!source.length && !fixes.length) return { action: 'UNCHANGED', sourceDays: 0, fixes: 0 };
  if (november.length > 1 || december.length !== 1) {
    return { action: 'BLOCKED', reason: 'Revisoes ativas ambiguas ou escala de dezembro ausente.' };
  }
  if (november[0] && november[0].sectionId && december[0].sectionId
    && november[0].sectionId !== december[0].sectionId) {
    return { action: 'BLOCKED', reason: 'Secao mudou entre novembro e dezembro.' };
  }
  if (fixes.some((fix) => fix.ESCSECAO_ID && december[0].sectionId
    && Number(fix.ESCSECAO_ID) !== december[0].sectionId)) {
    return { action: 'BLOCKED', reason: 'Fixo de novembro pertence a outra secao.' };
  }
  for (const [label, days] of [
    ['novembro', source], ['dezembro', december[0].days],
    ['fixos de novembro', fixes], ['fixos de dezembro', decemberFixes]
  ]) {
    const dates = days.map((day) => day.DT);
    if (new Set(dates).size !== dates.length) {
      return { action: 'BLOCKED', reason: `Datas duplicadas em ${label}.` };
    }
  }
  const target = new Map(december[0].days.map((day) => [day.DT, day]));
  const conflict = source.find((day) => target.has(day.DT) && !sameDay(day, target.get(day.DT)));
  if (conflict) return { action: 'BLOCKED', reason: `Escala de dezembro divergente em ${conflict.DT}.` };
  const targetFixes = new Map(decemberFixes.map((day) => [day.DT, day]));
  const crossConflict = source.find((day) => targetFixes.has(day.DT) && !sameDay(day, targetFixes.get(day.DT)))
    || fixes.find((day) => target.has(day.DT) && !sameDay(day, target.get(day.DT)));
  if (crossConflict) return { action: 'BLOCKED', reason: `Horario e fixo divergentes em ${crossConflict.DT}.` };
  const fixConflict = fixes.find((day) => targetFixes.has(day.DT) && !sameDay(day, targetFixes.get(day.DT)));
  if (fixConflict) return { action: 'BLOCKED', reason: `Fixo de dezembro divergente em ${fixConflict.DT}.` };
  return { action: 'TRANSFER', sourceDays: source.length, fixes: fixes.length,
    addDays: source.filter((day) => !target.has(day.DT)).length,
    addFixes: fixes.filter((day) => !targetFixes.has(day.DT)).length };
}

module.exports = { START, END, isTransferDate, planDecemberTransfer };
