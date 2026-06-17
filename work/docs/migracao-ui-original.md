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
- O fluxo de dados foi movido para APIs que consultam e gravam diretamente no Oracle.

## Ordem segura de migracao

1. Preservar a UI original funcionando atras do login.
2. Mapear todos os usos remanescentes de `localStorage`.
3. Extrair CSS para `public/css/app-original.css`.
4. Extrair JavaScript para modulos em `public/js`.
5. Isolar regras de calculo em `src/rules` e `public/js/escala-rules.js`.
6. Criar testes de regressao para comparar entradas e saidas com o arquivo original.
7. Trocar leitura de funcionarios para `/api/catalog/lojas/:lojaId/funcionarios`.
8. Trocar salvamento oficial de escala para `/api/escalas`.
9. Remover importacao/exportacao JSON como fluxo principal.

## Pontos de persistencia local identificados

- `escalasSalvas`
- `escalaConfig`
- `genericAppLicenseKey`

`genericAppLicenseKey` deixou de ser necessario no fluxo novo. `escalasSalvas` e `escalaConfig` nao representam persistencia oficial no Oracle; a persistencia oficial da escala fica em `SGN_ESC_PROG` e `ESC_PROG_DIA`.

## Progresso da persistencia

- Lojas carregam de `/api/catalog/lojas`.
- Funcionarios carregam de `/api/catalog/lojas/:lojaId/funcionarios` e preenchem os nomes do esqueleto.
- Ausencias carregam de `/api/catalog/lojas/:lojaId/ausencias`.
- Usuarios carregam e salvam por `/api/acessos/usuarios`.
- Ao salvar uma escala detalhada com funcionarios vinculados, a UI sincroniza com `/api/escalas`, preenchendo `SGN_ESC_PROG` e `ESC_PROG_DIA`.
- A UI manteve os nomes das funcoes principais para reduzir risco de alterar regras.

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

Execute:

```bash
npm test
```
