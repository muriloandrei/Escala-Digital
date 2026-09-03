set serveroutput on

begin
  for par in (
    with secoes_norm as (
      select
        escsecao_id,
        codfilial,
        codcoligada,
        cod_secao,
        descr,
        upper(translate(
          descr,
          'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇáàâãäéèêëíìîïóòôõöúùûüç',
          'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc'
        )) descr_norm
      from sgn_esc_secao
    ),
    pares as (
      select
        src.escsecao_id as origem_id,
        src.descr as origem_descr,
        (
          select min(tgt.escsecao_id)
          from secoes_norm tgt
          where tgt.codfilial = src.codfilial
            and nvl(tgt.codcoligada, -1) = nvl(src.codcoligada, -1)
            and tgt.escsecao_id <> src.escsecao_id
            and tgt.descr_norm not like '%LIDER%'
            and (
              (src.descr_norm like '%DEPOSITO%' and tgt.descr_norm like '%DEPOSITO%')
              or (src.descr_norm like '%MERCEARIA%' and tgt.descr_norm like '%MERCEARIA%')
            )
        ) as destino_id
      from secoes_norm src
      where src.descr_norm like '%LIDER%'
        and (
          src.descr_norm like '%DEPOSITO%'
          or src.descr_norm like '%MERCEARIA%'
        )
    )
    select origem_id, origem_descr, destino_id
    from pares
    where destino_id is not null
  ) loop
    dbms_output.put_line('Unificando secao ' || par.origem_id || ' (' || par.origem_descr || ') em ' || par.destino_id);

    update sgn_esc_funcionario
       set escsecao_id = par.destino_id
     where escsecao_id = par.origem_id;

    update sgn_esc_prog
       set escsecao_id = par.destino_id
     where escsecao_id = par.origem_id;

    update sgn_esc_fixo_escala
       set escsecao_id = par.destino_id
     where escsecao_id = par.origem_id;

    insert into sgn_esc_usuario_secao (usuario_id, escsecao_id, status, dt_hr_incl)
    select us.usuario_id, par.destino_id, us.status, sysdate
      from sgn_esc_usuario_secao us
     where us.escsecao_id = par.origem_id
       and not exists (
         select 1
           from sgn_esc_usuario_secao destino
          where destino.usuario_id = us.usuario_id
            and destino.escsecao_id = par.destino_id
       );

    delete from sgn_esc_usuario_secao
     where escsecao_id = par.origem_id;

    delete from sgn_esc_secao_turno origem
     where origem.escsecao_id = par.origem_id
       and exists (
         select 1
           from sgn_esc_secao_turno destino
          where destino.escsecao_id = par.destino_id
            and destino.hr_ent1 = origem.hr_ent1
            and destino.hr_sai1 = origem.hr_sai1
            and destino.hr_ent2 = origem.hr_ent2
            and destino.hr_sai2 = origem.hr_sai2
            and destino.qtde_colaboradores = origem.qtde_colaboradores
       );

    update sgn_esc_secao_turno
       set escsecao_id = par.destino_id
     where escsecao_id = par.origem_id;

    delete from sgn_esc_subsecao origem
     where origem.escsecao_id = par.origem_id
       and exists (
         select 1
           from sgn_esc_subsecao destino
          where destino.escsecao_id = par.destino_id
            and upper(destino.descr) = upper(origem.descr)
       );

    update sgn_esc_subsecao
       set escsecao_id = par.destino_id
     where escsecao_id = par.origem_id;

    delete from sgn_esc_secao
     where escsecao_id = par.origem_id
       and not exists (select 1 from sgn_esc_funcionario where escsecao_id = par.origem_id)
       and not exists (select 1 from sgn_esc_secao_turno where escsecao_id = par.origem_id)
       and not exists (select 1 from sgn_esc_usuario_secao where escsecao_id = par.origem_id)
       and not exists (select 1 from sgn_esc_subsecao where escsecao_id = par.origem_id);
  end loop;

  commit;
end;
/
