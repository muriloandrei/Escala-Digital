export type StandardHours = { HR_ENT1: string; HR_SAI1: string; HR_ENT2: string; HR_SAI2: string };

function minutes(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return -1;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function validateStandardHours(hours: StandardHours) {
  const [entry, breakStart, breakEnd, exit] = [hours.HR_ENT1, hours.HR_SAI1, hours.HR_ENT2, hours.HR_SAI2].map(minutes);
  if ([entry, breakStart, breakEnd, exit].some((value) => value < 0)) return 'Informe os quatro horários no formato HH:MM.';
  if (entry >= breakStart || breakStart >= breakEnd || breakEnd >= exit) return 'Os horários precisam estar em ordem.';
  if (breakStart - entry > 360 || exit - breakEnd > 360) return 'Cada período de trabalho deve ter no máximo 06:00.';
  if (breakEnd - breakStart !== 70) return 'O intervalo deve ser exatamente 01:10.';
  if (breakStart - entry + exit - breakEnd !== 528) return 'A jornada total deve ser exatamente 08:48.';
  return '';
}
