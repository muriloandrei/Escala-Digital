set define off

declare
  v_loja_col varchar2(30);
  v_status_col number := 0;
  v_rows number := 0;
begin
  select case
           when exists (
             select 1
               from user_tab_columns
              where table_name = 'SGN_ESC_SECAO'
                and column_name = 'CODFILIAL'
           ) then 'CODFILIAL'
           else 'LOJA'
         end
    into v_loja_col
    from dual;

  select count(*)
    into v_status_col
    from user_tab_columns
   where table_name = 'SGN_ESC_SECAO'
     and column_name = 'STATUS';

  if v_status_col = 0 then
    execute immediate 'alter table SGN_ESC_SECAO add (STATUS varchar2(1) default ''A'' not null)';
  end if;

  execute immediate '
    update sgn_esc_secao
       set status = ''I''
     where ' || lower(v_loja_col) || ' = :loja
       and regexp_like(
             translate(
               upper(nvl(descr, '''')),
               ''ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ'',
               ''AAAAAEEEEIIIIOOOOOUUUUC''
             ),
             ''(^|[^[:alpha:]])TRANSPORTE[[:space:]]+AEREO([^[:alpha:]]|$)''
           )
       and nvl(status, ''A'') <> ''I'''
    using 999;

  v_rows := sql%rowcount;
  dbms_output.put_line('Secoes Transporte Aereo inativadas na loja 999: ' || v_rows);

  commit;
end;
/
