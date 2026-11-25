const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { activeSectionSql, enabledAdditionalSectionSql, eligibleManagementEmployeeSql,
  isApprenticeManagementSection } = require('../src/domain/sectionRollout');

test('catalogo inclui status Z na lista de funcionarios ativos', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/catalogService.js'), 'utf8');
  assert.match(source, /funcionarioColumns\.has\('STATUS'\)\s*\?\s*"and upper\(trim\(nvl\(f\.status, 'A'\)\)\) in \('A', 'F', 'P', 'Z'\)"/);
});

test('additional sections depend on a store flag and an active employee', () => {
  const sql = enabledAdditionalSectionSql('s', ':lojaId');
  assert.match(sql, /rollout_loja\.loja = :lojaId/);
  assert.match(sql, /todas_secoes_habilitadas, 0\) = 1/);
  assert.match(sql, /rollout_func\.escsecao_id = s\.escsecao_id/);
  assert.match(sql, /rollout_func\.dt_demiss is null/);
  assert.match(sql, /'A', 'F', 'P', 'Z'/);
  assert.match(sql, /02\[\.\]012\$/);
  assert.match(activeSectionSql('s', ':lojaId'), /nvl\(s\.status, 'A'\) = 'A' or/);
});

test('Gerencia 01.001 so entra para aprendizes ativos em praticos e postos', () => {
  const additional = enabledAdditionalSectionSql('s', ':lojaId');
  const active = activeSectionSql('s', ':lojaId');
  assert.match(additional, /not regexp_like\(trim\(nvl\(s\.cod_secao, ' '\)\), '\(\^\|\[\.\]\)01\[\.\]001\$'\)/);
  assert.match(active, /not regexp_like\(trim\(nvl\(s\.cod_secao, ' '\)\), '\(\^\|\[\.\]\)01\[\.\]001\$'\)/);
  assert.match(active, /and \(nvl\(s\.status, 'A'\) = 'A' or/);
  assert.match(active, /:lojaId between 400 and 499 or :lojaId between 700 and 799/);
  assert.match(active, /aprendiz\.escsecao_id = s\.escsecao_id/);
  assert.match(active, /aprendiz\.dt_demiss is null/);
  assert.match(active, /regexp_like\(upper\(funcao_aprendiz\.descr\), 'APRENDIZ'\)/);
  assert.match(active, /or \(nvl\(s\.status, 'A'\) = 'A' and/);
  const employee = eligibleManagementEmployeeSql('s', 'fu', ':lojaId');
  assert.match(employee, /regexp_like\(upper\(nvl\(fu\.descr, ' '\)\), 'APRENDIZ'\)/);
  for (const loja of [400, 499, 700, 703, 799]) {
    assert.equal(isApprenticeManagementSection({ COD_SECAO: `${loja}.01.001` }, loja), true);
  }
  for (const loja of [65, 399, 500, 699, 800]) {
    assert.equal(isApprenticeManagementSection({ COD_SECAO: `${loja}.01.001` }, loja), false);
  }
  assert.equal(isApprenticeManagementSection({ COD_SECAO: '703.02.002' }, 703), false);
});
