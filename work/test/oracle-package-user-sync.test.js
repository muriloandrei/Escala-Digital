const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const packageBody = fs.readFileSync(path.join(__dirname, '../db/packages/PK_ESCALA_INTELIGENTE.body.sql'), 'utf8');
const prepare = fs.readFileSync(path.join(__dirname, '../db/packages/20261014_preparar_sync_usuario_escalaint.sql'), 'utf8');

test('package existente chama a integracao de usuarios apos funcionarios sem mudar a assinatura do job', () => {
  assert.match(packageBody, /procedure PKB_INTEGRA_CADASTRO is/i);
  assert.match(packageBody, /end PKB_INTEGRA_CADASTRO;/i);
  assert.match(packageBody, /commit;\s*PKB_INTEGRA_USUARIOS;/i);
  assert.match(packageBody, /from SGN_USUARIO\b/i);
  assert.doesNotMatch(packageBody, /from SGN_USUARIO\s+where\s+status/i);
  assert.match(packageBody, /rec\.senha is null/i);
  assert.match(packageBody, /instr\(v_login, 'FISCAL'\) = 0/i);
  assert.equal((packageBody.match(/\(\^\|\[\.\]\)02\[\.\]012\$/g) || []).length, 3);
  assert.match(packageBody, /'FÉRIAS', 'FER'/);
});

test('preparo SQL preserva contas e cria somente os metadados de origem necessarios', () => {
  assert.match(prepare, /ORIGEM_USUARIO_ID/);
  assert.match(prepare, /DT_HR_ULT_SENHA_ORIGEM/);
  assert.doesNotMatch(prepare, /\b(delete|truncate|drop)\b/i);
  assert.doesNotMatch(prepare, /AUTH_VERSION/);
});
