# Vale-transporte e Escala Inteligente

`PK_VT.body.sql` e o corpo completo enviado para analise, com alteracoes apenas
na escolha da fonte da escala, contagem de dias, inclusao da compra e saldo de
desligamento. Nao foi compilado contra o Oracle de producao. Compare-o com o
`USER_SOURCE` atual antes de substituir o corpo instalado.

## Escopo

- Lojas 2, 3, 7, 16, 35, 47, 52, 63, 64 e 300 a 315 usam a nova fonte a
  partir da compra de 11/2026. Lojas e meses anteriores seguem no APEX.
- A nova fonte vale apenas para Frente de Caixa canonica (`02.002`), Portaria
  (`02.012`, exceto 999), Servicos a Clientes e Transportes cadastrados na
  `SGN_ESC_SECAO`. Para os dois ultimos, a descricao operacional identifica
  os codigos reais; confira o resultado abaixo antes de liberar.
- `FKG_ESCALA_OK` exige a programacao ativa da maior revisao do funcionario
  no mes operacional de referencia, oficializada. Revisao antiga oficializada
  nao substitui revisao atual pendente.
- `FKG_DIAS_TRAB` conta datas `TRB` no intervalo calendario da compra,
  inclusive dias que pertencem a escala operacional do mes anterior. Dias
  repetidos sao contados uma vez. Regras de gratuidade e exclusao permanecem.
- Cada compra nova guarda os dias usados no calculo. O desligamento das lojas
  migradas usa esse retrato, e nao a escala que pode ter sido alterada depois.

## Antes da compilacao

1. Exporte o corpo e a specification atuais de `PK_VT`; compare assinaturas,
   objetos e qualquer ajuste posterior ao corpo fornecido.
2. Confirme que `SGN_VT_COMPRA_FUNC.VTCOMPFUNC_ID` e chave primaria ou unica.
   Execute `20261022_vt_escala_inteligente.sql` **uma vez**, no schema dono
   de `PK_VT`, apos backup. Nao execute dentro de `ESCALAINT`.
3. Conceda ao dono de `PK_VT` `SELECT` direto (nao so por role) sobre
   `ESCALAINT.SGN_ESC_PROG`, `ESCALAINT.SGN_ESC_PROG_DIA` e
   `ESCALAINT.SGN_ESC_SECAO`.
4. Confira os codigos abrangidos para cada loja. Exemplo:

```sql
select codfilial, cod_secao, descr, status
  from escalaint.sgn_esc_secao
 where codfilial in (2,3,7,16,35,47,52,63,64,300,301,302,303,304,
                    305,306,307,308,309,310,311,312,313,314,315)
   and (regexp_like(trim(cod_secao), '(^|[.])02[.](002|012)$')
        or regexp_like(upper(descr), 'SERVI[CÇ]OS?.*CLIENT|TRANSPORT'))
 order by codfilial, cod_secao;
```

5. Compras ja realizadas sem retrato **nao podem ser reconstruidas com
   garantia** a partir da escala vigente. Identifique-as antes da ativacao;
   desligamentos desses casos exigem revisao manual:

```sql
select c.loja_id, c.dt_ref, count(*) compras_sem_retrato
  from sgn_vt_compra c
  join sgn_vt_compra_func cf on cf.vtcompra_id = c.vtcompra_id
  left join sgn_vt_escala_snapshot ss on ss.vtcompfunc_id = cf.vtcompfunc_id
 where c.dt_ref >= date '2026-11-01'
   and c.status <> 4 and cf.qtde_vt > 0
   and ss.vtcompfunc_id is null
 group by c.loja_id, c.dt_ref
 order by c.loja_id, c.dt_ref;
```

## Validacao

Compile como dono de `PK_VT` e confirme `USER_ERRORS` vazio e package body
`VALID`. Compare `FKG_ESCALA_OK` e `FKG_DIAS_TRAB` para um empregado de uma loja
migrada e outro de uma loja APEX. Teste 01/11/2026 vindo da escala operacional
de outubro, uma revisao nova nao oficializada, folga/FER/AFA, compra parcial e
gratuidade. Faca uma compra de teste transacional e confira
`SGN_VT_ESCALA_SNAPSHOT` e `SGN_VT_ESCALA_SNAPSHOT_DIA`.

O SELECT da pagina APEX enviado nao consulta diretamente as tabelas da escala:
chama `PK_VT.FKG_ESCALA_OK`. Portanto **nao precisa ser alterado** para trocar
a fonte, desde que continue passando o numero da loja (`P9_NROEMPRESA`) e o
mes de referencia (`P10_DT_REF`). A inclusao da compra tambem foi alterada
para consultar a mesma funcao, evitando mostrar "Escala OK" e depois gravar
zero dias por ainda consultar `SGN_PROG_ESCALA`.
