-- Execute em sessao dedicada, conectado como ESCALAINT no SQL Developer (F5).
-- Altere v_aplicar para 1 somente depois de conferir a previa.
-- Secoes sem destino elegivel sao omitidas; o usuario e atualizado se restar
-- pelo menos uma secao. Destinos ambiguos bloqueiam o usuario por inteiro.
-- Nao cria usuarios, secoes nem vinculos de loja; replica apenas permissoes de secao.
set serveroutput on size unlimited

declare
  v_aplicar      number := 0;
  v_bloqueios    number := 0;
  v_usuarios     number := 0;
  v_prontos      number := 0;
  v_parciais     number := 0;
  v_pulados      number := 0;
  v_secoes_sem_destino number := 0;
  v_alterados    number := 0;
  v_ausentes     number := 0;
  v_encontrados  number;

  cursor c_destinos is
    with modelos as (
      select u.usuario_id, upper(trim(u.login)) login,
             regexp_replace(regexp_replace(upper(trim(u.login)), '[0-9]+$', ''),
                            '^LLIDER', 'LIDER') prefixo
        from sgn_esc_usuario u
       where u.loja_principal = 2 and u.status = 'A'
         and (upper(trim(u.login)) in ('ADM02', 'GERENTE02')
              or regexp_like(upper(trim(u.login)), '^L{1,2}IDER[.].+02$'))
         and exists (select 1 from sgn_esc_usuario_loja ul
                      where ul.usuario_id = u.usuario_id and ul.loja = 2)
    ), destinos as (
      select u.usuario_id, upper(trim(u.login)) login, u.loja_principal loja,
             regexp_replace(regexp_replace(upper(trim(u.login)), '[0-9]+$', ''),
                            '^LLIDER', 'LIDER') prefixo
        from sgn_esc_usuario u
       where u.status = 'A' and u.loja_principal <> 2
         and regexp_like(upper(trim(u.login)), '(^|[^0-9])[0-9]{1,4}$')
         and to_number(regexp_substr(upper(trim(u.login)),
                                     '(^|[^0-9])([0-9]{1,4})$', 1, 1, null, 2)) = u.loja_principal
         and exists (select 1 from sgn_esc_loja l where l.loja = u.loja_principal)
         and exists (select 1 from sgn_esc_usuario_loja ul
                      where ul.usuario_id = u.usuario_id and ul.loja = u.loja_principal)
    )
    select m.usuario_id modelo_id, m.login modelo_login,
           d.usuario_id destino_id, d.login destino_login, d.loja,
           count(*) over (partition by d.loja, d.prefixo) pares_mesmo_prefixo
      from modelos m join destinos d on d.prefixo = m.prefixo
     order by d.loja, d.login;

  procedure processar(p_gravar number) is
    v_ids            sys.odcinumberlist;
    v_origem         number;
    v_anteriores     number;
    v_correspondente number;
    v_id             number;
    v_invalido       number;
    v_faltantes      number;
  begin
    for u in c_destinos loop
      v_usuarios := v_usuarios + case when p_gravar = 0 then 1 else 0 end;
      if u.pares_mesmo_prefixo <> 1 then
        if p_gravar = 0 then
          v_bloqueios := v_bloqueios + 1;
          v_pulados := v_pulados + 1;
          dbms_output.put_line('BLOQUEADO ' || u.destino_login || ': login modelo/destino duplicado.');
        end if;
        continue;
      end if;

      v_ids := sys.odcinumberlist();
      v_origem := 0;
      v_invalido := 0;
      v_faltantes := 0;
      for sec in (
        select s.cod_secao, s.descr
          from sgn_esc_usuario_secao us
          join sgn_esc_secao s on s.escsecao_id = us.escsecao_id
         where us.usuario_id = u.modelo_id and us.status = 'A'
           and s.codfilial = 2
         order by s.cod_secao
      ) loop
        if regexp_like(sec.cod_secao, '(^|[.])01[.]001$|(^|[.])02[.]012$') then
          if p_gravar = 0 then
            dbms_output.put_line('  IGNORADA secao legada ' || sec.cod_secao ||
                                 ' de ' || u.modelo_login);
          end if;
          continue;
        end if;
        v_origem := v_origem + 1;
        v_correspondente := 0;
        v_id := null;
        if instr(sec.cod_secao, '.') > 0 then
          select count(*), min(s.escsecao_id)
            into v_correspondente, v_id
            from sgn_esc_secao s
            join sgn_esc_loja l on l.loja = u.loja and l.codcoligada = s.codcoligada
           where s.codfilial = u.loja
             and regexp_replace(upper(trim(s.cod_secao)), '^[^.]+[.]', '') =
                 regexp_replace(upper(trim(sec.cod_secao)), '^[^.]+[.]', '')
             and not regexp_like(s.cod_secao, '(^|[.])01[.]001$|(^|[.])02[.]012$')
             and (s.status = 'A' or (
               l.todas_secoes_habilitadas = 1
               and exists (select 1 from sgn_esc_funcionario f
                            where f.escsecao_id = s.escsecao_id and f.loja = u.loja
                              and f.dt_demiss is null
                              and upper(trim(nvl(f.status, 'A'))) in ('A', 'F', 'P', 'Z'))));
        end if;
        if v_correspondente = 0 then
          v_faltantes := v_faltantes + 1;
          if p_gravar = 0 then
            v_secoes_sem_destino := v_secoes_sem_destino + 1;
            dbms_output.put_line('  SEM_SECAO_ELEGIVEL loja=' || u.loja ||
                                 ' usuario=' || u.destino_login ||
                                 ' modelo=' || sec.cod_secao || ' (' || sec.descr || ')');
          end if;
        elsif v_correspondente > 1 then
          v_invalido := 1;
          if p_gravar = 0 then
            v_bloqueios := v_bloqueios + 1;
            dbms_output.put_line('BLOQUEADO ' || u.destino_login || ': secao modelo ' ||
                                 sec.cod_secao || ' (' || sec.descr || ') tem ' ||
                                 v_correspondente || ' destino(s) elegivel(is).');
          end if;
        else
          v_ids.extend;
          v_ids(v_ids.count) := v_id;
          if p_gravar = 0 then
            dbms_output.put_line('  SECAO ' || sec.cod_secao || ' -> ' ||
                                 u.loja || ' / escsecao_id=' || v_id);
          end if;
        end if;
      end loop;

      if v_origem = 0 then
        if p_gravar = 0 then
          v_bloqueios := v_bloqueios + 1;
          v_pulados := v_pulados + 1;
          dbms_output.put_line('BLOQUEADO ' || u.destino_login || ': modelo ' ||
                               u.modelo_login || ' sem secoes liberadas.');
        end if;
        continue;
      end if;

      if v_invalido = 1 then
        if p_gravar = 0 then
          v_pulados := v_pulados + 1;
          dbms_output.put_line('PULADO loja=' || u.loja || ' usuario=' ||
                               u.destino_login || ': nenhuma permissao sera alterada.');
        end if;
        continue;
      end if;

      if v_ids.count = 0 then
        if p_gravar = 0 then
          v_pulados := v_pulados + 1;
          dbms_output.put_line('PULADO loja=' || u.loja || ' usuario=' ||
                               u.destino_login || ': nenhuma secao do modelo existe ou esta elegivel.');
        end if;
        continue;
      end if;

      if p_gravar = 0 then
        v_prontos := v_prontos + 1;
        if v_faltantes > 0 then v_parciais := v_parciais + 1; end if;
      end if;

      select count(*) into v_anteriores
        from sgn_esc_usuario_secao us
        join sgn_esc_secao s on s.escsecao_id = us.escsecao_id
       where us.usuario_id = u.destino_id and s.codfilial = u.loja and us.status = 'A';

      if p_gravar = 0 then
        dbms_output.put_line(case when v_faltantes > 0 then 'PREVIA_PARCIAL' else 'PREVIA' end ||
                             ' loja=' || u.loja || ' usuario=' || u.destino_login ||
                             ' modelo=' || u.modelo_login || ' atuais=' || v_anteriores ||
                             ' novas=' || v_ids.count || ' de ' || v_origem ||
                             ' sem_destino=' || v_faltantes);
        for antiga in (
          select s.cod_secao
            from sgn_esc_usuario_secao us
            join sgn_esc_secao s on s.escsecao_id = us.escsecao_id
           where us.usuario_id = u.destino_id and s.codfilial = u.loja
             and us.escsecao_id not in (select column_value from table(v_ids))
           order by s.cod_secao
        ) loop
          dbms_output.put_line('  REMOVER ' || antiga.cod_secao);
        end loop;
      else
        -- Remove somente permissoes desta loja fora do modelo; demais lojas ficam intactas.
        delete from sgn_esc_usuario_secao us
         where us.usuario_id = u.destino_id
           and us.escsecao_id in (select s.escsecao_id from sgn_esc_secao s
                                   where s.codfilial = u.loja)
           and us.escsecao_id not in (select column_value from table(v_ids));
        for i in 1 .. v_ids.count loop
          v_id := v_ids(i);
          merge into sgn_esc_usuario_secao us
          using (select u.destino_id usuario_id, v_id escsecao_id from dual) x
             on (us.usuario_id = x.usuario_id and us.escsecao_id = x.escsecao_id)
          when matched then update set us.status = 'A' where us.status <> 'A'
          when not matched then insert (usuario_id, escsecao_id, status, dt_hr_incl)
            values (x.usuario_id, x.escsecao_id, 'A', sysdate);
        end loop;
        v_alterados := v_alterados + 1;
        dbms_output.put_line('APLICADO loja=' || u.loja || ' usuario=' ||
                             u.destino_login || ' secoes=' || v_ids.count ||
                             ' sem_destino=' || v_faltantes);
      end if;
    end loop;
  end;
