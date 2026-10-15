const { getEnv } = require('../src/config/env');
const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const escalaEventService = require('../src/services/escalaEventService');

const LOJA = 16;
const MES_REF = '2026-11-01';

function parseArgs(argv) {
  if (argv.length === 0) return { apply: false, actor: null };
  if (argv.length === 2 && argv[0] === '--apply' && /^--by=[\w.@-]{2,80}$/.test(argv[1])) {
    return { apply: true, actor: argv[1].slice(5) };
  }
  throw new Error('Use sem argumentos para previa, ou --apply --by=OPERADOR para aplicar.');
}

async function listarFixosComDias(connection) {
  const result = await connection.execute(
    `select x.escfixo_id, x.escfunc_id, x.escsecao_id, x.programacao as fixo_programacao,
            to_char(x.dt, 'YYYY-MM-DD') as data, p.escprog_id, p.revisao,
            p.oficializada, d.escprogdia_id, d.programacao as dia_programacao
       from sgn_esc_fixo_escala x
       left join sgn_esc_prog p on p.loja = x.loja and p.mes_ref = x.mes_ref
        and p.escfunc_id = x.escfunc_id and p.escsecao_id = x.escsecao_id
        and nvl(p.ativa, 1) = 1
        and p.revisao = (select max(px.revisao) from sgn_esc_prog px
                          where px.loja = p.loja and px.mes_ref = p.mes_ref
                            and px.escfunc_id = p.escfunc_id and nvl(px.ativa, 1) = 1)
       left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id and d.dt = x.dt
      where x.loja = :loja and x.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
        and nvl(x.status, 'A') = 'A'
      order by x.escfunc_id, x.dt, x.escfixo_id`,
    { loja: LOJA, mesRef: MES_REF }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows || [];
}

async function listarDiasFxfVigentes(connection) {
  const result = await connection.execute(
    `select p.escfunc_id, p.escsecao_id, p.revisao, p.oficializada,
            d.escprogdia_id, to_char(d.dt, 'YYYY-MM-DD') as data
       from sgn_esc_prog p
       join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
      where p.loja = :loja and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
        and nvl(p.ativa, 1) = 1 and d.programacao = 'FXF'
        and p.revisao = (select max(px.revisao) from sgn_esc_prog px
                          where px.loja = p.loja and px.mes_ref = p.mes_ref
                            and px.escfunc_id = p.escfunc_id and nvl(px.ativa, 1) = 1)
      order by p.escfunc_id, d.dt, d.escprogdia_id`,
    { loja: LOJA, mesRef: MES_REF }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows || [];
}

function avaliar(rows, diasFxf = []) {
  const blockers = [];
  const ids = new Set();
  const funcionarios = new Set();
  let folgas = 0;
  let trabalhos = 0;
  let fixosSemDia = 0;
  const diasComFixoAtivo = new Set();
  for (const row of rows) {
    const fixedId = Number(row.ESCFIXO_ID);
    const key = `${row.ESCFUNC_ID}|${row.DATA}`;
    if (ids.has(fixedId)) blockers.push(`Fixo ${fixedId}: programacao ativa duplicada.`);
    ids.add(fixedId);
    funcionarios.add(Number(row.ESCFUNC_ID));
    const fixed = String(row.FIXO_PROGRAMACAO || '').trim().toUpperCase();
    const day = String(row.DIA_PROGRAMACAO || '').trim().toUpperCase();
    if (!row.ESCPROGDIA_ID) fixosSemDia += 1;
    if (Number(row.OFICIALIZADA) === 1) blockers.push(`${key}: escala oficializada.`);
    if (!['FXF', 'F', 'TRB'].includes(fixed)) blockers.push(`${key}: codigo fixo ${fixed || '(vazio)'} nao reconhecido.`);
    if (fixed === 'TRB') {
      trabalhos += 1;
      if (day && day !== 'TRB') blockers.push(`${key}: fixo de trabalho diverge do dia ${day}.`);
    } else if (fixed === 'FXF' || fixed === 'F') {
      folgas += 1;
      if (day === 'FXF' && row.ESCPROGDIA_ID) diasComFixoAtivo.add(Number(row.ESCPROGDIA_ID));
      else if (day && day !== 'F') blockers.push(`${key}: fixo de folga diverge do dia ${day}.`);
    }
  }
  const diasVigentes = new Set();
  let fxfsSemFixoAtivo = 0;
  for (const row of diasFxf) {
    const id = Number(row.ESCPROGDIA_ID);
    const key = `${row.ESCFUNC_ID}|${row.DATA}`;
    if (diasVigentes.has(id)) blockers.push(`${key}: dia FXF vigente duplicado.`);
    diasVigentes.add(id);
    funcionarios.add(Number(row.ESCFUNC_ID));
    if (Number(row.OFICIALIZADA) === 1) blockers.push(`${key}: escala oficializada.`);
    if (!diasComFixoAtivo.has(id)) fxfsSemFixoAtivo += 1;
  }
  for (const id of diasComFixoAtivo) {
    if (!diasVigentes.has(id)) blockers.push(`Dia ${id}: FXF ligado a fixo ativo nao encontrado na programacao vigente.`);
  }
  return { loja: LOJA, mesRef: MES_REF, fixos: ids.size, funcionarios: funcionarios.size,
    folgas, trabalhos, fixosSemDia, diasParaNormalizar: diasVigentes.size, fxfsSemFixoAtivo, blockers };
}

async function normalizar(connection, { apply, actor, expectedSchema }) {
  if (apply) {
    const current = await connection.execute('select user as schema_user from dual', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!expectedSchema || String(current.rows?.[0]?.SCHEMA_USER || '').toUpperCase() !== expectedSchema.toUpperCase()) {
      throw new Error('Schema Oracle diferente do configurado; nenhuma alteracao executada.');
    }
    await connection.execute(
      `select f.escfunc_id from sgn_esc_funcionario f
        where f.loja = :loja and exists (
          select 1 from sgn_esc_fixo_escala x
           where x.escfunc_id = f.escfunc_id and x.loja = :loja
             and x.mes_ref = to_date(:mesRef, 'YYYY-MM-DD') and nvl(x.status, 'A') = 'A')
        for update wait 5`,
      { loja: LOJA, mesRef: MES_REF }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await connection.execute(
      `select x.escfixo_id from sgn_esc_fixo_escala x
        where x.loja = :loja and x.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and nvl(x.status, 'A') = 'A' for update wait 5`,
      { loja: LOJA, mesRef: MES_REF }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await connection.execute(
      `select p.escprog_id from sgn_esc_prog p
        where p.loja = :loja and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and nvl(p.ativa, 1) = 1
        for update wait 5`,
      { loja: LOJA, mesRef: MES_REF }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
  }
  const rows = await listarFixosComDias(connection);
  const diasFxf = await listarDiasFxfVigentes(connection);
  const report = avaliar(rows, diasFxf);
  if (!apply) return report;
  if ((!report.fixos && !report.diasParaNormalizar) || report.blockers.length) {
    await connection.rollback();
    return { ...report, aplicado: false };
  }

  const grupos = new Map();
  try {
    const registrarDia = (row, anterior, novo) => {
      const groupKey = `${row.ESCFUNC_ID}|${row.ESCSECAO_ID}`;
      if (!grupos.has(groupKey)) grupos.set(groupKey, { escfuncId: row.ESCFUNC_ID,
        escsecaoId: row.ESCSECAO_ID, revisao: row.REVISAO, dias: [] });
      grupos.get(groupKey).dias.push({ data: row.DATA, anterior, novo });
    };
    for (const row of diasFxf) {
      const day = await connection.execute(
        `update sgn_esc_prog_dia
            set programacao = 'F', hr_ent1 = 'F', hr_sai1 = 'F',
                hr_ent2 = 'F', hr_sai2 = 'F'
          where escprogdia_id = :id and programacao = 'FXF'`,
        { id: row.ESCPROGDIA_ID }, { autoCommit: false }
      );
      if (day.rowsAffected !== 1) throw new Error(`Dia ${row.ESCPROGDIA_ID} mudou durante a conversao.`);
      registrarDia(row, 'FXF', 'F');
    }
    if (rows.length) {
      const fixed = await connection.execute(
        `update sgn_esc_fixo_escala set status = 'I', dt_hr_incl = sysdate
          where loja = :loja and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
            and nvl(status, 'A') = 'A'`,
        { loja: LOJA, mesRef: MES_REF }, { autoCommit: false }
      );
      if (fixed.rowsAffected !== report.fixos) throw new Error('A quantidade de fixos mudou durante a conversao.');
    }
    for (const row of rows) {
      const novo = !row.ESCPROGDIA_ID ? 'SEM_DIA_GERADO'
        : String(row.FIXO_PROGRAMACAO).toUpperCase() === 'TRB' ? 'TRB' : 'F';
      registrarDia(row, `FIXO_${row.FIXO_PROGRAMACAO}`, novo);
    }
    const operacaoId = escalaEventService.createOperationId();
    for (const group of grupos.values()) {
      await escalaEventService.appendEvent(connection, {
        operacaoId, lojaId: LOJA, mesRef: MES_REF,
        escfuncId: group.escfuncId, escsecaoId: group.escsecaoId,
        revisaoAnterior: group.revisao, revisaoNova: group.revisao,
        actor: { login: actor }, acao: 'NORMALIZAR_FIXOS_LOJA16', origem: 'SISTEMA', situacao: 'RASCUNHO',
        detalhe: { motivo: 'Converter fixos de novembro em programacao comum sem regenerar dias.', dias: group.dias }
      });
    }
    await connection.commit();
    return { ...report, aplicado: true, eventos: grupos.size };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const report = await withConnection((connection) => normalizar(connection, {
      ...args, expectedSchema: args.apply ? getEnv().oracle.user : null
    }));
    const modo = !args.apply ? 'PREVIA' : report.aplicado ? 'APLICADA'
      : report.blockers.length ? 'BLOQUEADA_SEM_ALTERACOES' : 'SEM_ALTERACOES';
    console.log(JSON.stringify({ modo, ...report }, null, 2));
    if (report.blockers.length) process.exitCode = 1;
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  main().catch((error) => { console.error(`Conversao interrompida: ${error.message}`); process.exitCode = 1; });
}

module.exports = { parseArgs, avaliar, normalizar };
