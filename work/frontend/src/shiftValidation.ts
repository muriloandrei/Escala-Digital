export type StandardHours = { HR_ENT1: string; HR_SAI1: string; HR_ENT2: string; HR_SAI2: string };

function minutes(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return -1;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function unfoldShiftMinutes(values: string[]): number[] | null {
  const clockTimes = values.map(minutes);
  if (clockTimes.some((value) => value < 0)) return null;
  const timeline = [clockTimes[0]];
  for (const time of clockTimes.slice(1)) {
    let next = time;
    while (next <= timeline[timeline.length - 1]) next += 1440;
    timeline.push(next);
  }
  return timeline[3] - timeline[0] < 1440 ? timeline : null;
}

export function validateStandardHours(hours: StandardHours) {
  const values = [hours.HR_ENT1, hours.HR_SAI1, hours.HR_ENT2, hours.HR_SAI2];
  if (values.some((value) => minutes(value) < 0)) return 'Informe os quatro horários no formato HH:MM.';
  const timeline = unfoldShiftMinutes(values);
  if (!timeline) return 'O turno deve terminar em menos de 24 horas.';
  const [entry, breakStart, breakEnd, exit] = timeline;
  if (breakStart - entry > 360 || exit - breakEnd > 360) return 'Cada período de trabalho deve ter no máximo 06:00.';
  if (breakEnd - breakStart !== 70) return 'O intervalo deve ser exatamente 01:10.';
  if (breakStart - entry + exit - breakEnd !== 528) return 'A jornada total deve ser exatamente 08:48.';
  return '';
}
