const dotenv = require('dotenv');
const { closeOraclePool, oracledb, withConnection } = require('../src/db/oracle');

dotenv.config();

const APRENDIZ_JORNADA_MINUTOS = 315;
const SQL_HORA_VALIDA = '^([01][0-9]|2[0-3]):[0-5][0-9]$';

function parseArgs(argv) {
  const args = {
    apply: false,
    loja: null,
    mesRef: null,
    incluirFinalizadas: false
  };

  argv.forEach((arg) => {
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry-run') args.apply = false;
    else if (arg === '--incluir-finalizadas') args.incluirFinalizadas = true;
    else if (arg.startsWith('--loja=')) {
      const loja = Number(arg.slice('--loja='.length));
      if (!Number.isFinite(loja) || loja <= 0) throw new Error('--loja deve ser um numero positivo.');
      args.loja = loja;
    } else if (arg.startsWith('--mes=')) {
      args.mesRef = normalizeMesRef(arg.slice('--mes='.length));
    }
  });

  return args;
}

function normalizeMesRef(value) {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw.slice(0, 7)}-01`;
  throw new Error('--mes deve estar no formato YYYY-MM ou YYYY-MM-DD.');
}

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

async function getColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name
       from user_tab_columns
      where table_name = :tableName`,
    { tableName: tableName.toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => String(pick(row, 'COLUMN_NAME', 'column_name')).toUpperCase()));
}

async function assertSchema(connection) {
  const funcionario = await getColumns(connection, 'SGN_ESC_FUNCIONARIO');
  const funcao = await getColumns(connection, 'SGN_ESC_FUNCAO');
  const prog = await getColumns(connection, 'SGN_ESC_PROG');
  const progDia = await getColumns(connection, 'SGN_ESC_PROG_DIA');
  const ausencia = await getColumns(connection, 'SGN_ESC_AUSENCIA');

  ['ESCFUNC_ID', 'ESCFUNCAO_ID', 'CHAPA', 'NOME', 'LOJA', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'].forEach((column) => {
    if (!funcionario.has(column)) throw new Error(`Coluna SGN_ESC_FUNCIONARIO.${column} nao encontrada.`);
  });
  ['ESCFUNCAO_ID', 'DESCR'].forEach((column) => {
    if (!funcao.has(column)) throw new Error(`Coluna SGN_ESC_FUNCAO.${column} nao encontrada.`);
  });
  ['ESCPROG_ID', 'ESCFUNC_ID', 'LOJA', 'MES_REF'].forEach((column) => {
    if (!prog.has(column)) throw new Error(`Coluna SGN_ESC_PROG.${column} nao encontrada.`);
  });
  ['ESCPROG_ID', 'DT', 'PROGRAMACAO', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'].forEach((column) => {
    if (!progDia.has(column)) throw new Error(`Coluna SGN_ESC_PROG_DIA.${column} nao encontrada.`);
  });
  ['DT_INIC', 'MOTIVO'].forEach((column) => {
    if (!ausencia.has(column)) throw new Error(`Coluna SGN_ESC_AUSENCIA.${column} nao encontrada.`);
  });

  return { funcionario, funcao, prog, progDia, ausencia };
}

function buildFuncionarioFilters(args, columns, alias = 'f') {
  const filters = [];
  const binds = {};
  if (columns.funcionario.has('DT_DEMISS')) filters.push(`${alias}.dt_demiss is null`);
  if (args.loja) {
    filters.push(`${alias}.loja = :loja`);
    binds.loja = args.loja;
  }
  return { filters, binds };
}

function buildProgFilters(args, columns, alias = 'p') {
  const filters = [];
  const binds = {};
  if (columns.prog.has('ATIVA')) filters.push(`nvl(${alias}.ativa, 1) = 1`);
  if (!args.incluirFinalizadas) filters.push(`last_day(${alias}.mes_ref) >= trunc(sysdate)`);
  if (args.loja) {
    filters.push(`${alias}.loja = :loja`);
    binds.loja = args.loja;
  }
  if (args.mesRef) {
    filters.push(`trunc(${alias}.mes_ref, 'MM') = to_date(:mesRef, 'YYYY-MM-DD')`);
    binds.mesRef = args.mesRef;
  }
  return { filters, binds };
}

