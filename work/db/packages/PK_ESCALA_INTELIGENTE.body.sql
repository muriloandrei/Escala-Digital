-- Baseado no corpo enviado em 14/10/2026. Compare com USER_SOURCE antes de compilar.
-- Compilar conectado ao schema que possui SGN_USUARIO e PK_ESCALA_INTELIGENTE.
create or replace package body PK_ESCALA_INTELIGENTE is

  procedure PKB_INTEGRA_USUARIOS is
    v_login             varchar2(50);
    v_loja_texto        varchar2(10);
    v_loja              number;
    v_perfil            varchar2(30);
    v_usuario_id        number;
    v_origem_id_atual   number;
    v_perfil_atual      varchar2(30);
    v_hash_atual        varchar2(100);
    v_data_senha_atual  date;
    v_data_inclusao     date;
    v_total             number;
    v_secao_id          number;
    v_secao_total       number;
    v_trocar_senha      number;
    v_inseridos         number := 0;
    v_atualizados       number := 0;
    v_senhas            number := 0;
    v_ignorados         number := 0;
  begin
    for rec in (
      select usuario_id, login, nome, senha, dt_hr_ult_senha, codcoligada, chapa,
             count(*) over (partition by upper(trim(login))) as qtd_login,
             count(*) over (partition by usuario_id) as qtd_id
        from SGN_USUARIO
       order by usuario_id
    ) loop
      v_login := upper(trim(rec.login));
      v_loja_texto := regexp_substr(v_login, '(^|[^0-9])0*([0-9]{1,4})$', 1, 1, null, 2);
      if v_login is null or rec.qtd_login <> 1 or rec.qtd_id <> 1
         or v_loja_texto is null or rec.senha is null
         or not regexp_like(rec.senha, '^[0-9A-Fa-f]{32}$') then
        v_ignorados := v_ignorados + 1;
        dbms_output.put_line('USUARIO IGNORADO: ' || rec.login || ' - login, loja ou MD5 invalido/duplicado.');
        continue;
      end if;

      v_loja := to_number(v_loja_texto);
      select count(*) into v_total from ESCALAINT.SGN_ESC_LOJA where loja = v_loja;
      if v_total <> 1 then
        v_ignorados := v_ignorados + 1;
        dbms_output.put_line('USUARIO IGNORADO: ' || v_login || ' - loja ' || v_loja || ' nao cadastrada.');
        continue;
      end if;

      v_perfil := case
        when substr(v_login, 1, 7) = 'GERENTE' then 'GERENTE'
        when substr(v_login, 1, 5) = 'LIDER' then 'LIDER'
        when substr(v_login, 1, 3) = 'ADM' then 'RH'
        else 'OPERADOR'
      end;

      v_secao_id := null;
      v_secao_total := 0;
      if v_perfil = 'LIDER' then
        if (instr(v_login, 'FRENTE') > 0 or instr(v_login, 'CAIXA') > 0)
           and instr(v_login, 'FISCAL') = 0 and instr(v_login, 'REMOTO') = 0 then
          select count(*) into v_secao_total
            from ESCALAINT.SGN_ESC_SECAO
           where codfilial = v_loja and status = 'A'
             and (regexp_like(upper(descr), 'FRENTE.*CAIXA|SERVI.*CLIENT|TRANSP|PORTARIA')
               or regexp_like(trim(cod_secao), '(^|[.])02[.]012$'));
        elsif rec.chapa is not null and rec.codcoligada is not null then
          select count(distinct f.escsecao_id), min(f.escsecao_id)
            into v_secao_total, v_secao_id
            from ESCALAINT.SGN_ESC_FUNCIONARIO f
            join ESCALAINT.SGN_ESC_SECAO s on s.escsecao_id = f.escsecao_id
           where f.loja = v_loja and f.codcoligada = rec.codcoligada
             and f.chapa = rec.chapa and s.codfilial = v_loja and s.status = 'A'
             and (f.dt_demiss is null or f.dt_demiss >= trunc(sysdate));
        end if;
        if v_secao_total = 0 or (v_secao_id is not null and v_secao_total <> 1) then
          v_ignorados := v_ignorados + 1;
          dbms_output.put_line('USUARIO IGNORADO: ' || v_login || ' - secao do lider nao identificada.');
          continue;
        end if;
      end if;

      select count(*), min(usuario_id)
        into v_total, v_usuario_id
        from ESCALAINT.SGN_ESC_USUARIO
       where upper(login) = v_login;
      if v_total > 1 then
        v_ignorados := v_ignorados + 1;
        dbms_output.put_line('USUARIO IGNORADO: ' || v_login || ' - login duplicado no destino.');
        continue;
      end if;

      select count(*) into v_total
        from ESCALAINT.SGN_ESC_USUARIO
       where origem_usuario_id = rec.usuario_id
         and (v_usuario_id is null or usuario_id <> v_usuario_id);
      if v_total > 0 then
        v_ignorados := v_ignorados + 1;
        dbms_output.put_line('USUARIO IGNORADO: ' || v_login || ' - ID de origem vinculado a outra conta.');
        continue;
      end if;

      if v_usuario_id is null then
        select ESCALAINT.SGN_ESC_USUARIO_SEQ.nextval into v_usuario_id from dual;
        insert into ESCALAINT.SGN_ESC_USUARIO
          (usuario_id, login, nome, senha_hash, perfil, status, loja_principal,
           origem_usuario_id, dt_hr_ult_senha_origem, dt_hr_incl)
        values
          (v_usuario_id, v_login, rec.nome, lower(rec.senha), v_perfil, 'A', v_loja,
           rec.usuario_id, rec.dt_hr_ult_senha, sysdate);
        v_inseridos := v_inseridos + 1;
      else
        select origem_usuario_id, perfil, senha_hash, dt_hr_ult_senha_origem, dt_hr_incl
          into v_origem_id_atual, v_perfil_atual, v_hash_atual, v_data_senha_atual, v_data_inclusao
          from ESCALAINT.SGN_ESC_USUARIO
         where usuario_id = v_usuario_id;
        if v_origem_id_atual is not null and v_origem_id_atual <> rec.usuario_id then
          v_ignorados := v_ignorados + 1;
          dbms_output.put_line('USUARIO IGNORADO: ' || v_login || ' - ID de origem divergente.');
          continue;
        end if;
        if upper(v_perfil_atual) in ('ADMIN', 'CONTROLADORIA') then
          v_ignorados := v_ignorados + 1;
          dbms_output.put_line('USUARIO IGNORADO: ' || v_login || ' - perfil global preservado.');
          continue;
        end if;

        v_trocar_senha := 0;
        if regexp_like(v_hash_atual, '^[0-9A-Fa-f]{32}$') then
          if lower(v_hash_atual) <> lower(rec.senha) then v_trocar_senha := 1; end if;
        elsif rec.dt_hr_ult_senha is not null
          and rec.dt_hr_ult_senha > nvl(v_data_senha_atual, v_data_inclusao) then
          v_trocar_senha := 1;
        end if;

        update ESCALAINT.SGN_ESC_USUARIO
           set nome = rec.nome,
               perfil = v_perfil,
               loja_principal = v_loja,
               origem_usuario_id = rec.usuario_id,
               dt_hr_ult_senha_origem = rec.dt_hr_ult_senha,
               senha_hash = case when v_trocar_senha = 1 then lower(rec.senha) else senha_hash end
         where usuario_id = v_usuario_id;
        v_atualizados := v_atualizados + 1;
        v_senhas := v_senhas + v_trocar_senha;
      end if;

      select count(*), min(loja)
        into v_total, v_secao_total
        from ESCALAINT.SGN_ESC_USUARIO_LOJA
       where usuario_id = v_usuario_id;
      if v_total <> 1 or v_secao_total <> v_loja then
        delete from ESCALAINT.SGN_ESC_USUARIO_LOJA where usuario_id = v_usuario_id;
        insert into ESCALAINT.SGN_ESC_USUARIO_LOJA (usuario_id, loja) values (v_usuario_id, v_loja);
      end if;

      if v_perfil = 'LIDER' then
        delete from ESCALAINT.SGN_ESC_USUARIO_SECAO
         where usuario_id = v_usuario_id
           and escsecao_id not in (
             select escsecao_id from ESCALAINT.SGN_ESC_SECAO
              where (v_secao_id is not null and escsecao_id = v_secao_id)
                 or (v_secao_id is null and codfilial = v_loja and status = 'A'
                     and (regexp_like(upper(descr), 'FRENTE.*CAIXA|SERVI.*CLIENT|TRANSP|PORTARIA')
                       or regexp_like(trim(cod_secao), '(^|[.])02[.]012$')))
           );
        for sec in (
          select escsecao_id from ESCALAINT.SGN_ESC_SECAO
           where (v_secao_id is not null and escsecao_id = v_secao_id)
              or (v_secao_id is null and codfilial = v_loja and status = 'A'
                  and (regexp_like(upper(descr), 'FRENTE.*CAIXA|SERVI.*CLIENT|TRANSP|PORTARIA')
                    or regexp_like(trim(cod_secao), '(^|[.])02[.]012$')))
        ) loop
          merge into ESCALAINT.SGN_ESC_USUARIO_SECAO dest
          using (select v_usuario_id usuario_id, sec.escsecao_id escsecao_id from dual) src
             on (dest.usuario_id = src.usuario_id and dest.escsecao_id = src.escsecao_id)
          when matched then update set dest.status = 'A' where dest.status <> 'A'
          when not matched then insert (usuario_id, escsecao_id, status, dt_hr_incl)
            values (src.usuario_id, src.escsecao_id, 'A', sysdate);
        end loop;
      end if;
    end loop;

    commit;
    dbms_output.put_line('USUARIOS: inseridos=' || v_inseridos || ', atualizados=' || v_atualizados ||
                         ', senhas=' || v_senhas || ', ignorados=' || v_ignorados);
  exception
    when others then
      rollback;
      dbms_output.put_line('ERRO NA INTEGRACAO DE USUARIOS: ' || sqlerrm);
      raise;
  end PKB_INTEGRA_USUARIOS;

  procedure PKB_INTEGRA_CADASTRO is
    v_reg_func         ESCALAINT.SGN_ESC_FUNCIONARIO%rowtype;
    v_total_lidos      number := 0;
    v_ignora_transf    number := 0;
    v_ignora_funcao    number := 0;
    v_ignora_secao     number := 0;
    v_inseridos        number := 0;
    v_atualizados      number := 0;
  begin
    -- Loja
    for rec1 in (select l.nro loja, nvl(b.nro_func_total, 0) nro_func_total,
                        nvl(b.nro_func_dia, 0) nro_func_dia, l.codcoligada
                   from V_LOJAS l
                   left join SGN_BRIGADA_INCENDIO b on b.loja_id = l.loja_id
                  where b.loja_id is not null
                     or exists (select 1 from PFUNC f
                                 where f.nroempresa = l.nro
                                   and f.codcoligada = l.codcoligada
                                   and f.datademissao is null)) loop
      update ESCALAINT.SGN_ESC_LOJA a
         set a.qtde_brigadista_exigido = rec1.nro_func_total,
             a.qtde_brigadista_exigido_dia = rec1.nro_func_dia,
             a.codcoligada = rec1.codcoligada
       where a.loja = rec1.loja;
      if sql%rowcount = 0 then
        insert into ESCALAINT.SGN_ESC_LOJA
          (escloja_id, loja, qtde_brigadista_exigido, qtde_brigadista_exigido_dia, codcoligada)
        values (ESCALAINT.SGN_ESC_LOJA_SEQ.nextval, rec1.loja, rec1.nro_func_total,
                rec1.nro_func_dia, rec1.codcoligada);
      end if;
    end loop;
    commit;

    -- Funcao
    for rec1 in (select a.codcoligada, a.codigo, a.nome,
                        decode(a.inativa, 0, 'ATIVO', 'INATIVO') status
                   from RM.PFUNCAO@RM a
                  where exists (select 1 from RM.PFUNC@RM b
                                 where b.codcoligada = a.codcoligada
                                   and b.codfuncao = a.codigo
                                   and b.datademissao is null)) loop
      update ESCALAINT.SGN_ESC_FUNCAO a
         set a.descr = rec1.nome, a.status = rec1.status
       where a.codcoligada = rec1.codcoligada and a.cod_funcao = rec1.codigo;
      if sql%rowcount = 0 and rec1.status = 'ATIVO' then
        insert into ESCALAINT.SGN_ESC_FUNCAO
          (codcoligada, cod_funcao, descr, status, dt_hr_incl)
        values (rec1.codcoligada, rec1.codigo, rec1.nome, rec1.status, sysdate);
      end if;
    end loop;
    commit;

    -- Secao
    for rec1 in (select a.codcoligada, a.codfilial, a.codigo, a.descricao
                   from RM.PSECAO@RM a
                  where exists (select 1 from RM.PFUNC@RM b
                                 where b.codcoligada = a.codcoligada
                                   and b.codsecao = a.codigo
                                   and b.datademissao is null)) loop
      update ESCALAINT.SGN_ESC_SECAO a set a.descr = rec1.descricao
       where a.codfilial = rec1.codfilial
         and a.cod_secao = rec1.codigo
         and a.codcoligada = rec1.codcoligada;
      if sql%rowcount = 0 then
        insert into ESCALAINT.SGN_ESC_SECAO
          (cod_secao, descr, dt_hr_incl, codcoligada, codfilial)
        values (rec1.codigo, rec1.descricao, sysdate, rec1.codcoligada, rec1.codfilial);
      end if;
    end loop;
    commit;

    dbms_output.put_line('--- INICIANDO PROCESSAMENTO DE FUNCIONARIOS ---');
    for rec1 in (select a.codcoligada, a.nroempresa loja, a.chapa, a.nome, a.dataadmissao,
                        a.datademissao, a.codsecao, a.codfuncao, a.codfilial, a.cpf_func
                   from PFUNC a
                  where a.datademissao is null or a.datademissao >= to_date('01/06/2026', 'dd/mm/yyyy')) loop
      v_total_lidos := v_total_lidos + 1;
      v_reg_func := null;
      v_reg_func.codcoligada := rec1.codcoligada;
      v_reg_func.loja := rec1.loja;
      v_reg_func.chapa := rec1.chapa;
      v_reg_func.nome := rec1.nome;
      v_reg_func.dt_admiss := rec1.dataadmissao;
      v_reg_func.dt_demiss := rec1.datademissao;
      v_reg_func.dt_hr_incl := sysdate;
      v_reg_func.codfilial := rec1.codfilial;
      v_reg_func.cpf := rec1.cpf_func;

      begin
        select a.coligadaanteriortransf, a.chapaanteriortransf, b.sexo,
               case when upper(trim(a.codsituacao)) = 'A' then 'A' else 'I' end
          into v_reg_func.codcoligada_ant, v_reg_func.chapa_ant, v_reg_func.sexo,
               v_reg_func.status
          from RM.PPESSOA@RM b, RM.PFUNC@RM a
         where b.codigo = a.codpessoa and a.chapa = rec1.chapa
           and a.codcoligada = rec1.codcoligada;
      exception
        when no_data_found then
          v_ignora_transf := v_ignora_transf + 1;
          dbms_output.put_line('ERRO: Chapa ' || rec1.chapa || ' ignorada. Cadastro nao encontrado em ppessoa/pfunc@rm.');
          continue;
      end;

      begin
        select escfuncao_id into v_reg_func.escfuncao_id from ESCALAINT.SGN_ESC_FUNCAO
         where codcoligada = rec1.codcoligada and cod_funcao = rec1.codfuncao;
      exception
        when no_data_found then
          v_ignora_funcao := v_ignora_funcao + 1;
          dbms_output.put_line('ERRO: Chapa ' || rec1.chapa || ' ignorada. Funcao nao encontrada.');
          continue;
      end;

      begin
        select escsecao_id into v_reg_func.escsecao_id from ESCALAINT.SGN_ESC_SECAO
         where codcoligada = rec1.codcoligada and cod_secao = rec1.codsecao
           and codfilial = rec1.codfilial;
      exception
        when no_data_found then
          v_ignora_secao := v_ignora_secao + 1;
          dbms_output.put_line('ERRO: Chapa ' || rec1.chapa || ' ignorada. Secao nao encontrada.');
          continue;
      end;

      begin
        select 'S' into v_reg_func.brigadista
          from RM.VBIBRIGADA@RM a, RM.VBIBRIGADISTA@RM b
         where b.chapa = rec1.chapa
           and sysdate between a.dtiniciovigencia and a.dtfimvigencia
           and b.codbrigada = a.codbrigada
           and a.codcoligada = a.codcoligada
           and a.codcoligada = rec1.codcoligada
           and rownum = 1;
      exception
        when no_data_found then v_reg_func.brigadista := 'N';
      end;

      update ESCALAINT.SGN_ESC_FUNCIONARIO a
         set a.nome = v_reg_func.nome, a.sexo = v_reg_func.sexo,
             a.dt_admiss = v_reg_func.dt_admiss, a.brigadista = v_reg_func.brigadista,
             a.escsecao_id = v_reg_func.escsecao_id, a.escfuncao_id = v_reg_func.escfuncao_id,
             a.codcoligada_ant = v_reg_func.codcoligada_ant, a.chapa_ant = v_reg_func.chapa_ant,
             a.dt_demiss = v_reg_func.dt_demiss, a.codfilial = v_reg_func.codfilial,
             a.cpf = v_reg_func.cpf, a.status = v_reg_func.status
       where a.codcoligada = rec1.codcoligada and a.loja = rec1.loja and a.chapa = rec1.chapa
      returning escfunc_id into v_reg_func.escfunc_id;

      if sql%rowcount = 0 and rec1.datademissao is null then
        insert into ESCALAINT.SGN_ESC_FUNCIONARIO
          (codcoligada, loja, chapa, nome, sexo, dt_admiss, brigadista, escsecao_id,
           escfuncao_id, codcoligada_ant, chapa_ant, hr_ent1, hr_sai1, hr_ent2, hr_sai2,
           dt_hr_incl, dt_demiss, codfilial, cpf, status)
        values
          (v_reg_func.codcoligada, v_reg_func.loja, v_reg_func.chapa, v_reg_func.nome,
           v_reg_func.sexo, v_reg_func.dt_admiss, v_reg_func.brigadista, v_reg_func.escsecao_id,
           v_reg_func.escfuncao_id, v_reg_func.codcoligada_ant, v_reg_func.chapa_ant,
           v_reg_func.hr_ent1, v_reg_func.hr_sai1, v_reg_func.hr_ent2, v_reg_func.hr_sai2,
           v_reg_func.dt_hr_incl, v_reg_func.dt_demiss, v_reg_func.codfilial, v_reg_func.cpf,
           v_reg_func.status)
        returning escfunc_id into v_reg_func.escfunc_id;
        v_inseridos := v_inseridos + 1;
      else
        v_atualizados := v_atualizados + 1;
      end if;

      if v_reg_func.escfunc_id is not null and rec1.datademissao is null then
        delete from ESCALAINT.SGN_ESC_AUSENCIA a where a.escfunc_id = v_reg_func.escfunc_id;
        for rec2 in (select afa.dtinicio, nvl(afa.dtfinal, FG_GET_DATE('31/12/2099')) dtfinal
                       from RM.PFHSTAFT@RM afa
                      where afa.chapa = rec1.chapa and afa.codcoligada = rec1.codcoligada) loop
          insert into ESCALAINT.SGN_ESC_AUSENCIA
            (escfunc_id, chapa, dt_inic, dt_fim, motivo, id_erp, dt_hr_incl, codcoligada, loja, codfilial)
          values
            (v_reg_func.escfunc_id, v_reg_func.chapa, rec2.dtinicio, rec2.dtfinal,
             'AFASTAMENTO', 'AFA', sysdate, rec1.codcoligada, rec1.loja, rec1.codfilial);
        end loop;
        for rec2 in (select fer.datainicio, nvl(fer.datafim, FG_GET_DATE('31/12/2099')) datafim
                       from RM.PFUFERIASPER@RM fer
                      where fer.chapa = rec1.chapa and fer.codcoligada = rec1.codcoligada) loop
          insert into ESCALAINT.SGN_ESC_AUSENCIA
            (escfunc_id, chapa, dt_inic, dt_fim, motivo, id_erp, dt_hr_incl, codcoligada, loja, codfilial)
          values
            (v_reg_func.escfunc_id, v_reg_func.chapa, rec2.datainicio, rec2.datafim,
             'FÉRIAS', 'FER', sysdate, rec1.codcoligada, rec1.loja, rec1.codfilial);
        end loop;
      end if;
      commit;
    end loop;

    dbms_output.put_line('--- RESUMO DA EXECUCAO (FUNCIONARIOS) ---');
    dbms_output.put_line('Total lidos da view pfunc: ' || v_total_lidos);
    dbms_output.put_line('Ignorados (Sem dados Transferencia): ' || v_ignora_transf);
    dbms_output.put_line('Ignorados (Funcao nao encontrada): ' || v_ignora_funcao);
    dbms_output.put_line('Ignorados (Secao nao encontrada): ' || v_ignora_secao);
    dbms_output.put_line('Funcionarios Atualizados: ' || v_atualizados);
    dbms_output.put_line('Funcionarios Inseridos: ' || v_inseridos);
    dbms_output.put_line('-------------------------------------------');
    commit;

    PKB_INTEGRA_USUARIOS;
  exception
    when others then
      rollback;
      dbms_output.put_line('ERRO GERAL FATAL: ' || sqlerrm);
      if sqlcode <> -20001 then
        raise_application_error(-20001, sqlerrm);
      end if;
      raise;
  end PKB_INTEGRA_CADASTRO;

end PK_ESCALA_INTELIGENTE;
/
