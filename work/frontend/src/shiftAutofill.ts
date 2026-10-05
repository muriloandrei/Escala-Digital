import type { StandardHours } from './shiftValidation';

const WORK_MINUTES = 528;
const BREAK_MINUTES = 70;
type Field = keyof StandardHours;

function minutes(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const result = Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  return result >= 0 && result < 1440 && Number(value.slice(3, 5)) < 60 ? result : null;
}

function clock(value: number) {
  if (value < 0 || value >= 1440) return null;
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function autofillStandardHours(current: StandardHours, field: Field, value: string): StandardHours | null {
  const edited = minutes(value);
  if (edited === null) return null;
  const entry = minutes(current.HR_ENT1);
  const breakStart = minutes(current.HR_SAI1);
  const morning = entry !== null && breakStart !== null && breakStart > entry
    ? Math.min(360, Math.max(168, breakStart - entry)) : 240;
  let first: number;
  let firstPeriod: number;
  if (field === 'HR_ENT1') {
    first = edited;
    const preserved = breakStart !== null ? breakStart - first : 0;
    firstPeriod = preserved >= 168 && preserved <= 360 ? preserved : morning;
  } else if (field === 'HR_SAI1') {
    first = entry ?? edited - morning;
    firstPeriod = edited - first;
  } else if (field === 'HR_ENT2') {
    first = entry ?? edited - BREAK_MINUTES - morning;
    firstPeriod = edited - BREAK_MINUTES - first;
  } else {
    first = edited - BREAK_MINUTES - WORK_MINUTES;
    firstPeriod = morning;
  }
  if (firstPeriod < 168 || firstPeriod > 360) return null;
  const values = [first, first + firstPeriod, first + firstPeriod + BREAK_MINUTES, first + WORK_MINUTES + BREAK_MINUTES]
    .map(clock);
  if (values.some((item) => item === null)) return null;
  return { HR_ENT1: values[0]!, HR_SAI1: values[1]!, HR_ENT2: values[2]!, HR_SAI2: values[3]! };
}
