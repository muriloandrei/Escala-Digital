const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const servicePath = path.join(__dirname, '../src/services/catalogService.js');
const serviceRequire = createRequire(servicePath);

function serviceForConflict({ status = 'A', constraint = 'SGN_ESC_SUBSECAO_1_UK' } = {}) {
  const calls = [];
  const connection = {
    async execute(sql, binds = {}) {
      calls.push(sql);
      if (/from user_tab_columns/i.test(sql)) {
        const columns = {
          SGN_ESC_LOJA: ['ESCLOJA_ID', 'LOJA', 'CODCOLIGADA'],
          SGN_ESC_SECAO: ['ESCSECAO_ID', 'CODFILIAL', 'CODCOLIGADA', 'COD_SECAO', 'DESCR', 'STATUS'],
          SGN_ESC_SUBSECAO: ['ESCSUBSECAO_ID', 'ESCSECAO_ID', 'DESCR', 'STATUS', 'DT_HR_INCL']
        };
        return { rows: columns[binds.tableName].map((COLUMN_NAME) => ({ COLUMN_NAME })) };
      }
      if (/from sgn_esc_loja\s+order by loja/i.test(sql)) return { rows: [{ ESCLOJA_ID: 2, LOJA: 2, CODCOLIGADA: 1 }] };
      if (/select codcoligada\s+from sgn_esc_loja/i.test(sql)) return { rows: [{ CODCOLIGADA: 1 }] };
      if (/from sgn_esc_secao/i.test(sql)) return { rows: [{ ESCSECAO_ID: 4144, CODFILIAL: 2, CODCOLIGADA: 1, DESCR: 'Frente de Caixa' }] };
      if (/^\s*(insert into|update) sgn_esc_subsecao/i.test(sql)) {
        const error = new Error(`ORA-00001: unique constraint (ESCALAINT.${constraint}) violated`);
        error.errorNum = 1;
        throw error;
      }
      if (/from sgn_esc_subsecao/i.test(sql)) return { rows: [{ ESCSUBSECAO_ID: 19, ESCSECAO_ID: 4144, DESCR: 'Porteiro', STATUS: status }] };
      throw new Error(`Unexpected SQL: ${sql}`);
    },
    async commit() { calls.push('COMMIT'); }
  };
  const loaded = { exports: {} };
  vm.runInNewContext(fs.readFileSync(servicePath, 'utf8'), {
    module: loaded,
    require: (name) => name === '../db/oracle'
      ? { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1, NUMBER: 2, BIND_OUT: 3 } }
      : name === './escalaEventService' ? {} : serviceRequire(name),
    process, Date, Intl, Set, Map, JSON, Number, String, Error
  });
  return { service: loaded.exports, calls };
}

test('duplicate subsection names report existing active and inactive records', async () => {
  for (const status of ['A', 'I']) {
    const { service, calls } = serviceForConflict({ status });
    await assert.rejects(
      service.createSubsecao({ lojaId: 2, escsecaoId: 4144, data: { DESCR: 'Porteiro' } }),
      (error) => error.statusCode === 422 && error.message.includes('ID 19') &&
        error.message.includes(status === 'I' ? 'Reative-a' : 'Use o cadastro existente')
    );
    assert.equal(calls.includes('COMMIT'), false);
  }
});

test('renaming a subsection to an existing name reports the conflict', async () => {
  const { service } = serviceForConflict();
  await assert.rejects(
    service.updateSubsecao({ lojaId: 2, escsecaoId: 4144, escsubsecaoId: 20, data: { DESCR: 'Porteiro', STATUS: 'A' } }),
    (error) => error.statusCode === 422 && error.message.includes('ID 19')
  );
});

test('other Oracle unique constraints remain server errors', async () => {
  const { service, calls } = serviceForConflict({ constraint: 'SGN_ESC_SUBSECAO_PK' });
  await assert.rejects(
    service.createSubsecao({ lojaId: 2, escsecaoId: 4144, data: { DESCR: 'Porteiro' } }),
    (error) => error.errorNum === 1 && error.statusCode === undefined
  );
  assert.equal(calls.filter((sql) => /from sgn_esc_subsecao/i.test(sql)).length, 0);
});
