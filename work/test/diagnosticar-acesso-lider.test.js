const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, diagnosticar } = require('../scripts/diagnosticar-acesso-lider');

test('diagnostico exige loja e mes explicitos', () => {
  assert.deepEqual(parseArgs(['--loja=64', '--mes=2026-11']), { loja: 64, mesRef: '2026-11-01' });
  assert.throws(() => parseArgs(['--loja=64']), /--mes/);
  assert.throws(() => parseArgs(['--loja=0', '--mes=2026-11']), /--loja/);
});

test('diagnostico mostra apenas vinculos de cada lider e escala do mes', async () => {
  const connection = {
    execute: async (sql) => {
      if (sql.includes('from sgn_esc_loja')) return { rows: [{ TODAS_SECOES_HABILITADAS: 1 }] };
      if (sql.includes('from sgn_esc_usuario u')) return { rows: [
        { USUARIO_ID: 1, LOGIN: 'LIDERESTOQUE64', STATUS: 'A' },
        { USUARIO_ID: 2, LOGIN: 'LIDERPADARIA64', STATUS: 'A' }
      ] };
      if (sql.includes('from sgn_esc_secao s') && sql.includes('funcionarios_aptos')) return { rows: [
        { ESCSECAO_ID: 10, COD_SECAO: '064.03.001', DESCR: 'Estoque', STATUS: 'I',
          FUNCIONARIOS_APTOS: 2, FUNCIONARIOS_COM_ESCALA: 2 }
      ] };
      if (sql.includes('from sgn_esc_usuario_secao us')) return { rows: [
        { USUARIO_ID: 1, ESCSECAO_ID: 10, STATUS: 'A' }
      ] };
      throw new Error(`SQL inesperado: ${sql}`);
    }
  };
  const result = await diagnosticar(connection, { loja: 64, mesRef: '2026-11-01' });
  assert.equal(result.todasSecoesHabilitadas, true);
  assert.deepEqual(result.lideres[0].secoes, [{ secaoId: 10, codigo: '064.03.001',
    secao: 'Estoque', vinculoAtivo: true, secaoDisponivel: true, funcionariosComEscala: 2 }]);
  assert.deepEqual(result.lideres[1].secoes, []);
});
