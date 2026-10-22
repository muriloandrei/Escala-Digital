create or replace PACKAGE BODY PK_VT IS



--

/*

delete from sgn_vt_compra_func_files;

delete from sgn_vt_compra_func;

delete from sgn_vt_compra;

delete from sgn_vt_adesao_files;

delete from sgn_vt_adesao;



BEGIN

   for rec1 in (select v.vtcompra_id

                  from tcnx_loja l

                     , sgn_vt_compra v

                 where l.nro in (2,11,12,14,32,50,6,8,13,16,17,24,25,26,28,37,15,19,34,31,21)

                   and l.loja_id = v.loja_id)

   loop

      delete from sgn_vt_compra_func a where a.vtcompra_id = rec1.vtcompra_id;

      delete from sgn_vt_compra a where a.vtcompra_id = rec1.vtcompra_id;

   end loop;

end;

*/



PROCEDURE PKB_EXCLUI_COMPRA (en_vtcompra_id in Tint) IS



BEGIN

   for rec1 in (select v.vtcompfunc_id

                  from sgn_vt_compra_func v

                 where v.vtcompra_id = en_vtcompra_id)

   loop

      delete from sgn_vt_compra_func_files a where a.vtcompfunc_id = rec1.vtcompfunc_id;

      delete from sgn_vt_compra_func       a where a.vtcompfunc_id = rec1.vtcompfunc_id;

   end loop;

--

   delete from sgn_vt_compra a

   where a.vtcompra_id = en_vtcompra_id;

--

   commit;

--



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_EXCLUI_COMPRA'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_EXCLUI_COMPRA;



--





-- A loja so muda de fonte no mes explicitamente liberado para VT.
-- Frente de Caixa 02.002 e Portaria 02.012 usam o codigo; as demais
-- secoes operacionais seguem o mesmo escopo por descricao da Escala.
FUNCTION FKG_USA_ESCALA_INTELIGENTE (en_nroempresa in Tint
                                    ,ev_chapa      in Tstr
                                    ,ed_dt_ref     in date) return Tint is
  vn_encontrado Tint;
begin
  select count(*) into vn_encontrado
    from SGN_VT_ESCALA_INT_LOJA l
   where l.loja = en_nroempresa
     and trunc(ed_dt_ref, 'MM') >= l.mes_inicio
     and (l.mes_fim is null or trunc(ed_dt_ref, 'MM') <= l.mes_fim);
  if vn_encontrado = 0 then return 0; end if;

  select count(*) into vn_encontrado
    from pfunc f
   where f.chapa = ev_chapa
     and f.codcoligada = 1
     and f.nroempresa = en_nroempresa
     and (
       regexp_like(trim(f.codsecao), '(^|[.])02[.]002$')
       or (en_nroempresa <> 999 and regexp_like(trim(f.codsecao), '(^|[.])02[.]012$'))
       or exists (
         select 1 from ESCALAINT.SGN_ESC_SECAO s
          where s.codcoligada = f.codcoligada
            and s.codfilial = f.codfilial
            and s.cod_secao = f.codsecao
            and s.status = 'A'
            and regexp_like(upper(nvl(s.descr, ' ')), 'FRENTE.*CAIXA|SERVI[CÇ]OS?.*CLIENT|TRANSPORT')
       )
     );
  return case when vn_encontrado > 0 then 1 else 0 end;
end FKG_USA_ESCALA_INTELIGENTE;


FUNCTION FKG_INICIO_PERIODO_OPERACIONAL (ed_dt_ref in date) return date is
begin
   return trunc(trunc(ed_dt_ref, 'MM') + 6, 'IW');
end FKG_INICIO_PERIODO_OPERACIONAL;


FUNCTION FKG_FIM_PERIODO_OPERACIONAL (ed_dt_ref in date) return date is
begin
   return FKG_INICIO_PERIODO_OPERACIONAL(add_months(trunc(ed_dt_ref, 'MM'), 1)) - 1;
end FKG_FIM_PERIODO_OPERACIONAL;


FUNCTION FKG_ESCALA_OK (en_nroempresa  in Tint

                       ,ev_chapa       in Tstr

                       ,ed_dt_ref      in date) return Tint IS



vn_ret        Tint;

vn_jovem      Tint;

vn_pendentes  Tint;

vd_inicio_periodo date;

vd_fim_periodo date;



BEGIN

--

   select case when instr(':' || a.codfuncao_jovem || ':',':' || b.codfuncao || ':') > 0 then 1 else 0 end

     into vn_jovem

     from pfunc         b

        , sgn_vt_param  a

    where b.chapa =ev_chapa;

--

   if FKG_USA_ESCALA_INTELIGENTE(en_nroempresa, ev_chapa, ed_dt_ref) = 1 then
      select count(*) into vn_ret
        from ESCALAINT.SGN_ESC_PROG p
        join ESCALAINT.SGN_ESC_SECAO s on s.escsecao_id = p.escsecao_id
       where p.loja = en_nroempresa
         and p.chapa = ev_chapa
         and p.mes_ref = trunc(ed_dt_ref, 'MM')
         and p.ativa = 1
         and p.revisao = (
           select max(px.revisao) from ESCALAINT.SGN_ESC_PROG px
            where px.loja = p.loja and px.escfunc_id = p.escfunc_id
              and px.mes_ref = p.mes_ref and px.ativa = 1)
         and p.oficializada = 1
         and (regexp_like(upper(nvl(s.descr, ' ')), 'FRENTE.*CAIXA|SERVI[CÇ]OS?.*CLIENT|TRANSPORT|PORTARIA')
              or regexp_like(trim(s.cod_secao), '(^|[.])02[.]012$'));
      vn_ret := case when vn_ret > 0 then 1 else 0 end;
      if vn_ret = 1 then
         vd_inicio_periodo := FKG_INICIO_PERIODO_OPERACIONAL(ed_dt_ref);
         vd_fim_periodo := FKG_FIM_PERIODO_OPERACIONAL(ed_dt_ref);
         select count(*) into vn_pendentes
           from ESCALAINT.SGN_ESC_PROG p
           join ESCALAINT.SGN_ESC_PROG_DIA d on d.escprog_id = p.escprog_id
           join ESCALAINT.SGN_ESC_SECAO s on s.escsecao_id = p.escsecao_id
          where p.loja = en_nroempresa and p.chapa = ev_chapa
            and p.ativa = 1 and p.oficializada = 0
            and p.revisao = (
              select max(px.revisao) from ESCALAINT.SGN_ESC_PROG px
               where px.loja = p.loja and px.escfunc_id = p.escfunc_id
                 and px.mes_ref = p.mes_ref and px.ativa = 1)
            and d.programacao = 'TRB'
            and d.dt >= vd_inicio_periodo
            and d.dt < vd_fim_periodo + 1
            and (regexp_like(upper(nvl(s.descr, ' ')), 'FRENTE.*CAIXA|SERVI[CÇ]OS?.*CLIENT|TRANSPORT|PORTARIA')
                 or regexp_like(trim(s.cod_secao), '(^|[.])02[.]012$'));
         if vn_pendentes > 0 then vn_ret := 0; end if;
      end if;
   else
      begin
         select 1 into vn_ret
           from sgn_prog_escala ax, tcnx_loja lx
          where lx.nro = en_nroempresa
            and ax.loja_id = lx.loja_id
            and ax.dt_ref = trunc(ed_dt_ref, 'MM')
            and ax.chapa = ev_chapa
            and exists (
              select 1 from sgn_escala_status r
               where r.loja_id = ax.loja_id and r.codigo = ax.codsecao
                 and r.dt_ref = ax.dt_ref and r.status = 1)
            and rownum = 1;
      exception
         when no_data_found then vn_ret := 0;
      end;
   end if;

