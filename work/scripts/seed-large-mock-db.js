const fs = require('fs');
const path = require('path');

const defaultTarget = path.join(__dirname, '..', 'data', 'mock-db.json');
const now = '2026-06-07T00:00:00.000Z';
const passwordHash = '$2a$10$oPhuoFYAEfKAVXvDkIKGj.gdiSmhg0wuGCPux7ibTT/q0kmrSCN7W';

const nomes = [
  'Ana Souza', 'Carlos Lima', 'Beatriz Rocha', 'Diego Martins',
  'Fernanda Alves', 'Gustavo Pereira', 'Helena Costa', 'Igor Nunes',
  'Juliana Melo', 'Lucas Santos', 'Marina Duarte', 'Rafael Gomes'
];

const funcoes = [
  { ESCFUNCAO_ID: 1, CODCOLIGADA: 1, COD_FUNCAO: 'OPER', DESCR: 'Operador de Loja', STATUS: 'A', DT_HR_INCL: now },
  { ESCFUNCAO_ID: 2, CODCOLIGADA: 1, COD_FUNCAO: 'CAIXA', DESCR: 'Operador de Caixa', STATUS: 'A', DT_HR_INCL: now },
  { ESCFUNCAO_ID: 3, CODCOLIGADA: 1, COD_FUNCAO: 'REPOS', DESCR: 'Repositor', STATUS: 'A', DT_HR_INCL: now },
  { ESCFUNCAO_ID: 4, CODCOLIGADA: 1, COD_FUNCAO: 'LIDER', DESCR: 'Lider de Setor', STATUS: 'A', DT_HR_INCL: now }
];

const secoes = [
  { ESCSECAO_ID: 1, LOJA: 0, COD_SECAO: 'FRENTE', DESCR: 'Frente de Caixa', DT_HR_INCL: now },
  { ESCSECAO_ID: 2, LOJA: 0, COD_SECAO: 'MERCE', DESCR: 'Mercearia', DT_HR_INCL: now },
  { ESCSECAO_ID: 3, LOJA: 0, COD_SECAO: 'PEREC', DESCR: 'Pereciveis', DT_HR_INCL: now },
  { ESCSECAO_ID: 4, LOJA: 0, COD_SECAO: 'BAZAR', DESCR: 'Bazar', DT_HR_INCL: now }
];

function pad(value, size = 6) {
  return String(value).padStart(size, '0');
}

function buildFuncionario({ loja, index, escfuncId }) {
  const nomeBase = nomes[index % nomes.length];
  const funcaoId = (index % funcoes.length) + 1;
  const secaoId = (index % secoes.length) + 1;
  const tarde = index % 3 === 1;
  const noite = index % 3 === 2;

  return {
    ESCFUNC_ID: escfuncId,
    CODCOLIGADA: 1,
    LOJA: loja,
    CHAPA: pad((loja * 100) + index + 1),
    NOME: `${nomeBase} ${loja}-${index + 1}`,
    DT_ADMISS: `202${index % 5}-0${(index % 8) + 1}-1${index % 9}`,
    BRIGADISTA: index % 4 === 0 ? 'S' : 'N',
    ESCSECAO_ID: secaoId,
    ESCFUNCAO_ID: funcaoId,
    HR_ENT1: tarde ? '13:00' : noite ? '14:00' : '06:00',
    HR_SAI1: tarde ? '17:00' : noite ? '18:00' : '11:00',
    HR_ENT2: tarde ? '18:00' : noite ? '19:00' : '12:50',
    HR_SAI2: tarde ? '22:20' : noite ? '23:20' : '15:10',
    DT_HR_INCL: now
  };
}

