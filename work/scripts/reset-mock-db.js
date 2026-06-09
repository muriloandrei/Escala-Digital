const fs = require('fs');
const path = require('path');

const defaultTarget = path.join(__dirname, '..', 'data', 'mock-db.json');

const mockData = {
  SGN_ESC_USUARIO: [
    {
      USUARIO_ID: 1,
      LOGIN: 'admin',
      NOME: 'Administrador Local',
      SENHA_HASH: '$2a$10$oPhuoFYAEfKAVXvDkIKGj.gdiSmhg0wuGCPux7ibTT/q0kmrSCN7W',
      PERFIL: 'ADMIN',
      STATUS: 'A',
      DT_HR_INCL: '2026-06-07T00:00:00.000Z'
    },
    {
      USUARIO_ID: 2,
      LOGIN: 'gerente101',
      NOME: 'Gerente Loja 101',
      SENHA_HASH: '$2a$10$oPhuoFYAEfKAVXvDkIKGj.gdiSmhg0wuGCPux7ibTT/q0kmrSCN7W',
      PERFIL: 'GERENTE',
      STATUS: 'A',
      DT_HR_INCL: '2026-06-07T00:00:00.000Z'
    }
  ],
  SGN_ESC_USUARIO_LOJA: [
    { USUARIO_ID: 1, LOJA: 101 },
    { USUARIO_ID: 1, LOJA: 102 },
    { USUARIO_ID: 2, LOJA: 101 }
  ],
  SGN_ESC_LOJA: [
    { ESCLOJA_ID: 1, LOJA: 101, QTDE_BRIGADISTA_EXIGIDO: 2, QTDE_BRIGADISTA_EXIGIDO_DIA: 1 },
    { ESCLOJA_ID: 2, LOJA: 102, QTDE_BRIGADISTA_EXIGIDO: 2, QTDE_BRIGADISTA_EXIGIDO_DIA: 1 }
  ],
  SGN_ESC_FUNC: [
    {
      ESCFUNC_ID: 1,
      CODCOLIGADA: 1,
      LOJA: 101,
      CHAPA: '000101',
      NOME: 'Ana Souza',
      DT_ADMISS: '2022-03-14',
      BRIGADISTA: 'S',
      ESCSECAO_ID: 1,
      ESCFUNCAO_ID: 1,
      HR_ENT1: '08:00',
      HR_SAI1: '12:00',
      HR_ENT2: '13:00',
      HR_SAI2: '17:20',
      DT_HR_INCL: '2026-06-07T00:00:00.000Z'
    },
    {
      ESCFUNC_ID: 2,
      CODCOLIGADA: 1,
      LOJA: 101,
      CHAPA: '000102',
      NOME: 'Carlos Lima',
      DT_ADMISS: '2021-11-08',
      BRIGADISTA: 'N',
      ESCSECAO_ID: 1,
      ESCFUNCAO_ID: 2,
      HR_ENT1: '13:00',
      HR_SAI1: '17:00',
      HR_ENT2: '18:00',
      HR_SAI2: '22:20',
      DT_HR_INCL: '2026-06-07T00:00:00.000Z'
    },
    {
      ESCFUNC_ID: 3,
      CODCOLIGADA: 1,
      LOJA: 102,
      CHAPA: '000201',
      NOME: 'Beatriz Rocha',
      DT_ADMISS: '2020-01-20',
      BRIGADISTA: 'S',
      ESCSECAO_ID: 2,
      ESCFUNCAO_ID: 1,
      HR_ENT1: '07:00',
      HR_SAI1: '11:00',
      HR_ENT2: '12:00',
      HR_SAI2: '16:20',
      DT_HR_INCL: '2026-06-07T00:00:00.000Z'
    }
  ],
  SGN_ESC_AUSENCIA: [
    {
      ESCAUSEN_ID: 1,
      ESCFUNC_ID: 2,
      CHAPA: '000102',
      DT_INIC: '2026-06-10',
      DT_FIM: '2026-06-12',
      MOTIVO: 'Ferias',
      DT_HR_INCL: '2026-06-07T00:00:00.000Z'
    }
  ],
  SGN_ESC_PROG: [],
  SGN_ESC_PROG_DIA: [],
  SGN_ESC_AUDITORIA: [],
  APP_STATE: {}
};

function resetMockDb(target = process.env.MOCK_DB_FILE || defaultTarget) {
  fs.writeFileSync(target, `${JSON.stringify(mockData, null, 2)}\n`, 'utf8');
  return target;
}

if (require.main === module) {
  console.log(`Mock database reset: ${resetMockDb()}`);
}

module.exports = { resetMockDb, mockData };
