const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');

async function loadFrontendHelper(filename) {
  const source = fs.readFileSync(path.join(__dirname, '../frontend/src', filename), 'utf8');
  const compiled = stripTypeScriptTypes(source, { mode: 'strip' });
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

test('operation id uses secure random values when randomUUID is unavailable on HTTP', async () => {
  const { createOperationId } = await loadFrontendHelper('operationId.ts');
  assert.match(createOperationId({ getRandomValues: (buffer) => buffer.fill(42) }), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('editing any shift time keeps 08:48 work and 01:10 break', async () => {
  const { autofillStandardHours } = await loadFrontendHelper('shiftAutofill.ts');
  const base = { HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };
  const expected = {
    HR_ENT1: { HR_ENT1: '09:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '18:58' },
    HR_SAI1: { HR_ENT1: '08:00', HR_SAI1: '12:30', HR_ENT2: '13:40', HR_SAI2: '17:58' },
    HR_ENT2: { HR_ENT1: '08:00', HR_SAI1: '11:50', HR_ENT2: '13:00', HR_SAI2: '17:58' },
    HR_SAI2: { HR_ENT1: '08:02', HR_SAI1: '12:02', HR_ENT2: '13:12', HR_SAI2: '18:00' }
  };
  for (const [field, output] of Object.entries(expected)) {
    const value = { HR_ENT1: '09:00', HR_SAI1: '12:30', HR_ENT2: '13:00', HR_SAI2: '18:00' }[field];
    assert.deepEqual({ ...autofillStandardHours(base, field, value) }, output);
  }
  assert.equal(autofillStandardHours(base, 'HR_ENT1', '20:00'), null);
});

test('fixed schedule click cycle returns to empty after rest and work', async () => {
  const { nextFixedState } = await loadFrontendHelper('quickFixedCycle.ts');
  assert.equal(nextFixedState(null), 'FXF');
  assert.equal(nextFixedState('FXF'), 'TRB');
  assert.equal(nextFixedState('TRB'), null);
});
