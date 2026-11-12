import type { StandardHours } from './shiftValidation';

type Field = keyof StandardHours;

function minutes(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const result = Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  return result >= 0 && result < 1440 && Number(value.slice(3, 5)) < 60 ? result : null;
}

function clock(value: number) {
  const wrapped = ((value % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

export function autofillStandardHours(current: StandardHours, field: Field, value: string, workMinutes = 528, intervalMinutes = 70): StandardHours | null {
  const edited = minutes(value);
  if (edited === null) return null;
  const entry = minutes(current.HR_ENT1);
  const breakStart = minutes(current.HR_SAI1);
  const minFirst = workMinutes <= 360 ? 60 : 168;
  const maxFirst = Math.min(360, workMinutes - 1);
  const morning = entry !== null && breakStart !== null
    ? Math.min(maxFirst, Math.max(minFirst, (breakStart - entry + 1440) % 1440)) : workMinutes <= 360 ? 180 : 240;
  let first: number;
  let firstPeriod: number;
  if (field === 'HR_ENT1') {
    first = edited;
    const preserved = breakStart !== null ? (breakStart - first + 1440) % 1440 : 0;
    firstPeriod = preserved >= minFirst && preserved <= maxFirst ? preserved : morning;
  } else if (field === 'HR_SAI1') {
    first = entry ?? edited - morning;
    firstPeriod = (edited - first + 1440) % 1440;
  } else if (field === 'HR_ENT2') {
    first = entry ?? edited - intervalMinutes - morning;
    firstPeriod = (edited - intervalMinutes - first + 1440) % 1440;
  } else {
    first = edited - intervalMinutes - workMinutes;
    firstPeriod = morning;
  }
  if (firstPeriod < minFirst || firstPeriod > maxFirst) return null;
  const values = [first, first + firstPeriod, first + firstPeriod + intervalMinutes, first + workMinutes + intervalMinutes]
    .map(clock);
  if (values.some((item) => item === null)) return null;
  return { HR_ENT1: values[0]!, HR_SAI1: values[1]!, HR_ENT2: values[2]!, HR_SAI2: values[3]! };
}

export function applyShiftProfile(current: StandardHours, workMinutes: number, intervalMinutes: number): StandardHours | null {
  return autofillStandardHours(current, 'HR_ENT1', current.HR_ENT1, workMinutes, intervalMinutes);
}
