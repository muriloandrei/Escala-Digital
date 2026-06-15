# Escala Digital

Aplicacao web para gerar, consultar e salvar escalas diretamente em banco Oracle.

## Decisoes

- Backend em Node.js para reaproveitar as regras JavaScript sem reescrita em outra linguagem.
- Frontend separado em HTML, CSS e JavaScript.
- Oracle e obrigatorio: nao existe modo de simulacao local nesta branch.
- Credenciais do Oracle somente por variaveis de ambiente.
- Login validado no backend, com senha armazenada como hash bcrypt.
- Regras de calculo isoladas em modulo proprio.

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

## Setup local ou servidor

1. Instalar Node.js LTS.
2. Instalar Oracle Instant Client compativel com o servidor.
3. Criar `.env` com as variaveis obrigatorias:

```env
JWT_SECRET=troque-por-uma-chave-forte
ORACLE_USER=usuario_da_aplicacao
ORACLE_PASSWORD=senha_da_aplicacao
ORACLE_CONNECT_STRING=host:porta/service
PORT=3000
COOKIE_SECURE=false
TRUST_PROXY=false
```

4. Instalar dependencias:

```bash
npm install
```

5. Iniciar:

```bash
npm start
```

6. Abrir:

```txt
http://localhost:3000/login.html
```

## Testes

Os testes automatizados mantidos nesta branch cobrem regras puras de calculo, sem simular banco.

```bash
npm test
```

Para validar a integracao real com Oracle, use o login da aplicacao e o diagnostico protegido:

```txt
/api/diagnostics/oracle
```

## Roteiros do projeto

- [Escopo restante](docs/alteracoes-restantes.md)
- [Escopo de desenvolvimento Savegnago](docs/escopo-dev-savegnago.md)
- [Banco Oracle](docs/database.md)
- [Requisicoes de banco](docs/requisicoes-banco.md)
- [Seguranca](docs/security.md)
- [Deploy Linux via PuTTY](docs/deploy-linux-putty.md)
- [GitHub privado](docs/github-privado.md)

## Observacao sobre credenciais

A senha usada em qualquer print, chat ou documento deve ser tratada como exposta. Troque a senha do schema antes de conectar esta aplicacao ao banco real.
