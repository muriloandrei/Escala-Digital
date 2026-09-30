const test = require('node:test');
const assert = require('node:assert/strict');
const { validateStandardShift } = require('../src/domain/shiftValidation');

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
