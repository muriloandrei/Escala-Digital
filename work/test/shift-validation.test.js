const test = require('node:test');
const assert = require('node:assert/strict');
const { validateStandardShift, validateApprenticeShift, validate12x36Shift } = require('../src/domain/shiftValidation');

test('validador unico aceita limite de seis horas ja permitido pela escala', () => {
  assert.deepEqual(validateStandardShift({
    HR_ENT1: '08:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '17:58'
  }), []);
});

test('validador aceita turno que atravessa a meia-noite', () => {
  const shift = { HR_ENT1: '20:00', HR_SAI1: '00:00', HR_ENT2: '01:10', HR_SAI2: '05:58' };
  assert.deepEqual(validateStandardShift(shift, { exactInterval: true }), []);
  assert.match(validateStandardShift({ ...shift, HR_SAI2: '20:00' }).join(' '), /24 horas/);
});

test('validador unico rejeita jornada acima do limite e horario invalido', () => {
  assert.match(validateStandardShift({
    HR_ENT1: '08:00', HR_SAI1: '14:01', HR_ENT2: '15:11', HR_SAI2: '17:58'
  }).join(' '), /Primeiro periodo/);
  assert.match(validateStandardShift({
    HR_ENT1: '24:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  }).join(' '), /formato HH:MM/);
});

test('edicao de horario-base exige intervalo exato sem mudar a regra geral', () => {
  const longerBreak = { HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:20', HR_SAI2: '18:08' };
  assert.deepEqual(validateStandardShift(longerBreak), []);
  assert.match(validateStandardShift(longerBreak, { exactInterval: true }).join(' '), /exatamente 01:10/);
});

test('perfis registrados aceitam 6h/1h10 e 5h/15m sem liberar outras jornadas', () => {
  const six = { HR_ENT1: '08:00', HR_SAI1: '11:00', HR_ENT2: '12:10', HR_SAI2: '15:10' };
  const five = { HR_ENT1: '08:00', HR_SAI1: '10:30', HR_ENT2: '10:45', HR_SAI2: '13:15' };
  assert.deepEqual(validateStandardShift(six, { allowProfiles: true }), []);
  assert.deepEqual(validateStandardShift(five, { allowProfiles: true }), []);
  assert.match(validateStandardShift({ ...five, HR_ENT2: '11:40', HR_SAI2: '14:10' }, { allowProfiles: true }).join(' '), /exatamente 00:15/);
  assert.match(validateStandardShift({ ...six, HR_SAI2: '16:10' }, { allowProfiles: true }).join(' '), /Jornada total/);
});

test('apprentice shift can move while keeping exactly 05:15 without a second period', () => {
  assert.deepEqual(validateApprenticeShift({ HR_ENT1: '09:00', HR_SAI1: '14:15', HR_ENT2: null, HR_SAI2: null }), []);
  assert.match(validateApprenticeShift({ HR_ENT1: '09:00', HR_SAI1: '14:16', HR_ENT2: null, HR_SAI2: null }).join(' '), /05:15/);
  assert.match(validateApprenticeShift({ HR_ENT1: '09:00', HR_SAI1: '14:15', HR_ENT2: '15:00', HR_SAI2: null }).join(' '), /segundo periodo/);
});

test('12x36 shift spans twelve hours with an internal break, including overnight', () => {
  const day = { HR_ENT1: '07:00', HR_SAI1: '12:30', HR_ENT2: '13:30', HR_SAI2: '19:00' };
  const night = { HR_ENT1: '20:00', HR_SAI1: '01:30', HR_ENT2: '02:30', HR_SAI2: '08:00' };
  assert.deepEqual(validate12x36Shift(day), []);
  assert.deepEqual(validate12x36Shift(night), []);
  assert.match(validate12x36Shift({ ...day, HR_SAI2: '20:00' }).join(' '), /12:00/);
  assert.match(validate12x36Shift({ ...day, HR_ENT2: '13:00' }).join(' '), /01:00/);
});

test('post shift profiles are available only with the post-store flag', () => {
  const postFiveTwo = { HR_ENT1: '07:00', HR_SAI1: '11:30', HR_ENT2: '13:10', HR_SAI2: '17:04' };
  assert.deepEqual(validateStandardShift(postFiveTwo, { allowProfiles: true, allowPostProfiles: true }), []);
  assert.match(validateStandardShift(postFiveTwo, { allowProfiles: true }).join(' '), /Jornada total/);
  assert.match(validateStandardShift({ ...postFiveTwo, HR_ENT2: '12:50', HR_SAI2: '16:44' },
    { allowProfiles: true, allowPostProfiles: true, exactInterval: true }).join(' '), /Jornada total|Intervalo/);
});
