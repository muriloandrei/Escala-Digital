import type { DiaEscala } from './api';

export type PayloadDay = {
  data: string;
  jornadaMinutos?: number | null;
  intervaloMinutos?: number | null;
  hrEnt1: string | null;
  hrSai1: string | null;
  hrEnt2: string | null;
  hrSai2: string | null;
  programacao: string;
  justificativa: string | null;
};

export function toPayloadDay(day: DiaEscala): PayloadDay {
  const rest = String(day.PROGRAMACAO || 'TRB').toUpperCase() !== 'TRB';
  const noSecondShift = [day.HR_ENT2, day.HR_SAI2]
    .every((value) => !value || value === '00:00');
  return {
    data: String(day.DT || '').slice(0, 10),
    jornadaMinutos: day.JORNADA_MINUTOS ?? null,
    intervaloMinutos: day.INTERVALO_MINUTOS ?? null,
    hrEnt1: rest ? null : day.HR_ENT1 || null,
    hrSai1: rest ? null : day.HR_SAI1 || null,
    hrEnt2: rest || noSecondShift ? null : day.HR_ENT2 || null,
    hrSai2: rest || noSecondShift ? null : day.HR_SAI2 || null,
    programacao: rest ? String(day.PROGRAMACAO || 'F').toUpperCase() : 'TRB',
    justificativa: day.JUSTIFICATIVA_ALTERACAO || null,
  };
}
