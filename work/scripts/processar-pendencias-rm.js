const { initOraclePool, closeOraclePool } = require('../src/db/oracle');
const { getEnv } = require('../src/config/env');
const { listPendenciasRm, processarPendenciasRm } = require('../src/services/rmIntegrationService');

function option(name) {
  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1] || null;
  return process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1) || null;
}

function positiveInt(value, name, fallback) {
  if (value === null) return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error(`${name} deve ser um inteiro positivo.`);
  return number;
}

async function main() {
  const lojaId = positiveInt(option('--loja'), '--loja', null);
  const limit = positiveInt(option('--limit'), '--limit', 100);
  if (limit > 500) throw new Error('--limit deve ser no maximo 500.');
  const incertos = process.argv.includes('--incertos');
  const falhas = process.argv.includes('--falhas');
  if (incertos && falhas) throw new Error('Use --incertos ou --falhas, nao ambos.');
  const erroTipo = option('--erro')?.toUpperCase() || null;
  if (erroTipo && !['CODTABFOLGA', 'TIMEOUT'].includes(erroTipo)) throw new Error('--erro deve ser codtabfolga ou timeout.');
  const apply = process.argv.includes('--apply');
  const operador = option('--by');
  if (apply && (incertos || falhas) && !/^[\w.-]{2,50}$/.test(operador || '')) {
    throw new Error('Reprocessamento de INCERTO/FALHA requer --by=OPERADOR.');
  }
  await initOraclePool();
  try {
    if (!apply) {
      const pendencias = await listPendenciasRm({ lojaId, limit, incertos, falhas, erroTipo });
      console.log(`${pendencias.length} envio(s) ${falhas ? 'FALHA' : incertos ? 'INCERTO' : 'PENDENTE'} na previa; nenhum envio iniciado.`);
      for (const envio of pendencias) {
        const apto = Number(envio.REVISAO) === Number(envio.REVISAO_ATUAL) && Number(envio.OFICIALIZADA) === 1;
        console.log(`envio=${envio.ENVIO_ID} loja=${envio.LOJA} chapa=${envio.CHAPA} secao=${envio.ESCSECAO_ID} revisao=${envio.REVISAO} revisao_atual=${envio.REVISAO_ATUAL} oficializada=${envio.OFICIALIZADA} apto=${apto} tentativas=${envio.TENTATIVAS} erro=${envio.ERRO || '-'}`);
      }
      return;
    }
    if (!getEnv().rm.enabled) throw new Error('Integracao RM desabilitada. Nenhum envio foi iniciado.');
    if (operador) console.log(`Reprocessamento solicitado por ${operador}.`);
    const resultados = await processarPendenciasRm({ lojaId, limit, incertos, falhas, erroTipo });
    for (const resultado of resultados) {
      console.log(`envio=${resultado.envioId} status=${resultado.status}${resultado.erro ? ` erro=${resultado.erro}` : ''}`);
    }
    console.log(`${resultados.length} pendencia(s) examinada(s).`);
    if (resultados.some(({ status }) => !['ENVIADO', 'IGNORADO'].includes(status))) process.exitCode = 1;
  } finally {
    await closeOraclePool();
  }
}

main().catch((error) => {
  console.error(`Falha ao processar pendencias RM: ${error.message}`);
  process.exitCode = 1;
});
