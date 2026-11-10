const { initOraclePool, closeOraclePool } = require('../src/db/oracle');
const { getEnv } = require('../src/config/env');
const rm = require('../src/services/rmIntegrationService');

function parseArgs(args) {
  const lojaArg = args.find((arg) => /^--loja=[1-9]\d*$/.test(arg));
  const all = args.includes('--all');
  const apply = args.includes('--apply');
  const byArg = args.find((arg) => /^--by=[\w.@-]{2,80}$/.test(arg));
  const maxIdArg = args.find((arg) => /^--max-id=[1-9]\d*$/.test(arg));
  if (Boolean(lojaArg) === all || (apply && (!byArg || !maxIdArg)) || (!apply && (byArg || maxIdArg))
    || args.length !== 1 + Number(apply) + Number(Boolean(byArg)) + Number(Boolean(maxIdArg))) {
    throw new Error('Use --loja=NUMERO ou --all [--apply --by=OPERADOR --max-id=ID_DA_PREVIA].');
  }
  return { lojaId: lojaArg ? Number(lojaArg.slice(7)) : null, apply,
    operador: byArg?.slice(5) || null, maxIdAprovado: maxIdArg ? Number(maxIdArg.slice(9)) : null };
}

function mesIso(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '').slice(0, 10);
}

async function main() {
  const { lojaId, apply, operador, maxIdAprovado } = parseArgs(process.argv.slice(2));
  if (apply && !getEnv().rm.enabled) throw new Error('Integracao RM desabilitada.');
  await initOraclePool();
  try {
    const maiorAtual = await rm.getMaiorEnvioErroId({ lojaId });
    if (apply && maxIdAprovado > maiorAtual) throw new Error('--max-id excede o maior envio com erro atual. Refaca a previa.');
    const maxId = apply ? maxIdAprovado : maiorAtual;
    const contagem = {};
    let afterId = 0;
    console.log(`${apply ? 'APLICACAO' : 'PREVIA'} de envios RM com erro; loja=${lojaId ?? 'todas'}; ate envio_id=${maxId}${operador ? `; operador=${operador}` : ''}.`);
    while (afterId < maxId) {
      const grupos = await rm.listarGruposRmComErro({ lojaId, afterId, maxId, limit: 100 });
      if (!grupos.length) break;
      for (const grupo of grupos) {
        afterId = Number(grupo.PRIMEIRO_ENVIO_ID);
        let resultado;
        try {
          resultado = apply ? await rm.reprocessarGrupoRmComErro(grupo)
            : await rm.prepararGrupoRmComErro(grupo);
        } catch (error) {
          resultado = { acao: 'VERIFICAR', motivo: error.message };
        }
        const acao = resultado.acao || 'VERIFICAR';
        contagem[acao] = (contagem[acao] || 0) + 1;
        console.log(`envio_origem=${afterId} loja=${grupo.LOJA} escfunc_id=${grupo.ESCFUNC_ID} mes=${mesIso(grupo.MES_REF)} revisao_atual=${resultado.revisao ?? '-'} envio_atual=${resultado.envio?.ENVIO_ID ?? '-'} acao=${acao} modo=${resultado.modo || '-'}${resultado.motivo ? ` motivo=${resultado.motivo}` : ''}`);
      }
    }
    console.log(`Resumo: ${JSON.stringify(contagem)}. ${apply ? 'Confira os envios com acao diferente de ENVIADO/JA_ENVIADO.' : 'Nenhum POST executado.'}`);
    if (apply && Object.entries(contagem).some(([acao, qtd]) => qtd > 0 && !['ENVIADO', 'JA_ENVIADO'].includes(acao))) {
      process.exitCode = 1;
    }
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Reprocessamento interrompido: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { parseArgs, main };
