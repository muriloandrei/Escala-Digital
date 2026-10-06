const { buildDiaAlteracoes } = require('../utils/scheduleDiff');
const { validateStandardShift } = require('./shiftValidation');

function validateQuickRestWorkEdit(funcionario, diasAnteriores = []) {
  const alteracoes = buildDiaAlteracoes(diasAnteriores, funcionario.dias || []);
  if (alteracoes.length !== 1 || !alteracoes[0].anterior) {
    return 'A edicao rapida deve alterar exatamente um dia existente.';
  }
  const { anterior, novo } = alteracoes[0];
  if (!['F', 'TRB'].includes(anterior.programacao) || !['F', 'TRB'].includes(novo.programacao)
    || anterior.programacao === novo.programacao) {
    return 'A edicao rapida permite somente alternar trabalho e folga.';
  }
  if (novo.programacao === 'F') {
    if ([novo.hrEnt1, novo.hrSai1, novo.hrEnt2, novo.hrSai2].some(Boolean)) return 'Folga nao pode conter horarios.';
    return '';
  }
  if (/APRENDIZ/i.test(String(funcionario.funcao || funcionario.FUNCAO_DESCR || '')) || funcionario.aprendiz) {
    const toMinutes = (value) => /^\d{2}:\d{2}$/.test(String(value || ''))
      ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5)) : null;
    const inicio = toMinutes(novo.hrEnt1);
    const fim = toMinutes(novo.hrSai1);
    return inicio !== null && fim - inicio === 315 && !novo.hrEnt2 && !novo.hrSai2
      ? '' : 'O aprendiz deve cumprir 05:15 sem segundo periodo.';
  }
  const errors = validateStandardShift({ HR_ENT1: novo.hrEnt1, HR_SAI1: novo.hrSai1,
    HR_ENT2: novo.hrEnt2, HR_SAI2: novo.hrSai2 });
  return errors[0] || '';
}

module.exports = { validateQuickRestWorkEdit };
