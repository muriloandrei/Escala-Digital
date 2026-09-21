set define off

declare
  v_perfil_id number;
  v_has_loja_principal number := 0;
begin
  merge into sgn_esc_perfil p
  using (select 'CONTROLADORIA' nome, 'Controladoria' descr from dual) s
  on (upper(p.nome) = s.nome)
  when matched then update set p.descr = s.descr, p.status = 'A'
  when not matched then insert (perfil_id, nome, descr, status, dt_hr_incl)
    values (sgn_esc_perfil_seq.nextval, s.nome, s.descr, 'A', sysdate);

  select perfil_id
    into v_perfil_id
    from sgn_esc_perfil
   where upper(nome) = 'CONTROLADORIA';

  delete from sgn_esc_perfil_permissao
   where perfil_id = v_perfil_id;

  insert into sgn_esc_perfil_permissao (
    perfil_id, pagina, pode_visualizar, pode_criar, pode_editar,
    pode_oficializar, pode_reprocessar, pode_excluir, pode_administrar, dt_hr_incl
  )
  select v_perfil_id,
         gp.pagina,
         gp.pode_visualizar,
         gp.pode_criar,
         gp.pode_editar,
         gp.pode_oficializar,
         gp.pode_reprocessar,
         gp.pode_excluir,
         gp.pode_administrar,
         sysdate
    from sgn_esc_perfil_permissao gp
    join sgn_esc_perfil gerente on gerente.perfil_id = gp.perfil_id
   where upper(gerente.nome) = 'GERENTE';

  update sgn_esc_usuario
     set perfil = 'CONTROLADORIA'
   where usuario_id in (744, 1600, 171, 770, 3563, 3564);

  merge into sgn_esc_usuario_loja ul
  using (
    select u.usuario_id, l.loja
      from sgn_esc_usuario u
      cross join sgn_esc_loja l
     where u.usuario_id in (744, 1600, 171, 770, 3563, 3564)
  ) src
  on (ul.usuario_id = src.usuario_id and ul.loja = src.loja)
  when not matched then insert (usuario_id, loja)
    values (src.usuario_id, src.loja);

  select count(*)
    into v_has_loja_principal
    from user_tab_columns
   where table_name = 'SGN_ESC_USUARIO'
     and column_name = 'LOJA_PRINCIPAL';

  if v_has_loja_principal > 0 then
    update sgn_esc_usuario
       set loja_principal = null
     where usuario_id in (744, 1600, 171, 770, 3563, 3564);
  end if;

  commit;
end;
/
