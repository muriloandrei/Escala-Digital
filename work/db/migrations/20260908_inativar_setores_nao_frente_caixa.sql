set define off

declare
  v_count number;
begin
  select count(*) into v_count
    from user_tab_columns
   where table_name = 'SGN_ESC_SECAO'
     and column_name = 'STATUS';

  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_SECAO add (STATUS varchar2(1) default ''A'' not null)';
  end if;

  select count(*) into v_count
    from user_constraints
   where table_name = 'SGN_ESC_SECAO'
     and constraint_name = 'SGN_ESC_SECAO_STATUS_CK';

  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_SECAO add constraint SGN_ESC_SECAO_STATUS_CK check (STATUS in (''A'', ''I''))';
  end if;
end;
/

update SGN_ESC_SECAO
   set STATUS = case
                  when regexp_like(upper(DESCR), 'FRENTE.*CAIXA') then 'A'
                  else 'I'
                end;

commit;
