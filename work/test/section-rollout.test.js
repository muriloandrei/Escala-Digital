const test = require('node:test');
const assert = require('node:assert/strict');
const { activeSectionSql, enabledAdditionalSectionSql } = require('../src/domain/sectionRollout');

test('additional sections depend on a store flag and an active employee', () => {
  const sql = enabledAdditionalSectionSql('s', ':lojaId');
  assert.match(sql, /rollout_loja\.loja = :lojaId/);
  assert.match(sql, /todas_secoes_habilitadas, 0\) = 1/);
  assert.match(sql, /rollout_func\.escsecao_id = s\.escsecao_id/);
  assert.match(sql, /rollout_func\.dt_demiss is null/);
  assert.match(sql, /'A', 'F', 'P'/);
  assert.match(sql, /02\[\.\]012\$/);
  assert.match(activeSectionSql('s', ':lojaId'), /nvl\(s\.status, 'A'\) = 'A' or/);
});
