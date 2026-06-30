connect ESCALA/escala@FREEPDB1

insert into SGN_ESC_LOJA (ESCLOJA_ID, LOJA, CODCOLIGADA, QTDE_BRIGADISTA_EXIGIDO, QTDE_BRIGADISTA_EXIGIDO_DIA) values (1, 1, 1, 2, 1);
insert into SGN_ESC_LOJA (ESCLOJA_ID, LOJA, CODCOLIGADA, QTDE_BRIGADISTA_EXIGIDO, QTDE_BRIGADISTA_EXIGIDO_DIA) values (2, 2, 1, 2, 1);
insert into SGN_ESC_LOJA (ESCLOJA_ID, LOJA, CODCOLIGADA, QTDE_BRIGADISTA_EXIGIDO, QTDE_BRIGADISTA_EXIGIDO_DIA) values (3, 3, 1, 2, 1);

insert into SGN_ESC_SECAO (ESCSECAO_ID, CODFILIAL, COD_SECAO, DESCR, CODCOLIGADA, DT_HR_INCL) values (1, 1, '001.01.001', 'ADMINISTRACAO', 1, sysdate);
insert into SGN_ESC_SECAO (ESCSECAO_ID, CODFILIAL, COD_SECAO, DESCR, CODCOLIGADA, DT_HR_INCL) values (2, 1, '001.01.026', 'VENDAS - MATAO', 1, sysdate);
insert into SGN_ESC_SECAO (ESCSECAO_ID, CODFILIAL, COD_SECAO, DESCR, CODCOLIGADA, DT_HR_INCL) values (3, 1, '001.01.041', 'DEPOSITO', 1, sysdate);
insert into SGN_ESC_SECAO (ESCSECAO_ID, CODFILIAL, COD_SECAO, DESCR, CODCOLIGADA, DT_HR_INCL) values (4, 2, '002.01.001', 'ADMINISTRACAO', 1, sysdate);
insert into SGN_ESC_SECAO (ESCSECAO_ID, CODFILIAL, COD_SECAO, DESCR, CODCOLIGADA, DT_HR_INCL) values (5, 3, '003.01.001', 'ADMINISTRACAO', 1, sysdate);

insert into SGN_ESC_FUNCAO (ESCFUNCAO_ID, CODCOLIGADA, COD_FUNCAO, DESCR, STATUS, DT_HR_INCL) values (1, 1, '0001', 'OPERADOR DE LOJA', 'A', sysdate);
insert into SGN_ESC_FUNCAO (ESCFUNCAO_ID, CODCOLIGADA, COD_FUNCAO, DESCR, STATUS, DT_HR_INCL) values (2, 1, '0002', 'CAIXA', 'A', sysdate);
insert into SGN_ESC_FUNCAO (ESCFUNCAO_ID, CODCOLIGADA, COD_FUNCAO, DESCR, STATUS, DT_HR_INCL) values (3, 1, '0003', 'REPOSITOR', 'A', sysdate);

insert into SGN_ESC_SECAO_TURNO (ESCSECAOTURNO_ID, ESCSECAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, QTDE_COLABORADORES, DT_HR_INCL) values (1, 1, '07:20', '12:00', '13:00', '16:00', 4, sysdate);
insert into SGN_ESC_SECAO_TURNO (ESCSECAOTURNO_ID, ESCSECAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, QTDE_COLABORADORES, DT_HR_INCL) values (2, 1, '08:00', '14:00', '15:00', '18:00', 1, sysdate);
insert into SGN_ESC_SECAO_TURNO (ESCSECAOTURNO_ID, ESCSECAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, QTDE_COLABORADORES, DT_HR_INCL) values (3, 2, '08:00', '12:30', '14:00', '18:48', 8, sysdate);
insert into SGN_ESC_SECAO_TURNO (ESCSECAOTURNO_ID, ESCSECAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, QTDE_COLABORADORES, DT_HR_INCL) values (4, 3, '06:00', '11:00', '12:50', '15:10', 6, sysdate);

