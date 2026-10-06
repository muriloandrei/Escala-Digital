const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, run } = require('../scripts/liberar-escalas-novembro-2026');

test('november release requires operator and rejects unknown arguments', () => {
  assert.deepEqual(parseArgs([]), { apply: false, by: null });
  assert.throws(() => parseArgs(['--apply']), /--by/);
  assert.throws(() => parseArgs(['--mes=2026-12']), /Argumento desconhecido/);
  assert.equal(parseArgs(['--apply', '--by=murilo.jesus']).by, 'murilo.jesus');
});

test('november preview is read-only and application audits created stores', async () => {
  const calls = [];
  const dependencies = {
    liberarEscalasMensais: async (options) => {
      calls.push(options);
      return [{ lojaId: 10, criada: !options.dryRun, prevista: options.dryRun, funcionarios: 4 }];
    },
    registerAudit: async (options) => calls.push(options)
  };
  await run([], dependencies);
  assert.deepEqual(calls[0], { mesRef: '2026-11-01', dryRun: true });
  assert.equal(calls.length, 1);
  await run(['--apply', '--by=murilo.jesus'], dependencies);
  assert.deepEqual(calls[1], { mesRef: '2026-11-01', dryRun: false });
  assert.equal(calls[2].lojaId, 10);
  assert.equal(calls[2].user.login, 'murilo.jesus');
});
