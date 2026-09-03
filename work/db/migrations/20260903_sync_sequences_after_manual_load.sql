set serveroutput on

declare
  v_target number;
  v_current number;
  v_increment number;
begin
  select nvl(max(escprog_id), 0) + 1 into v_target from sgn_esc_prog;
  execute immediate 'select sgn_esc_prog_seq.nextval from dual' into v_current;

  if v_current < v_target then
    v_increment := v_target - v_current;
    execute immediate 'alter sequence sgn_esc_prog_seq increment by ' || v_increment;
    execute immediate 'select sgn_esc_prog_seq.nextval from dual' into v_current;
    execute immediate 'alter sequence sgn_esc_prog_seq increment by 1';
  end if;

  dbms_output.put_line('SGN_ESC_PROG_SEQ OK');
exception
  when others then
    begin
      execute immediate 'alter sequence sgn_esc_prog_seq increment by 1';
    exception
      when others then null;
    end;
    raise;
end;
/

declare
  v_target number;
  v_current number;
  v_increment number;
begin
  select nvl(max(escprogdia_id), 0) + 1 into v_target from sgn_esc_prog_dia;
  execute immediate 'select sgn_esc_prog_dia_seq.nextval from dual' into v_current;

  if v_current < v_target then
    v_increment := v_target - v_current;
    execute immediate 'alter sequence sgn_esc_prog_dia_seq increment by ' || v_increment;
    execute immediate 'select sgn_esc_prog_dia_seq.nextval from dual' into v_current;
    execute immediate 'alter sequence sgn_esc_prog_dia_seq increment by 1';
  end if;

  dbms_output.put_line('SGN_ESC_PROG_DIA_SEQ OK');
exception
  when others then
    begin
      execute immediate 'alter sequence sgn_esc_prog_dia_seq increment by 1';
    exception
      when others then null;
    end;
    raise;
end;
/

declare
  v_target number;
  v_current number;
  v_increment number;
begin
  select nvl(max(escsubsecao_id), 0) + 1 into v_target from sgn_esc_subsecao;
  execute immediate 'select sgn_esc_subsecao_seq.nextval from dual' into v_current;

  if v_current < v_target then
    v_increment := v_target - v_current;
    execute immediate 'alter sequence sgn_esc_subsecao_seq increment by ' || v_increment;
    execute immediate 'select sgn_esc_subsecao_seq.nextval from dual' into v_current;
    execute immediate 'alter sequence sgn_esc_subsecao_seq increment by 1';
  end if;

  dbms_output.put_line('SGN_ESC_SUBSECAO_SEQ OK');
exception
  when others then
    begin
      execute immediate 'alter sequence sgn_esc_subsecao_seq increment by 1';
    exception
      when others then null;
    end;
    raise;
end;
/

declare
  v_target number;
  v_current number;
  v_increment number;
begin
  select nvl(max(escfixo_id), 0) + 1 into v_target from sgn_esc_fixo_escala;
  execute immediate 'select sgn_esc_fixo_escala_seq.nextval from dual' into v_current;

  if v_current < v_target then
    v_increment := v_target - v_current;
    execute immediate 'alter sequence sgn_esc_fixo_escala_seq increment by ' || v_increment;
    execute immediate 'select sgn_esc_fixo_escala_seq.nextval from dual' into v_current;
    execute immediate 'alter sequence sgn_esc_fixo_escala_seq increment by 1';
  end if;

  dbms_output.put_line('SGN_ESC_FIXO_ESCALA_SEQ OK');
exception
  when others then
    begin
      execute immediate 'alter sequence sgn_esc_fixo_escala_seq increment by 1';
    exception
      when others then null;
    end;
    raise;
end;
/