--

   if vn_ret = 0 and vn_jovem = 1 then

      vn_ret := 2;

   end if;

--

   return (vn_ret);



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'FKG_ESCALA_OK'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END FKG_ESCALA_OK;



--



FUNCTION FKG_QTDE_COMPRA (ed_dt_ref      in date

                         ,ev_chapa       in Tstr

                         ,en_tipo_utiliz in Tint) return Tint is



vn_ret  Tint;



BEGIN

   select nvl(count(*),0)

     into vn_ret

     from sgn_vt_compra_func b

        , sgn_vt_compra      a

    where b.chapa       = ev_chapa

      and b.vtcompra_id = a.vtcompra_id

      and a.dt_ref      = ed_dt_ref

      and a.tipo_utiliz = en_tipo_utiliz

      and a.status     <> 4

      and nvl(b.qtde_vt,0) > 0

      and rownum        = 1;

--

   return (vn_ret);

--

EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'FKG_QTDE_COMPRA'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END FKG_QTDE_COMPRA;



--



PROCEDURE PKB_GERA_ADESAO_MUNICIPAL is



/*

BEGIN

   --

   BEGIN

      DBMS_SCHEDULER.drop_job(job_name => 'JOB_VT_INCLUSAO');

   EXCEPTION

      WHEN OTHERS THEN

         NULL;

   END;



   DBMS_SCHEDULER.CREATE_JOB(job_name            => 'JOB_VT_INCLUSAO'

                            ,job_type            => 'PLSQL_BLOCK'

                            ,job_action          => 'begin pk_vt.pkb_gera_adesao_municipal; end;'

                            ,number_of_arguments => 0

                            ,start_date          => to_date('21-09-2021 00:00:00', 'dd-mm-yyyy hh24:mi:ss')

                            ,repeat_interval     => 'FREQ=Daily; ByHour=5'

                            ,end_date            => NULL

                            ,enabled             => FALSE

                            ,auto_drop           => FALSE

                            ,comments            => 'Gera Adesão ao VT - Municipal');

   --

   DBMS_SCHEDULER.enable(name => 'JOB_VT_INCLUSAO');



END;

*/



BEGIN

   for rec1 in (select l.loja_id

                     , a.chapa

                  from rm.pfcompl@rm b

                      ,pfunc         a

                      ,tcnx_loja     l

                 where b.valetransporte  = 1

                   and b.chapa           = a.chapa

                   and b.codcoligada     = a.codcoligada

                   and a.dtdesligamento  is null

                   and l.nro             = a.nroempresa

                   and not exists (select 1

                                     from sgn_vt_adesao d

                                    where d.loja_id     = l.loja_id

                                      and d.chapa       = a.chapa

                                      and d.acao        = 0 -- Inclusão

                                      and d.tipo_utiliz = 0 -- Municipal

                                      and d.vtadesao_id = (select max(d2.vtadesao_id)

                                                             from sgn_vt_adesao d2

                                                            where d2.loja_id     = d.loja_id

                                                              and d2.chapa       = d.chapa

                                                              and d2.tipo_utiliz = 0)))

   loop

      insert into sgn_vt_adesao (vtadesao_id

                                ,loja_id

                                ,chapa

                                ,acao

                                ,status

                                ,dt_hr_incl

                                ,usuario_id_incl

                                ,tipo_utiliz

                                ,obs

                                ,usuario_id_rh

                                ,dt_hr_cien_rh

                                ,obs_rh

                                ,sld_vt

                                ,vtforn_id

                                ,vtlinha_id

                                ,vlr_vt)

                         values (vtadesao_seq.nextval

                                ,rec1.loja_id

                                ,rec1.chapa

                                ,0 -- Inclusão

                                ,1 -- Finalizado

                                ,sysdate

                                ,134 -- CPD

                                ,0 -- Municipal

                                ,'Inclusão automática'

                                ,134

                                ,sysdate

                                ,null

                                ,0

                                ,null

                                ,null

                                ,0);

--

   end loop;

--

   commit;

--



EXCEPTION

   when others then

        rollback;

--

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_GERA_ADESAO_MUNICIPAL'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;

--

END PKB_GERA_ADESAO_MUNICIPAL;



--



FUNCTION FKG_SEMAFARO_RECIBO_GLOBAL (en_vtcompra_id in Tint) return Tstr is



vv_ret          Tstr;

vn_qtde         Tint := 0;

vn_qtde_compra  Tint := 0;



BEGIN

    select nvl(count(*),0)

      into vn_qtde_compra

      from sgn_vt_compra_func a

     where a.vtcompra_id = en_vtcompra_id;

--

   if vn_qtde_compra > 0 then

--

       select nvl(count(*),0)

         into vn_qtde

         from sgn_vt_compra_func a

        where not exists (select 1

                            from sgn_vt_compra_func_files b

                           where b.vtcompfunc_id = a.vtcompfunc_id)

          and a.vtcompra_id = en_vtcompra_id;

--

    end if;

--

   if vn_qtde_compra > 0 then

--

       vv_ret :=  fg_semafaro (ev_color => case when vn_qtde > 0 then 'red'

                                           else                       'green'

                                           end

                              ,ev_min_width => 100

                              ,ev_text  => case when vn_qtde > 0 then 'Pendente'

                                           else                       'Concluído'

                                           end);

--

   else

--

       vv_ret :=  fg_semafaro (ev_color     => 'orange'

                              ,ev_min_width => 100

                              ,ev_text      => 'Aguardando Compra');

--

   end if;

--

    return (vv_ret);

--



EXCEPTION

   when others then

        rollback;

--

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'FKG_SEMAFARO_RECIBO_GLOBAL'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;

--



END FKG_SEMAFARO_RECIBO_GLOBAL;



--



FUNCTION FKG_SEMAFARO_RECIBO (en_vtcompfunc_id in Tint) return Tstr is



vv_ret  Tstr;

vn_qtde Tint;



BEGIN

    select nvl(count(*),0)

      into vn_qtde

      from sgn_vt_compra_func_files

     where vtcompfunc_id = en_vtcompfunc_id;

--

    vv_ret :=  fg_semafaro (ev_color => case when vn_qtde = 0 then 'red'

                                        else                       'green'

                                        end

                           ,ev_min_width => 100

                           ,ev_text  => case when vn_qtde = 0 then 'Pendente'

                                        else                       'Concluído'

                                        end);

--

    return (vv_ret);

--



EXCEPTION

   when others then

        rollback;

--

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'FKG_SEMAFARO_RECIBO'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;

--



END FKG_SEMAFARO_RECIBO;



--



PROCEDURE PKB_SEND_FINISH (en_vtcompra_id in Tint) IS



vv_assunto  Tstr;

vv_body     Tstr;



