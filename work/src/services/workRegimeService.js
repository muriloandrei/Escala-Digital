const { withConnection, oracledb } = require('../db/oracle');
const escalaEventService = require('./escalaEventService');
const { REGULAR, TWELVE_THIRTY_SIX, isIsoDate } = require('../domain/workRegime');

function isPostStore(lojaId) {
  const loja = Number(lojaId);
  return Number.isInteger(loja) && loja >= 700 && loja <= 799;
}

function monthStart(value) {
  return isIsoDate(value) && value.endsWith('-01');
}

async function listEffective(connection, { lojaId, mesRef }) {
  if (!isPostStore(lojaId)) return new Map();
  const result = await connection.execute(
    `select escfunc_id, regime, to_char(mes_inicio, 'YYYY-MM-DD') mes_inicio,
            to_char(dt_ancora, 'YYYY-MM-DD') dt_ancora,
            hr_ent1, hr_sai1, hr_ent2, hr_sai2
       from (
         select r.*, row_number() over (
           partition by r.escfunc_id order by r.mes_inicio desc, r.regime_id desc) rn
           from sgn_esc_regime_func r
          where r.loja = :lojaId and r.mes_inicio <= to_date(:mesRef, 'YYYY-MM-DD')
       ) where rn = 1`,
    { lojaId: Number(lojaId), mesRef }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Map((result.rows || []).map((row) => [Number(row.ESCFUNC_ID), row]));
}

async function configure({ lojaId, escfuncId, mesInicio, regime, dtAncora = null, hours = null, actor }) {
  if (!isPostStore(lojaId)) {
    const error = new Error('Regime por funcionario disponivel apenas nos postos 700 a 799.');
    error.statusCode = 422;
    throw error;
  }
  if (!monthStart(mesInicio) || ![REGULAR, TWELVE_THIRTY_SIX].includes(regime)
    || (regime === TWELVE_THIRTY_SIX && !isIsoDate(dtAncora))) {
    const error = new Error('Regime, mes de inicio ou data ancora invalidos.');
    error.statusCode = 422;
    throw error;
  }
  if (regime === TWELVE_THIRTY_SIX) {
    const { validate12x36Shift } = require('../domain/shiftValidation');
    const errors = validate12x36Shift(hours || {});
    if (errors.length) {
      const error = new Error(errors[0]);
      error.statusCode = 422;
      error.details = errors;
      throw error;
    }
  }
  return withConnection(async (connection) => {
    try {
      const employee = await connection.execute(
        `select escfunc_id, chapa, escsecao_id, nome, dt_demiss
           from sgn_esc_funcionario
          where loja = :lojaId and escfunc_id = :escfuncId
          for update wait 5`,
        { lojaId: Number(lojaId), escfuncId: Number(escfuncId) }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const person = employee.rows?.[0];
      if (!person) return null;
      if (person.DT_DEMISS) {
        const error = new Error('Funcionario desligado nao pode mudar de regime.');
        error.statusCode = 422;
        throw error;
      }
      const official = await connection.execute(
        `select count(*) total from sgn_esc_prog p
          where p.loja = :lojaId and p.escfunc_id = :escfuncId
            and p.mes_ref >= to_date(:mesInicio, 'YYYY-MM-DD')
            and nvl(p.ativa, 1) = 1 and nvl(p.oficializada, 0) = 1`,
        { lojaId: Number(lojaId), escfuncId: Number(escfuncId), mesInicio },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (Number(official.rows?.[0]?.TOTAL || 0) > 0) {
        const error = new Error('Existem escalas oficializadas a partir desta vigencia. Revise-as antes de alterar o regime.');
        error.statusCode = 422;
        throw error;
      }
      const previous = await listEffective(connection, { lojaId, mesRef: mesInicio });
      const previousConfig = previous.get(Number(escfuncId));
      const result = await connection.execute(
        `insert into sgn_esc_regime_func
           (regime_id, escfunc_id, loja, mes_inicio, regime, dt_ancora,
            hr_ent1, hr_sai1, hr_ent2, hr_sai2, login, dt_hr_incl)
         values (sgn_esc_regime_func_seq.nextval, :escfuncId, :lojaId,
           to_date(:mesInicio, 'YYYY-MM-DD'), :regime,
           to_date(:dtAncora, 'YYYY-MM-DD'), :hrEnt1, :hrSai1, :hrEnt2, :hrSai2, :login, sysdate)`,
        { escfuncId: Number(escfuncId), lojaId: Number(lojaId), mesInicio, regime,
          dtAncora: regime === TWELVE_THIRTY_SIX ? dtAncora : null,
          hrEnt1: regime === TWELVE_THIRTY_SIX ? hours.HR_ENT1 : null,
          hrSai1: regime === TWELVE_THIRTY_SIX ? hours.HR_SAI1 : null,
          hrEnt2: regime === TWELVE_THIRTY_SIX ? hours.HR_ENT2 : null,
          hrSai2: regime === TWELVE_THIRTY_SIX ? hours.HR_SAI2 : null,
          login: String(actor?.login || 'SISTEMA').slice(0, 100) }, { autoCommit: false }
      );
      await escalaEventService.appendEvent(connection, {
        operacaoId: escalaEventService.createOperationId(), lojaId, mesRef: mesInicio,
        escfuncId, escsecaoId: Number(person.ESCSECAO_ID), actor,
        acao: 'CONFIGURAR_REGIME', origem: 'USUARIO', situacao: 'CADASTRO',
        detalhe: { chapa: person.CHAPA, anterior: previousConfig || { REGIME: REGULAR },
          novo: { regime, dtAncora, hours: regime === TWELVE_THIRTY_SIX ? hours : null } }
      });
      await connection.commit();
      return { regime, mesInicio, dtAncora: regime === TWELVE_THIRTY_SIX ? dtAncora : null,
        requiresRegeneration: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

module.exports = { isPostStore, listEffective, configure };
