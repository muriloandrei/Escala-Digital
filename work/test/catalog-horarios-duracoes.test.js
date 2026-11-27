const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

test('missing apprentice profile column does not break schedule reads but fails closed', async () => {
  const servicePath = path.join(__dirname, '../src/services/catalogService.js');
  const serviceRequire = createRequire(servicePath);
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(servicePath, 'utf8'), {
    module: mod,
    require: (name) => name === '../db/oracle'
      ? { withConnection: async (work) => work({}), oracledb: { OUT_FORMAT_OBJECT: 1 } }
      : name === './escalaEventService' ? {} : serviceRequire(name)
  });
  const missingColumn = Object.assign(new Error('ORA-00904: "H"."LIBERAR_HORARIO_APRENDIZ": invalid identifier'),
    { errorNum: 904, code: 'ORA-00904' });
  const connection = { execute: async () => { throw missingColumn; } };
  const profiles = await mod.exports.getAllowedProfileKeys(24, connection, { apprentice: true });
  assert.equal(profiles.size, 0);
  await assert.rejects(mod.exports.getAllowedProfileKeys(24, connection), /LIBERAR_HORARIO_APRENDIZ/);
  const otherError = { execute: async () => { throw Object.assign(new Error('ORA-00904: OUTRO'), { errorNum: 904 }); } };
  await assert.rejects(mod.exports.getAllowedProfileKeys(24, otherError, { apprentice: true }), /OUTRO/);
});

test('inactive profiles remain valid for existing schedules but unavailable for new selections', async () => {
  const servicePath = path.join(__dirname, '../src/services/catalogService.js');
  const serviceRequire = createRequire(servicePath);
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(servicePath, 'utf8'), {
    module: mod,
    require: (name) => name === '../db/oracle'
      ? { withConnection: async (work) => work({}), oracledb: { OUT_FORMAT_OBJECT: 1 } }
      : name === './escalaEventService' ? {} : serviceRequire(name)
  });
  const queries = [];
  const connection = { execute: async (sql) => {
    queries.push(sql);
    return { rows: [{ JORNADA_MINUTOS: 528, INTERVALO_MINUTOS: 70 }] };
  } };
  assert.equal((await mod.exports.getAllowedProfileKeys(35, connection)).has('528:70'), true);
  assert.match(queries[0], /h\.status = 'A'/);
  assert.equal((await mod.exports.getAllowedProfileKeys(35, connection, { includeInactive: true })).has('528:70'), true);
  assert.match(queries[1], /h\.status in \('A', 'I'\)/);
});

test('duration-only profile insert does not require fixed start or end times', async () => {
  const servicePath = path.join(__dirname, '../src/services/catalogService.js');
  const serviceRequire = createRequire(servicePath);
  const statements = [];
  const connection = {
    async commit() {},
    async rollback() {},
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
    DESCR: 'Postos 08:24 com 01:40 de intervalo', JORNADA_MINUTOS: 504, INTERVALO_MINUTOS: 100,
    LIBERAR_HORARIO_APRENDIZ: true
  });
  assert.equal(result.ESCHORPAD_ID, 42);
  assert.match(statements[0].sql, /insert into sgn_esc_horario_padrao/i);
  assert.doesNotMatch(statements[0].sql, /hr_ent1|hr_sai1|hr_ent2|hr_sai2/i);
  assert.deepEqual(Object.keys(statements[0].binds).sort(),
    ['apprentice', 'descr', 'id', 'intervaloMinutos', 'jornadaMinutos', 'status'].sort());
  assert.equal(statements[0].binds.apprentice, 1);
  assert.match(statements[1].sql, /delete from sgn_esc_horpad_loja/i);
});