BEGIN

   for rec1 in (select a.vtcompra_id

                     , u.email

                  from sgn_vt_compra a

                     , sgn_usuario   u

                 where a.vtcompra_id = en_vtcompra_id

                   and a.status      = 3 -- Finalizado

                   and u.usuario_id  = a.usuario_id_incl)

   loop

      vv_assunto := '[VT] [FINALIZADO] - Solicitação de compra Vale Transporte';

--

      vv_body := 'Sua solicitação de ID: ' || rec1.vtcompra_id || ' já foi dada ciência pelo Gerente e pelo RH.';

--

      if instr(rec1.email,'@') > 0 then

--

         pk_envia_email_saveg.pb_envia_email (msg_to       => rec1.email

                                             ,msg_assunto  => vv_assunto

                                             ,msg_mensagem => null

                                             ,msg_clob     => vv_body);

--

      end if;

--

   end loop;

--

   commit;



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_SEND_FINISH'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_SEND_FINISH;



--



PROCEDURE PKB_SEND_REJEICAO_GERENTE (en_vtcompra_id in Tint) IS



vv_assunto  Tstr;

vv_body     Tstr;



BEGIN

   for rec1 in (select a.vtcompra_id

                     , u.email

                  from sgn_vt_compra a

                     , sgn_usuario   u

                 where a.vtcompra_id = en_vtcompra_id

                   and a.status      = 4 -- Rejeitado pelo gerente

                   and u.usuario_id  = a.usuario_id_incl)

   loop

      vv_assunto := '[VT] [REJEIÇÃO] [GERENTE] - Solicitação de compra Vale Transporte';

--

      vv_body := 'Sua solicitação de ID: ' || rec1.vtcompra_id || ' já rejeitada pelo Gerente.';

--

      if instr(rec1.email,'@') > 0 then

--

         pk_envia_email_saveg.pb_envia_email (msg_to       => rec1.email

                                             ,msg_assunto  => vv_assunto

                                             ,msg_mensagem => null

                                             ,msg_clob     => vv_body);

--

      end if;

--

   end loop;

--

   commit;



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_SEND_REJEICAO_GERENTE'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_SEND_REJEICAO_GERENTE;



--



PROCEDURE PKB_CIENCIA_RH (en_vtcompra_id in Tint

                         ,en_usuario_id  in Tint

                         ,ev_obs_rh      in Tstr) is



BEGIN

   update sgn_vt_compra a set a.usuario_id_rh = en_usuario_id

                            , a.dt_hr_cien_rh = sysdate

                            , a.obs_rh        = ev_obs_rh

                            , a.status        = 3 -- Finalizado

     where a.vtcompra_id = en_vtcompra_id;

--

   commit;

--

-- Envia e-mail para Solicitante

--

   pkb_send_finish (en_vtcompra_id => en_vtcompra_id);

--



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_CIENCIA_RH'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_CIENCIA_RH;



--



PROCEDURE PKB_SEND_CIENCIA_RH (en_vtcompra_id in Tint) IS



vv_assunto  Tstr;

vv_body     Tstr;

vv_email    Tstr;



BEGIN

   for rec1 in (select a.vtcompra_id

                  from sgn_vt_compra a

                 where a.vtcompra_id   = nvl(en_vtcompra_id,a.vtcompra_id)

                   and a.status        = 2 -- Aguardando Ciência RH

                   and a.usuario_id_rh is null)

   loop

      vv_assunto := '[VT] [CIÊNCIA] [RH] - Ciência da solicitação de compra Vale Transporte';

--

      vv_body := 'Você possui solicitação de compra de Vale Transporte pendente de ciência. ID: ' || rec1.vtcompra_id;

--

      vv_email := null;

--

      for rec_email in (select *

                          from sgn_param_email

                         where instr(descr,' #VT_RH#') > 0)

      loop

         vv_email := fg_emails (en_paramemail_id => rec_email.paramemail_id

                               ,en_loja_id       => null);

--

         if vv_email is not null then

--

            pk_envia_email_saveg.pb_envia_email (msg_to       => vv_email

                                                ,msg_assunto  => vv_assunto

                                                ,msg_mensagem => null

                                                ,msg_clob     => vv_body);

--

         end if;

--

      end loop;

--

   end loop;

--

   commit;



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_SEND_CIENCIA_RH'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_SEND_CIENCIA_RH;



--



PROCEDURE PKB_CIENCIA_GERENTE (en_vtcompra_id in Tint

                              ,en_usuario_id  in Tint

                              ,ev_obs_ger     in Tstr) is



BEGIN

   update sgn_vt_compra a set a.usuario_id_ger = en_usuario_id

                            , a.dt_hr_cien_ger = sysdate

                            , a.obs_ger        = ev_obs_ger

                            , a.status         = 2 -- Aguardando ciência RH

     where a.vtcompra_id = en_vtcompra_id;

--

   commit;

--

-- Envia e-mail para o RH

--

   pkb_send_ciencia_rh (en_vtcompra_id => en_vtcompra_id);

--



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_CIENCIA_GERENTE'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_CIENCIA_GERENTE;



--



PROCEDURE PKB_REABRE_SOLICITACAO (en_vtcompra_id in Tint) is



BEGIN

   update sgn_vt_compra a set a.status = 0 -- Em Elaboração

     where a.vtcompra_id = en_vtcompra_id;

--

   commit;

--



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_REABRE_SOLICITACAO'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_REABRE_SOLICITACAO;



--



PROCEDURE PKB_REJEICAO_GERENTE (en_vtcompra_id in Tint

                               ,en_usuario_id  in Tint

                               ,ev_obs_ger     in Tstr) is



BEGIN

   update sgn_vt_compra a set a.usuario_id_ger = en_usuario_id

                            , a.dt_hr_cien_ger = sysdate

                            , a.obs_ger        = ev_obs_ger

                            , a.status         = 4 -- Em Elaboração

     where a.vtcompra_id = en_vtcompra_id;

--

   commit;

--

-- Envia e-mail para o RH

--

   pkb_send_rejeicao_gerente (en_vtcompra_id => en_vtcompra_id);

--



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_REJEICAO_GERENTE'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_REJEICAO_GERENTE;



--



PROCEDURE PKB_SEND_CIENCIA_GERENTE (en_vtcompra_id in Tint) IS



vv_assunto  Tstr;

vv_body     Tstr;



BEGIN

   update sgn_vt_compra a set a.usuario_id_ger = null

                            , a.dt_hr_cien_ger = null

                            , a.obs_ger        = null

     where a.vtcompra_id = en_vtcompra_id;

--



-- Remover alteração case quando o gerente da 57 voltar

   /*for rec1 in (select a.vtcompra_id

                     , l.usuario_id_ger_loj

                     , u.email

                  from sgn_vt_compra a

                     , tcnx_loja     l

                     , sgn_usuario   u

                 where l.loja_id     = a.loja_id

                   and a.vtcompra_id = en_vtcompra_id

                   and a.status      in (0,1) -- Em Elaboração / Aguardando Ciência Gerente

                   and a.usuario_id_ger is null

                   and u.usuario_id  = l.usuario_id_ger_loj)*/

   for rec1 in (select a.vtcompra_id

                     , case when a.loja_id = 585 then u.usuario_id else l.usuario_id_ger_loj end usuario_id_ger_loj

                     , case when a.loja_id = 585 then u.email else u.email end email

                  from sgn_vt_compra a

                     , tcnx_loja     l

                     , sgn_usuario   u

                 where l.loja_id     = a.loja_id

                   and a.vtcompra_id = en_vtcompra_id

                   and a.status      in (0,1) -- Em Elaboração / Aguardando Ciência Gerente

                   and a.usuario_id_ger is null

                   and ( (a.loja_id = 585 and u.usuario_id = 1868) or ( u.usuario_id  = l.usuario_id_ger_loj )))

   loop

      vv_assunto := '[VT] [CIÊNCIA] [GERENCIA] - Ciência da solicitação de compra Vale Transporte';

