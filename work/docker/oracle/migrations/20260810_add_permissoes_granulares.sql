set define off

begin
  execute immediate 'alter table SGN_ESC_PERFIL_PERMISSAO add (PODE_CRIAR number(1) default 0 not null)';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

begin
  execute immediate 'alter table SGN_ESC_PERFIL_PERMISSAO add (PODE_OFICIALIZAR number(1) default 0 not null)';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

begin
  execute immediate 'alter table SGN_ESC_PERFIL_PERMISSAO add (PODE_REPROCESSAR number(1) default 0 not null)';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

begin
  execute immediate 'alter table SGN_ESC_PERFIL_PERMISSAO add (PODE_ADMINISTRAR number(1) default 0 not null)';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

update SGN_ESC_PERFIL_PERMISSAO
set PODE_CRIAR = case when PODE_EDITAR = 1 then 1 else PODE_CRIAR end,
    PODE_OFICIALIZAR = case when PODE_EDITAR = 1 and PAGINA in ('escalas', 'escalas-funcionarios') then 1 else PODE_OFICIALIZAR end,
    PODE_REPROCESSAR = case when PODE_EDITAR = 1 and PAGINA = 'integracao-rm' then 1 else PODE_REPROCESSAR end,
    PODE_ADMINISTRAR = case when PAGINA in ('acessos', 'roles', 'configuracoes') and PODE_EDITAR = 1 then 1 else PODE_ADMINISTRAR end;

update SGN_ESC_PERFIL_PERMISSAO pp
set PODE_CRIAR = 1,
    PODE_OFICIALIZAR = 1,
    PODE_REPROCESSAR = 1,
    PODE_ADMINISTRAR = 1
where exists (
  select 1
  from SGN_ESC_PERFIL p
  where p.PERFIL_ID = pp.PERFIL_ID
    and upper(p.NOME) = 'ADMIN'
);

commit;