function buildLargeMockData() {
  const lojas = [];
  const funcionarios = [];
  const ausencias = [];
  const usuarios = [
    {
      USUARIO_ID: 1,
      LOGIN: 'admin',
      NOME: 'Administrador Local',
      SENHA_HASH: passwordHash,
      PERFIL: 'ADMIN',
      STATUS: 'A',
      DT_HR_INCL: now
    },
    {
      USUARIO_ID: 2,
      LOGIN: 'regional1',
      NOME: 'Regional 1',
      SENHA_HASH: passwordHash,
      PERFIL: 'REGIONAL',
      STATUS: 'A',
      DT_HR_INCL: now
    }
  ];
  const usuarioLojas = [];

  let escfuncId = 1;
  let escausenId = 1;
  let usuarioId = 3;

  for (let i = 0; i < 70; i += 1) {
    const loja = 101 + i;
    lojas.push({
      ESCLOJA_ID: i + 1,
      LOJA: loja,
      QTDE_BRIGADISTA_EXIGIDO: 2,
      QTDE_BRIGADISTA_EXIGIDO_DIA: 1
    });

    usuarioLojas.push({ USUARIO_ID: 1, LOJA: loja });
    if (i < 20) usuarioLojas.push({ USUARIO_ID: 2, LOJA: loja });

    usuarios.push({
      USUARIO_ID: usuarioId,
      LOGIN: `gerente${loja}`,
      NOME: `Gerente Loja ${loja}`,
      SENHA_HASH: passwordHash,
      PERFIL: 'GERENTE',
      STATUS: 'A',
      DT_HR_INCL: now
    });
    usuarioLojas.push({ USUARIO_ID: usuarioId, LOJA: loja });
    usuarioId += 1;

    for (let j = 0; j < 8; j += 1) {
      const funcionario = buildFuncionario({ loja, index: j, escfuncId });
      funcionarios.push(funcionario);

      if (j === 1 && i % 5 === 0) {
        ausencias.push({
          ESCAUSEN_ID: escausenId,
          ESCFUNC_ID: escfuncId,
          CHAPA: funcionario.CHAPA,
          DT_INIC: '2026-06-10',
          DT_FIM: '2026-06-12',
          MOTIVO: 'Ferias',
          DT_HR_INCL: now
        });
        escausenId += 1;
      }

      if (j === 4 && i % 7 === 0) {
        ausencias.push({
          ESCAUSEN_ID: escausenId,
          ESCFUNC_ID: escfuncId,
          CHAPA: funcionario.CHAPA,
          DT_INIC: '2026-06-22',
          DT_FIM: '2026-06-22',
          MOTIVO: 'Atestado',
          DT_HR_INCL: now
        });
        escausenId += 1;
      }

      escfuncId += 1;
    }
  }

  return {
    SGN_ESC_USUARIO: usuarios,
    SGN_ESC_USUARIO_LOJA: usuarioLojas,
    SGN_ESC_LOJA: lojas,
    SGN_ESC_FUNCAO: funcoes,
    SGN_ESC_SECAO: secoes,
    SGN_ESC_FUNC: funcionarios,
    SGN_ESC_AUSENCIA: ausencias,
    SGN_ESC_PROG: [],
    SGN_ESC_PROG_DIA: [],
    SGN_ESC_AUDITORIA: [],
    APP_STATE: {}
  };
}

function seedLargeMockDb(target = process.env.MOCK_DB_FILE || defaultTarget) {
  const data = buildLargeMockData();
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return {
    target,
    lojas: data.SGN_ESC_LOJA.length,
    funcionarios: data.SGN_ESC_FUNC.length,
    usuarios: data.SGN_ESC_USUARIO.length,
    ausencias: data.SGN_ESC_AUSENCIA.length
  };
}

if (require.main === module) {
  const result = seedLargeMockDb();
  console.log(`Mock grande gerado em ${result.target}`);
  console.log(`${result.lojas} lojas, ${result.funcionarios} funcionarios, ${result.usuarios} usuarios, ${result.ausencias} ausencias`);
}

module.exports = { buildLargeMockData, seedLargeMockDb };
