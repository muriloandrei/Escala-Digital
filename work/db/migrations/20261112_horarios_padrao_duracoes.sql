declare
  type t_colunas is table of varchar2(128);
  type t_nullable is table of varchar2(1);
  v_colunas t_colunas;
  v_nullable t_nullable;
begin
  select column_name, nullable bulk collect into v_colunas, v_nullable
    from user_tab_columns
   where table_name = 'SGN_ESC_HORARIO_PADRAO'
     and column_name in ('HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2');
  if v_colunas.count <> 4 then
    raise_application_error(-20001, 'SGN_ESC_HORARIO_PADRAO incompleta ou ausente.');
  end if;
  for i in 1 .. v_colunas.count loop
    if v_nullable(i) = 'N' then
      execute immediate 'alter table SGN_ESC_HORARIO_PADRAO modify (' || v_colunas(i) || ' null)';
    end if;
  end loop;
end;
/
