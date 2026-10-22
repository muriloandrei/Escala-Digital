const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '../db/packages');
const body = fs.readFileSync(path.join(dir, 'PK_VT.body.sql'), 'utf8');
const setup = fs.readFileSync(path.join(dir, '20261022_vt_escala_inteligente.sql'), 'utf8');

test('VT libera somente as 25 lojas informadas a partir de novembro de 2026', () => {
  const lojas = [...setup.matchAll(/into SGN_VT_ESCALA_INT_LOJA \(LOJA, MES_INICIO\) values \((\d+), date '2026-11-01'\)/g)]
    .map((match) => Number(match[1]));
  assert.deepEqual(lojas.sort((a, b) => a - b),
    [2, 3, 7, 16, 35, 47, 52, 63, 64, ...Array.from({ length: 16 }, (_, index) => index + 300)]);
  assert.match(body, /trunc\(ed_dt_ref, 'MM'\) >= l\.mes_inicio/i);
  assert.match(body, /from sgn_prog_escala ax, tcnx_loja lx/i);
});

test('VT conta o mes calendario cruzando escalas operacionais sem usar revisoes antigas', () => {
  assert.match(body, /from ESCALAINT\.SGN_ESC_PROG p\s+join ESCALAINT\.SGN_ESC_PROG_DIA d/i);
  assert.match(body, /p\.ativa = 1 and p\.oficializada = 1/i);
  assert.match(body, /p\.revisao = \(\s*select max\(px\.revisao\)/i);
  assert.match(body, /d\.dt >= trunc\(ed_dt_inic\) and d\.dt < trunc\(ed_dt_fim\) \+ 1/i);
  assert.doesNotMatch(body, /p\.mes_ref = trunc\(ed_dt_inic, 'MM'\)/i);
  assert.match(body, /d\.programacao = 'TRB'/i);
  assert.doesNotMatch(body, /nvl\(d\.programacao, 'TRB'\) = 'TRB'/i);
});

test('compra usa a mesma disponibilidade exibida no APEX e preserva dias para desligamento', () => {
  const compra = body.slice(body.indexOf('PROCEDURE PKB_INCLUI_FUNC_SOLIC'));
  assert.match(compra, /vn_escala_ok := FKG_ESCALA_OK\(/i);
  assert.doesNotMatch(compra, /from sgn_prog_escala/i);
  assert.match(compra, /insert into SGN_VT_ESCALA_SNAPSHOT\s+\(/i);
  assert.match(compra, /PKB_APURA_DIAS_TRAB\(vd_dt_inic_escala, vd_dt_fim_escala/i);
  assert.match(body, /select count\(distinct sd\.dt\) into vn_saldo/i);
  assert.match(body, /Compra de VT sem retrato da escala/i);
});
