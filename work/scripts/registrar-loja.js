const { initOraclePool, closeOraclePool, withConnection } = require('../src/db/oracle');
const { diagnosticar, parseLoja } = require('./diagnosticar-loja');

function parseArgs(argv) {
  const lojaArg = argv.find((arg) => arg.startsWith('--loja='));
  const loja = parseLoja(lojaArg ? [lojaArg] : []);
  const apply = argv.includes('--apply');
  const byArg = argv.find((arg) => arg.startsWith('--by='));
  const by = byArg?.slice('--by='.length) || null;
  if (argv.length !== 1 + Number(apply) + Number(Boolean(byArg))
      || (apply && !/^[a-zA-Z0-9._-]{2,80}$/.test(by || ''))
      || (!apply && byArg)) {
    throw new Error('Use --loja=NUMERO [--apply --by=OPERADOR].');
  }
  return { loja, apply, by };
}

function getCodcoligadaConfirmada(diagnostico) {
  const funcionarios = diagnostico.funcionarios || [];
  const secoes = (diagnostico.secoes || []).filter((row) => String(row.STATUS).toUpperCase() === 'A');
  const codigos = [...new Set([...funcionarios, ...secoes].map((row) => Number(row.CODCOLIGADA)))];
  if (!funcionarios.some((row) => Number(row.ATIVOS) > 0) || !secoes.length
      || codigos.length !== 1 || !Number.isSafeInteger(codigos[0]) || codigos[0] <= 0) {
    throw new Error('Cadastro incompleto ou coligadas divergentes. Confira colaboradores ativos e secoes ativas antes de registrar a loja.');
  }
  return codigos[0];
}

async function registrar(connection, { loja, apply, by }, log = console.log) {
  const diagnostico = await diagnosticar(connection, loja);
  const codcoligada = getCodcoligadaConfirmada(diagnostico);
  if (diagnostico.catalogo) {
    if (Number(diagnostico.catalogo.CODCOLIGADA) !== codcoligada) {
      throw new Error(`Loja ${loja} ja cadastrada com coligada diferente. Nenhuma alteracao executada.`);
    }
    log(`Loja ${loja} ja cadastrada na coligada ${codcoligada}. Nenhuma alteracao executada.`);
    return { cadastrada: false, jaExistia: true };
  }
  log(`Loja ${loja}: ${diagnostico.funcionarios.reduce((total, row) => total + Number(row.ATIVOS || 0), 0)} colaborador(es) ativo(s), ${diagnostico.secoes.reduce((total, row) => total + Number(row.TOTAL || 0), 0)} secao(oes) ativa(s), coligada ${codcoligada}.`);
  if (!apply) {
    log('PREVIA: nenhum dado alterado. Para registrar, use --apply --by=OPERADOR.');
    return { cadastrada: false, jaExistia: false };
  }

  try {
    const result = await connection.execute(
      `insert into sgn_esc_loja
         (escloja_id, loja, codcoligada, qtde_brigadista_exigido, qtde_brigadista_exigido_dia)
       select sgn_esc_loja_seq.nextval, :loja, :codcoligada, 0, 0
         from dual where not exists (select 1 from sgn_esc_loja where loja = :loja)`,
      { loja, codcoligada }, { autoCommit: false }
    );
    if (result.rowsAffected !== 1) {
      throw new Error(`Loja ${loja} foi cadastrada por outra sessao. Execute a previa novamente.`);
    }
    await connection.commit();
    log(`Loja ${loja} registrada por ${by}. Atualize os filtros e vincule apenas contas autorizadas.`);
    return { cadastrada: true, jaExistia: false };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await initOraclePool();
  try {
    await withConnection((connection) => registrar(connection, args));
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Registro interrompido: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { parseArgs, getCodcoligadaConfirmada, registrar };