--

      vv_body := 'Você possui solicitação de compra de Vale Transporte pendente de ciência. ID: ' || rec1.vtcompra_id;

--

      pk_envia_email_saveg.pb_envia_email (msg_to       => rec1.email

                                          ,msg_assunto  => vv_assunto

                                          ,msg_mensagem => null

                                          ,msg_clob     => vv_body);

--

      update sgn_vt_compra a set a.status         = 1

                               , a.dt_hr_cien_ger = null

                               , a.usuario_id_ger = null

                               , a.obs_ger        = null

       where vtcompra_id = rec1.vtcompra_id;

--

   end loop;

--

   commit;



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_SEND_CIENCIA_GERENTE'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_SEND_CIENCIA_GERENTE;



--





PROCEDURE PKB_SEND_MAIL_RH (en_vtadesao_id in Tint default null) is



vv_email    Tstr;

vv_assunto  Tstr;

vv_body     clob;



BEGIN

   for rec1 in (select a.vtadesao_id

                     , a.acao

                     , a.dt_hr_incl

                     , a.obs

                     , l.nro nroempresa

                     , f.nome

                     , f.chapa

                  from sgn_vt_adesao a

                     , tcnx_loja     l

                     , pfunc         f

                 where a.usuario_id_rh is null

                   and a.status      = 0

                   and l.loja_id     = a.loja_id

                   and f.chapa       = a.chapa

                   and f.codcoligada = 1

                   and a.vtadesao_id = nvl(en_vtadesao_id,a.vtadesao_id)

                   )

   loop

      vv_assunto := 'Ciência - Vale Transporte ( ' || case rec1.acao

                                                          when 0 then 'Inclusão'

                                                          when 1 then 'Exclusão'

                                                          when 2 then 'Demissão'

                                                      end || ' )';

--

      vv_body := 'ID: '         || rec1.vtadesao_id                              || '<br>' ||

                 'Loja: '       || rec1.nroempresa                               || '<br>' ||

                 'Chapa: '      || rec1.chapa                                    || '<br>' ||

                 'Nome: '       || rec1.nome                                     || '<br>' ||

                 'Dt.Hr.Incl: ' || to_char(rec1.dt_hr_incl,'dd/mm/yyyy hh24:mi') || '<br>' ||

                 'Observação: ' || rec1.obs;

 --

      vv_email := null;

--

      for rec_email in (select *

                          from sgn_param_email

                         where instr(descr,' #VT_RH#') > 0)

      loop

         vv_email := fg_emails (en_paramemail_id => rec_email.paramemail_id

                               ,en_loja_id       => null);

--

         if vv_email is not null then

--

            pk_envia_email_saveg.pb_envia_email (msg_to       => vv_email

                                                ,msg_assunto  => vv_assunto

                                                ,msg_mensagem => null

                                                ,msg_clob     => vv_body);

--

         end if;

--

      end loop;

--

   end loop;

--

   commit;



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_SEND_MAIL_RH'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;

--

END PKB_SEND_MAIL_RH;



--



PROCEDURE PKB_INCL_DEMITIDOS IS



vn_loja_id  Tnum;

vn_saldo    Tnum;

vn_found    Tint;

vn_valor    Tnum;

vn_sem_snapshot Tint;

vn_fonte_inteligente Tint;



BEGIN

   for rec1 in (select p.chapa

                     , p.datademissao

                     , p.nroempresa

                     , b.tipo_utiliz

                     , (a.vlr_tot_vt / a.qtde_vt) vlr_unit

                     , max(b.dt_ref) dt_ref_fim

                  from sgn_vt_compra      b

                     , sgn_vt_compra_func a

                     , pfunc              p

                 where b.dt_ref    between add_months(trunc(p.datademissao,'month'), -1)

                                    and last_day(last_day(p.datademissao)+1)

                   and b.vtcompra_id   = a.vtcompra_id

                   and a.chapa         = p.chapa
                   and (b.dt_ref >= trunc(p.datademissao,'month')
                        or exists (select 1
                                     from SGN_VT_ESCALA_SNAPSHOT_DIA sd
                                    where sd.vtcompfunc_id = a.vtcompfunc_id
                                      and sd.dt > trunc(p.datademissao)))

                   and p.datademissao >= trunc(sysdate)-10

                   and p.codcoligada   = 1

                   and a.qtde_vt       > 0

                   and b.status       <> 4 -- Rejeitado pelo Gerente

              group by p.chapa

                     , p.datademissao

                     , p.nroempresa

                     , b.tipo_utiliz

                     , a.vlr_tot_vt

                     , a.qtde_vt)

   loop

      begin

         select 1

           into vn_found

           from sgn_vt_adesao

          where chapa       = rec1.chapa

            and acao        = 2 -- Demissão

            and tipo_utiliz = rec1.tipo_utiliz

            and rownum      = 1;

--

      exception

          when no_data_found then

--

               select loja_id

                 into vn_loja_id

                 from tcnx_loja

                where nro = rec1.nroempresa;

--

               select count(*) into vn_fonte_inteligente
                 from sgn_vt_compra_func cf
                 join sgn_vt_compra c on c.vtcompra_id = cf.vtcompra_id
                 join SGN_VT_ESCALA_SNAPSHOT ss on ss.vtcompfunc_id = cf.vtcompfunc_id
                where cf.chapa = rec1.chapa and c.loja_id = vn_loja_id
                  and c.tipo_utiliz = rec1.tipo_utiliz and c.status <> 4
                  and c.dt_ref between add_months(trunc(rec1.datademissao, 'MM'), -1)
                                   and last_day(last_day(rec1.datademissao) + 1)
                  and ss.fonte = 'INTELIGENTE' and rownum = 1;

               if vn_fonte_inteligente > 0 or
                  FKG_USA_ESCALA_INTELIGENTE(rec1.nroempresa, rec1.chapa, rec1.dt_ref_fim) = 1 then
                  select count(*) into vn_sem_snapshot
                    from sgn_vt_compra_func cf
                    join sgn_vt_compra c on c.vtcompra_id = cf.vtcompra_id
                   where cf.chapa = rec1.chapa and c.loja_id = vn_loja_id
                     and c.tipo_utiliz = rec1.tipo_utiliz and c.status <> 4
                     and c.dt_ref between add_months(trunc(rec1.datademissao, 'MM'), -1)
                                      and last_day(last_day(rec1.datademissao) + 1)
                     and c.dt_ref >= date '2026-11-01'
                     and cf.qtde_vt > 0
                     and not exists (select 1 from SGN_VT_ESCALA_SNAPSHOT ss
                                      where ss.vtcompfunc_id = cf.vtcompfunc_id);
                  if vn_sem_snapshot > 0 then
                     raise_application_error(-20002,
                       'Compra de VT sem retrato da escala para ' || rec1.chapa ||
                       '. Calcule o saldo de desligamento manualmente.');
                  end if;

                  select count(distinct sd.dt) into vn_saldo
                    from sgn_vt_compra_func cf
                    join sgn_vt_compra c on c.vtcompra_id = cf.vtcompra_id
                    join SGN_VT_ESCALA_SNAPSHOT ss on ss.vtcompfunc_id = cf.vtcompfunc_id
                    join SGN_VT_ESCALA_SNAPSHOT_DIA sd on sd.vtcompfunc_id = ss.vtcompfunc_id
                   where cf.chapa = rec1.chapa and c.loja_id = vn_loja_id
                     and c.tipo_utiliz = rec1.tipo_utiliz and c.status <> 4
                     and c.dt_ref between add_months(trunc(rec1.datademissao, 'MM'), -1)
                                      and last_day(last_day(rec1.datademissao) + 1)
                     and cf.qtde_vt > 0
                     and sd.dt > trunc(rec1.datademissao)
                     and sd.dt < add_months(trunc(rec1.datademissao, 'MM'), 3);
               else
                  vn_saldo := fkg_dias_trab (ed_dt_inic => rec1.datademissao + 1
                                            ,ed_dt_fim  => last_day(rec1.dt_ref_fim)
                                            ,ev_chapa   => rec1.chapa
                                            ,en_loja_id => vn_loja_id);
               end if;

