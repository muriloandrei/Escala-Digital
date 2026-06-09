const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../public/js/escala-rules-core');

const defaultRules = {
  minIntervalo: '01:00',
  maxIntervalo: '02:00',
  maxJornadaContinua: '06:00'
};

test('time conversion keeps original behavior', () => {
  assert.equal(rules.timeToMinutes('00:00'), 0);
  assert.equal(rules.timeToMinutes('08:30'), 510);
  assert.equal(rules.timeToMinutes('23:59'), 1439);
  assert.equal(rules.timeToMinutes('8:30'), 0);
  assert.equal(rules.minutesToTime(0), '00:00');
  assert.equal(rules.minutesToTime(510), '08:30');
  assert.equal(rules.minutesToTime(-1), '00:00');
  assert.equal(rules.hoursToMinutes('7.5'), 450);
});

test('valid shift has no simple validation errors', () => {
  const errors = rules.validarTurnoSimples({
    inicio: '08:00',
    fim: '17:20',
    inicioIntervalo: '12:00',
    fimIntervalo: '13:00'
  }, defaultRules);

  assert.deepEqual(errors, []);
});

test('invalid interval end is rejected', () => {
  const errors = rules.validarTurnoSimples({
    inicio: '08:00',
    fim: '17:20',
    inicioIntervalo: '13:00',
    fimIntervalo: '12:00'
  }, defaultRules);

  assert.ok(errors.some((error) => error.includes('fim do intervalo')));
});

test('interval outside shift is rejected', () => {
  const errors = rules.validarTurnoSimples({
    inicio: '08:00',
    fim: '17:20',
    inicioIntervalo: '07:00',
    fimIntervalo: '08:30'
  }, defaultRules);

  assert.ok(errors.some((error) => error.includes('contido dentro')));
});

test('minimum and maximum interval rules are preserved', () => {
  const tooShort = rules.validarTurnoSimples({
    inicio: '08:00',
    fim: '17:20',
    inicioIntervalo: '12:00',
    fimIntervalo: '12:30'
  }, defaultRules);
  assert.ok(tooShort.some((error) => error.includes('menor que o mínimo')));

  const tooLong = rules.validarTurnoSimples({
    inicio: '08:00',
    fim: '17:20',
    inicioIntervalo: '11:00',
    fimIntervalo: '14:30'
  }, defaultRules);
  assert.ok(tooLong.some((error) => error.includes('maior que o máximo')));
});

test('continuous journey limit is preserved', () => {
  const errors = rules.validarTurnoSimples({
    inicio: '06:00',
    fim: '17:20',
    inicioIntervalo: '13:00',
    fimIntervalo: '14:00'
  }, defaultRules);

  assert.ok(errors.some((error) => error.includes('jornada contínua máxima')));
});
