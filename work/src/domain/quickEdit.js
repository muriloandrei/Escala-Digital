const { buildDiaAlteracoes } = require('../utils/scheduleDiff');
const { validateStandardShift, validateApprenticeShift } = require('./shiftValidation');

function validateQuickRestWorkEdit(funcionario, diasAnteriores = [], { allowShiftChange = false } = {}) {
  const alteracoes = buildDiaAlteracoes(diasAnteriores, funcionario.dias || []);
  if (alteracoes.length !== 1 || !alteracoes[0].anterior) {
    return 'A edicao rapida deve alterar exatamente um dia existente.';
  }
  const { anterior, novo } = alteracoes[0];
  if (!['F', 'TRB'].includes(anterior.programacao) || !['F', 'TRB'].includes(novo.programacao)
    || (!allowShiftChange && anterior.programacao === novo.programacao)) {
    return allowShiftChange
      ? 'A edicao pontual permite somente folga ou trabalho em um dia existente.'
      : 'A edicao rapida permite somente alternar trabalho e folga.';
  }
  if (novo.programacao === 'F') {
    if ([novo.hrEnt1, novo.hrSai1, novo.hrEnt2, novo.hrSai2].some(Boolean)) return 'Folga nao pode conter horarios.';
    return '';
  }
  if (/APRENDIZ/i.test(String(funcionario.funcao || funcionario.FUNCAO_DESCR || '')) || funcionario.aprendiz) {
    return validateApprenticeShift({ HR_ENT1: novo.hrEnt1, HR_SAI1: novo.hrSai1,
      HR_ENT2: novo.hrEnt2, HR_SAI2: novo.hrSai2 })[0] || '';
  }
  const errors = validateStandardShift({ HR_ENT1: novo.hrEnt1, HR_SAI1: novo.hrSai1,
    HR_ENT2: novo.hrEnt2, HR_SAI2: novo.hrSai2 });
  return errors[0] || '';
}

module.exports = { validateQuickRestWorkEdit };
