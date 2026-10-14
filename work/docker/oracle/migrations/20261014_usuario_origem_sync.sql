declare
  v_count number;
begin
  select count(*) into v_count from user_tab_columns
   where table_name = 'SGN_ESC_USUARIO' and column_name = 'ORIGEM_USUARIO_ID';
  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_USUARIO add (ORIGEM_USUARIO_ID number(10))';
  end if;

  select count(*) into v_count from user_tab_columns
   where table_name = 'SGN_ESC_USUARIO' and column_name = 'DT_HR_ULT_SENHA_ORIGEM';
  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_USUARIO add (DT_HR_ULT_SENHA_ORIGEM date)';
  end if;

  select count(*) into v_count from user_tab_columns
   where table_name = 'SGN_ESC_USUARIO' and column_name = 'AUTH_VERSION';
  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_USUARIO add (AUTH_VERSION number(10) default 0 not null)';
  end if;

  select count(*) into v_count from user_constraints
   where table_name = 'SGN_ESC_USUARIO' and constraint_name = 'SGN_ESC_USUARIO_ORIGEM_UK';
  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_USUARIO add constraint SGN_ESC_USUARIO_ORIGEM_UK unique (ORIGEM_USUARIO_ID)';
  end if;
end;
/
