const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');

async function loadPrintSchedule() {
  const source = fs.readFileSync(path.join(__dirname, '../frontend/src/printSchedule.ts'), 'utf8')
    .replace("import type { DiaEscala } from './api';", '');
  const compiled = stripTypeScriptTypes(source, { mode: 'strip' });
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

test('monthly and weekly rosters keep four employees per sheet', async () => {
  const { printBatches, printPageSize } = await loadPrintSchedule();
  for (const mode of ['mensal', 'semanal']) {
    for (const format of ['juntos', 'cargos', 'colaborador']) {
      assert.equal(printPageSize(mode, format), 4);
    }
  }
  assert.deepEqual(printBatches([1, 2, 3, 4, 5, 6, 7, 8, 9], printPageSize('mensal', 'juntos')),
    [[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
});

test('printed hours add both work periods but ignore rest and absence', async () => {
  const { workedMinutes, formatWorkedMinutes, printDayLabel } = await loadPrintSchedule();
  const shift = { PROGRAMACAO: 'TRB', HR_ENT1: '07:20', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '16:30' };
  assert.equal(formatWorkedMinutes(workedMinutes(shift)), '08:00');
  assert.equal(workedMinutes({ ...shift, PROGRAMACAO: 'F' }), 0);
  assert.equal(workedMinutes({ ...shift, AUSENCIA_OBRIGATORIA: 1 }), 0);
  assert.equal(workedMinutes({ ...shift, HR_SAI2: null }), 0);
  assert.equal(printDayLabel({ PROGRAMACAO: 'FXF' }), 'FOLGA');
  assert.equal(printDayLabel({ PROGRAMACAO: 'AFA' }), 'AFA');
});
