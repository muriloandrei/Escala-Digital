-- Seed padrao para tipos de descanso usados na escala.
-- Pode ser executado mais de uma vez: os registros existentes por SIGLA sao preservados.

declare
  v_has_classificacao number := 0;
begin
  select count(*)
    into v_has_classificacao
    from user_tab_columns
   where table_name = 'SGN_ESC_TIPO_DESCANSO'
     and column_name = 'CLASSIFICACAO';

  if v_has_classificacao > 0 then
    execute immediate q'[
      merge into sgn_esc_tipo_descanso dst
      using (
        select 'AFASTAMENTO' as descr, 'AFA' as sigla, 'OUTROS' as classificacao from dual
        union all
        select 'FOLGA' as descr, 'F' as sigla, 'FOLGA' as classificacao from dual
        union all
        select 'FERIAS' as descr, 'FER' as sigla, 'FERIAS' as classificacao from dual
      ) src
      on (upper(dst.sigla) = src.sigla)
      when not matched then
        insert (esctipodesc_id, descr, sigla, classificacao, status, dt_hr_incl)
        values (sgn_esc_tipo_descanso_seq.nextval, src.descr, src.sigla, src.classificacao, 'A', sysdate)
    ]';
  else
    execute immediate q'[
      merge into sgn_esc_tipo_descanso dst
      using (
        select 'AFASTAMENTO' as descr, 'AFA' as sigla from dual
        union all
        select 'FOLGA' as descr, 'F' as sigla from dual
        union all
        select 'FERIAS' as descr, 'FER' as sigla from dual
      ) src
      on (upper(dst.sigla) = src.sigla)
      when not matched then
        insert (esctipodesc_id, descr, sigla, status, dt_hr_incl)
        values (sgn_esc_tipo_descanso_seq.nextval, src.descr, src.sigla, 'A', sysdate)
    ]';
  end if;
end;
/

commit;
