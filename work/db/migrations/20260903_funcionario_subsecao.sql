declare
  v_count number;
begin
  select count(*) into v_count
  from user_tab_columns
  where table_name = 'SGN_ESC_FUNCIONARIO'
    and column_name = 'ESCSUBSECAO_ID';

  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_FUNCIONARIO add (ESCSUBSECAO_ID number(15))';
  end if;

  select count(*) into v_count
  from user_constraints
  where constraint_name = 'SGN_ESC_FUNC_SUBSECAO_FK';

  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_FUNCIONARIO add constraint SGN_ESC_FUNC_SUBSECAO_FK foreign key (ESCSUBSECAO_ID) references SGN_ESC_SUBSECAO (ESCSUBSECAO_ID)';
  end if;

  select count(*) into v_count
  from user_indexes
  where index_name = 'SGN_ESC_FUNC_SUBSECAO_IDX';

  if v_count = 0 then
    execute immediate 'create index SGN_ESC_FUNC_SUBSECAO_IDX on SGN_ESC_FUNCIONARIO (ESCSUBSECAO_ID)';
  end if;
end;
/

update SGN_ESC_FUNCIONARIO f
set ESCSUBSECAO_ID = (
  select max(ss.ESCSUBSECAO_ID)
  from SGN_ESC_SUBSECAO ss
  join SGN_ESC_FUNCAO fu on fu.ESCFUNCAO_ID = f.ESCFUNCAO_ID
  where ss.ESCSECAO_ID = f.ESCSECAO_ID
    and ss.STATUS = 'A'
    and (
      upper(fu.DESCR) = upper(ss.DESCR)
      or (upper(fu.DESCR) like '%CAIXA%' and upper(ss.DESCR) = 'CAIXA')
      or (upper(fu.DESCR) like '%BALCAO%' and upper(ss.DESCR) = 'BALCAO ATENDIMENTO')
      or (upper(fu.DESCR) like '%BALCÃO%' and upper(ss.DESCR) = 'BALCAO ATENDIMENTO')
      or (upper(fu.DESCR) like '%FISCAL%' and upper(ss.DESCR) = 'FISCAL CAIXA')
      or (upper(fu.DESCR) like '%EMPACOT%' and upper(ss.DESCR) = 'EMPACOTADOR')
      or (upper(fu.DESCR) like '%PADARIA%' and upper(ss.DESCR) = 'PADARIA CAIXA')
      or (upper(fu.DESCR) like '%PORTEIR%' and upper(ss.DESCR) = 'PORTEIRO')
      or (upper(fu.DESCR) like '%SELF%' and upper(ss.DESCR) = 'SELF')
      or (upper(fu.DESCR) like '%VASILHAME%' and upper(ss.DESCR) = 'VASILHAME')
      or (upper(fu.DESCR) like '%CASA DE MASSA%' and upper(ss.DESCR) = 'CASA DE MASSA')
    )
)
where f.ESCSUBSECAO_ID is null
  and exists (
    select 1
    from SGN_ESC_SUBSECAO ss
    where ss.ESCSECAO_ID = f.ESCSECAO_ID
      and ss.STATUS = 'A'
  );

commit;
