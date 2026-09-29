function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function firstMonday(year, month) {
  const date = new Date(year, month, 1);
  date.setDate(date.getDate() + ((8 - date.getDay()) % 7));
  return date;
}

function getOperationalPeriodIso(mesRef) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(mesRef || '').slice(0, 10));
  if (!match || Number(match[2]) < 1 || Number(match[2]) > 12) {
    throw new Error('Mês de referência inválido.');
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const inicio = firstMonday(year, month);
  const nextStart = firstMonday(year, month + 1);
  const fim = new Date(nextStart);
  fim.setDate(fim.getDate() - 1);
  return { inicio: formatLocalDate(inicio), fim: formatLocalDate(fim) };
}

module.exports = { getOperationalPeriodIso };
