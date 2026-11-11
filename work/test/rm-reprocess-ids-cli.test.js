const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, avaliarEnvio } = require('../scripts/reprocessar-envios-rm-por-id');

test('reprocessamento por ID exige lista unica, motivo e operador para aplicar', () => {
  assert.deepEqual(parseArgs(['--ids=1498,971', '--motivo=cabecalho-200']), {
    ids: [1498, 971], motivo: 'cabecalho-200', apply: false, operador: null
  });
  assert.deepEqual(parseArgs(['--ids=1415', '--motivo=duplicada', '--apply', '--by=opc']), {
    ids: [1415], motivo: 'duplicada', apply: true, operador: 'opc'
  });
  for (const args of [[], ['--ids=1415', '--motivo=duplicada', '--apply'],
    ['--ids=1415,1415', '--motivo=duplicada'], ['--ids=0', '--motivo=duplicada'],
    ['--ids=1415', '--motivo=outro'], ['--ids=1415', '--motivo=duplicada', '--by=opc']]) {
    assert.throws(() => parseArgs(args), /Use --ids/);
  }
});

test('reprocessamento por ID bloqueia erro divergente e revisao alterada', () => {
  const envio = { ENVIO_ID: 1498, REVISAO: 11, STATUS: 'INCERTO',
    ERRO: 'RM retornou HTTP 200 ao criar cabecalho da tabela de folga; detalhes nao reenviados.' };
  const plano = { acao: 'REPROCESSAR', envio, revisao: 11 };
  assert.equal(avaliarEnvio(envio, plano, 'cabecalho-200'), null);
  assert.match(avaliarEnvio({ ...envio, ERRO: 'Chave duplicada' }, plano, 'cabecalho-200'), /nao corresponde/);
  assert.match(avaliarEnvio(envio, { ...plano, revisao: 12 }, 'cabecalho-200'), /Revisao/);
  assert.match(avaliarEnvio(envio, { ...plano, envio: { ENVIO_ID: 1500 } }, 'cabecalho-200'), /envio atual/);
});
