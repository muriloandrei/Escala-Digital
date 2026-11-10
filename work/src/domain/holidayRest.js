const { getNationalHoliday } = require('./nationalHolidays');

function weekStart(dateIso) {
  const date = new Date(`${dateIso}T00:00:00Z`);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1));
  return date.toISOString().slice(0, 10);
}

function planHolidayRests(days, { regime = '5X2', lockedDates = [], holidayDates = null,
  validate = () => [], restCounts = new Map() } = {}) {
  const planned = days.map((day) => ({ ...day }));
  const locked = new Set(lockedDates);
  const allowedHolidays = holidayDates ? new Set(holidayDates) : null;
  const converted = [];
  const blocked = [];
  const replacementRests = [];
  if (!planned.some((day) => ['F', 'TRB'].includes(day.programacao) && getNationalHoliday(day.data)
    && !locked.has(day.data) && (!allowedHolidays || allowedHolidays.has(day.data)))) {
    return { days: planned, converted, blocked, replacementRests };
  }
  const currentErrors = new Set(validate(planned));

  for (const day of planned) {
    if (!['F', 'TRB'].includes(day.programacao) || !getNationalHoliday(day.data) || locked.has(day.data)
      || (allowedHolidays && !allowedHolidays.has(day.data))) continue;
    const wasWeeklyRest = day.programacao === 'F';
    const candidateDays = !wasWeeklyRest || String(regime).toUpperCase() === '12X36' ? [null] : planned
      .filter((candidate) => candidate.programacao === 'TRB' && !locked.has(candidate.data)
        && !getNationalHoliday(candidate.data) && weekStart(candidate.data) === weekStart(day.data)
        && new Date(`${candidate.data}T00:00:00Z`).getUTCDay() !== 0)
      .sort((left, right) => (restCounts.get(left.data) || 0) - (restCounts.get(right.data) || 0)
        || left.data.localeCompare(right.data));
    let replacement = null;
    let accepted = false;
    for (const candidate of candidateDays) {
      const originalDay = { ...day };
      const originalCandidate = candidate ? { ...candidate } : null;
      day.programacao = 'FDO';
      for (const field of ['hrEnt1', 'hrSai1', 'hrEnt2', 'hrSai2']) day[field] = 'FDO';
      if (candidate) {
        candidate.programacao = 'F';
        for (const field of ['hrEnt1', 'hrSai1', 'hrEnt2', 'hrSai2']) candidate[field] = 'F';
      }
      const newErrors = validate(planned).filter((error) => !currentErrors.has(error));
      if (!newErrors.length) {
        accepted = true;
        replacement = candidate;
        break;
      }
      if (candidate) {
        Object.assign(candidate, originalCandidate);
      }
      Object.assign(day, originalDay);
    }
    if (!accepted) {
      blocked.push(day.data);
      continue;
    }
    day.justificativa = `Folga de feriado automatica: ${getNationalHoliday(day.data).nome}`;
    converted.push(day.data);
    if (!wasWeeklyRest) restCounts.set(day.data, (restCounts.get(day.data) || 0) + 1);
    if (replacement) {
      replacement.justificativa = 'Folga 5x2 compensatoria do feriado';
      replacementRests.push(replacement.data);
      restCounts.set(replacement.data, (restCounts.get(replacement.data) || 0) + 1);
    }
  }

  return { days: planned, converted, blocked, replacementRests };
}

module.exports = { planHolidayRests };
