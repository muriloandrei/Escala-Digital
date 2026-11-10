const { getOperationalPeriodIso } = require('./operationalPeriod');

function datesInPeriod({ inicio, fim }) {
  const dates = [];
  const current = new Date(`${inicio}T00:00:00Z`);
  const end = new Date(`${fim}T00:00:00Z`);
  while (current <= end && dates.length < 42) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function previousMonth(mesRef) {
  const date = new Date(`${mesRef}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 10);
}

function weekday(date) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

function projectFixedDays({ mesRef, previousRows = [], existingRows = [], todayIso = '0000-00-00' }) {
  const previousPeriod = getOperationalPeriodIso(previousMonth(mesRef));
  const targetDates = datesInPeriod(getOperationalPeriodIso(mesRef)).filter((date) => date >= todayIso);
  const existing = new Set(existingRows.map((row) => `${row.escfuncId}|${row.date}`));
  const latest = new Map();
  for (const row of previousRows) {
    if (row.date < previousPeriod.inicio || row.date > previousPeriod.fim) continue;
    const key = `${row.escfuncId}|${weekday(row.date)}`;
    if (!latest.has(key) || row.date > latest.get(key).date) latest.set(key, row);
  }
  const projected = [];
  for (const row of latest.values()) {
    for (const date of targetDates) {
      if (weekday(date) !== weekday(row.date)) continue;
      const key = `${row.escfuncId}|${date}`;
      if (existing.has(key)) continue;
      projected.push({ ...row, date, sourceDate: row.date });
    }
  }
  return projected.sort((a, b) => a.date.localeCompare(b.date) || a.escfuncId - b.escfuncId);
}

module.exports = { previousMonth, projectFixedDays };
