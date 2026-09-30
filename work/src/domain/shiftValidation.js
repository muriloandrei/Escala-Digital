function timeToMinutes(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  const hours = String(Math.floor(safeMinutes / 60)).padStart(2, '0');
  const minutes = String(safeMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function validateStandardShift(data) {
  const ent1 = timeToMinutes(data.HR_ENT1);
  const sai1 = timeToMinutes(data.HR_SAI1);
  const ent2 = timeToMinutes(data.HR_ENT2);
  const sai2 = timeToMinutes(data.HR_SAI2);
  if ([ent1, sai1, ent2, sai2].some((value) => value === null)) {
    return ['Informe todos os horarios no formato HH:MM.'];
  }

  const primeiraJornada = sai1 - ent1;
  const intervalo = ent2 - sai1;
  const segundaJornada = sai2 - ent2;
  const jornadaTotal = primeiraJornada + segundaJornada;
  const errors = [];
  if (primeiraJornada <= 0) errors.push('Saida 1 deve ser maior que Entrada 1.');
  if (segundaJornada <= 0) errors.push('Saida 2 deve ser maior que Entrada 2.');
  if (intervalo <= 0) errors.push('Entrada 2 deve ser maior que Saida 1.');
  if (primeiraJornada > 360) errors.push(`Primeiro periodo nao pode passar de 06:00. Atual: ${minutesToTime(primeiraJornada)}.`);
  if (segundaJornada > 360) errors.push(`Segundo periodo nao pode passar de 06:00. Atual: ${minutesToTime(segundaJornada)}.`);
  if (jornadaTotal !== 528) errors.push(`Jornada total deve ser exatamente 08:48. Atual: ${minutesToTime(jornadaTotal)}.`);
  if (intervalo < 70) errors.push(`Intervalo entre as jornadas deve ter no minimo 01:10. Atual: ${minutesToTime(intervalo)}.`);
  return errors;
}

module.exports = { validateStandardShift };
