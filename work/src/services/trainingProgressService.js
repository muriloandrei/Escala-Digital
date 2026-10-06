const { withConnection, oracledb } = require('../db/oracle');
const { TRAINING_VERSION: VERSION, LAST_STAGE } = require('../config/trainingStages');

function stageOf(row) {
  if (Number(row?.VERSAO) === VERSION) return Number(row.ETAPA);
  if (Number(row?.VERSAO) === 2 && Number(row.ETAPA) >= 12) return LAST_STAGE;
  return 0;
}

function missingTable(error) {
  return Number(error?.errorNum) === 942 || /ORA-00942/.test(String(error?.message || ''));
}

function outdatedStageConstraint(error) {
  return Number(error?.errorNum) === 2290
    && /SGN_ESC_TREINAMENTO_ETAPA_CK/i.test(String(error?.message || ''));
}

async function getProgress(usuarioId) {
  return withConnection(async (connection) => {
    try {
      const result = await connection.execute(
        'select versao, etapa from sgn_esc_treinamento where usuario_id = :usuarioId',
        { usuarioId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const row = result.rows[0];
      return { version: VERSION, stage: stageOf(row),
        found: Boolean(row), persisted: true };
    } catch (error) {
      if (missingTable(error)) return { version: VERSION, stage: 0, found: false, persisted: false };
      throw error;
    }
  });
}

async function saveProgress(usuarioId, stage) {
  if (!Number.isInteger(stage) || stage < 0 || stage > LAST_STAGE) {
    const error = new Error('Etapa de treinamento invalida.');
    error.statusCode = 400;
    throw error;
  }
  return withConnection(async (connection) => {
    try {
      const currentResult = await connection.execute(
        'select versao, etapa from sgn_esc_treinamento where usuario_id = :usuarioId for update',
        { usuarioId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const current = currentResult.rows[0];
      const currentStage = stageOf(current);
      if (stage > currentStage + 1) {
        const invalid = new Error('Conclua a etapa atual antes de avancar no treinamento.');
        invalid.statusCode = 422;
        throw invalid;
      }
      await connection.execute(
        `merge into sgn_esc_treinamento t
         using (select :usuarioId usuario_id from dual) src on (t.usuario_id = src.usuario_id)
         when matched then update set t.versao = :versao, t.etapa = greatest(case when t.versao = :versao then t.etapa else 0 end, :etapa), t.dt_hr_alter = sysdate
         when not matched then insert (usuario_id, versao, etapa, dt_hr_alter) values (:usuarioId, :versao, :etapa, sysdate)`,
        { usuarioId, versao: VERSION, etapa: stage }, { autoCommit: true }
      );
      const readback = await connection.execute(
        'select versao, etapa from sgn_esc_treinamento where usuario_id = :usuarioId',
        { usuarioId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return { version: VERSION, stage: Number(readback.rows[0]?.ETAPA ?? stage), found: true, persisted: true };
    } catch (error) {
      if (missingTable(error)) {
        const unavailable = new Error('Migracao de treinamento nao aplicada.');
        unavailable.statusCode = 503;
        throw unavailable;
      }
      if (outdatedStageConstraint(error)) {
        const unavailable = new Error('Migration 20261006_treinamento_tour_v3.sql pendente no Oracle.');
        unavailable.statusCode = 503;
        throw unavailable;
      }
      throw error;
    }
  });
}

async function resetProgress(usuarioId) {
  return withConnection(async (connection) => {
    try {
      await connection.execute(
        `merge into sgn_esc_treinamento t
         using (select :usuarioId usuario_id from dual) src on (t.usuario_id = src.usuario_id)
         when matched then update set t.versao = :versao, t.etapa = 0, t.dt_hr_alter = sysdate
         when not matched then insert (usuario_id, versao, etapa, dt_hr_alter) values (:usuarioId, :versao, 0, sysdate)`,
        { usuarioId, versao: VERSION }, { autoCommit: true }
      );
      return { version: VERSION, stage: 0, found: true, persisted: true };
    } catch (error) {
      if (missingTable(error)) return { version: VERSION, stage: 0, found: false, persisted: false };
      throw error;
    }
  });
}

module.exports = { getProgress, saveProgress, resetProgress, _private: { missingTable, outdatedStageConstraint } };
