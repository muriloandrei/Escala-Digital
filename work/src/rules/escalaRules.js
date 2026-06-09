// Este modulo deve receber a regra atual extraida do index.php original.
// A regra sera movida em etapa separada com testes de regressao para evitar
// mudancas acidentais no calculo da escala.

function validateEscalaPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return ['Payload da escala invalido.'];
  }

  const errors = [];
  if (!payload.lojaId) errors.push('Loja obrigatoria.');
  if (!payload.mesRef) errors.push('Mes de referencia obrigatorio.');
  if (!Array.isArray(payload.funcionarios)) errors.push('Lista de funcionarios obrigatoria.');

  return errors;
}

module.exports = { validateEscalaPayload };
