const REGULAR = '5X2';
const TWELVE_THIRTY_SIX = '12X36';

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isDutyDay(anchor, date) {
  if (!isIsoDate(anchor) || !isIsoDate(date)) throw new Error('Data ancora ou data da escala invalida.');
  const difference = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${anchor}T00:00:00Z`)) / 86400000);
  return difference % 2 === 0;
}

function effectiveRegime(employee) {
  const regime = String(employee?.REGIME_ESCALA || employee?.regimeEscala || REGULAR).toUpperCase();
  if (regime !== REGULAR && regime !== TWELVE_THIRTY_SIX) throw new Error('Regime de escala invalido.');
  return regime;
}

module.exports = { REGULAR, TWELVE_THIRTY_SIX, isIsoDate, isDutyDay, effectiveRegime };
