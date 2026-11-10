function isIgnoredOfficializationDate(mesRef, date) {
  return mesRef === '2026-11-01' && date === '2026-11-01';
}

function isRequiredOfficializationDate({ mesRef, date, todayIso, hasPersistedDay }) {
  return !isIgnoredOfficializationDate(mesRef, date) && (date >= todayIso || hasPersistedDay);
}

module.exports = { isIgnoredOfficializationDate, isRequiredOfficializationDate };