insert into SGN_ESC_FUNCIONARIO (ESCFUNC_ID, CODCOLIGADA, LOJA, CHAPA, NOME, SEXO, DT_ADMISS, BRIGADISTA, ESCSECAO_ID, ESCFUNCAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, CODFILIAL, DT_HR_INCL) values (1, 1, 1, '000101', 'ANA SOUZA', 'F', date '2024-01-10', 'S', 1, 1, '07:20', '12:00', '13:00', '16:00', 1, sysdate);
insert into SGN_ESC_FUNCIONARIO (ESCFUNC_ID, CODCOLIGADA, LOJA, CHAPA, NOME, SEXO, DT_ADMISS, BRIGADISTA, ESCSECAO_ID, ESCFUNCAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, CODFILIAL, DT_HR_INCL) values (2, 1, 1, '000102', 'CARLOS LIMA', 'M', date '2023-09-14', 'N', 1, 2, '08:00', '14:00', '15:00', '18:00', 1, sysdate);
insert into SGN_ESC_FUNCIONARIO (ESCFUNC_ID, CODCOLIGADA, LOJA, CHAPA, NOME, SEXO, DT_ADMISS, BRIGADISTA, ESCSECAO_ID, ESCFUNCAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, CODFILIAL, DT_HR_INCL) values (3, 1, 1, '000103', 'ALINE SANTOS', 'F', date '2022-05-02', 'N', 2, 1, '08:00', '12:30', '14:00', '18:48', 1, sysdate);
insert into SGN_ESC_FUNCIONARIO (ESCFUNC_ID, CODCOLIGADA, LOJA, CHAPA, NOME, SEXO, DT_ADMISS, BRIGADISTA, ESCSECAO_ID, ESCFUNCAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, CODFILIAL, DT_HR_INCL) values (4, 1, 1, '000104', 'BRUNO ALMEIDA', 'M', date '2021-03-20', 'S', 2, 3, '08:00', '12:30', '14:00', '18:48', 1, sysdate);
insert into SGN_ESC_FUNCIONARIO (ESCFUNC_ID, CODCOLIGADA, LOJA, CHAPA, NOME, SEXO, DT_ADMISS, BRIGADISTA, ESCSECAO_ID, ESCFUNCAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, CODFILIAL, DT_HR_INCL) values (5, 1, 1, '000105', 'JULIANA FERREIRA', 'F', date '2020-11-05', 'N', 3, 3, '06:00', '11:00', '12:50', '15:10', 1, sysdate);
insert into SGN_ESC_FUNCIONARIO (ESCFUNC_ID, CODCOLIGADA, LOJA, CHAPA, NOME, SEXO, DT_ADMISS, BRIGADISTA, ESCSECAO_ID, ESCFUNCAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, CODFILIAL, DT_HR_INCL) values (6, 1, 2, '000201', 'MARCOS OLIVEIRA', 'M', date '2024-02-01', 'N', 4, 1, '07:20', '12:00', '13:00', '16:00', 2, sysdate);
insert into SGN_ESC_FUNCIONARIO (ESCFUNC_ID, CODCOLIGADA, LOJA, CHAPA, NOME, SEXO, DT_ADMISS, BRIGADISTA, ESCSECAO_ID, ESCFUNCAO_ID, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, CODFILIAL, DT_HR_INCL) values (7, 1, 3, '000301', 'PATRICIA COSTA', 'F', date '2024-04-08', 'N', 5, 2, '08:00', '14:00', '15:00', '18:00', 3, sysdate);

insert into SGN_ESC_AUSENCIA (ESCAUSEN_ID, ESCFUNC_ID, CHAPA, DT_INIC, DT_FIM, MOTIVO, DT_HR_INCL) values (1, 2, '000102', date '2026-06-10', date '2026-06-12', 'Ferias', sysdate);

insert into SGN_ESC_TIPO_DESCANSO (ESCTIPODESC_ID, DESCR, SIGLA, STATUS, DT_HR_INCL) values (1, 'Folga', 'F', 'A', sysdate);
insert into SGN_ESC_TIPO_DESCANSO (ESCTIPODESC_ID, DESCR, SIGLA, STATUS, DT_HR_INCL) values (2, 'Ferias', 'FER', 'A', sysdate);

insert into SGN_ESC_PERFIL (PERFIL_ID, NOME, DESCR, STATUS, DT_HR_INCL) values (1, 'ADMIN', 'Administracao completa', 'A', sysdate);
insert into SGN_ESC_PERFIL (PERFIL_ID, NOME, DESCR, STATUS, DT_HR_INCL) values (2, 'OPERADOR', 'Operacao nas lojas permitidas', 'A', sysdate);

insert into SGN_ESC_PERFIL_PERMISSAO (PERFIL_ID, PAGINA, PODE_VISUALIZAR, PODE_EDITAR, PODE_EXCLUIR, DT_HR_INCL)
select 1, pagina, 1, 1, 1, sysdate from (
  select 'escalas' pagina from dual union all select 'escalas-funcionarios' from dual union all select 'funcionarios' from dual union all select 'secoes' from dual union all select 'turnos-secao' from dual union all select 'historico' from dual union all select 'tipos-descanso' from dual union all select 'acessos' from dual union all select 'roles' from dual union all select 'configuracoes' from dual
);
insert into SGN_ESC_PERFIL_PERMISSAO (PERFIL_ID, PAGINA, PODE_VISUALIZAR, PODE_EDITAR, PODE_EXCLUIR, DT_HR_INCL)
select 2, pagina, 1, editar, 0, sysdate from (
  select 'escalas' pagina, 1 editar from dual union all select 'escalas-funcionarios', 1 from dual union all select 'funcionarios', 1 from dual union all select 'secoes', 1 from dual union all select 'turnos-secao', 1 from dual union all select 'historico', 0 from dual union all select 'tipos-descanso', 1 from dual union all select 'acessos', 0 from dual union all select 'roles', 0 from dual union all select 'configuracoes', 0 from dual
);

insert into SGN_ESC_USUARIO (USUARIO_ID, LOGIN, NOME, SENHA_HASH, PERFIL, STATUS, DT_HR_INCL) values (1, 'admin', 'Administrador', '$2a$10$1N1BKFLNZh7I2s7bkMavhu2RBBJpWqQQXbONkZosobki33EPpzxWe', 'ADMIN', 'A', sysdate);
insert into SGN_ESC_USUARIO (USUARIO_ID, LOGIN, NOME, SENHA_HASH, PERFIL, STATUS, DT_HR_INCL) values (2, 'loja1', 'Usuario Loja 1', '$2a$10$1N1BKFLNZh7I2s7bkMavhu2RBBJpWqQQXbONkZosobki33EPpzxWe', 'OPERADOR', 'A', sysdate);
insert into SGN_ESC_USUARIO_LOJA (USUARIO_ID, LOJA) values (2, 1);

commit;
