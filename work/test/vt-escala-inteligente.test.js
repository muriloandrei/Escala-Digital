const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getOperationalPeriodIso } = require('../src/domain/operationalPeriod');

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
  const fonte = body.slice(body.indexOf('FUNCTION FKG_USA_ESCALA_INTELIGENTE'), body.indexOf('FUNCTION FKG_INICIO_PERIODO_OPERACIONAL'));
  assert.match(fonte, /f\.codsecao/i);
  assert.match(fonte, /s\.status = 'A'/i);
  assert.match(fonte, /FRENTE\.\*CAIXA/);
  assert.doesNotMatch(fonte, /SGN_ESC_PROG p/i);
});

test('VT conta o periodo informado da compra sem usar revisoes antigas', () => {
  const dias = body.slice(body.indexOf('PROCEDURE PKB_APURA_DIAS_TRAB'), body.indexOf('FUNCTION FKG_DIAS_TRAB'));
  assert.match(dias, /from ESCALAINT\.SGN_ESC_PROG p\s+join ESCALAINT\.SGN_ESC_PROG_DIA d/i);
  assert.match(dias, /p\.ativa = 1/i);
  assert.match(dias, /p\.revisao = \(\s*select max\(px\.revisao\)/i);
  assert.match(dias, /d\.dt >= trunc\(ed_dt_inic\) and d\.dt < trunc\(ed_dt_fim\) \+ 1/i);
  assert.doesNotMatch(dias, /p\.mes_ref = trunc\(ed_dt_inic, 'MM'\)/i);
  assert.match(dias, /d\.programacao = 'TRB'/i);
  assert.doesNotMatch(dias, /nvl\(d\.programacao, 'TRB'\) = 'TRB'/i);
});

test('compra inteligente atribui 01/11 a novembro sem consultar outubro', () => {
  const disponibilidade = body.slice(body.indexOf('FUNCTION FKG_ESCALA_OK'), body.indexOf('FUNCTION FKG_QTDE_COMPRA'));
  const dias = body.slice(body.indexOf('PROCEDURE PKB_APURA_DIAS_TRAB'), body.indexOf('FUNCTION FKG_DIAS_TRAB'));
  const compra = body.slice(body.indexOf('PROCEDURE PKB_INCLUI_FUNC_SOLIC'));
  assert.deepEqual(getOperationalPeriodIso('2026-11-01'), { inicio: '2026-11-01', fim: '2026-12-06' });
  assert.deepEqual(getOperationalPeriodIso('2026-12-01'), { inicio: '2026-12-07', fim: '2027-01-03' });
  assert.match(body, /return trunc\(trunc\(ed_dt_ref, 'MM'\) \+ 6, 'IW'\)/i);
  assert.match(body, /if trunc\(ed_dt_ref, 'MM'\) = date '2026-11-01' then\s+return date '2026-11-01'/i);
  assert.match(body, /return FKG_INICIO_PERIODO_OPERACIONAL\(add_months\(trunc\(ed_dt_ref, 'MM'\), 1\)\) - 1/i);
  assert.match(disponibilidade, /p\.mes_ref = trunc\(ed_dt_ref, 'MM'\)/i);
  assert.match(disponibilidade, /p\.oficializada = 1/i);
  assert.match(disponibilidade, /select count\(\*\) into vn_pendentes/i);
  assert.match(disponibilidade, /p\.mes_ref = trunc\(ed_dt_ref, 'MM'\)\s+and p\.ativa = 1 and p\.oficializada = 0/i);
  assert.match(disponibilidade, /vd_inicio_periodo := FKG_INICIO_PERIODO_OPERACIONAL\(ed_dt_ref\)/i);
  assert.match(disponibilidade, /vd_fim_periodo := FKG_FIM_PERIODO_OPERACIONAL\(ed_dt_ref\)/i);
  assert.match(disponibilidade, /d\.dt >= vd_inicio_periodo\s+and d\.dt < vd_fim_periodo \+ 1/i);
  assert.doesNotMatch(disponibilidade, /d\.dt\s*[<>]=?\s*FKG_(INICIO|FIM)_PERIODO_OPERACIONAL/i);
  assert.match(dias, /p\.oficializada = 1/i);
  assert.match(dias, /not \(p\.mes_ref = date '2026-10-01' and trunc\(d\.dt\) = date '2026-11-01'\)/i);
  assert.doesNotMatch(dias, /pm\.mes_ref = date '2026-11-01'/i);
  assert.match(compra, /if vv_fonte_escala = 'INTELIGENTE' then\s+vd_dt_inic_escala := FKG_INICIO_PERIODO_OPERACIONAL\(v_reg\.dt_ref\);\s+vd_dt_fim_escala := FKG_FIM_PERIODO_OPERACIONAL\(v_reg\.dt_ref\)/i);
  assert.match(compra, /if trunc\(v_reg\.dt_ref, 'MM'\) = date '2026-11-01' then\s+vd_dt_inic_escala := date '2026-11-01'/i);
  assert.match(compra, /else\s+if v_reg\.tipo_carga = 1 then\s+vd_dt_inic_escala := fg_get_date/i);
  assert.match(compra, /vd_dt_fim_escala := last_day\(vd_dt_inic_escala\)/i);
});

test('compra usa a mesma disponibilidade exibida no APEX e preserva dias para desligamento', () => {
  const compra = body.slice(body.indexOf('PROCEDURE PKB_INCLUI_FUNC_SOLIC'));
  assert.match(compra, /vn_escala_ok := FKG_ESCALA_OK\(/i);
  assert.doesNotMatch(compra, /from sgn_prog_escala/i);
  assert.match(compra, /insert into SGN_VT_ESCALA_SNAPSHOT\s+\(/i);
  assert.match(compra, /PKB_APURA_DIAS_TRAB\(vd_dt_inic_escala, vd_dt_fim_escala/i);
  assert.match(body, /select count\(distinct sd\.dt\) into vn_saldo/i);
  assert.match(body, /Compra de VT sem retrato da escala/i);
  assert.match(body, /b\.dt_ref\s+between add_months\(trunc\(p\.datademissao,'month'\), -1\)/i);
  assert.match(body, /vn_cred_ant_inteligente > 0 then\s+vd_dt_inic_cred_ant := FKG_INICIO_PERIODO_OPERACIONAL/i);
  assert.match(body, /vn_cred_ant_inteligente > 0 and vn_cred_ant_apex > 0 then\s+raise_application_error\(-20002/i);
});