begin
  savepoint replicar_secoes_02;
  if v_aplicar not in (0, 1) or v_aplicar is null then
    raise_application_error(-20001, 'v_aplicar deve ser 0 (previa) ou 1 (aplicar).');
  end if;
  processar(0);
  for modelo in (
    select u.login,
           regexp_replace(regexp_replace(upper(trim(u.login)), '[0-9]+$', ''),
                          '^LLIDER', 'LIDER') prefixo
      from sgn_esc_usuario u
     where u.loja_principal = 2 and u.status = 'A'
       and (upper(trim(u.login)) in ('ADM02', 'GERENTE02')
            or regexp_like(upper(trim(u.login)), '^L{1,2}IDER[.].+02$'))
       and exists (select 1 from sgn_esc_usuario_loja ul
                    where ul.usuario_id = u.usuario_id and ul.loja = 2)
  ) loop
    for loja in (select loja from sgn_esc_loja where loja <> 2 order by loja) loop
      select count(*) into v_encontrados
        from sgn_esc_usuario u
       where u.loja_principal = loja.loja and u.status = 'A'
         and regexp_like(upper(trim(u.login)), '(^|[^0-9])[0-9]{1,4}$')
         and to_number(regexp_substr(upper(trim(u.login)),
                                     '(^|[^0-9])([0-9]{1,4})$', 1, 1, null, 2)) = loja.loja
         and regexp_replace(regexp_replace(upper(trim(u.login)), '[0-9]+$', ''),
                            '^LLIDER', 'LIDER') = modelo.prefixo
         and exists (select 1 from sgn_esc_usuario_loja ul
                      where ul.usuario_id = u.usuario_id and ul.loja = loja.loja);
      if v_encontrados = 0 then
        v_ausentes := v_ausentes + 1;
        dbms_output.put_line('SEM_USUARIO loja=' || loja.loja || ' modelo=' || modelo.login);
      end if;
    end loop;
  end loop;
  dbms_output.put_line('RESUMO: usuarios=' || v_usuarios || ', prontos=' || v_prontos ||
                       ', parciais=' || v_parciais || ', pulados=' || v_pulados ||
                       ', secoes_sem_destino=' || v_secoes_sem_destino ||
                       ', bloqueios=' || v_bloqueios);
  dbms_output.put_line('PARES SEM USUARIO CORRESPONDENTE: ' || v_ausentes);
  if v_usuarios = 0 then
    raise_application_error(-20002, 'Nenhum usuario correspondente encontrado. Nada alterado.');
  end if;
  if v_aplicar = 1 then
    if v_prontos = 0 then
      raise_application_error(-20003, 'Nenhum usuario pronto; nenhuma permissao foi alterada.');
    end if;
    processar(1);
    commit;
    dbms_output.put_line('APLICADO: ' || v_alterados || ' usuario(s); ' ||
                         v_pulados || ' pulado(s).');
  else
    dbms_output.put_line('PREVIA: nada foi alterado. Para aplicar, mude v_aplicar para 1.');
  end if;
exception
  when others then
    rollback to replicar_secoes_02;
    raise;
end;
/
