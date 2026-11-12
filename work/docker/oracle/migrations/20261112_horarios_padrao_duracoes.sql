declare
  v_colunas number;
begin
  select count(*) into v_colunas
    from user_tab_columns
   where table_name = 'SGN_ESC_HORARIO_PADRAO'
     and column_name in ('HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2');
  if v_colunas <> 4 then
    raise_application_error(-20001, 'SGN_ESC_HORARIO_PADRAO incompleta ou ausente.');
  end if;
  for coluna in (
    select column_name, nullable
      from user_tab_columns
     where table_name = 'SGN_ESC_HORARIO_PADRAO'
       and column_name in ('HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2')
  ) loop
    if coluna.nullable = 'N' then
      execute immediate 'alter table SGN_ESC_HORARIO_PADRAO modify (' || coluna.column_name || ' null)';
    end if;
  end loop;
end;
/