function getFuncaoJoinColigada(columns, funcionarioAlias = 'f', funcaoAlias = 'fu') {
  return columns.funcionario.has('CODCOLIGADA') && columns.funcao.has('CODCOLIGADA')
    ? `and ${funcaoAlias}.codcoligada = ${funcionarioAlias}.codcoligada`
    : '';
}

function getProgFuncionarioJoin(columns) {
  if (columns.prog.has('CHAPA')) return '(f.escfunc_id = p.escfunc_id or f.chapa = p.chapa)';
  return 'f.escfunc_id = p.escfunc_id';
}

function getAusenciaExistsSql(columns) {
  const escfuncMatch = columns.ausencia.has('ESCFUNC_ID') ? 'a.escfunc_id = p.escfunc_id' : null;
  const chapaMatches = [];
  if (columns.ausencia.has('CHAPA')) {
    if (columns.prog.has('CHAPA')) chapaMatches.push('a.chapa = p.chapa');
    chapaMatches.push('a.chapa = f.chapa');
  }
  const matches = [escfuncMatch, ...chapaMatches].filter(Boolean).join(' or ');
  if (!matches) throw new Error('SGN_ESC_AUSENCIA precisa ter ESCFUNC_ID ou CHAPA para identificar ausencias oficiais.');
  const fimExpr = columns.ausencia.has('DT_FIM') ? 'nvl(a.dt_fim, a.dt_inic)' : 'a.dt_inic';
  return `exists (
    select 1
      from sgn_esc_ausencia a
     where (${matches})
       and a.dt_inic <= d.dt
       and ${fimExpr} >= d.dt
  )`;
}

function getEntradaAprendizExpr(sourceAlias = 'd', fallbackAlias = 'f') {
  return `case
    when regexp_like(${sourceAlias}.hr_ent1, '${SQL_HORA_VALIDA}') then ${sourceAlias}.hr_ent1
    when regexp_like(${fallbackAlias}.hr_ent1, '${SQL_HORA_VALIDA}') then ${fallbackAlias}.hr_ent1
    else '08:00'
  end`;
}

