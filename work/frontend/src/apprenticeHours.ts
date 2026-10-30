import type { StandardHours } from './shiftValidation';

const WORK_MINUTES = 315;

function minutes(value: string | null | undefined): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function clock(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function apprenticeHoursFromStart(start: string): StandardHours | null {
  const entry = minutes(start);
  if (entry === null || entry + WORK_MINUTES >= 1440) return null;
  return { HR_ENT1: clock(entry), HR_SAI1: clock(entry + WORK_MINUTES), HR_ENT2: '', HR_SAI2: '' };
}

export function autofillApprenticeHours(field: 'HR_ENT1' | 'HR_SAI1', value: string): StandardHours | null {
  const edited = minutes(value);
  if (edited === null || (field === 'HR_SAI1' && edited < WORK_MINUTES)) return null;
  return apprenticeHoursFromStart(clock(field === 'HR_ENT1' ? edited : edited - WORK_MINUTES));
}

export function validateApprenticeHours(hours: StandardHours): string {
  const entry = minutes(hours.HR_ENT1);
  const exit = minutes(hours.HR_SAI1);
  if (entry === null || exit === null) return 'Informe entrada e saída no formato HH:MM.';
  if (hours.HR_ENT2 || hours.HR_SAI2) return 'Aprendiz não pode ter segundo período.';
  if (exit - entry !== WORK_MINUTES) return 'A jornada do aprendiz deve ser exatamente 05:15.';
  return '';
}
