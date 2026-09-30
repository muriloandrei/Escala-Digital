const { initOraclePool, closeOraclePool } = require('../src/db/oracle');
const { getEnv } = require('../src/config/env');
const { listPendenciasRm, processarPendenciasRm } = require('../src/services/rmIntegrationService');

function option(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1];
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
  const apply = process.argv.includes('--apply');
  await initOraclePool();
  try {
    if (!apply) {
      const pendencias = await listPendenciasRm({ lojaId, limit });
      console.log(`${pendencias.length} pendencia(s) PENDENTE na previa; nenhum envio iniciado.`);
      for (const envio of pendencias) {
        console.log(`envio=${envio.ENVIO_ID} loja=${envio.LOJA} secao=${envio.ESCSECAO_ID} revisao=${envio.REVISAO}`);
      }
      return;
    }
    if (!getEnv().rm.enabled) throw new Error('Integracao RM desabilitada. Nenhum envio foi iniciado.');
    const resultados = await processarPendenciasRm({ lojaId, limit });
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
