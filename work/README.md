# Escala Digital

Aplicacao web para gerar, consultar e salvar escalas em banco Oracle.

## Decisoes iniciais

- Backend em Node.js para reaproveitar as regras JavaScript sem reescrita em outra linguagem.
- Frontend separado em HTML, CSS e JavaScript.
- Credenciais do Oracle somente por variaveis de ambiente.
- Login validado no backend, com senha armazenada como hash.
- Regra de calculo isolada em modulo proprio antes de qualquer alteracao funcional.

## Estrutura

```txt
work/
  public/
    css/app-original.css
    js/app-original.js
    js/escala-rules-core.js
    js/login.js
  src/
    config/env.js
    db/oracle.js
    middleware/
    routes/
    rules/escalaRules.js
    services/
    server.js
  docs/
```

## Setup local

1. Instalar Node.js LTS.
2. Instalar Oracle Instant Client compativel com o servidor.
3. Copiar `.env.example` para `.env`.
4. Para simular localmente sem Oracle, manter `DB_DRIVER=mock`.
5. Para conectar no Oracle, usar `DB_DRIVER=oracle` e preencher `.env` com as credenciais novas do banco.
6. Instalar dependencias:

```bash
npm install
```

7. Iniciar:

```bash
npm start
```

8. Abrir:

```txt
http://localhost:3000/login.html
```

Login local do modo mock:

```txt
Usuario: admin
Senha: admin123
```

## Modo mock

O modo `DB_DRIVER=mock` usa [data/mock-db.json](data/mock-db.json) para simular as tabelas Oracle. Ele permite testar localmente:

- login;
- permissao por loja;
- consulta de lojas;
- consulta de funcionarios;
- consulta de ausencias;
- salvamento de escala teste.

Quando o ambiente do trabalho estiver disponivel, mude para `DB_DRIVER=oracle`.

## Testes e reset local

Para recriar a base mock:

```bash
npm run mock:reset
```

Para gerar uma massa local maior, mais proxima do uso real com 70 lojas:

```bash
npm run mock:seed-large
```

Esse comando recria `data/mock-db.json` com 70 lojas, 560 funcionarios, usuarios por loja, funcoes, secoes e ausencias variadas.

Para rodar os testes das APIs principais:

```bash
npm test
```

Os testes cobrem login, consulta de lojas/funcionarios, salvamento estruturado da escala, bloqueio por ausencia e revisao no mock.

## Roteiros do projeto

- [Escopo restante](docs/alteracoes-restantes.md)
- [Escopo de desenvolvimento Savegnago](docs/escopo-dev-savegnago.md)
- [Banco Oracle](docs/database.md)
- [Seguranca](docs/security.md)
- [Deploy Linux via PuTTY](docs/deploy-linux-putty.md)
- [GitHub privado](docs/github-privado.md)

## Observacao sobre credenciais

A senha usada em qualquer print, chat ou documento deve ser tratada como exposta. Troque a senha do schema antes de conectar esta aplicacao ao banco real.
