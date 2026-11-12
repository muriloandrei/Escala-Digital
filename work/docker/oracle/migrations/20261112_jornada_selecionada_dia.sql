declare
  v_total number;
begin
  select count(*) into v_total from user_tab_columns
   where table_name = 'SGN_ESC_PROG_DIA' and column_name = 'JORNADA_MINUTOS';
  if v_total = 0 then
    execute immediate 'alter table SGN_ESC_PROG_DIA add (JORNADA_MINUTOS number(4))';
  end if;
  select count(*) into v_total from user_tab_columns
   where table_name = 'SGN_ESC_PROG_DIA' and column_name = 'INTERVALO_MINUTOS';
  if v_total = 0 then
    execute immediate 'alter table SGN_ESC_PROG_DIA add (INTERVALO_MINUTOS number(4))';
  end if;
  select count(*) into v_total from user_tab_columns
   where table_name = 'SGN_ESC_FIXO_ESCALA' and column_name = 'JORNADA_MINUTOS';
  if v_total = 0 then
    execute immediate 'alter table SGN_ESC_FIXO_ESCALA add (JORNADA_MINUTOS number(4))';
  end if;
  select count(*) into v_total from user_tab_columns
   where table_name = 'SGN_ESC_FIXO_ESCALA' and column_name = 'INTERVALO_MINUTOS';
  if v_total = 0 then
    execute immediate 'alter table SGN_ESC_FIXO_ESCALA add (INTERVALO_MINUTOS number(4))';
  end if;
end;
/
