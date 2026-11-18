const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');

const source = fs.readFileSync(path.join(__dirname, '../frontend/src/scheduleReadback.ts'), 'utf8');
const readbackModule = import(`data:text/javascript,${encodeURIComponent(stripTypeScriptTypes(source))}`);

test('readback treats Oracle 00:00 placeholders as absent second shift', async () => {
  const { toPayloadDay } = await readbackModule;
  const day = { DT: '2026-11-05', PROGRAMACAO: 'TRB', HR_ENT1: '07:30', HR_SAI1: '12:45',
    HR_ENT2: '00:00', HR_SAI2: '00:00', JORNADA_MINUTOS: null, INTERVALO_MINUTOS: null };
  const payload = toPayloadDay(day);
  assert.equal(payload.hrEnt2, null);
  assert.equal(payload.hrSai2, null);
  assert.equal(payload.hrEnt1, '07:30');
});

test('readback preserves a real second shift', async () => {
  const { toPayloadDay } = await readbackModule;
  const day = { DT: '2026-11-05', PROGRAMACAO: 'TRB', HR_ENT1: '08:00', HR_SAI1: '12:00',
    HR_ENT2: '13:10', HR_SAI2: '17:58' };
  const payload = toPayloadDay(day);
  assert.equal(payload.hrEnt2, '13:10');
  assert.equal(payload.hrSai2, '17:58');
});
