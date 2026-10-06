import type { DiaEscala, Funcionario } from './api';
import { validateStandardHours, type StandardHours } from './shiftValidation';

export function quickShift(employee: Funcionario, reference?: DiaEscala) {
  const apprentice = /APRENDIZ/i.test(employee.FUNCAO_DESCR || '');
  if (apprentice) {
    const start = employee.HR_ENT1 || reference?.HR_ENT1 || '08:00';
    const match = /^(\d{2}):(\d{2})$/.exec(start);
    const entry = match && Number(match[1]) < 24 && Number(match[2]) < 60
      ? Number(match[1]) * 60 + Number(match[2]) : 480;
    const first = entry >= 0 && entry + 315 < 1440 ? entry : 480;
    const clock = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    return { HR_ENT1: clock(first), HR_SAI1: clock(first + 315), HR_ENT2: null, HR_SAI2: null };
  }
  const from = (source?: Funcionario | DiaEscala): StandardHours => ({
    HR_ENT1: source?.HR_ENT1 || '', HR_SAI1: source?.HR_SAI1 || '',
    HR_ENT2: source?.HR_ENT2 || '', HR_SAI2: source?.HR_SAI2 || '',
  });
  const fallback = { HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };
  return [from(employee), from(reference), fallback].find((hours) => !validateStandardHours(hours)) || fallback;
}
