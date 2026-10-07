# Publicacao automatizada no Oracle Linux

O script `scripts/publicar-oracle-linux.sh` prepara um worktree imutavel em
`/opt/escala-app/releases`, instala dependencias, compila o React, roda testes,
confere o schema Oracle e so entao troca o servico `escala-app`. Ele preserva
`/opt/escala-app/work/.env` e o checkout principal. Nao aplica migrations.

Na janela de publicacao, com backup do Oracle confirmado, execute no servidor:

```bash
cd /opt/escala-app/work
bash scripts/publicar-oracle-linux.sh --ref=main
```

Confira o SHA e o resultado do preflight. O script informa o comando de
publicacao com `--sha` para impedir que a branch mude entre a validacao e a
troca. Por exemplo:

```bash
bash scripts/publicar-oracle-linux.sh --ref=main --sha=SHA_COMPLETO_APROVADO --apply --by=murilo.jesus
```

Para publicar uma versao de homologacao, substitua `main` por `homologacao`
nos dois comandos. Nao use `git pull` no checkout em execucao. Se uma migration
mudou desde o release ativo, o script para: revise a migration, confirme o
backup e aplique-a pelo executor aprovado antes de repetir o preflight.

O script verifica `/ready` apos reiniciar. Se falhar, restaura o drop-in anterior
do systemd e reinicia a versao anterior. Isso nao reverte alteracoes no banco.
Depois da publicacao, valide login, listagem e uma escala real com um usuario
da loja. Veja logs com `journalctl -u escala-app -n 100 --no-pager`.

O script precisa estar no checkout do qual for invocado. Se a versao ativa
ainda nao o contiver, crie um worktree da branch desejada ou use um release
de homologacao existente e rode `bash scripts/publicar-oracle-linux.sh` nele.
