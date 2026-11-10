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

function unfoldShiftMinutes(values) {
  const clockTimes = values.map(timeToMinutes);
  if (clockTimes.some((value) => value === null)) return null;
  const timeline = [clockTimes[0]];
  for (const time of clockTimes.slice(1)) {
    let next = time;
    while (next <= timeline[timeline.length - 1]) next += 1440;
    timeline.push(next);
  }
  return timeline[3] - timeline[0] < 1440 ? timeline : null;
}

const SHIFT_PROFILES = [
  { workMinutes: 528, intervalMinutes: 70, exactInterval: false },
  { workMinutes: 360, intervalMinutes: 70, exactInterval: true },
  { workMinutes: 300, intervalMinutes: 15, exactInterval: true }
];
const POST_SHIFT_PROFILES = [
  { workMinutes: 528, intervalMinutes: 100, exactInterval: true },
  { workMinutes: 504, intervalMinutes: 70, exactInterval: true },
  { workMinutes: 504, intervalMinutes: 100, exactInterval: true }
];

function validateStandardShift(data, { exactInterval = false, workMinutes = 528,
  intervalMinutes = 70, allowProfiles = false, allowPostProfiles = false } = {}) {
  const values = [data.HR_ENT1, data.HR_SAI1, data.HR_ENT2, data.HR_SAI2];
  if (values.some((value) => timeToMinutes(value) === null)) {
    return ['Informe todos os horarios no formato HH:MM.'];
  }
  const timeline = unfoldShiftMinutes(values);
  if (!timeline) return ['O turno deve terminar em menos de 24 horas.'];
  const [ent1, sai1, ent2, sai2] = timeline;

  const primeiraJornada = sai1 - ent1;
  const intervalo = ent2 - sai1;
  const segundaJornada = sai2 - ent2;
  const jornadaTotal = primeiraJornada + segundaJornada;
  const profiles = allowPostProfiles ? [...SHIFT_PROFILES, ...POST_SHIFT_PROFILES] : SHIFT_PROFILES;
  const profile = allowProfiles ? profiles.find((item) => item.workMinutes === jornadaTotal
    && item.intervalMinutes === intervalo)
    || profiles.find((item) => item.workMinutes === jornadaTotal) : null;
  const expectedWork = allowProfiles && profile ? profile.workMinutes : workMinutes;
  const expectedInterval = allowProfiles && profile ? profile.intervalMinutes : intervalMinutes;
  const intervalMustBeExact = allowProfiles && profile ? exactInterval || profile.exactInterval : exactInterval;
  const errors = [];
  if (primeiraJornada <= 0) errors.push('Saida 1 deve ser maior que Entrada 1.');
  if (segundaJornada <= 0) errors.push('Saida 2 deve ser maior que Entrada 2.');
  if (intervalo <= 0) errors.push('Entrada 2 deve ser maior que Saida 1.');
  if (primeiraJornada > 360) errors.push(`Primeiro periodo nao pode passar de 06:00. Atual: ${minutesToTime(primeiraJornada)}.`);
  if (segundaJornada > 360) errors.push(`Segundo periodo nao pode passar de 06:00. Atual: ${minutesToTime(segundaJornada)}.`);
  if (allowProfiles && !profile) errors.push(`Jornada total deve ser 08:48, 06:00, 05:00${allowPostProfiles ? ' ou 08:24' : ''}. Atual: ${minutesToTime(jornadaTotal)}.`);
  else if (jornadaTotal !== expectedWork) errors.push(`Jornada total deve ser exatamente ${minutesToTime(expectedWork)}. Atual: ${minutesToTime(jornadaTotal)}.`);
  if (intervalMustBeExact && intervalo !== expectedInterval) errors.push(`Intervalo entre as jornadas deve ser exatamente ${minutesToTime(expectedInterval)}. Atual: ${minutesToTime(intervalo)}.`);
  else if (!intervalMustBeExact && intervalo < expectedInterval) errors.push(`Intervalo entre as jornadas deve ter no minimo ${minutesToTime(expectedInterval)}. Atual: ${minutesToTime(intervalo)}.`);
  return errors;
}

function validateApprenticeShift(data) {
  const entrada = timeToMinutes(data.HR_ENT1);
  const saida = timeToMinutes(data.HR_SAI1);
  if (entrada === null || saida === null) return ['Informe entrada e saida no formato HH:MM.'];
  if (data.HR_ENT2 || data.HR_SAI2) return ['O aprendiz nao pode ter segundo periodo.'];
  if (saida - entrada !== 315) return ['A jornada do aprendiz deve ser exatamente 05:15.'];
  return [];
}

function validate12x36Shift(data) {
  const timeline = unfoldShiftMinutes([data.HR_ENT1, data.HR_SAI1, data.HR_ENT2, data.HR_SAI2]);
  if (!timeline) return ['Informe quatro horarios validos para o plantao 12x36.'];
  const [entry, breakStart, breakEnd, exit] = timeline;
  const first = breakStart - entry;
  const interval = breakEnd - breakStart;
  const second = exit - breakEnd;
  const errors = [];
  if (exit - entry !== 720) errors.push('O plantao 12x36 deve durar 12:00 entre entrada e saida.');
  if (interval < 60) errors.push('O intervalo do plantao 12x36 deve ter ao menos 01:00.');
  if (first > 360 || second > 360) errors.push('Cada periodo de trabalho do plantao deve ter no maximo 06:00.');
  return errors;
}

module.exports = { validateStandardShift, validateApprenticeShift, validate12x36Shift,
  unfoldShiftMinutes, SHIFT_PROFILES, POST_SHIFT_PROFILES };
