const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const servicePath = path.join(__dirname, '../src/services/escalaService.js');
const serviceRequire = createRequire(servicePath);

function loadMonthService({ allSections = true } = {}) {
  const queries = [];
  const previousSection = 4943;
  const currentSection = 4781;
  const employee = {
    ESCFUNC_ID: 30907, CHAPA: '302.0588', NOME: 'Kevin', ESCSECAO_ID: currentSection,
    COD_SECAO: '302.02.006', SECAO_DESCR: 'Mercearia', ESCFUNCAO_ID: 701,
    FUNCAO_DESCR: 'Operador', STATUS: 'A'
  };
  const connection = { execute: async (sql, binds) => {
    queries.push({ sql, binds });
    if (sql.includes('from sgn_esc_prog p') && sql.includes('left join sgn_esc_prog_dia d')) return { rows: [{
      ESCFUNC_ID: 30907, CHAPA: '302.0588', NOME: 'Kevin', ESCSECAO_ID: previousSection,
      CADASTRO_SECAO_ID: currentSection, ESCSECAO_ID_ESCALA: previousSection,
      COD_SECAO: '302.02.002', SECAO_DESCR: 'Frente de Caixa',
      ESCFUNCAO_ID: 700, FUNCAO_DESCR: 'Funcao antiga',
      LOJA_TODAS_SECOES_HABILITADAS: allSections ? 1 : 0, FUNCIONARIO_STATUS: 'A',
      ESCPROGDIA_ID: 101, DT: binds.mesRef === '2026-10-01' ? '2026-10-01' : '2026-12-01',
      PROGRAMACAO: 'TRB', OFICIALIZADA: 0
    }] };
    if (sql.includes('from sgn_esc_transfer_sub t')) return { rows: [] };
    throw new Error(`SQL inesperado: ${sql}`);
  } };
  const catalog = { listFuncionariosByLoja: async () => [employee] };
  const module = { exports: {} };
  const context = vm.createContext({ module, console, require: (name) => name === '../db/oracle'
    ? { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } }
    : name === './catalogService' ? catalog : serviceRequire(name) });
  vm.runInContext(fs.readFileSync(servicePath, 'utf8'), context);
  vm.runInContext(`
    reconciliarDesligamentosComConnection = async () => ({ dias: 0 });
    getLatestRevision = async () => 106;
    getTableColumns = async () => new Set(['ESCSUBSECAO_ID', 'DT_DEMISS']);
    getAtivaSql = async () => '1 = 1';
    getSecaoAtivaProgSql = async () => '1 = 1';
    listAusenciasEscalaMensalComConnection = async () => [];
    listFixosEscalaComConnection = async () => [{
      ESCFUNC_ID: 30907, ESCSECAO_ID: 4943, DT: '2026-12-01'
    }];
  `, context);
  return { service: module.exports, queries, previousSection, currentSection };
}

test('open month projects current employee section and function without changing stored revision', async () => {
  const { service, queries, previousSection, currentSection } = loadMonthService();
  const month = await service.getEscalaMensal({ lojaId: 302, mesRef: '2026-12-01', secoesPermitidas: [currentSection] });
  assert.equal(month.dias[0].ESCSECAO_ID, currentSection);
  assert.equal(month.dias[0].ESCSECAO_ID_ESCALA, previousSection);
  assert.equal(month.dias[0].ESCFUNCAO_ID, 701);
  assert.equal(month.funcionarios[0].ESCSECAO_ID, currentSection);
  assert.equal(month.fixos.length, 1);
  assert.equal(month.fixos[0].ESCSECAO_ID, previousSection);
  assert.match(queries[0].sql, /nvl\(f\.escsecao_id, p\.escsecao_id\) in \(:secaoPermitida0\)/);
});

test('open month retains transferred employee when only existing sections are enabled', async () => {
  const { service, currentSection } = loadMonthService({ allSections: false });
  const month = await service.getEscalaMensal({ lojaId: 302, mesRef: '2026-12-01', secoesPermitidas: [currentSection] });
  assert.equal(month.funcionarios[0].ESCSECAO_ID, currentSection);
  assert.equal(month.dias[0].ESCSECAO_ID, currentSection);
});

test('finalized month keeps section and function from its revision', async () => {
  const { service, previousSection } = loadMonthService();
  const month = await service.getEscalaMensal({ lojaId: 302, mesRef: '2026-10-01' });
  assert.equal(month.dias[0].ESCSECAO_ID, previousSection);
  assert.equal(month.dias[0].ESCFUNCAO_ID, 700);
  assert.equal(month.funcionarios[0].ESCSECAO_ID, previousSection);
  assert.equal(month.funcionarios[0].ESCFUNCAO_ID, 700);
});
