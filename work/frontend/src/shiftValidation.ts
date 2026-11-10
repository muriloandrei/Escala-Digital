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

export function validateStandardHours(hours: StandardHours, workMinutes = 528, intervalMinutes = 70) {
  const values = [hours.HR_ENT1, hours.HR_SAI1, hours.HR_ENT2, hours.HR_SAI2];
  if (values.some((value) => minutes(value) < 0)) return 'Informe os quatro horários no formato HH:MM.';
  const timeline = unfoldShiftMinutes(values);
  if (!timeline) return 'O turno deve terminar em menos de 24 horas.';
  const [entry, breakStart, breakEnd, exit] = timeline;
  if (breakStart - entry > 360 || exit - breakEnd > 360) return 'Cada período de trabalho deve ter no máximo 06:00.';
  const intervalText = `${String(Math.floor(intervalMinutes / 60)).padStart(2, '0')}:${String(intervalMinutes % 60).padStart(2, '0')}`;
  const workText = `${String(Math.floor(workMinutes / 60)).padStart(2, '0')}:${String(workMinutes % 60).padStart(2, '0')}`;
  if (breakEnd - breakStart !== intervalMinutes) return `O intervalo deve ser exatamente ${intervalText}.`;
  if (breakStart - entry + exit - breakEnd !== workMinutes) return `A jornada total deve ser exatamente ${workText}.`;
  return '';
}

export function validate12x36Hours(hours: StandardHours) {
  const timeline = unfoldShiftMinutes([hours.HR_ENT1, hours.HR_SAI1, hours.HR_ENT2, hours.HR_SAI2]);
  if (!timeline) return 'Informe quatro horários válidos para o plantão.';
  const [entry, breakStart, breakEnd, exit] = timeline;
  if (exit - entry !== 720) return 'O plantão deve ter 12:00 entre entrada e saída.';
  if (breakEnd - breakStart < 60) return 'O intervalo deve ter ao menos 01:00.';
  if (breakStart - entry > 360 || exit - breakEnd > 360) return 'Cada período de trabalho deve ter no máximo 06:00.';
  return '';
}
