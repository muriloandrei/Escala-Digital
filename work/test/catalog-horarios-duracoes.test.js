const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

test('duration-only profile insert does not require fixed start or end times', async () => {
  const servicePath = path.join(__dirname, '../src/services/catalogService.js');
  const serviceRequire = createRequire(servicePath);
  const statements = [];
  const connection = {
    async execute(sql, binds) {
      statements.push({ sql, binds });
      return { outBinds: { id: [42] } };
    }
  };
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(servicePath, 'utf8'), {
    module: mod,
    require: (name) => name === '../db/oracle'
      ? { withConnection: (work) => work(connection), oracledb: { NUMBER: 2, BIND_OUT: 3 } }
      : name === './escalaEventService' ? {} : serviceRequire(name)
  });
  const result = await mod.exports.createHorarioPadrao({
    DESCR: 'Postos 08:24 com 01:40 de intervalo', JORNADA_MINUTOS: 504, INTERVALO_MINUTOS: 100
  });
  assert.equal(result.ESCHORPAD_ID, 42);
  assert.match(statements[0].sql, /insert into sgn_esc_horario_padrao/i);
  assert.doesNotMatch(statements[0].sql, /hr_ent1|hr_sai1|hr_ent2|hr_sai2/i);
  assert.deepEqual(Object.keys(statements[0].binds).sort(),
    ['descr', 'id', 'intervaloMinutos', 'jornadaMinutos', 'status'].sort());
});
