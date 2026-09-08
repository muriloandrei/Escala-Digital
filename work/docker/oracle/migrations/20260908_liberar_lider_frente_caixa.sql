-- Libera automaticamente a secao Frente de Caixa para usuarios lideres de frente/caixa
-- nas lojas vinculadas ao usuario.

declare
  v_loja_col varchar2(30);
begin
  select case
           when exists (
             select 1 from user_tab_columns
              where table_name = 'SGN_ESC_SECAO'
                and column_name = 'CODFILIAL'
           ) then 'CODFILIAL'
           else 'LOJA'
         end
    into v_loja_col
    from dual;

  execute immediate '
    merge into SGN_ESC_USUARIO_SECAO us
    using (
      select distinct u.usuario_id, s.escsecao_id
        from SGN_ESC_USUARIO u
        join SGN_ESC_USUARIO_LOJA ul on ul.usuario_id = u.usuario_id
        join SGN_ESC_SECAO s on s.' || lower(v_loja_col) || ' = ul.loja
       where upper(nvl(u.perfil, '' '')) = ''LIDER''
         and nvl(u.status, ''A'') = ''A''
         and (
           regexp_like(upper(nvl(u.login, '' '')), ''FRENTE|CAIXA'')
           or regexp_like(upper(nvl(u.nome, '' '')), ''FRENTE|CAIXA'')
         )
         and regexp_like(upper(nvl(s.descr, '' '')), ''FRENTE.*CAIXA'')
         and nvl(s.status, ''A'') = ''A''
    ) src
    on (us.usuario_id = src.usuario_id and us.escsecao_id = src.escsecao_id)
    when matched then update set us.status = ''A''
      where nvl(us.status, ''A'') <> ''A''
    when not matched then insert (usuario_id, escsecao_id, status, dt_hr_incl)
      values (src.usuario_id, src.escsecao_id, ''A'', sysdate)';
end;
/

commit;
