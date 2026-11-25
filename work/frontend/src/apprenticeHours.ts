import type { StandardHours } from './shiftValidation';

const WORK_MINUTES = 300;
const BREAK_MINUTES = 15;

export function usesImplicitApprenticeBreak(workMinutes: number, intervalMinutes: number) {
  return workMinutes === WORK_MINUTES && intervalMinutes === BREAK_MINUTES;
}

function isAbsentSecondPeriod(entry: string | null | undefined, exit: string | null | undefined) {
  return (!entry && !exit) || (entry === '00:00' && exit === '00:00');
}

export function normalizeApprenticeHours(hours: Partial<Record<keyof StandardHours, string | null>>): StandardHours {
  const noSecond = isAbsentSecondPeriod(hours.HR_ENT2, hours.HR_SAI2);
  return { HR_ENT1: hours.HR_ENT1 || '', HR_SAI1: hours.HR_SAI1 || '',
    HR_ENT2: noSecond ? '' : hours.HR_ENT2 || '', HR_SAI2: noSecond ? '' : hours.HR_SAI2 || '' };
}

function minutes(value: string | null | undefined): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function clock(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function apprenticeProfileFromHours(hours: Partial<Record<keyof StandardHours, string | null>>) {
  const entry = minutes(hours.HR_ENT1);
  const firstExit = minutes(hours.HR_SAI1);
  if (entry === null || firstExit === null) return null;
  const first = (firstExit - entry + 1440) % 1440;
  if (isAbsentSecondPeriod(hours.HR_ENT2, hours.HR_SAI2)) return first
    ? first === WORK_MINUTES + BREAK_MINUTES
      ? { work: WORK_MINUTES, interval: BREAK_MINUTES } : { work: first, interval: 0 }
    : null;
  const secondEntry = minutes(hours.HR_ENT2);
  const exit = minutes(hours.HR_SAI2);
  if (secondEntry === null || exit === null) return null;
  const interval = (secondEntry - firstExit + 1440) % 1440;
  const second = (exit - secondEntry + 1440) % 1440;
  return first && second && interval ? { work: first + second, interval } : null;
}

export function apprenticeHoursFromStart(start: string, workMinutes = WORK_MINUTES, intervalMinutes = BREAK_MINUTES): StandardHours | null {
  const entry = minutes(start);
  if (entry === null || entry + workMinutes + intervalMinutes >= 1440) return null;
  if (intervalMinutes === 0 || usesImplicitApprenticeBreak(workMinutes, intervalMinutes)) return workMinutes <= 360
    ? { HR_ENT1: start, HR_SAI1: clock(entry + workMinutes + intervalMinutes), HR_ENT2: '', HR_SAI2: '' } : null;
  const first = Math.min(360, Math.max(workMinutes - 360, Math.ceil(workMinutes / 2)));
  if (first <= 0 || first >= workMinutes) return null;
  return { HR_ENT1: start, HR_SAI1: clock(entry + first),
    HR_ENT2: clock(entry + first + intervalMinutes), HR_SAI2: clock(entry + workMinutes + intervalMinutes) };
}

export function autofillApprenticeHours(field: keyof StandardHours, value: string, workMinutes = WORK_MINUTES, intervalMinutes = BREAK_MINUTES, current?: StandardHours): StandardHours | null {
  const edited = minutes(value);
  const single = intervalMinutes === 0 || usesImplicitApprenticeBreak(workMinutes, intervalMinutes);
  if (edited === null || (field === 'HR_SAI1' && edited < workMinutes + intervalMinutes && single)) return null;
  if (!single) {
    const entry = minutes(current?.HR_ENT1) ?? (field === 'HR_ENT1' ? edited : null);
    if (entry === null) return null;
    const first = field === 'HR_SAI1' ? edited - entry
      : field === 'HR_ENT2' ? edited - intervalMinutes - entry
        : (minutes(current?.HR_SAI1) ?? (entry + Math.ceil(workMinutes / 2))) - entry;
    const start = field === 'HR_SAI2' ? edited - workMinutes - intervalMinutes : entry;
    const duration = field === 'HR_ENT1' ? (minutes(current?.HR_SAI1) ?? (start + first)) - start : first;
    if (start < 0 || start + workMinutes + intervalMinutes >= 1440
      || duration <= 0 || duration > 360 || workMinutes - duration <= 0 || workMinutes - duration > 360) return null;
    return { HR_ENT1: clock(start), HR_SAI1: clock(start + duration),
      HR_ENT2: clock(start + duration + intervalMinutes), HR_SAI2: clock(start + workMinutes + intervalMinutes) };
  }
  return apprenticeHoursFromStart(clock(field === 'HR_ENT1' ? edited : edited - workMinutes - intervalMinutes), workMinutes, intervalMinutes);
}

export function validateApprenticeHours(hours: StandardHours, workMinutes = WORK_MINUTES, intervalMinutes = BREAK_MINUTES): string {
  if (intervalMinutes > 0 && !usesImplicitApprenticeBreak(workMinutes, intervalMinutes)) {
    const [entry, firstExit, secondEntry, exit] = [hours.HR_ENT1, hours.HR_SAI1, hours.HR_ENT2, hours.HR_SAI2].map(minutes);
    if ([entry, firstExit, secondEntry, exit].some((part) => part === null)) return 'Informe os quatro horários no formato HH:MM.';
    const first = firstExit! - entry!;
    const second = exit! - secondEntry!;
    if (first <= 0 || first > 360 || second <= 0 || second > 360
      || secondEntry! - firstExit! !== intervalMinutes || first + second !== workMinutes) {
      return 'A jornada do aprendiz deve corresponder ao horário selecionado.';
    }
    return '';
  }
  const entry = minutes(hours.HR_ENT1);
  const exit = minutes(hours.HR_SAI1);
  if (entry === null || exit === null) return 'Informe entrada e saída no formato HH:MM.';
  if (!isAbsentSecondPeriod(hours.HR_ENT2, hours.HR_SAI2)) return 'Aprendiz não pode ter segundo período.';
  if (exit - entry !== workMinutes + intervalMinutes) return 'A jornada do aprendiz deve corresponder ao horário selecionado.';
  return '';
}