--

               vn_saldo := vn_saldo * 2;

--

               vn_valor := round(vn_saldo * rec1.vlr_unit,2);

--

               begin

                  insert into sgn_vt_adesao (vtadesao_id

                                            ,loja_id

                                            ,chapa

                                            ,acao

                                            ,status

                                            ,dt_hr_incl

                                            ,usuario_id_incl

                                            ,tipo_utiliz

                                            ,obs

                                            ,usuario_id_rh

                                            ,dt_hr_cien_rh

                                            ,obs_rh

                                            ,sld_vt

                                            ,vlr_vt)

                                     values (vtadesao_seq.nextval

                                            ,vn_loja_id

                                            ,rec1.chapa

                                            ,2

                                            ,0

                                            ,sysdate

                                            ,134 -- CPD

                                            ,rec1.tipo_utiliz

                                            ,'Demissão em ' || to_char(rec1.datademissao,'dd/mm/yyyy')

                                            ,null

                                            ,null

                                            ,null

                                            ,vn_saldo

                                            ,vn_valor);

--

               end;

--

      end;

--

   end loop;

--

   commit;



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_INCL_DEMITIDOS'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;



END PKB_INCL_DEMITIDOS;



--



PROCEDURE PKB_EXCLUI_FUNC_SOLIC (vt_id in apex_application_global.vc_arr2) IS



ve_saida  exception;

i         Tint;



BEGIN

   if vt_id.count = 0 then

--

       apex_error.add_error (p_message          => 'Nenhum registro marcado!'

                            ,p_additional_info  => null

                            ,p_display_location => apex_error.c_inline_in_notification);

--

      raise ve_saida;

--

   end if;

--

   i := vt_id.first;

--

   while i is not null

   loop

--

      delete from sgn_vt_compra_func

       where vtcompfunc_id = vt_id (i);

--

      i := vt_id.next(i);

--

   end loop;

--

   commit;





EXCEPTION

   when ve_saida then

        null;

--

   when others then

        rollback;

--

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_EXCLUI_FUNC_SOLIC'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;

--



END PKB_EXCLUI_FUNC_SOLIC;



--



PROCEDURE PKB_APURA_DIAS_TRAB (ed_dt_inic       in date

                             ,ed_dt_fim        in date

                             ,ev_chapa         in Tstr

                             ,en_loja_id       in Tstr
                             ,en_vtcompfunc_id in Tnum
                             ,vn_count         out Tint) is



vn_codfuncao     Tint;

vn_found         Tint;

vn_loja_nro      Tint;

vn_fonte_nova    Tint;

vt_param         sgn_vt_param%rowtype;

vv_loja_grat     Tstr;



begin

--

   vn_count := 0;

--

   select *

     into vt_param

     from sgn_vt_param;

   select nro into vn_loja_nro from tcnx_loja where loja_id = en_loja_id;
   vn_fonte_nova := FKG_USA_ESCALA_INTELIGENTE(vn_loja_nro, ev_chapa, ed_dt_inic);

--

   begin

      select codfuncao

        into vn_codfuncao

        from pfunc

       where chapa       = ev_chapa

         and codcoligada = 1;

--

   exception

      when no_data_found then

           vn_codfuncao   := null;

   end;

--

   for rec1 in (
      select dias.dt,
             fg_so_caracter(to_char(dias.dt, 'DY', 'NLS_DATE_LANGUAGE=PORTUGUESE')) dia_sem
        from (
          select trunc(e.dt) dt
            from sgn_escala_func e
           where vn_fonte_nova = 0 and e.chapa = ev_chapa
             and nvl(e.programacao, 'TRAB') = 'TRAB'
             and e.dt >= trunc(ed_dt_inic) and e.dt < trunc(ed_dt_fim) + 1
          union
          select trunc(d.dt) dt
            from ESCALAINT.SGN_ESC_PROG p
            join ESCALAINT.SGN_ESC_PROG_DIA d on d.escprog_id = p.escprog_id
            join ESCALAINT.SGN_ESC_SECAO s on s.escsecao_id = p.escsecao_id
           where vn_fonte_nova = 1 and p.loja = vn_loja_nro and p.chapa = ev_chapa
             and p.ativa = 1
             and p.revisao = (
               select max(px.revisao) from ESCALAINT.SGN_ESC_PROG px
                where px.loja = p.loja and px.escfunc_id = p.escfunc_id
                  and px.mes_ref = p.mes_ref and px.ativa = 1)
             and d.programacao = 'TRB'
             and d.dt >= trunc(ed_dt_inic) and d.dt < trunc(ed_dt_fim) + 1
             and (p.oficializada = 1 or (
               trunc(ed_dt_inic, 'MM') = date '2026-11-01'
               and p.mes_ref = date '2026-10-01'
               and trunc(d.dt) = date '2026-11-01'
               and exists (
                 select 1 from ESCALAINT.SGN_ESC_PROG pm
                 join ESCALAINT.SGN_ESC_SECAO sm on sm.escsecao_id = pm.escsecao_id
                  where pm.loja = p.loja and pm.escfunc_id = p.escfunc_id
                    and pm.mes_ref = date '2026-11-01'
                    and pm.ativa = 1 and pm.oficializada = 1
                    and pm.revisao = (
                      select max(pmx.revisao) from ESCALAINT.SGN_ESC_PROG pmx
                       where pmx.loja = pm.loja and pmx.escfunc_id = pm.escfunc_id
                         and pmx.mes_ref = pm.mes_ref and pmx.ativa = 1)
                    and (regexp_like(upper(nvl(sm.descr, ' ')), 'FRENTE.*CAIXA|SERVI[CÇ]OS?.*CLIENT|TRANSPORT|PORTARIA')
                         or regexp_like(trim(sm.cod_secao), '(^|[.])02[.]012$'))
               )
             ))
             and (regexp_like(upper(nvl(s.descr, ' ')), 'FRENTE.*CAIXA|SERVI[CÇ]OS?.*CLIENT|TRANSPORT|PORTARIA')
                  or regexp_like(trim(s.cod_secao), '(^|[.])02[.]012$'))
        ) dias
       order by dias.dt)

   loop

