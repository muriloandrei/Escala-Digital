const { closeOraclePool } = require('../src/db/oracle');
const { liberarEscalasMensais } = require('../src/services/monthlyReleaseService');
const { getOperationalPeriodIso } = require('../src/domain/operationalPeriod');
const auditService = require('../src/services/auditService');

function parseArgs(argv) {
  const args = { mesRef: null, apply: false, by: null, loja: null };
  let dryRun = false;
  for (const arg of argv) {
    if (/^--mes=\d{4}-(0[1-9]|1[0-2])$/.test(arg) && !args.mesRef) {
      args.mesRef = `${arg.slice(6)}-01`;
    } else if (arg === '--apply' && !args.apply && !dryRun) {
      args.apply = true;
    } else if (arg === '--dry-run' && !args.apply && !dryRun) {
      dryRun = true;
    } else if (/^--by=[\w.-]{2,80}$/.test(arg) && !args.by) {
      args.by = arg.slice(5);
    } else if (/^--loja=[1-9]\d*$/.test(arg) && !args.loja
      && Number.isSafeInteger(Number(arg.slice(7)))) {
      args.loja = Number(arg.slice(7));
    } else {
      throw new Error(`Argumento desconhecido ou repetido: ${arg}`);
    }
  }
  if (!args.mesRef) throw new Error('Informe --mes=AAAA-MM.');
  if (args.apply !== Boolean(args.by)) throw new Error('Para aplicar, informe --apply --by=LOGIN_DO_OPERADOR.');
  return args;
}

async function run(argv = process.argv.slice(2), dependencies = {}) {
  const args = parseArgs(argv);
  const periodo = getOperationalPeriodIso(args.mesRef);
  const release = dependencies.liberarEscalasMensais || liberarEscalasMensais;
  const audit = dependencies.registerAudit || auditService.registerAudit;
  const results = await release({ mesRef: args.mesRef, dryRun: !args.apply,
    ...(args.loja ? { lojas: [args.loja] } : {}) });
  console.log(`${args.apply ? 'APLICACAO' : 'PREVIA'} - ${args.mesRef.slice(0, 7)} - ` +
    `${periodo.inicio} a ${periodo.fim} - ${results.length} loja(s)`);
  for (const result of results) {
    const status = result.erro ? `ERRO: ${result.erro}`
      : result.criada ? `LIBERADA (${result.funcionarios} funcionario(s))`
        : result.prevista ? `PREVISTA (${result.funcionarios} funcionario(s))`
          : `IGNORADA: ${result.motivo}`;
    console.log(`Loja ${result.lojaId}: ${status}`);
    if (args.apply && result.criada) {
      await audit({
        action: 'LIBERAR_ESCALA_MENSAL',
        user: { login: args.by, perfil: 'OPERACAO' },
        lojaId: result.lojaId,
        mesRef: args.mesRef,
        details: { origem: 'script_liberacao_mensal', funcionarios: result.funcionarios,
          inicio: periodo.inicio, fim: periodo.fim }
      });
    }
  }
  const count = (key) => results.filter((result) => result[key]).length;
  console.log(`Resumo: ${count(args.apply ? 'criada' : 'prevista')} ` +
    `${args.apply ? 'liberada(s)' : 'prevista(s)'}, ` +
    `${results.filter((result) => result.motivo).length} ignorada(s), ${count('erro')} erro(s).`);
  if (results.length === 0 || count('erro')) process.exitCode = 1;
  return results;
}

if (require.main === module) {
  run().catch((error) => {
    console.error(`Liberacao interrompida: ${error.message}`);
    process.exitCode = 1;
  }).finally(() => closeOraclePool());
}

module.exports = { parseArgs, run };
