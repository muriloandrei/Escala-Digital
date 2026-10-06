const { closeOraclePool } = require('../src/db/oracle');
const { liberarEscalasMensais } = require('../src/services/monthlyReleaseService');
const auditService = require('../src/services/auditService');

const MES_REF = '2026-11-01';

function parseArgs(argv) {
  const args = { apply: false, by: null };
  for (const arg of argv) {
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry-run') args.apply = false;
    else if (arg.startsWith('--by=')) args.by = arg.slice(5).trim();
    else throw new Error(`Argumento desconhecido: ${arg}`);
  }
  if (args.apply && !/^[\w.-]{2,80}$/.test(args.by || '')) {
    throw new Error('Para aplicar, informe --by=LOGIN_DO_OPERADOR.');
  }
  return args;
}

async function run(argv = process.argv.slice(2), dependencies = {}) {
  const args = parseArgs(argv);
  const release = dependencies.liberarEscalasMensais || liberarEscalasMensais;
  const audit = dependencies.registerAudit || auditService.registerAudit;
  const results = await release({ mesRef: MES_REF, dryRun: !args.apply });
  console.log(`${args.apply ? 'APLICACAO' : 'PREVIA'} - novembro/2026 - ${results.length} loja(s)`);
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
        mesRef: MES_REF,
        details: { origem: 'script_novembro_2026', funcionarios: result.funcionarios }
      });
    }
  }
  const count = (key) => results.filter((result) => result[key]).length;
  console.log(`Resumo: ${count(args.apply ? 'criada' : 'prevista')} ${args.apply ? 'liberada(s)' : 'prevista(s)'}, ${results.filter((result) => result.motivo).length} ignorada(s), ${count('erro')} erro(s).`);
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
