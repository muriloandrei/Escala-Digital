set define off

declare
  v_loja_col varchar2(30);
begin
  select case when exists (
    select 1 from user_tab_columns
     where table_name = 'SGN_ESC_SECAO' and column_name = 'CODFILIAL'
  ) then 'codfilial' else 'loja' end
    into v_loja_col
    from dual;

  update sgn_esc_secao set status = 'A'
   where regexp_like(upper(nvl(descr, ' ')), 'PORTARIA')
     and nvl(status, 'A') <> 'A';

  execute immediate '
    merge into sgn_esc_usuario_secao us
    using (
      select distinct u.usuario_id, s.escsecao_id
        from sgn_esc_usuario u
        join sgn_esc_usuario_loja ul on ul.usuario_id = u.usuario_id
        join sgn_esc_secao s on s.' || v_loja_col || ' = ul.loja
       where upper(nvl(u.perfil, '' '')) = ''LIDER''
         and nvl(u.status, ''A'') = ''A''
         and (regexp_like(upper(nvl(u.login, '' '')), ''FRENTE|CAIXA'')
           or regexp_like(upper(nvl(u.nome, '' '')), ''FRENTE|CAIXA''))
         and regexp_like(upper(nvl(s.descr, '' '')), ''PORTARIA'')
         and nvl(s.status, ''A'') = ''A''
    ) src
    on (us.usuario_id = src.usuario_id and us.escsecao_id = src.escsecao_id)
    when matched then update set us.status = ''A''
      where nvl(us.status, ''A'') <> ''A''
    when not matched then insert (usuario_id, escsecao_id, status, dt_hr_incl)
      values (src.usuario_id, src.escsecao_id, ''A'', sysdate)';
end;
/
