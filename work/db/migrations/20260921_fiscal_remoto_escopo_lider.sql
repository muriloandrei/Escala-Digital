set define off

declare
  v_loja_col varchar2(30);
  v_status_secao number := 0;
  v_dt_secao number := 0;
  v_codcoligada number := 1;
  v_secao_id number;
  v_count number;

  procedure ensure_funcao(p_cod_funcao varchar2, p_descr varchar2) is
    v_funcao_id number;
  begin
    select min(escfuncao_id)
      into v_funcao_id
     from sgn_esc_funcao
     where nvl(codcoligada, v_codcoligada) = v_codcoligada
       and upper(nvl(descr, '')) = upper(p_descr);

    if v_funcao_id is null then
      insert into sgn_esc_funcao (
        escfuncao_id, codcoligada, cod_funcao, descr, status, dt_hr_incl
      ) values (
        (select nvl(max(escfuncao_id), 0) + 1 from sgn_esc_funcao),
        v_codcoligada,
        p_cod_funcao,
        p_descr,
        'A',
        sysdate
      );
    else
      update sgn_esc_funcao
         set status = 'A',
             descr = p_descr
       where escfuncao_id = v_funcao_id;
    end if;
  end;
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

  select count(*) into v_status_secao
    from user_tab_columns
   where table_name = 'SGN_ESC_SECAO'
     and column_name = 'STATUS';

  select count(*) into v_dt_secao
    from user_tab_columns
   where table_name = 'SGN_ESC_SECAO'
     and column_name = 'DT_HR_INCL';

  begin
    select nvl(max(codcoligada), 1)
      into v_codcoligada
      from sgn_esc_loja
     where loja = 999;
  exception
    when others then
      v_codcoligada := 1;
  end;

  execute immediate
    'select count(*) from sgn_esc_secao where ' || lower(v_loja_col) || ' = :loja and cod_secao = :cod_secao'
    into v_count
    using 999, '999.03.008';

  if v_count = 0 then
    execute immediate
      'insert into sgn_esc_secao (escsecao_id, ' || lower(v_loja_col) || ', codcoligada, cod_secao, descr' ||
      case when v_status_secao > 0 then ', status' else '' end ||
      case when v_dt_secao > 0 then ', dt_hr_incl' else '' end ||
      ') values (sgn_esc_secao_seq.nextval, :loja, :codcoligada, :cod_secao, :descr' ||
      case when v_status_secao > 0 then ', ''A''' else '' end ||
      case when v_dt_secao > 0 then ', sysdate' else '' end ||
      ')'
      using 999, v_codcoligada, '999.03.008', 'Fiscal Remoto';
  end if;

  execute immediate
    'select min(escsecao_id) from sgn_esc_secao where ' || lower(v_loja_col) || ' = :loja and cod_secao = :cod_secao'
    into v_secao_id
    using 999, '999.03.008';

  execute immediate
    'update sgn_esc_secao set descr = :descr' ||
    case when v_status_secao > 0 then ', status = ''A''' else '' end ||
    ' where escsecao_id = :escsecao_id'
    using 'Fiscal Remoto', v_secao_id;

  ensure_funcao('REM001', 'FISCAL DE CAIXA REMOTO SENIOR');
  ensure_funcao('REM002', 'FISCAL DE CAIXA REMOTO JUNIOR');
  ensure_funcao('REM003', 'ESPECIALISTA DE OPERACAO REMOTA');
  ensure_funcao('REM004', 'ANALISTA DE MONITORAMENTO REMOTO');
  ensure_funcao('REM005', 'SUPERVISOR FISCAL DE CAIXA REMOTO');

  update sgn_esc_funcionario f
     set f.escsecao_id = v_secao_id
   where f.loja = 999
     and f.dt_demiss is null
     and exists (
       select 1
         from sgn_esc_funcao fu
        where fu.escfuncao_id = f.escfuncao_id
          and nvl(fu.codcoligada, v_codcoligada) = v_codcoligada
          and upper(nvl(fu.descr, '')) in (
            'FISCAL DE CAIXA REMOTO SENIOR',
            'FISCAL DE CAIXA REMOTO JUNIOR',
            'ESPECIALISTA DE OPERACAO REMOTA',
            'ANALISTA DE MONITORAMENTO REMOTO',
            'SUPERVISOR FISCAL DE CAIXA REMOTO'
          )
     );

  update sgn_esc_prog p
     set p.escsecao_id = v_secao_id
   where p.loja = 999
     and exists (
       select 1
         from sgn_esc_funcionario f
         join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id
        where f.escfunc_id = p.escfunc_id
          and f.loja = 999
          and upper(nvl(fu.descr, '')) in (
            'FISCAL DE CAIXA REMOTO SENIOR',
            'FISCAL DE CAIXA REMOTO JUNIOR',
            'ESPECIALISTA DE OPERACAO REMOTA',
            'ANALISTA DE MONITORAMENTO REMOTO',
            'SUPERVISOR FISCAL DE CAIXA REMOTO'
          )
     );

  begin
    update sgn_esc_fixo_escala fx
       set fx.escsecao_id = v_secao_id
     where exists (
       select 1
         from sgn_esc_funcionario f
         join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id
        where f.escfunc_id = fx.escfunc_id
          and f.loja = 999
          and upper(nvl(fu.descr, '')) in (
            'FISCAL DE CAIXA REMOTO SENIOR',
            'FISCAL DE CAIXA REMOTO JUNIOR',
            'ESPECIALISTA DE OPERACAO REMOTA',
            'ANALISTA DE MONITORAMENTO REMOTO',
            'SUPERVISOR FISCAL DE CAIXA REMOTO'
          )
     );
  exception
    when others then
      null;
  end;

  if v_status_secao > 0 then
    execute immediate '
      update sgn_esc_secao
         set status = ''A''
       where regexp_like(upper(nvl(descr, '''')), ''FRENTE.*CAIXA'')
          or regexp_like(upper(nvl(descr, '''')), ''SERVI(C|Ç)OS?.*CLIENT'')
          or regexp_like(upper(nvl(descr, '''')), ''TRANSPORT'')
          or escsecao_id = :escsecao_id'
      using v_secao_id;
  end if;

  update sgn_esc_usuario u
     set u.perfil = 'LIDER'
   where nvl(u.status, 'A') = 'A'
     and exists (
       select 1
         from sgn_esc_usuario_loja ul
        where ul.usuario_id = u.usuario_id
          and ul.loja = 999
     )
     and (
       regexp_like(upper(nvl(u.login, '')), 'ESPECIALISTA.*REMOT')
       or regexp_like(upper(nvl(u.nome, '')), 'ESPECIALISTA.*REMOT')
     );

  execute immediate '
    merge into sgn_esc_usuario_secao us
    using (
      select distinct u.usuario_id, s.escsecao_id
        from sgn_esc_usuario u
        join sgn_esc_usuario_loja ul on ul.usuario_id = u.usuario_id
        join sgn_esc_secao s on s.' || lower(v_loja_col) || ' = ul.loja
       where upper(nvl(u.perfil, '' '')) = ''LIDER''
         and nvl(u.status, ''A'') = ''A''
         and (
           regexp_like(upper(nvl(u.login, '' '')), ''FRENTE|CAIXA'')
           or regexp_like(upper(nvl(u.nome, '' '')), ''FRENTE|CAIXA'')
         )
         and (
           regexp_like(upper(nvl(s.descr, '' '')), ''FRENTE.*CAIXA'')
           or regexp_like(upper(nvl(s.descr, '' '')), ''SERVI(C|Ç)OS?.*CLIENT'')
           or regexp_like(upper(nvl(s.descr, '' '')), ''TRANSPORT'')
         )
         ' || case when v_status_secao > 0 then 'and nvl(s.status, ''A'') = ''A''' else '' end || '
    ) src
    on (us.usuario_id = src.usuario_id and us.escsecao_id = src.escsecao_id)
    when matched then update set us.status = ''A''
      where nvl(us.status, ''A'') <> ''A''
    when not matched then insert (usuario_id, escsecao_id, status, dt_hr_incl)
      values (src.usuario_id, src.escsecao_id, ''A'', sysdate)';

  merge into sgn_esc_usuario_secao us
  using (
    select distinct u.usuario_id, v_secao_id as escsecao_id
      from sgn_esc_usuario u
      join sgn_esc_usuario_loja ul on ul.usuario_id = u.usuario_id
     where ul.loja = 999
       and upper(nvl(u.perfil, ' ')) = 'LIDER'
       and nvl(u.status, 'A') = 'A'
       and (
         regexp_like(upper(nvl(u.login, '')), 'ESPECIALISTA.*REMOT')
         or regexp_like(upper(nvl(u.nome, '')), 'ESPECIALISTA.*REMOT')
       )
  ) src
  on (us.usuario_id = src.usuario_id and us.escsecao_id = src.escsecao_id)
  when matched then update set us.status = 'A'
    where nvl(us.status, 'A') <> 'A'
  when not matched then insert (usuario_id, escsecao_id, status, dt_hr_incl)
    values (src.usuario_id, src.escsecao_id, 'A', sysdate);

  commit;
end;
/
