connect ESCALA/escala@FREEPDB1

create table SGN_ESC_LOJA (
  ESCLOJA_ID number(15) not null,
  LOJA number(10) not null,
  CODCOLIGADA number(10) default 1 not null,
  QTDE_BRIGADISTA_EXIGIDO number(3) default 0 not null,
  QTDE_BRIGADISTA_EXIGIDO_DIA number(3) default 0 not null,
  constraint SGN_ESC_LOJA_PK primary key (ESCLOJA_ID),
  constraint SGN_ESC_LOJA_1_UK unique (LOJA)
);

create table SGN_ESC_SECAO (
  ESCSECAO_ID number(15) not null,
  CODFILIAL number(10) not null,
  COD_SECAO varchar2(10) not null,
  DESCR varchar2(100) not null,
  DT_HR_INCL date default sysdate not null,
  CODCOLIGADA number(10) not null,
  constraint SGN_ESC_SECAO_PK primary key (ESCSECAO_ID),
  constraint SGN_ESC_SECAO_1_UK unique (COD_SECAO, CODFILIAL),
  constraint SGN_ESC_SECAO_2_UK unique (CODFILIAL, DESCR)
);

create table SGN_ESC_FUNCAO (
  ESCFUNCAO_ID number(15) not null,
  CODCOLIGADA number(10) not null,
  COD_FUNCAO varchar2(10) not null,
  DESCR varchar2(100) not null,
  STATUS varchar2(1) default 'A' not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_FUNCAO_PK primary key (ESCFUNCAO_ID),
  constraint SGN_ESC_FUNCAO_1_UK unique (COD_FUNCAO, CODCOLIGADA)
);

create table SGN_ESC_FUNCIONARIO (
  ESCFUNC_ID number(15) not null,
  CODCOLIGADA number(10) not null,
  LOJA number(10) not null,
  CHAPA varchar2(8) not null,
  NOME varchar2(100) not null,
  CPF varchar2(20),
  SEXO varchar2(1) not null,
  DT_ADMISS date not null,
  BRIGADISTA varchar2(1) not null,
  ESCSECAO_ID number(15) not null,
  ESCFUNCAO_ID number(15) not null,
  CODCOLIGADA_ANT number(10),
  CHAPA_ANT varchar2(8),
  HR_ENT1 varchar2(5),
  HR_SAI1 varchar2(5),
  HR_ENT2 varchar2(5),
  HR_SAI2 varchar2(5),
  DT_HR_INCL date default sysdate not null,
  DT_DEMISS date,
  CODFILIAL number(10) not null,
  constraint SGN_ESC_FUNC_PK primary key (ESCFUNC_ID),
  constraint SGN_ESC_FUNC_1_UK unique (CHAPA),
  constraint SGN_ESC_FUNC_SECAO_FK foreign key (ESCSECAO_ID) references SGN_ESC_SECAO (ESCSECAO_ID),
  constraint SGN_ESC_FUNC_FUNCAO_FK foreign key (ESCFUNCAO_ID) references SGN_ESC_FUNCAO (ESCFUNCAO_ID)
);

create table SGN_ESC_SECAO_TURNO (
  ESCSECAOTURNO_ID number(15) not null,
  ESCSECAO_ID number(15) not null,
  HR_ENT1 varchar2(5) not null,
  HR_SAI1 varchar2(5) not null,
  HR_ENT2 varchar2(5) not null,
  HR_SAI2 varchar2(5) not null,
  QTDE_COLABORADORES number(5) not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_SECAO_TURNO_PK primary key (ESCSECAOTURNO_ID),
  constraint SGN_ESC_SECAO_TURNO_1_FK foreign key (ESCSECAO_ID) references SGN_ESC_SECAO (ESCSECAO_ID)
);

create table SGN_ESC_AUSENCIA (
  ESCAUSEN_ID number(15) not null,
  ESCFUNC_ID number(15) not null,
  CHAPA varchar2(8) not null,
  DT_INIC date not null,
  DT_FIM date,
  MOTIVO varchar2(100),
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_AUSENCIA_PK primary key (ESCAUSEN_ID),
  constraint SGN_ESC_AUS_FUNC_FK foreign key (ESCFUNC_ID) references SGN_ESC_FUNCIONARIO (ESCFUNC_ID)
);

