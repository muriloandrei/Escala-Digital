const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, lojaSugerida, perfilSugerido, analisar, diagnosticar } = require('../scripts/diagnosticar-usuarios-origem');

test('diagnostico aceita somente nome de tabela seguro e nao oferece modo de escrita', () => {
  assert.deepEqual(parseArgs([]), { source: 'SGN_USUARIO', targetSchema: 'ESCALAINT', sample: 20 });
  assert.deepEqual(parseArgs(['--source=SGN.SGN_USUARIO', '--target-schema=ESCALAINT', '--sample=5']), { source: 'SGN.SGN_USUARIO', targetSchema: 'ESCALAINT', sample: 5 });
  assert.throws(() => parseArgs(['--source=SGN_USUARIO;delete from sgn_esc_usuario']), /somente consulta/);
  assert.throws(() => parseArgs(['--apply']), /somente consulta/);
});

test('sugestao de perfil exige padrao de login explicito', () => {
  assert.equal(perfilSugerido('gerente35'), 'GERENTE');
  assert.equal(perfilSugerido('lider.frente35'), 'LIDER');
  assert.equal(perfilSugerido('adm64'), 'RH');
  assert.equal(perfilSugerido('caixa64'), 'OPERADOR');
  assert.equal(lojaSugerida('lider.frente064'), 64);
  assert.equal(lojaSugerida('user20261014'), null);
});

test('diagnostico nao concede perfil e evidencia senha e loja divergentes', () => {
  const result = analisar({
    origem: [
      { LOGIN: 'lider.frente64', SENHA: 'a'.repeat(32), DT_HR_ULT_SENHA: new Date('2026-10-14') },
      { LOGIN: 'gerente35', SENHA: 'b'.repeat(32), DT_HR_ULT_SENHA: null },
      { LOGIN: 'lider.frente64', SENHA: 'a'.repeat(32), DT_HR_ULT_SENHA: new Date('2026-10-14') }
    ],
    destino: [{ USUARIO_ID: 1, LOGIN: 'GERENTE35', PERFIL: 'GERENTE', SENHA_HASH: 'c'.repeat(32), DT_HR_INCL: new Date('2026-10-01') }],
    lojas: [{ LOJA: 35 }, { LOJA: 64 }],
    vinculos: [{ USUARIO_ID: 1, LOJA: 10 }],
    secoes: [{ LOJA: 35, TOTAL: 2 }, { LOJA: 64, TOTAL: 4 }]
  });
  assert.equal(result.length, 2);
  assert.equal(result[0].origemDuplicada, true);
  assert.equal(result[0].perfilSugerido, 'LIDER');
  assert.equal(result[1].senha, 'md5_diferente');
  assert.deepEqual(result[1].lojasAtuais, [10]);
  assert.equal(JSON.stringify(result).includes('a'.repeat(32)), false);
});

test('diagnostico nao executa escrita', async () => {
  const sqls = [];
  const connection = {
    execute: async (sql) => {
      sqls.push(sql);
      if (sql.includes('from user_tab_columns')) return { rows: [{ COLUMN_NAME: 'STATUS' }] };
      if (sql.includes('from SGN_USUARIO')) return { rows: [] };
      if (sql.includes('from ESCALAINT.sgn_esc_usuario_loja')) return { rows: [] };
      if (sql.includes('from ESCALAINT.sgn_esc_usuario')) return { rows: [] };
      if (sql.includes('from ESCALAINT.sgn_esc_loja')) return { rows: [] };
      if (sql.includes('from all_tab_columns')) return { rows: [{ COLUMN_NAME: 'CODFILIAL' }] };
      if (sql.includes('from ESCALAINT.sgn_esc_secao')) return { rows: [] };
      throw new Error(`SQL inesperado: ${sql}`);
    }
  };
  assert.deepEqual(await diagnosticar(connection, { source: 'SGN_USUARIO', targetSchema: 'ESCALAINT' }), { temStatusOrigem: true, resultados: [] });
  assert.equal(sqls.every((sql) => /^\s*select\b/i.test(sql)), true);
});
