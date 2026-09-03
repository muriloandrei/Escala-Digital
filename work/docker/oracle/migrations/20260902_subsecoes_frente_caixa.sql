declare
  v_count number;
begin
  select count(*) into v_count from user_tables where table_name = 'SGN_ESC_SUBSECAO';
  if v_count = 0 then
    execute immediate '
      create table SGN_ESC_SUBSECAO (
        ESCSUBSECAO_ID number(15) not null,
        ESCSECAO_ID number(15) not null,
        DESCR varchar2(100) not null,
        STATUS varchar2(1) default ''A'' not null,
        DT_HR_INCL date default sysdate not null,
        constraint SGN_ESC_SUBSECAO_PK primary key (ESCSUBSECAO_ID),
        constraint SGN_ESC_SUBSECAO_1_UK unique (ESCSECAO_ID, DESCR),
        constraint SGN_ESC_SUBSECAO_SEC_FK foreign key (ESCSECAO_ID) references SGN_ESC_SECAO (ESCSECAO_ID),
        constraint SGN_ESC_SUBSECAO_STATUS_CK check (STATUS in (''A'', ''I''))
      )';
  end if;

  select count(*) into v_count from user_sequences where sequence_name = 'SGN_ESC_SUBSECAO_SEQ';
  if v_count = 0 then
    execute immediate 'create sequence SGN_ESC_SUBSECAO_SEQ start with 100 increment by 1 nocache';
  end if;
end;
/

merge into SGN_ESC_SUBSECAO dst
using (
  select s.ESCSECAO_ID, x.DESCR
  from SGN_ESC_SECAO s
  cross join (
    select 'Balcao Atendimento' DESCR from dual union all
    select 'Caixa' from dual union all
    select 'Casa de Massa' from dual union all
    select 'Empacotador' from dual union all
    select 'Fiscal Caixa' from dual union all
    select 'Padaria Caixa' from dual union all
    select 'Porteiro' from dual union all
    select 'Self' from dual union all
    select 'Vasilhame' from dual
  ) x
  where lower(s.DESCR) like '%frente de caixa%'
) src
on (dst.ESCSECAO_ID = src.ESCSECAO_ID and upper(dst.DESCR) = upper(src.DESCR))
when not matched then
  insert (ESCSUBSECAO_ID, ESCSECAO_ID, DESCR, STATUS, DT_HR_INCL)
  values (SGN_ESC_SUBSECAO_SEQ.nextval, src.ESCSECAO_ID, src.DESCR, 'A', sysdate);

commit;
