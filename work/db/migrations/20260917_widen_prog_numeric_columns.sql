set serveroutput on

declare
  procedure widen_number_column(
    p_table_name in varchar2,
    p_column_name in varchar2,
    p_precision in number,
    p_scale in number default 0
  ) is
    v_count number;
    v_precision number;
    v_scale number;
    v_type varchar2(128);
  begin
    select count(*)
      into v_count
      from user_tab_columns
     where table_name = upper(p_table_name)
       and column_name = upper(p_column_name);

    if v_count = 0 then
      return;
    end if;

    select data_type, data_precision, data_scale
      into v_type, v_precision, v_scale
      from user_tab_columns
     where table_name = upper(p_table_name)
       and column_name = upper(p_column_name);

    if upper(v_type) = 'NUMBER'
       and v_precision is not null
       and (v_precision < p_precision or nvl(v_scale, 0) != nvl(p_scale, 0)) then
      execute immediate 'alter table ' || p_table_name || ' modify (' || p_column_name || ' number(' || p_precision || ',' || nvl(p_scale, 0) || '))';
      dbms_output.put_line(p_table_name || '.' || p_column_name || ' ajustada para NUMBER(' || p_precision || ',' || nvl(p_scale, 0) || ')');
    end if;
  end;
begin
  widen_number_column('SGN_ESC_PROG', 'ESCPROG_ID', 15);
  widen_number_column('SGN_ESC_PROG', 'ESCFUNC_ID', 15);
  widen_number_column('SGN_ESC_PROG', 'ESCSECAO_ID', 15);
  widen_number_column('SGN_ESC_PROG', 'ESCFUNCAO_ID', 15);
  widen_number_column('SGN_ESC_PROG', 'ESCSECAOTURNO_ID', 15);
  widen_number_column('SGN_ESC_PROG', 'LOJA', 10);
  widen_number_column('SGN_ESC_PROG', 'REVISAO', 5);

  widen_number_column('SGN_ESC_PROG_DIA', 'ESCPROGDIA_ID', 15);
  widen_number_column('SGN_ESC_PROG_DIA', 'ESCPROG_ID', 15);

  widen_number_column('SGN_ESC_AUDITORIA', 'REVISAO', 5);
  widen_number_column('SGN_ESC_RM_LOG', 'REVISAO', 5);
  dbms_output.put_line('Precisao numerica das tabelas de escala verificada.');
end;
/