create table SGN_ESC_PROG (
  ESCPROG_ID number(15) not null,
  MES_REF date not null,
  ESCFUNC_ID number(15) not null,
  ESCSECAO_ID number(15) not null,
  ESCFUNCAO_ID number(15) not null,
  LOJA number(10) not null,
  CHAPA varchar2(8) not null,
  ESCSECAOTURNO_ID number(15),
  HR_OFICIAL_ENT1 varchar2(5),
  HR_OFICIAL_SAI1 varchar2(5),
  HR_OFICIAL_ENT2 varchar2(5),
  HR_OFICIAL_SAI2 varchar2(5),
  REVISAO number(2) default 0 not null,
  OFICIALIZADA number(1) default 0 not null,
  ATIVA number(1) default 1 not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_PROG_PK primary key (ESCPROG_ID),
  constraint SGN_ESC_PROG_FUNC_FK foreign key (ESCFUNC_ID) references SGN_ESC_FUNCIONARIO (ESCFUNC_ID)
);

create table SGN_ESC_PROG_DIA (
  ESCPROGDIA_ID number(15) not null,
  ESCPROG_ID number(15) not null,
  DT date not null,
  HR_ENT1 varchar2(5) not null,
  HR_SAI1 varchar2(5) not null,
  HR_ENT2 varchar2(5) not null,
  HR_SAI2 varchar2(5) not null,
  PROGRAMACAO varchar2(3),
  constraint SGN_ESC_PROG_DIA_PK primary key (ESCPROGDIA_ID),
  constraint SGN_ESC_PROG_DIA_1_UK unique (ESCPROG_ID, DT),
  constraint SGN_ESC_PROG_DIA_FK foreign key (ESCPROG_ID) references SGN_ESC_PROG (ESCPROG_ID)
);

create table SGN_ESC_USUARIO (
  USUARIO_ID number(15) not null,
  LOGIN varchar2(50) not null,
  NOME varchar2(100) not null,
  SENHA_HASH varchar2(100) not null,
  PERFIL varchar2(30) not null,
  STATUS varchar2(1) default 'A' not null,
  LOJA_PRINCIPAL number(10),
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_USUARIO_PK primary key (USUARIO_ID),
  constraint SGN_ESC_USUARIO_1_UK unique (LOGIN),
  constraint SGN_ESC_USUARIO_LOJA_PRINC_CK check (LOJA_PRINCIPAL is null or LOJA_PRINCIPAL > 0),
  constraint SGN_ESC_USUARIO_STATUS_CK check (STATUS in ('A', 'I'))
);

create table SGN_ESC_USUARIO_LOJA (
  USUARIO_ID number(15) not null,
  LOJA number(10) not null,
  constraint SGN_ESC_USULOJA_PK primary key (USUARIO_ID, LOJA),
  constraint SGN_ESC_USULOJA_1_FK foreign key (USUARIO_ID) references SGN_ESC_USUARIO (USUARIO_ID)
);

create table SGN_ESC_USUARIO_SECAO (
  USUARIO_ID number(15) not null,
  ESCSECAO_ID number(15) not null,
  STATUS varchar2(1) default 'A' not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_USUSECAO_PK primary key (USUARIO_ID, ESCSECAO_ID),
  constraint SGN_ESC_USUSECAO_USR_FK foreign key (USUARIO_ID) references SGN_ESC_USUARIO (USUARIO_ID),
  constraint SGN_ESC_USUSECAO_SEC_FK foreign key (ESCSECAO_ID) references SGN_ESC_SECAO (ESCSECAO_ID),
  constraint SGN_ESC_USUSECAO_STATUS_CK check (STATUS in ('A', 'I'))
);

create table SGN_ESC_AUDITORIA (
  AUDITORIA_ID number(15) not null,
  USUARIO_ID number(15),
  LOGIN varchar2(50),
  NOME_USUARIO varchar2(100),
  PERFIL varchar2(30),
  ACAO varchar2(40) not null,
  ENTIDADE varchar2(40) not null,
  ENTIDADE_ID number(15),
  LOJA number(10),
  MES_REF date,
  REVISAO number(2),
  DETALHE varchar2(1000),
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_AUDITORIA_PK primary key (AUDITORIA_ID)
);

create table SGN_ESC_TIPO_DESCANSO (
  ESCTIPODESC_ID number(15) not null,
  DESCR varchar2(100) not null,
  SIGLA varchar2(3) not null,
  CLASSIFICACAO varchar2(30) default 'OUTROS' not null,
  STATUS varchar2(1) default 'A' not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_TIPO_DESC_PK primary key (ESCTIPODESC_ID),
  constraint SGN_ESC_TIPO_DESC_1_UK unique (SIGLA),
  constraint SGN_ESC_TIPO_DESC_STATUS_CK check (STATUS in ('A', 'I'))
);

create table SGN_ESC_HORARIO_PADRAO (
  ESCHORPAD_ID number(15) not null,
  DESCR varchar2(100) not null,
  HR_ENT1 varchar2(5) not null,
  HR_SAI1 varchar2(5) not null,
  HR_ENT2 varchar2(5) not null,
  HR_SAI2 varchar2(5) not null,
  JORNADA_MINUTOS number(5) default 528 not null,
  INTERVALO_MINUTOS number(5) default 70 not null,
  STATUS varchar2(1) default 'A' not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_HOR_PAD_PK primary key (ESCHORPAD_ID),
  constraint SGN_ESC_HOR_PAD_STATUS_CK check (STATUS in ('A', 'I'))
);

