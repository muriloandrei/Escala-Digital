# GitHub privado

## Objetivo

Versionar o projeto em um repositorio privado, sem enviar credenciais, banco real, logs, `node_modules` ou arquivos temporarios.

## Antes de subir

1. Confirmar que `.env` nao sera versionado.
2. Confirmar que `node_modules/` nao sera versionado.
3. Confirmar que logs e arquivos temporarios nao serao versionados.
4. Trocar qualquer senha que ja apareceu em print, chat ou arquivo compartilhado.
5. Confirmar que nenhum export real do banco Oracle sera versionado.

## Arquivos que devem ir

- `package.json`
- `package-lock.json`
- `src/`
- `public/`
- `views/`
- `scripts/`
- `test/`
- `docs/`
- `.env.example`
- `.gitignore`
- `README.md`

## Arquivos que nao devem ir

- `.env`
- `node_modules/`
- `*.log`
- backups com dados reais
- exports do banco real
- prints com usuario/senha/schema

## Criar repositorio privado pelo site

1. Abrir GitHub.
2. Criar um novo repositorio.
3. Marcar `Private`.
4. Nao adicionar README, `.gitignore` ou license pelo site se eles ja existirem localmente.
5. Copiar a URL do repositorio.

## Enviar pelo terminal

Executar na pasta do projeto:

```bash
cd "C:\Users\Murilo\Documents\Escala de Trabalho\work"
git init
git status
git add .
git status
git commit -m "Versao inicial da aplicacao de escala"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

Se o Git pedir login, usar GitHub Desktop, Git Credential Manager ou token pessoal de acesso. Nao colocar token dentro do projeto.

## Depois do primeiro push

1. Conferir no GitHub se `.env` nao subiu.
2. Conferir se `node_modules/` nao subiu.
3. Conferir se nao ha senha em commits, README, docs ou prints.
4. Ativar branch protection quando o projeto estiver em uso por mais pessoas.

## Fluxo recomendado de trabalho

```bash
git status
git add .
git commit -m "Descricao objetiva da alteracao"
git push
```

Para atualizar o servidor Linux depois:

```bash
cd /opt/escala-app
git pull
npm ci --omit=dev
sudo systemctl restart escala-app
sudo systemctl status escala-app
```
