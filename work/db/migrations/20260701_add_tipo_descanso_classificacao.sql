connect ESCALA/escala@FREEPDB1

begin
  execute immediate q'[alter table SGN_ESC_TIPO_DESCANSO add (CLASSIFICACAO varchar2(30) default 'OUTROS' not null)]';
exception
  when others then
    if sqlcode != -1430 then raise; end if;
end;
/

update SGN_ESC_TIPO_DESCANSO
   set CLASSIFICACAO = case
     when upper(SIGLA) = 'F' then 'FOLGA'
     when upper(SIGLA) in ('FER', 'FE') then 'FERIAS'
     else nvl(CLASSIFICACAO, 'OUTROS')
   end;

commit;
