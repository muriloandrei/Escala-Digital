const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, run } = require('../scripts/liberar-escalas-mensais');

test('liberacao mensal exige mes, operador e argumentos sem duplicidade', () => {
  assert.deepEqual(parseArgs(['--mes=2026-12']),
    { mesRef: '2026-12-01', apply: false, by: null, loja: null });
  assert.deepEqual(parseArgs(['--mes=2026-12', '--loja=64', '--apply', '--by=opc']),
    { mesRef: '2026-12-01', apply: true, by: 'opc', loja: 64 });
  assert.throws(() => parseArgs([]), /--mes/);
  assert.throws(() => parseArgs(['--mes=2026-13']), /Argumento desconhecido/);
  assert.throws(() => parseArgs(['--mes=2026-12', '--mes=2027-01']), /repetido/);
  assert.throws(() => parseArgs(['--mes=2026-12', '--loja=0']), /Argumento desconhecido/);
  assert.throws(() => parseArgs(['--mes=2026-12', '--apply']), /--by/);
  assert.throws(() => parseArgs(['--mes=2026-12', '--by=opc']), /--apply/);
  assert.throws(() => parseArgs(['--mes=2026-12', '--dry-run', '--apply', '--by=opc']), /Argumento desconhecido/);
});

test('dezembro usa periodo operacional e previsualiza todas as lojas sem gravar', async () => {
  const calls = [];
  const originalLog = console.log;
  const lines = [];
  console.log = (line) => lines.push(line);
  try {
    const dependencies = {
      liberarEscalasMensais: async (options) => {
        calls.push(options);
        return [{ lojaId: 35, prevista: options.dryRun, criada: !options.dryRun,
          funcionarios: 4 }];
      },
      registerAudit: async (options) => calls.push(options)
    };
    await run(['--mes=2026-12'], dependencies);
    assert.deepEqual(calls, [{ mesRef: '2026-12-01', dryRun: true }]);
    assert.match(lines[0], /2026-12-07 a 2027-01-03/);
    await run(['--mes=2026-12', '--loja=35', '--apply', '--by=opc'], dependencies);
    assert.deepEqual(calls[1], { mesRef: '2026-12-01', dryRun: false, lojas: [35] });
    assert.equal(calls[2].action, 'LIBERAR_ESCALA_MENSAL');
    assert.equal(calls[2].mesRef, '2026-12-01');
    assert.equal(calls[2].details.fim, '2027-01-03');
  } finally {
    console.log = originalLog;
  }
});
