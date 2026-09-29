declare
  v_count number;
begin
  select count(*) into v_count from user_tables where table_name = 'SGN_ESC_PENDENCIA_FUNC';
  if v_count = 0 then
    execute immediate '
      create table SGN_ESC_PENDENCIA_FUNC (
        ESCPEND_ID number(15) not null,
        LOJA number(10) not null,
        ESCFUNC_ID number(15) not null,
        TIPO varchar2(20) not null,
        DT_INICIO date not null,
        DT_FIM date,
        JUSTIFICATIVA varchar2(500) not null,
        STATUS varchar2(1) default ''P'' not null,
        USUARIO_ID number(15),
        USUARIO_LOGIN varchar2(100),
        DT_HR_INCL date default sysdate not null,
        USUARIO_ENCERRAMENTO varchar2(100),
        DT_HR_ENCERR date,
        ORIGEM_CONCILIACAO varchar2(30),
        constraint SGN_ESC_PEND_FUNC_PK primary key (ESCPEND_ID),
        constraint SGN_ESC_PEND_FUNC_FK foreign key (ESCFUNC_ID) references SGN_ESC_FUNCIONARIO (ESCFUNC_ID),
        constraint SGN_ESC_PEND_FUNC_TIPO_CK check (TIPO in (''AFASTAMENTO'', ''TRANSFERENCIA'', ''DESLIGAMENTO'', ''OUTRO'')),
        constraint SGN_ESC_PEND_FUNC_STATUS_CK check (STATUS in (''P'', ''C'', ''X'')),
        constraint SGN_ESC_PEND_FUNC_DATAS_CK check (DT_FIM is null or DT_FIM >= DT_INICIO)
      )';
  end if;

  select count(*) into v_count from user_sequences where sequence_name = 'SGN_ESC_PENDENCIA_FUNC_SEQ';
  if v_count = 0 then
    execute immediate 'create sequence SGN_ESC_PENDENCIA_FUNC_SEQ start with 1 increment by 1 nocache';
  end if;

  select count(*) into v_count from user_indexes where index_name = 'SGN_ESC_PEND_FUNC_ABERTA_UK';
  if v_count = 0 then
    execute immediate 'create unique index SGN_ESC_PEND_FUNC_ABERTA_UK on SGN_ESC_PENDENCIA_FUNC (case when STATUS = ''P'' then ESCFUNC_ID end)';
  end if;

  select count(*) into v_count from user_indexes where index_name = 'SGN_ESC_PEND_FUNC_LOJA_IDX';
  if v_count = 0 then
    execute immediate 'create index SGN_ESC_PEND_FUNC_LOJA_IDX on SGN_ESC_PENDENCIA_FUNC (LOJA, STATUS, DT_INICIO)';
  end if;
end;
/
