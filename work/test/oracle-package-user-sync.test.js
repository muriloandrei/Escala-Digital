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
  assert.equal((packageBody.match(/\(\^\|\[\.\]\)02\[\.\]012\$/g) || []).length, 4);
  assert.match(packageBody, /'FÉRIAS', 'FER'/);
});

test('preparo SQL preserva contas e cria somente os metadados de origem necessarios', () => {
  assert.match(prepare, /ORIGEM_USUARIO_ID/);
  assert.match(prepare, /DT_HR_ULT_SENHA_ORIGEM/);
  assert.doesNotMatch(prepare, /\b(delete|truncate|drop)\b/i);
  assert.doesNotMatch(prepare, /AUTH_VERSION/);
});

test('carga registra lojas com funcionarios ativos mesmo sem brigada e associa Portaria a Frente de Caixa', () => {
  assert.match(packageBody, /from V_LOJAS l\s+left join SGN_BRIGADA_INCENDIO b/i);
  assert.match(packageBody, /exists \(select 1 from PFUNC f[\s\S]*?f\.datademissao is null\)/i);
  assert.match(packageBody, /regexp_like\(trim\(rec1\.codsecao\), '\(\^\|\[\.\]\)02\[\.\]012\$'\)/i);
  assert.match(packageBody, /upper\(ss\.descr\) = 'PORTEIRO'/i);
  assert.match(packageBody, /regexp_like\(trim\(s\.cod_secao\), '\(\^\|\[\.\]\)02\[\.\]002\$'\)/i);
  assert.match(packageBody, /select escfuncao_id,\s+case when upper\(trim\(descr\)\) = 'PORTEIRO' then 1 else 0 end\s+into v_reg_func\.escfuncao_id, v_funcao_porteiro/i);
  assert.match(packageBody, /if rec1\.codfilial <> 999\s+and regexp_like\(trim\(rec1\.codsecao\)[\s\S]*?and v_funcao_porteiro = 1 then/i);
  assert.doesNotMatch(packageBody, /and exists\s*\(select 1 from ESCALAINT\.SGN_ESC_FUNCAO fn/i);
  assert.match(packageBody, /a\.escsubsecao_id = case/i);
  assert.doesNotMatch(packageBody, /a\.status = v_reg_func\.status/i);
  assert.match(packageBody, /ESCALAINT\.SGN_ESC_LOJA_SEQ\.nextval/i);
});
