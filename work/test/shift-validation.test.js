const test = require('node:test');
const assert = require('node:assert/strict');
const { validateStandardShift, validateApprenticeShift } = require('../src/domain/shiftValidation');

test('validador unico aceita limite de seis horas ja permitido pela escala', () => {
  assert.deepEqual(validateStandardShift({
    HR_ENT1: '08:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '17:58'
  }), []);
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

test('apprentice shift can move while keeping exactly 05:15 without a second period', () => {
  assert.deepEqual(validateApprenticeShift({ HR_ENT1: '09:00', HR_SAI1: '14:15', HR_ENT2: null, HR_SAI2: null }), []);
  assert.match(validateApprenticeShift({ HR_ENT1: '09:00', HR_SAI1: '14:16', HR_ENT2: null, HR_SAI2: null }).join(' '), /05:15/);
  assert.match(validateApprenticeShift({ HR_ENT1: '09:00', HR_SAI1: '14:15', HR_ENT2: '15:00', HR_SAI2: null }).join(' '), /segundo periodo/);
});