--

      begin

--

         select 1

           into vn_found

           from sgn_vt_dias_sem_compra

          where rec1.dt between dt_inic

                            and dt_fim

            and instr(':' || loja_id || ':',':' || en_loja_id || ':') > 0

            and ( codfuncao is null or instr(':' || codfuncao || ':',':' || vn_codfuncao || ':') > 0)

            and ( chapa     is null or instr(':' || chapa     || ':',':' || ev_chapa     || ':') > 0)

            and rownum = 1;

--

         continue; -- Dia não programado para compra de VT

--

      exception

         when no_data_found then

              null;

      end;

--

-- Verifica dia da semana que não será comprado VT, porque existe gratuidade no dia

--

      vv_loja_grat := case rec1.dia_sem

                        when 'SEG' then vt_param.seg_grat

                        when 'TER' then vt_param.ter_grat

                        when 'QUA' then vt_param.qua_grat

                        when 'QUI' then vt_param.qui_grat

                        when 'SEX' then vt_param.sex_grat

                        when 'SAB' then vt_param.sab_grat

                        when 'DOM' then vt_param.dom_grat

                      end;

--

     if vv_loja_grat is not null then

        if instr(':' || vv_loja_grat || ':',':' || en_loja_id || ':') > 0 then

           continue; -- VT Gratuido no dia

        end if;

     end if;

--

-- Verifica dia do feriado que não será comprado VT, porque existe gratuidade no dia

--

     begin

--

        select loja_id

          into vv_loja_grat

          from sgn_vt_feriado

         where dt = rec1.dt;

--

        if vv_loja_grat is not null then

           if instr(':' || vv_loja_grat || ':',':' || en_loja_id || ':') > 0 then

              continue; -- VT Gratuido no dia do feriado

           end if;

        end if;

--

     exception

        when no_data_found then

             null;

     end;

--

     vn_count := vn_count + 1; -- Compra VT

     if en_vtcompfunc_id is not null then
        insert into SGN_VT_ESCALA_SNAPSHOT_DIA (VTCOMPFUNC_ID, DT)
          values (en_vtcompfunc_id, rec1.dt);
     end if;

--

   end loop;

--

END PKB_APURA_DIAS_TRAB;


FUNCTION FKG_DIAS_TRAB (ed_dt_inic in date
                       ,ed_dt_fim  in date
                       ,ev_chapa   in Tstr
                       ,en_loja_id in Tstr) return Tint is
   vn_count Tint;
begin
   PKB_APURA_DIAS_TRAB(ed_dt_inic, ed_dt_fim, ev_chapa, en_loja_id, null, vn_count);
   return vn_count;

--



EXCEPTION

   when others then

        rollback;

--

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'FKG_DIAS_TRAB'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;

--



END FKG_DIAS_TRAB;



--



PROCEDURE PKB_INCLUI_FUNC_SOLIC (en_vtcompra_id in Tnum

                                ,vt_chapa       in apex_application_global.vc_arr2) IS



ve_saida              exception;

v_reg                 sgn_vt_compra%rowtype;

v_reg_param           sgn_vt_param%rowtype;

i                     Tint;

vn_qtde               Tint;

vn_dias_trab          Tint;

vd_dt_inic            date;

vn_qt_vt_ja_cred      Tint;

vn_debito             Tint;

vn_dias_trab_ant      Tint;

vn_dias_cred_ant      Tint;

vn_cred_ant_inteligente Tint;

vn_cred_ant_apex Tint;

vn_dias_escala        Tint;

vn_dias_snapshot      Tint;

vn_escala_ok          Tint;

vn_loja_nro           Tint;

vn_vtcompfunc_id      Tnum;

vv_fonte_escala       varchar2(12);

--

vd_dt_inic_escala     date;

vd_dt_fim_escala      date;

vd_dt_cred_ant        date;

vd_dt_inic_cred_ant   date;

vd_dt_fim_cred_ant    date;

vv_memoria            tstr;

vv_dias_nao_trab      Tstr;

vn_vlr_tot_vt         Tnum;

vn_vlr_vt             Tnum;

vn_qt_dia_subsidiado  Tint;

vn_deb_manual         Tint;

vn_cred_manual        Tint;

vv_codfuncao          Tnum;

vn_jovem              Tint;



   PROCEDURE ADD_MEMORIA (ev_msg   in Tstr

                         ,ev_color in Tstr default null) is



   BEGIN

      vv_memoria := case when ev_color is not null then '<span style="color:' || ev_color || ';">' end || vv_memoria || ev_msg ||

                    case when ev_color is not null then '</span>' end || '<br>';



   END ADD_MEMORIA;



--



BEGIN

   select *

     into v_reg_param

     from sgn_vt_param;

--

   select *

     into v_reg

     from sgn_vt_compra

    where vtcompra_id = en_vtcompra_id;

   select nro into vn_loja_nro from tcnx_loja where loja_id = v_reg.loja_id;

--

-- Carga Completa ou Parcial

--

   -- O periodo da escala depende da fonte de cada funcionario da compra.

--

   vd_dt_cred_ant    := add_months(v_reg.dt_ref,-2);

--

   if vt_chapa.count = 0 then

--

       apex_error.add_error (p_message          => 'Nenhum registro marcado!'

                            ,p_additional_info  => null

                            ,p_display_location => apex_error.c_inline_in_notification);

--

      raise ve_saida;

--

   end if;

--

   i := vt_chapa.first;

--

   while i is not null

   loop

--

      vv_memoria   := null;

      vn_dias_trab := 0;

      vn_escala_ok := FKG_ESCALA_OK(vn_loja_nro, vt_chapa(i), v_reg.dt_ref);

      vv_fonte_escala := case
        when FKG_USA_ESCALA_INTELIGENTE(vn_loja_nro, vt_chapa(i), v_reg.dt_ref) = 1
          then 'INTELIGENTE' else 'APEX' end;

      if vv_fonte_escala = 'INTELIGENTE' then
         vd_dt_inic_escala := FKG_INICIO_PERIODO_OPERACIONAL(v_reg.dt_ref);
         vd_dt_fim_escala := FKG_FIM_PERIODO_OPERACIONAL(v_reg.dt_ref);
         if trunc(v_reg.dt_ref, 'MM') = date '2026-11-01' then
            vd_dt_inic_escala := date '2026-11-01';
         end if;
         if v_reg.tipo_carga = 1 then
            vd_dt_inic_escala := greatest(vd_dt_inic_escala,
               fg_get_date(to_char(v_reg.dia_mes,'fm00') || '/' || to_char(v_reg.dt_ref,'mm/yyyy')));
         end if;
      else
         if v_reg.tipo_carga = 1 then
            vd_dt_inic_escala := fg_get_date(to_char(v_reg.dia_mes,'fm00') || '/' || to_char(v_reg.dt_ref,'mm/yyyy'));
         else
            vd_dt_inic_escala := trunc(v_reg.dt_ref,'month');
         end if;
         vd_dt_fim_escala := last_day(vd_dt_inic_escala);
      end if;

