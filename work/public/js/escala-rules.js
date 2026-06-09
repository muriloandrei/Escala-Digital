// Etapa seguinte: extrair para ca as regras atuais do arquivo index.php original.
// Enquanto isso, este arquivo existe para manter a fronteira da regra bem definida.

const escalaRules = {
  validarPayloadBasico(payload) {
    const errors = [];
    if (!payload?.lojaId) errors.push('Loja obrigatoria.');
    if (!payload?.mesRef) errors.push('Mes de referencia obrigatorio.');
    return errors;
  }
};