async function listarPrevia(connection, args, columns) {
  const funcionarioFilter = buildFuncionarioFilters(args, columns, 'f');
  const progFilter = buildProgFilters(args, columns, 'p');
  const binds = { ...funcionarioFilter.binds, ...progFilter.binds };
  const funcaoJoinColigada = getFuncaoJoinColigada(columns);
  const funcionarioWhere = funcionarioFilter.filters.length ? `and ${funcionarioFilter.filters.join(' and ')}` : '';
  const progWhere = progFilter.filters.length ? `and ${progFilter.filters.join(' and ')}` : '';
  const ausenciaExists = getAusenciaExistsSql(columns);

  const aprendizes = await connection.execute(
    `select f.loja,
            count(*) as total,
            sum(case
              when regexp_like(f.hr_ent1, '${SQL_HORA_VALIDA}')
               and f.hr_sai1 = to_char(to_date(case when regexp_like(f.hr_ent1, '${SQL_HORA_VALIDA}') then f.hr_ent1 else '08:00' end, 'HH24:MI') + (:jornadaMin / 1440), 'HH24:MI')
               and f.hr_ent2 is null
               and f.hr_sai2 is null
              then 0 else 1 end) as ajustar
       from sgn_esc_funcionario f
       join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id ${funcaoJoinColigada}
      where regexp_like(upper(fu.descr), 'APRENDIZ')
        ${funcionarioWhere}
      group by f.loja
      order by f.loja`,
    { ...funcionarioFilter.binds, jornadaMin: APRENDIZ_JORNADA_MINUTOS },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const diasAprendiz = await connection.execute(
    `select p.loja,
            to_char(trunc(p.mes_ref, 'MM'), 'YYYY-MM') as mes_ref,
            count(*) as dias_trabalho
       from sgn_esc_prog p
       join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
       join sgn_esc_funcionario f on ${getProgFuncionarioJoin(columns)}
       join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id ${funcaoJoinColigada}
      where regexp_like(upper(fu.descr), 'APRENDIZ')
        and nvl(upper(d.programacao), 'TRB') = 'TRB'
        ${progWhere}
      group by p.loja, trunc(p.mes_ref, 'MM')
      order by p.loja, trunc(p.mes_ref, 'MM')`,
    progFilter.binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const ferAfaManuais = await connection.execute(
    `select p.loja,
            to_char(trunc(p.mes_ref, 'MM'), 'YYYY-MM') as mes_ref,
            upper(d.programacao) as programacao,
            count(*) as dias
       from sgn_esc_prog p
       join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
       join sgn_esc_funcionario f on ${getProgFuncionarioJoin(columns)}
      where upper(d.programacao) in ('FER', 'AFA')
        and not ${ausenciaExists}
        ${progWhere}
      group by p.loja, trunc(p.mes_ref, 'MM'), upper(d.programacao)
      order by p.loja, trunc(p.mes_ref, 'MM'), upper(d.programacao)`,
    progFilter.binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return { aprendizes: aprendizes.rows || [], diasAprendiz: diasAprendiz.rows || [], ferAfaManuais: ferAfaManuais.rows || [], binds };
}

function printTable(title, rows, mapRow) {
  console.log(`\n${title}`);
  if (!rows.length) {
    console.log('Nenhum registro encontrado.');
    return;
  }
  console.table(rows.map(mapRow));
}

async function aplicar(connection, args, columns) {
  const funcionarioFilter = buildFuncionarioFilters(args, columns, 'f');
  const progFilter = buildProgFilters(args, columns, 'p');
  const funcaoJoinColigada = getFuncaoJoinColigada(columns);
  const funcionarioWhere = funcionarioFilter.filters.length ? `and ${funcionarioFilter.filters.join(' and ')}` : '';
  const progWhere = progFilter.filters.length ? `and ${progFilter.filters.join(' and ')}` : '';
  const entradaExpr = getEntradaAprendizExpr('d', 'f');
  const ausenciaExists = getAusenciaExistsSql(columns);

  const base = await connection.execute(
    `update sgn_esc_funcionario f
        set f.hr_ent1 = case
              when regexp_like(f.hr_ent1, '${SQL_HORA_VALIDA}') then f.hr_ent1
              else '08:00'
            end,
            f.hr_sai1 = to_char(to_date(case
              when regexp_like(f.hr_ent1, '${SQL_HORA_VALIDA}') then f.hr_ent1
              else '08:00'
            end, 'HH24:MI') + (:jornadaMin / 1440), 'HH24:MI'),
            f.hr_ent2 = null,
            f.hr_sai2 = null
      where exists (
            select 1
              from sgn_esc_funcao fu
             where fu.escfuncao_id = f.escfuncao_id
               ${funcaoJoinColigada}
               and regexp_like(upper(fu.descr), 'APRENDIZ')
          )
        ${funcionarioWhere}`,
    { ...funcionarioFilter.binds, jornadaMin: APRENDIZ_JORNADA_MINUTOS },
    { autoCommit: false }
  );

  const dias = await connection.execute(
    `update sgn_esc_prog_dia d
        set d.hr_ent1 = (
              select ${entradaExpr}
                from sgn_esc_prog p
                join sgn_esc_funcionario f on ${getProgFuncionarioJoin(columns)}
                join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id ${funcaoJoinColigada}
               where p.escprog_id = d.escprog_id
                 and regexp_like(upper(fu.descr), 'APRENDIZ')
                 ${progWhere}
            ),
            d.hr_sai1 = (
              select to_char(to_date(${entradaExpr}, 'HH24:MI') + (:jornadaMin / 1440), 'HH24:MI')
                from sgn_esc_prog p
                join sgn_esc_funcionario f on ${getProgFuncionarioJoin(columns)}
                join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id ${funcaoJoinColigada}
               where p.escprog_id = d.escprog_id
                 and regexp_like(upper(fu.descr), 'APRENDIZ')
                 ${progWhere}
            ),
            d.hr_ent2 = '00:00',
            d.hr_sai2 = '00:00'
      where nvl(upper(d.programacao), 'TRB') = 'TRB'
        and exists (
          select 1
            from sgn_esc_prog p
            join sgn_esc_funcionario f on ${getProgFuncionarioJoin(columns)}
            join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id ${funcaoJoinColigada}
           where p.escprog_id = d.escprog_id
             and regexp_like(upper(fu.descr), 'APRENDIZ')
             ${progWhere}
        )`,
    { ...progFilter.binds, jornadaMin: APRENDIZ_JORNADA_MINUTOS },
    { autoCommit: false }
  );

  const descansosSistemaManuais = await connection.execute(
    `update sgn_esc_prog_dia d
        set d.programacao = 'F',
            d.hr_ent1 = 'F',
            d.hr_sai1 = 'F',
            d.hr_ent2 = 'F',
            d.hr_sai2 = 'F'
      where upper(d.programacao) in ('FER', 'AFA')
        and exists (
          select 1
            from sgn_esc_prog p
            join sgn_esc_funcionario f on ${getProgFuncionarioJoin(columns)}
           where p.escprog_id = d.escprog_id
             and not ${ausenciaExists}
             ${progWhere}
        )`,
    progFilter.binds,
    { autoCommit: false }
  );

  await connection.commit();
  return {
    funcionariosAprendiz: base.rowsAffected || 0,
    diasAprendiz: dias.rowsAffected || 0,
    descansosSistemaManuais: descansosSistemaManuais.rowsAffected || 0
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    await withConnection(async (connection) => {
      const columns = await assertSchema(connection);
      const previa = await listarPrevia(connection, args, columns);

      console.log(`Modo: ${args.apply ? 'APLICAR' : 'PREVIA'}`);
      console.log(`Loja: ${args.loja || 'TODAS'}`);
      console.log(`Mes: ${args.mesRef ? args.mesRef.slice(0, 7) : 'TODOS ATIVOS'}`);
      console.log(`Inclui finalizadas: ${args.incluirFinalizadas ? 'S' : 'N'}`);
      console.log(`Jornada aprendiz: 05:15 (${APRENDIZ_JORNADA_MINUTOS} minutos)`);

      printTable('Aprendizes ativos por loja', previa.aprendizes, (row) => ({
        loja: pick(row, 'LOJA', 'loja'),
        aprendizes: Number(pick(row, 'TOTAL', 'total') || 0),
        precisam_ajuste_base: Number(pick(row, 'AJUSTAR', 'ajustar') || 0)
      }));
      printTable('Dias de escala de aprendizes que serao padronizados', previa.diasAprendiz, (row) => ({
        loja: pick(row, 'LOJA', 'loja'),
        mes: pick(row, 'MES_REF', 'mes_ref'),
        dias_trabalho: Number(pick(row, 'DIAS_TRABALHO', 'dias_trabalho') || 0)
      }));
      printTable('FER/AFA sem ausencia oficial correspondente', previa.ferAfaManuais, (row) => ({
        loja: pick(row, 'LOJA', 'loja'),
        mes: pick(row, 'MES_REF', 'mes_ref'),
        programacao: pick(row, 'PROGRAMACAO', 'programacao'),
        dias: Number(pick(row, 'DIAS', 'dias') || 0)
      }));

      if (!args.apply) {
        console.log('\nPrevia concluida. Reexecute com --apply para aplicar a correcao.');
        return;
      }

      const resultado = await aplicar(connection, args, columns);
      console.log('\nCorrecao aplicada.');
      console.log(`Funcionarios aprendiz ajustados: ${resultado.funcionariosAprendiz}`);
      console.log(`Dias de escala de aprendiz ajustados: ${resultado.diasAprendiz}`);
      console.log(`FER/AFA manuais convertidos para F: ${resultado.descansosSistemaManuais}`);
    });
  } finally {
    await closeOraclePool();
  }
}

main().catch(async (error) => {
  console.error(error.message || error);
  await closeOraclePool().catch(() => {});
  process.exitCode = 1;
});