--

      select codfuncao

        into vv_codfuncao

        from pfunc

       where chapa = vt_chapa (i);

--

       vn_jovem := case when instr(':' || v_reg_param.codfuncao_jovem || ':',':' || vv_codfuncao || ':') > 0 then 1 else 0 end;

--

-- Contagem de dias a serem trabalhados na escala

--

      if vn_jovem = 0 then

--

         if vn_escala_ok = 1 then
            vn_dias_trab := fkg_dias_trab (ed_dt_inic => vd_dt_inic_escala

                                          ,ed_dt_fim  => vd_dt_fim_escala

                                          ,ev_chapa   => vt_chapa (i)

                                          ,en_loja_id => v_reg.loja_id);
         end if;

--

         add_memoria ('Dias Escala ' || to_char(vd_dt_inic_escala,'dd/mm/yyyy') ||
                     ' a ' || to_char(vd_dt_fim_escala,'dd/mm/yyyy') ||
                     ' (+) = ' || vn_dias_trab,'green');

--

      else

--

         add_memoria ('Jovem Aprendiz.','green');

--

      end if;

      vn_dias_escala := vn_dias_trab;

--

     begin

        select nvl(qtde_cred,0)

             , nvl(qtde_deb,0)

          into vn_cred_manual

             , vn_deb_manual

          from sgn_vt_deb_cred

         where vtcompra_id = en_vtcompra_id

            and chapa      = vt_chapa (i);

--

         if vn_cred_manual > 0 then

            add_memoria ('Créditos Manual (+) ' || vn_cred_manual,'green');

            vn_dias_trab := vn_dias_trab + vn_cred_manual;

         end if;

--

         if vn_deb_manual > 0 then

            add_memoria ('Débitos Manual (-) ' || vn_deb_manual,'red');

         end if;

--

      exception

         when no_data_found then

              vn_cred_manual := 0;

              vn_deb_manual  := 0;

      end;

--

-- Contagem de VT já creditados em outras compras do mês

--

      select nvl(sum(dias_cred * a.qt_vt_func),0)

        into vn_qt_vt_ja_cred

        from sgn_vt_compra_func b

           , sgn_vt_compra      a

       where b.chapa       = vt_chapa (i)

         and b.vtcompra_id = a.vtcompra_id

         and a.vtforn_id   = v_reg.vtforn_id

         and a.vtlinha_id  = v_reg.vtlinha_id

         and a.dt_ref      = v_reg.dt_ref

         and a.loja_id     = v_reg.loja_id

         and a.tipo_utiliz = v_reg.tipo_utiliz

         and a.status     <> 4; -- Não Rejeitado

--

      if vn_qt_vt_ja_cred> 0 then

         add_memoria ('<hr>Outras Compras em (Em nro de VT) ' || to_char(v_reg.dt_ref,'mm/yyyy') || ' (-) = ' || vn_qt_vt_ja_cred* -1,'red');

      end if;

--

-- Dias Creditados no mês anterior

--

      vn_debito        := 0;

      vn_dias_cred_ant := 0;

      vn_dias_trab_ant := 0;

      vv_dias_nao_trab := null;

--

      if vn_jovem = 0 and v_reg.tipo_carga = 0 then -- Completa

--

         select count(*) into vn_cred_ant_inteligente
           from sgn_vt_compra_func b
           join sgn_vt_compra a on a.vtcompra_id = b.vtcompra_id
           join SGN_VT_ESCALA_SNAPSHOT ss on ss.vtcompfunc_id = b.vtcompfunc_id
          where b.chapa = vt_chapa(i) and a.loja_id = v_reg.loja_id
            and a.dt_ref = vd_dt_cred_ant and a.tipo_utiliz = v_reg.tipo_utiliz
            and a.status <> 4 and ss.fonte = 'INTELIGENTE' and rownum = 1;

         select count(*) into vn_cred_ant_apex
           from sgn_vt_compra_func b
           join sgn_vt_compra a on a.vtcompra_id = b.vtcompra_id
           join SGN_VT_ESCALA_SNAPSHOT ss on ss.vtcompfunc_id = b.vtcompfunc_id
          where b.chapa = vt_chapa(i) and a.loja_id = v_reg.loja_id
            and a.dt_ref = vd_dt_cred_ant and a.tipo_utiliz = v_reg.tipo_utiliz
            and a.status <> 4 and ss.fonte = 'APEX' and rownum = 1;

         if vn_cred_ant_inteligente > 0 and vn_cred_ant_apex > 0 then
            raise_application_error(-20002,
              'Compras anteriores em fontes APEX e Escala Inteligente para a chapa ' || vt_chapa(i) ||
              '. Concilie os dias de VT antes de nova compra.');
         end if;

         vd_dt_inic_cred_ant := trunc(vd_dt_cred_ant, 'MM');
         vd_dt_fim_cred_ant := last_day(vd_dt_cred_ant);
         if vn_cred_ant_inteligente > 0 then
            vd_dt_inic_cred_ant := FKG_INICIO_PERIODO_OPERACIONAL(vd_dt_cred_ant);
            vd_dt_fim_cred_ant := FKG_FIM_PERIODO_OPERACIONAL(vd_dt_cred_ant);
            if trunc(vd_dt_cred_ant, 'MM') = date '2026-11-01' then
               vd_dt_inic_cred_ant := date '2026-11-01';
            end if;
         end if;

         select nvl(sum(dias_cred),0)

           into vn_dias_cred_ant

           from sgn_vt_compra_func b

              , sgn_vt_compra      a

          where b.chapa       = vt_chapa (i)

            and b.vtcompra_id = a.vtcompra_id

            and a.vtforn_id   = v_reg.vtforn_id

            and a.vtlinha_id  = v_reg.vtlinha_id

            and a.dt_ref      = vd_dt_cred_ant

            and a.loja_id     = v_reg.loja_id

            and a.tipo_utiliz = v_reg.tipo_utiliz

            and a.status     <> 4; -- Não Rejeitado

--

         if vn_dias_cred_ant > 0 then

--

            add_memoria ('<hr>Dias de VT comprados em ' || to_char(vd_dt_cred_ant,'mm/yyyy') || ' = ' || vn_dias_cred_ant,'black');

--

-- Dias Trabalhados

--

            select nvl(sum(decode(htrab,0,0,1)),0)

              into vn_dias_trab_ant

              from aafhtfun a

             where a.chapa       = vt_chapa (i)

               and a.codcoligada = 1

               and a.data between vd_dt_inic_cred_ant

                             and vd_dt_fim_cred_ant;

--

            add_memoria ('Dias Trab. em ' || to_char(vd_dt_cred_ant,'mm/yyyy') || ' = ' || vn_dias_trab_ant,'green');

--

            select listagg (to_char(a.data,'dd'),', ') within group (order by a.data)

              into vv_dias_nao_trab

              from rm.aafhtfun@rm a

             where a.chapa        = vt_chapa (i)

               and a.codcoligada  = 1

               and nvl(a.htrab,0) = 0

               and (a.compensado + a.descanso) = 0

               and a.data between vd_dt_inic_cred_ant

                             and vd_dt_fim_cred_ant;

