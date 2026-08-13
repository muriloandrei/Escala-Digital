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
