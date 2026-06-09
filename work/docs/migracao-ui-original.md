# Migracao da UI original

## Estado atual

A copia preservada do arquivo original esta em:

```txt
views/app-original.html
```

Ela e servida pelo backend em:

```txt
/app
```

O acesso passa pelo login em:

```txt
/login.html
```

## O que foi alterado na copia

- O bloqueio local de licenca foi desativado porque a autenticacao agora e feita pelo backend.
- Nenhuma regra de calculo da escala foi alterada nesta etapa.

## Ordem segura de migracao

1. Preservar a UI original funcionando atras do login.
2. Mapear todos os usos de `localStorage`.
3. Extrair CSS para `public/css/app-original.css`.
4. Extrair JavaScript para modulos em `public/js`.
5. Isolar regras de calculo em `src/rules` e `public/js/escala-rules.js`.
6. Criar testes de regressao para comparar entradas e saidas com o arquivo original.
7. Trocar leitura de funcionarios para `/api/catalog/lojas/:lojaId/funcionarios`.
8. Trocar salvamento de escala de `localStorage` para `/api/escalas`.
9. Remover importacao/exportacao JSON como fluxo principal, mantendo apenas backup administrativo se necessario.

## Pontos de persistencia local identificados

- `escalasSalvas`
- `escalaConfig`
- `genericAppLicenseKey`

`genericAppLicenseKey` deixou de ser necessario no fluxo novo.

## Progresso da persistencia

- `escalasSalvas` agora carrega de `/api/state` e salva em `/api/state/escalas` no modo mock.
- `escalaConfig` agora carrega de `/api/state` e salva em `/api/state/config` no modo mock.
- Lojas agora carregam de `/api/catalog/lojas` no modal de escala.
- Funcionarios agora carregam de `/api/catalog/lojas/:lojaId/funcionarios` e preenchem os nomes do esqueleto.
- Ao salvar uma escala detalhada com funcionarios vinculados, a UI tambem sincroniza com `/api/escalas`, preenchendo `SGN_ESC_PROG` e `SGN_ESC_PROG_DIA` no mock.
- A UI manteve os nomes das funcoes principais para reduzir risco de alterar regras.
- A proxima etapa e substituir esse armazenamento generico por tabelas definitivas no Oracle ou por uma tabela CLOB de rascunho/revisao, conforme a decisao de modelagem.

## Observacao sobre funcionarios

Nesta etapa, os funcionarios carregados do backend substituem apenas os nomes genericos `Colaborador 1`, `Colaborador 2` etc. A distribuicao de turnos continua usando a quantidade informada em cada turno, preservando o comportamento original da regra.

## Separacao do arquivo original

- CSS inline extraido para `public/css/app-original.css`.
- JavaScript principal extraido para `public/js/app-original.js`.
- Script de licenca legado extraido para `public/js/license-lock.js`.
- Nucleo puro de regras extraido para `public/js/escala-rules-core.js`.
- O HTML `views/app-original.html` agora referencia os arquivos externos.

## Regressao das regras

Os testes de regressao do nucleo de regras estao em:

```txt
test/rules-core.test.js
```

Eles cobrem:

- conversao de horario para minutos;
- conversao de minutos para horario;
- validacao de turno valido;
- fim de intervalo menor que inicio;
- intervalo fora do turno;
- intervalo abaixo do minimo;
- intervalo acima do maximo;
- jornada continua maxima.

Execute:

```bash
npm test
```
