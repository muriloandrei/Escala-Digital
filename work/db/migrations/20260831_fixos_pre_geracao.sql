declare
  v_count number;
begin
  select count(*) into v_count from user_tables where table_name = 'SGN_ESC_FIXO_ESCALA';
  if v_count = 0 then
    execute immediate '
      create table SGN_ESC_FIXO_ESCALA (
        ESCFIXO_ID number(15) not null,
        LOJA number(10) not null,
        MES_REF date not null,
        ESCFUNC_ID number(15) not null,
        ESCSECAO_ID number(15) not null,
        DT date not null,
        PROGRAMACAO varchar2(3) default ''TRB'' not null,
        HR_ENT1 varchar2(5),
        HR_SAI1 varchar2(5),
        HR_ENT2 varchar2(5),
        HR_SAI2 varchar2(5),
        JUSTIFICATIVA varchar2(500),
        STATUS varchar2(1) default ''A'' not null,
        DT_HR_INCL date default sysdate not null,
        constraint SGN_ESC_FIXO_ESCALA_PK primary key (ESCFIXO_ID),
        constraint SGN_ESC_FIXO_ESCALA_1_UK unique (LOJA, MES_REF, ESCFUNC_ID, DT),
        constraint SGN_ESC_FIXO_ESC_FUNC_FK foreign key (ESCFUNC_ID) references SGN_ESC_FUNCIONARIO (ESCFUNC_ID),
        constraint SGN_ESC_FIXO_ESC_STATUS_CK check (STATUS in (''A'', ''I''))
      )';
  end if;

  select count(*) into v_count from user_sequences where sequence_name = 'SGN_ESC_FIXO_ESCALA_SEQ';
  if v_count = 0 then
    execute immediate 'create sequence SGN_ESC_FIXO_ESCALA_SEQ start with 1 increment by 1 nocache';
  end if;
end;
/