create table SGN_ESC_RM_LOG (
  ESCRMLOG_ID number(15) not null,
  LOJA number(10),
  MES_REF date,
  REVISAO number(2),
  ESCFUNC_ID number(15),
  CHAPA varchar2(8),
  CPF varchar2(20),
  ACAO varchar2(40) not null,
  STATUS varchar2(20) not null,
  MENSAGEM varchar2(1000),
  PAYLOAD_RESUMO varchar2(1000),
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_RM_LOG_PK primary key (ESCRMLOG_ID)
);

create table SGN_ESC_PERFIL (
  PERFIL_ID number(15) not null,
  NOME varchar2(30) not null,
  DESCR varchar2(100),
  STATUS varchar2(1) default 'A' not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_PERFIL_PK primary key (PERFIL_ID),
  constraint SGN_ESC_PERFIL_1_UK unique (NOME),
  constraint SGN_ESC_PERFIL_STATUS_CK check (STATUS in ('A', 'I'))
);

create table SGN_ESC_PERFIL_PERMISSAO (
  PERFIL_ID number(15) not null,
  PAGINA varchar2(60) not null,
  PODE_VISUALIZAR number(1) default 1 not null,
  PODE_CRIAR number(1) default 0 not null,
  PODE_EDITAR number(1) default 0 not null,
  PODE_OFICIALIZAR number(1) default 0 not null,
  PODE_REPROCESSAR number(1) default 0 not null,
  PODE_EXCLUIR number(1) default 0 not null,
  PODE_ADMINISTRAR number(1) default 0 not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_PERFIL_PERM_PK primary key (PERFIL_ID, PAGINA),
  constraint SGN_ESC_PERFIL_PERM_FK foreign key (PERFIL_ID) references SGN_ESC_PERFIL (PERFIL_ID),
  constraint SGN_ESC_PERFIL_VIS_CK check (PODE_VISUALIZAR in (0, 1)),
  constraint SGN_ESC_PERFIL_CRIAR_CK check (PODE_CRIAR in (0, 1)),
  constraint SGN_ESC_PERFIL_EDIT_CK check (PODE_EDITAR in (0, 1)),
  constraint SGN_ESC_PERFIL_OFIC_CK check (PODE_OFICIALIZAR in (0, 1)),
  constraint SGN_ESC_PERFIL_REPROC_CK check (PODE_REPROCESSAR in (0, 1)),
  constraint SGN_ESC_PERFIL_EXCL_CK check (PODE_EXCLUIR in (0, 1)),
  constraint SGN_ESC_PERFIL_ADMIN_CK check (PODE_ADMINISTRAR in (0, 1))
);

create sequence SGN_ESC_LOJA_SEQ start with 100 increment by 1 nocache;
create sequence SGN_ESC_SECAO_SEQ start with 100 increment by 1 nocache;
create sequence SGN_ESC_SECAO_TURNO_SEQ start with 100 increment by 1 nocache;
create sequence SGN_ESC_FUNCAO_SEQ start with 100 increment by 1 nocache;
create sequence SGN_ESC_FUNCIONARIO_SEQ start with 1000 increment by 1 nocache;
create sequence SGN_ESC_AUSENCIA_SEQ start with 100 increment by 1 nocache;
create sequence SGN_ESC_PROG_SEQ start with 1 increment by 1 nocache;
create sequence SGN_ESC_PROG_DIA_SEQ start with 1 increment by 1 nocache;
create sequence SGN_ESC_USUARIO_SEQ start with 10 increment by 1 nocache;
create sequence SGN_ESC_AUDITORIA_SEQ start with 1 increment by 1 nocache;
create sequence SGN_ESC_TIPO_DESCANSO_SEQ start with 10 increment by 1 nocache;
create sequence SGN_ESC_PERFIL_SEQ start with 10 increment by 1 nocache;
create sequence SGN_ESC_HORARIO_PADRAO_SEQ start with 10 increment by 1 nocache;
create sequence SGN_ESC_RM_LOG_SEQ start with 1 increment by 1 nocache;

create index SGN_ESC_FUNC_1_IDX on SGN_ESC_FUNCIONARIO (LOJA);
create index SGN_ESC_AUSENCIA_1_IDX on SGN_ESC_AUSENCIA (CHAPA, DT_INIC);
create index SGN_ESC_PROG_1_IDX on SGN_ESC_PROG (LOJA, MES_REF, REVISAO);
