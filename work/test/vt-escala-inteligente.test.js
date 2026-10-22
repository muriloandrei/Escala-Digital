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
  const dias = body.slice(body.indexOf('PROCEDURE PKB_APURA_DIAS_TRAB'), body.indexOf('FUNCTION FKG_DIAS_TRAB'));
  assert.match(dias, /from ESCALAINT\.SGN_ESC_PROG p\s+join ESCALAINT\.SGN_ESC_PROG_DIA d/i);
  assert.match(dias, /p\.ativa = 1/i);
  assert.match(dias, /p\.revisao = \(\s*select max\(px\.revisao\)/i);
  assert.match(dias, /d\.dt >= trunc\(ed_dt_inic\) and d\.dt < trunc\(ed_dt_fim\) \+ 1/i);
  assert.doesNotMatch(dias, /p\.mes_ref = trunc\(ed_dt_inic, 'MM'\)/i);
  assert.match(dias, /d\.programacao = 'TRB'/i);
  assert.doesNotMatch(dias, /nvl\(d\.programacao, 'TRB'\) = 'TRB'/i);
});

test('somente 01/11/2026 herda escala encerrada de outubro apos aprovacao de novembro', () => {
  const disponibilidade = body.slice(body.indexOf('FUNCTION FKG_ESCALA_OK'), body.indexOf('FUNCTION FKG_QTDE_COMPRA'));
  const dias = body.slice(body.indexOf('PROCEDURE PKB_APURA_DIAS_TRAB'), body.indexOf('FUNCTION FKG_DIAS_TRAB'));
  assert.match(disponibilidade, /p\.mes_ref = trunc\(ed_dt_ref, 'MM'\)/i);
  assert.match(disponibilidade, /p\.oficializada = 1/i);
  assert.match(disponibilidade, /select count\(\*\) into vn_pendentes/i);
  assert.match(disponibilidade, /trunc\(ed_dt_ref, 'MM'\) = date '2026-11-01'\s+and p\.mes_ref = date '2026-10-01'\s+and trunc\(d\.dt\) = date '2026-11-01'/i);
  assert.match(dias, /p\.oficializada = 1 or \(/i);
  assert.match(dias, /trunc\(ed_dt_inic, 'MM'\) = date '2026-11-01'\s+and p\.mes_ref = date '2026-10-01'\s+and trunc\(d\.dt\) = date '2026-11-01'/i);
  assert.match(dias, /pm\.mes_ref = date '2026-11-01'\s+and pm\.ativa = 1 and pm\.oficializada = 1/i);
  assert.match(dias, /select max\(pmx\.revisao\)/i);
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
