set define off

begin
  -- Preserva os perfis operacionais e evita herdar grants antigos em perfis personalizados.
  update SGN_ESC_PERFIL_PERMISSAO pp set pp.PODE_OFICIALIZAR = case
       when pp.PAGINA = 'escalas' and pp.PODE_EDITAR = 1
         and exists (
           select 1 from SGN_ESC_PERFIL p
            where p.PERFIL_ID = pp.PERFIL_ID
              and upper(p.NOME) in ('LIDER', 'GERENTE', 'RH')
         ) then 1
       else 0
     end
   where exists (
     select 1 from SGN_ESC_PERFIL p
      where p.PERFIL_ID = pp.PERFIL_ID
        and upper(p.NOME) <> 'ADMIN'
   );
end;
/
