import type { DiaEscala } from './api';

export function printBatches<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) batches.push(items.slice(index, index + size));
  return batches;
}

export function printPageSize(mode: string, format: string): number {
  if (mode === 'mensal' || mode === 'semanal') return 4;
  if (format === 'colaborador' || mode === 'periodo') return 2;
  return mode === 'diario' ? 24 : 14;
}

function minutes(value?: string | null): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function workedMinutes(day?: Pick<DiaEscala, 'PROGRAMACAO' | 'AUSENCIA_OBRIGATORIA' | 'HR_ENT1' | 'HR_SAI1' | 'HR_ENT2' | 'HR_SAI2'>): number {
  if (!day || day.AUSENCIA_OBRIGATORIA || String(day.PROGRAMACAO || '').toUpperCase() !== 'TRB') return 0;
  const [start, breakStart, breakEnd, end] = [day.HR_ENT1, day.HR_SAI1, day.HR_ENT2, day.HR_SAI2].map(minutes);
  if (start === null || breakStart === null || breakStart <= start) return 0;
  if (breakEnd === null && end === null) return breakStart - start;
  if (breakEnd === null || end === null || !(breakStart < breakEnd && breakEnd < end)) return 0;
  return breakStart - start + end - breakEnd;
}

export function formatWorkedMinutes(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function printDayLabel(day?: Pick<DiaEscala, 'PROGRAMACAO' | 'AUSENCIA_OBRIGATORIA'>): string {
  if (!day) return '–';
  const code = String(day.PROGRAMACAO || '').toUpperCase();
  if (code === 'F' || code === 'FXF') return 'FOLGA';
  return code && code !== 'TRB' ? code : '–';
}
