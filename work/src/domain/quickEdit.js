const { buildDiaAlteracoes } = require('../utils/scheduleDiff');
const { validateStandardShift, validateApprenticeShift, validate12x36Shift } = require('./shiftValidation');
const { effectiveRegime, isDutyDay, TWELVE_THIRTY_SIX } = require('./workRegime');
const { getNationalHoliday } = require('./nationalHolidays');

function validateQuickRestWorkEdit(funcionario, diasAnteriores = [], { allowShiftChange = false, domingo6h = false, lojaId = null } = {}) {
  const alteracoes = buildDiaAlteracoes(diasAnteriores, funcionario.dias || []);
  if (alteracoes.length !== 1 || !alteracoes[0].anterior) {
    return 'A edicao rapida deve alterar exatamente um dia existente.';
  }
  const { anterior, novo } = alteracoes[0];
  if (!['F', 'FDO', 'TRB'].includes(anterior.programacao) || !['F', 'FDO', 'TRB'].includes(novo.programacao)
    || (!allowShiftChange && anterior.programacao === novo.programacao)) {
    return allowShiftChange
      ? 'A edicao pontual permite somente folga ou trabalho em um dia existente.'
      : 'A edicao rapida permite somente alternar trabalho e folga.';
  }
  if (effectiveRegime(funcionario) === TWELVE_THIRTY_SIX) {
    const date = alteracoes[0].data;
    const duty = isDutyDay(funcionario.dtAncora12x36 || funcionario.DT_ANCORA_12X36, date);
    if (novo.programacao === 'TRB' && !duty) return 'Descanso 12x36 obrigatorio neste dia.';
    if (novo.programacao === 'F' && duty) return 'Plantao 12x36 previsto neste dia.';
    if (novo.programacao === 'FDO' && !getNationalHoliday(date)) return 'FDO so e permitida em feriado nacional.';
    if (novo.programacao === 'TRB') return validate12x36Shift({
      HR_ENT1: novo.hrEnt1, HR_SAI1: novo.hrSai1,
      HR_ENT2: novo.hrEnt2, HR_SAI2: novo.hrSai2
    })[0] || '';
  }
  if (novo.programacao === 'F' || novo.programacao === 'FDO') {
    if ([novo.hrEnt1, novo.hrSai1, novo.hrEnt2, novo.hrSai2].some(Boolean)) return 'Folga nao pode conter horarios.';
    return '';
  }
  if (/APRENDIZ/i.test(String(funcionario.funcao || funcionario.FUNCAO_DESCR || '')) || funcionario.aprendiz) {
    return validateApprenticeShift({ HR_ENT1: novo.hrEnt1, HR_SAI1: novo.hrSai1,
      HR_ENT2: novo.hrEnt2, HR_SAI2: novo.hrSai2 })[0] || '';
  }
  const sunday = new Date(`${alteracoes[0].data}T12:00:00`).getDay() === 0;
  const errors = validateStandardShift({ HR_ENT1: novo.hrEnt1, HR_SAI1: novo.hrSai1,
    HR_ENT2: novo.hrEnt2, HR_SAI2: novo.hrSai2 }, { workMinutes: Number(novo.jornadaMinutos) || (domingo6h && sunday ? 360 : 528),
    intervalMinutes: Number(novo.intervaloMinutos) || 70,
    exactInterval: Boolean(novo.intervaloMinutos) || (domingo6h && sunday), allowProfiles: false });
  return errors[0] || '';
}

module.exports = { validateQuickRestWorkEdit };
