import type { DiaEscala, Funcionario } from './api';

export function compareEmployeesByShift(
  first: Funcionario,
  second: Funcionario,
  daysByEmployee: Map<string, Map<string, DiaEscala>>,
  dates: readonly string[],
) {
  const firstStart = (employee: Funcionario) => {
    const days = daysByEmployee.get(String(employee.ESCFUNC_ID));
    const shift = dates.map((date) => days?.get(date)).find((day) =>
      day && !day.AUSENCIA_OBRIGATORIA && String(day.PROGRAMACAO || 'TRB').toUpperCase() === 'TRB',
    );
    return shift?.HR_ENT1 || '99:99';
  };
  return firstStart(first).localeCompare(firstStart(second)) || first.NOME.localeCompare(second.NOME, 'pt-BR');
}
