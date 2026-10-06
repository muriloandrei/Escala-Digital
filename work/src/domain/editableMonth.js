function currentMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit'
  }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}`;
}

function isEditableMonth(mesRef, now = new Date()) {
  return /^\d{4}-(0[1-9]|1[0-2])-01$/.test(String(mesRef || ''))
    && String(mesRef).slice(0, 7) >= currentMonth(now);
}

module.exports = { currentMonth, isEditableMonth };
