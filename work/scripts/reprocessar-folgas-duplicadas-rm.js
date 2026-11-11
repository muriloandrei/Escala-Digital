const { initOraclePool, closeOraclePool } = require('../src/db/oracle');
const { getEnv } = require('../src/config/env');
const { getOperationalPeriodIso } = require('../src/domain/operationalPeriod');
const rm = require('../src/services/rmIntegrationService');

function parseArgs(args) {
  const firstArg = args.find((arg) => /^--primeiro=[1-9]\d*$/.test(arg));
  const maxArg = args.find((arg) => /^--max-id=[1-9]\d*$/.test(arg));
  const apply = args.includes('--apply');
  const byArg = args.find((arg) => /^--by=[\w.@-]{2,80}$/.test(arg));
  if (!firstArg || (apply && (!maxArg || !byArg)) || (!apply && (maxArg || byArg))
    || args.length !== 1 + Number(apply) + Number(Boolean(maxArg)) + Number(Boolean(byArg))) {
    throw new Error('Use --primeiro=ENVIO_ID [--apply --by=OPERADOR --max-id=ID_DA_PREVIA].');
  }
  return { primeiroId: Number(firstArg.slice(11)), apply,
    maxId: maxArg ? Number(maxArg.slice(9)) : null, operador: byArg?.slice(5) || null };
}

function mesmaPessoa(grupo, primeiro) {
  const mes = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  return Number(grupo.LOJA) === Number(primeiro.LOJA)
    && Number(grupo.ESCFUNC_ID) === Number(primeiro.ESCFUNC_ID)
    && mes(grupo.MES_REF) === mes(primeiro.MES_REF);
}

async function main() {
  const { primeiroId, apply, maxId, operador } = parseArgs(process.argv.slice(2));
  if (apply && !getEnv().rm.enabled) throw new Error('Integracao RM desabilitada.');
  await initOraclePool();
  try {
    const primeiro = await rm.getGrupoRmComErroPorEnvioId({ envioId: primeiroId });
    if (!primeiro) throw new Error(`Envio ${primeiroId} nao encontrado.`);
    if (['INCERTO', 'FALHA'].includes(primeiro.STATUS) && !/Chave duplicada/i.test(String(primeiro.ERRO || ''))) {
      throw new Error(`Envio ${primeiroId} tem outro erro atual; validacao interrompida.`);
    }
    const maior = await rm.getMaiorEnvioErroId({ erroTipo: 'duplicada' });
    const limite = apply ? maxId : maior;
    if (limite > maior) throw new Error('Limite da previa invalido; refaca a consulta.');
    const periodo = getOperationalPeriodIso(primeiro.MES_REF instanceof Date
      ? primeiro.MES_REF.toISOString().slice(0, 10) : String(primeiro.MES_REF).slice(0, 10));
    const plano = await rm.prepararGrupoRmComErro(primeiro);
    console.log(`VALIDACAO envio=${primeiroId} loja=${primeiro.LOJA} escfunc_id=${primeiro.ESCFUNC_ID}`
      + ` periodo=${periodo.inicio}..${periodo.fim} revisao=${plano.revisao ?? '-'} acao=${plano.acao}`
      + `${plano.motivo ? ` motivo=${plano.motivo}` : ''}`);
    if (!['REPROCESSAR', 'CRIAR_PENDENCIA', 'JA_ENVIADO'].includes(plano.acao)) {
      throw new Error('Primeiro envio nao esta apto; oficialize a revisao atual antes do lote.');
    }
    console.log(`${apply ? 'APLICACAO' : 'PREVIA'} de erros Chave duplicada ate envio_id=${limite}; operador=${operador || '-'}.`);
    if (apply) {
      const resultado = await rm.reprocessarGrupoRmComErro(primeiro);
      console.log(`VALIDACAO envio=${primeiroId} resultado=${resultado.acao}${resultado.motivo ? ` motivo=${resultado.motivo}` : ''}`);
      if (!['ENVIADO', 'JA_ENVIADO'].includes(resultado.acao)) {
        throw new Error('Validacao nao concluiu como ENVIADO; lote nao iniciado.');
      }
    }
    const contagem = {};
    let afterId = 0;
    while (afterId < limite) {
      const grupos = await rm.listarGruposRmComErro({ afterId, maxId: limite, limit: 100, erroTipo: 'duplicada' });
      if (!grupos.length) break;
      for (const grupo of grupos) {
        afterId = Number(grupo.PRIMEIRO_ENVIO_ID);
        if (mesmaPessoa(grupo, primeiro)) continue;
        let resultado;
        try {
          resultado = apply ? await rm.reprocessarGrupoRmComErro(grupo) : await rm.prepararGrupoRmComErro(grupo);
        } catch (error) {
          resultado = { acao: 'VERIFICAR', motivo: error.message };
        }
        contagem[resultado.acao] = (contagem[resultado.acao] || 0) + 1;
        console.log(`envio_origem=${afterId} loja=${grupo.LOJA} escfunc_id=${grupo.ESCFUNC_ID}`
          + ` acao=${resultado.acao}${resultado.motivo ? ` motivo=${resultado.motivo}` : ''}`);
      }
    }
    console.log(`Resumo: ${JSON.stringify(contagem)}.`);
    if (apply && Object.entries(contagem).some(([acao, quantidade]) => quantidade && !['ENVIADO', 'JA_ENVIADO'].includes(acao))) {
      process.exitCode = 1;
    }
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`Reprocessamento interrompido: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { parseArgs, mesmaPessoa, main };