--

            if vv_dias_nao_trab is not null then

               add_memoria ('Dias Não Trab. em ' || to_char(vd_dt_cred_ant,'mm/yyyy') || ' = ' || vv_dias_nao_trab,'red');

            end if;

--

            if vn_dias_trab_ant < vn_dias_cred_ant then

               vn_debito := vn_dias_cred_ant - vn_dias_trab_ant;

               add_memoria ('Dias a debitar (-) = ' || vn_debito,'red');

            else

               vn_debito := 0;

            end if;

--

         else

--

            vn_debito := 0;

--

         end if;

--

      end if;

--

      add_memoria ('<hr>Dias Créditos Nessa Compra = ' || vn_dias_trab,'blue');

--

      vn_debito := vn_debito + vn_deb_manual;

      add_memoria ('<hr>Dias Débito = ' || vn_debito,'red');

--

      add_memoria ('<hr>Qtde VT por dia = ' || v_reg.qt_vt_func,'blue');

--

      vn_qtde   := (vn_dias_trab - vn_debito) * v_reg.qt_vt_func;

      add_memoria ('<hr>Qtde VT dessa compra = ' || vn_qtde,'Blue');

--

      add_memoria ('<hr>Qtde VT Final = ' || vn_qtde || ' - ' || vn_qt_vt_ja_cred || ' (Outras Compras) = ' || (vn_qtde - vn_qt_vt_ja_cred),'red');

      vn_qtde := vn_qtde - vn_qt_vt_ja_cred;

--

-- Seleciona o valor do VT da Linha

--

      begin

         select a.vlr

              , l.qt_dia_subsidiado

           into vn_vlr_vt

              , vn_qt_dia_subsidiado

           from sgn_vt_forn_valor a

              , sgn_vt_linha      l

          where l.vtlinha_id  = v_reg.vtlinha_id

            and l.tipo_utiliz = v_reg.tipo_utiliz

            and a.vtlinha_id  = l.vtlinha_id

            and a.dt_inic   = (select max(b.dt_inic)

                                 from sgn_vt_forn_valor b

                                where b.vtlinha_id = a.vtlinha_id

                                  and b.dt_inic  <= last_day (v_reg.dt_ref));

--

      exception

         when no_data_found then

              vn_vlr_vt            := 0;

              vn_qt_dia_subsidiado := 0;

      end;

--

      if vn_qtde < 0 then

         vn_qtde := 0;

      end if;

--

      if nvl(vn_qt_dia_subsidiado,0) > 0 then

         if vn_qt_dia_subsidiado > (vn_dias_trab - vn_debito) then

            vn_qt_dia_subsidiado := vn_dias_trab - vn_debito;

         end if;

         vn_qtde := vn_qtde - ( vn_qt_dia_subsidiado * v_reg.qt_vt_func );

         if vn_qtde < 0 then

            vn_qtde := 0;

         end if;

      end if;

--

      vn_vlr_tot_vt := vn_vlr_vt * vn_qtde;

--

-- Insere Movimento

--

      vn_vtcompfunc_id := vtcompfunc_seq.nextval;

      insert into sgn_vt_compra_func (vtcompfunc_id

                                     ,vtcompra_id

                                     ,chapa

                                     ,dt_hr_incl

                                     ,dias_cred

                                     ,dias_deb

                                     ,memoria_calc

                                     ,qtde_vt

                                     ,vlr_tot_vt

                                     ,qtde_vt_subsidiado)

                              values (vn_vtcompfunc_id         -- vtcompfunc_id

                                     ,en_vtcompra_id          -- vtcompra_id

                                     ,vt_chapa (i)            -- chapa

                                     ,sysdate                 -- dt_hr_incl

                                     ,vn_dias_trab            -- dias_cred

                                     ,vn_debito               -- dias_deb

                                     ,vv_memoria              -- memoria_calc

                                     ,vn_qtde                 -- qtde_vt

                                     ,vn_vlr_tot_vt           -- vlr_tot_vt

                                     ,vn_qt_dia_subsidiado);

      insert into SGN_VT_ESCALA_SNAPSHOT
        (VTCOMPFUNC_ID, FONTE, DIAS_ESCALA, DT_HR_CAPTURA)
      values (vn_vtcompfunc_id, vv_fonte_escala, vn_dias_escala, sysdate);

      if vn_jovem = 0 and vn_escala_ok = 1 then
         PKB_APURA_DIAS_TRAB(vd_dt_inic_escala, vd_dt_fim_escala,
                            vt_chapa(i), v_reg.loja_id,
                            vn_vtcompfunc_id, vn_dias_snapshot);
         if vn_dias_snapshot <> vn_dias_escala then
            raise_application_error(-20002,
              'Escala alterada durante a compra do VT para a chapa ' || vt_chapa(i) ||
              '. Refaça a solicitação.');
         end if;
      end if;

--

      <<proximo>>

--

      i := vt_chapa.next(i);

--

   end loop;

--

   commit;

--



EXCEPTION

   when ve_saida then

        null;

--

   when others then

        rollback;

--

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_INCLUI_FUNC_SOLIC'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;

--



END PKB_INCLUI_FUNC_SOLIC;



--



PROCEDURE PKB_JOB_CIENCIA IS



/*



BEGIN

   --

   BEGIN

      DBMS_SCHEDULER.drop_job(job_name => 'JOB_VT_SEND_CIENCIA');

   EXCEPTION

      WHEN OTHERS THEN

         NULL;

   END;



   DBMS_SCHEDULER.CREATE_JOB(job_name            => 'JOB_VT_SEND_CIENCIA'

                            ,job_type            => 'PLSQL_BLOCK'

                            ,job_action          => 'begin pk_vt.pkb_job_ciencia; end;'

                            ,number_of_arguments => 0

                            ,start_date          => to_date('08-08-2021 00:00:00', 'dd-mm-yyyy hh24:mi:ss')

                            ,repeat_interval     => 'FREQ=Daily; ByHour=7'

                            ,end_date            => NULL

                            ,enabled             => FALSE

                            ,auto_drop           => FALSE

                            ,comments            => 'Envia e-mail com solicitação de Ciência para VT - Vale Transporte');

   --

   DBMS_SCHEDULER.enable(name => 'JOB_VT_SEND_CIENCIA');



END;



*/



BEGIN

--

-- Inclui Funcionários demitidos

--

   pkb_incl_demitidos;

--

-- Ciência de Inclusão / Exclusão / Demitidos

--

   pkb_send_mail_rh (en_vtadesao_id => null);

--

-- Ciência de Solicitação de Compra de VT para o Gerente

--

   pkb_send_ciencia_gerente (en_vtcompra_id => null);

--

-- Ciência de Solicitação de Compra de VT para o RH

--

   pkb_send_ciencia_rh (en_vtcompra_id => null);

--



EXCEPTION

   when others then

        if sqlcode <> -20001 then

--

           gv_msg_erro := fg_get_line_error (ev_local   => gv_objeto

                                            ,ev_msg_usu => 'PKB_JOB_CIENCIA'

                                            ,ev_msg_ora => sqlerrm);

--

           raise_application_error (-20001,gv_msg_erro);

--

        end if;

--

        raise;

--

END PKB_JOB_CIENCIA;



--



END PK_VT;
