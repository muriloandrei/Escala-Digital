#!/usr/bin/env bash
set -euo pipefail

repo=/opt/escala-app
releases="$repo/releases"
env_file="$repo/work/.env"
unit=escala-app
override=/etc/systemd/system/escala-app.service.d/zz-release.conf
ref=main
apply=false
operator=
expected_sha=

for arg in "$@"; do
  case "$arg" in
    --ref=main|--ref=homologacao) ref=${arg#*=} ;;
    --sha=*) expected_sha=${arg#*=} ;;
    --apply) apply=true ;;
    --by=*) operator=${arg#*=} ;;
    *) printf 'Argumento desconhecido: %s\n' "$arg" >&2; exit 2 ;;
  esac
done

if [[ "$apply" == true && ! "$operator" =~ ^[a-zA-Z0-9._-]{2,80}$ ]]; then
  printf 'Para publicar, informe --apply --by=LOGIN_DO_OPERADOR.\n' >&2
  exit 2
fi
if [[ -n "$expected_sha" && ! "$expected_sha" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'O --sha deve conter os 40 caracteres do commit aprovado.\n' >&2
  exit 2
fi

test -f "$env_file" || { printf 'Arquivo de ambiente ausente: %s\n' "$env_file" >&2; exit 1; }
command -v flock >/dev/null || { printf 'flock nao encontrado.\n' >&2; exit 1; }
exec 9>/tmp/escala-app-deploy.lock
flock -n 9 || { printf 'Outra publicacao esta em andamento.\n' >&2; exit 1; }

git -C "$repo" fetch origin "$ref"
sha=$(git -C "$repo" rev-parse "origin/$ref")
if [[ -n "$expected_sha" && "$sha" != "$expected_sha" ]]; then
  printf 'O remoto mudou: esperado %s, encontrado %s.\n' "$expected_sha" "$sha" >&2
  exit 1
fi

release="$releases/$ref-${sha:0:12}"
if [[ -e "$release" ]]; then
  test "$(git -C "$release" rev-parse HEAD)" = "$sha" || {
    printf 'Release existente aponta para outro commit: %s\n' "$release" >&2
    exit 1
  }
else
  mkdir -p "$releases"
  git -C "$repo" worktree add --detach "$release" "$sha"
fi

cd "$release/work"
test -f package.json
test -z "$(git status --porcelain --untracked-files=no)" || {
  printf 'Release com alteracoes versionadas; escolha um checkout limpo.\n' >&2
  exit 1
}

printf 'Preparando %s (%s) em %s\n' "$ref" "$sha" "$release"
npm ci
npm run check:client
npm run build:client
npm test
npm run migrations:check
ESCALA_ENV_FILE="$env_file" npm run db:check-schema
ESCALA_ENV_FILE="$env_file" npm run migrations:status

running_dir=$(systemctl show "$unit" -p WorkingDirectory --value)
test -f "$running_dir/src/server.js" || {
  printf 'Nao foi possivel identificar o release em execucao: %s\n' "$running_dir" >&2
  exit 1
}
running_sha=$(git -C "$running_dir" rev-parse HEAD)
new_migrations=$(git -C "$release" diff --name-only "$running_sha" "$sha" -- work/db/migrations/)
if [[ -n "$new_migrations" ]]; then
  printf 'Migrations alteradas desde o release ativo; revise e aplique antes da publicacao:\n%s\n' "$new_migrations" >&2
  exit 1
fi

printf 'Preflight concluido. Ativo: %s. Candidato: %s.\n' "$running_sha" "$sha"
if [[ "$apply" != true ]]; then
  printf 'Nenhuma troca feita. Para publicar, repita com --sha=%s --apply --by=LOGIN.\n' "$sha"
  exit 0
fi
if [[ "$running_sha" == "$sha" ]]; then
  printf 'O servico ja executa esse commit.\n'
  exit 0
fi

sudo true
backup=$(mktemp)
candidate=$(mktemp)
had_override=false
if sudo test -e "$override"; then
  sudo cp "$override" "$backup"
  had_override=true
fi
trap 'rm -f "$backup" "$candidate"' EXIT

printf '[Service]\nWorkingDirectory=%s/work\nExecStart=\nExecStart=/usr/bin/node %s/work/src/server.js\n' "$release" "$release" > "$candidate"

rollback() {
  printf 'Falha na publicacao; restaurando configuracao anterior.\n' >&2
  if [[ "$had_override" == true ]]; then
    sudo install -m 0644 "$backup" "$override"
  else
    sudo rm -f "$override"
  fi
  sudo systemctl daemon-reload
  sudo systemctl restart "$unit"
  systemctl show "$unit" -p WorkingDirectory -p ExecStart
}

if ! sudo install -m 0644 "$candidate" "$override" ||
   ! sudo systemctl daemon-reload ||
   ! sudo systemctl restart "$unit"; then
  rollback
  exit 1
fi

ready=false
for attempt in {1..15}; do
  if curl --fail --silent --show-error --max-time 3 http://127.0.0.1:3000/ready; then
    ready=true
    break
  fi
  sleep 2
done
if [[ "$ready" != true ]]; then
  rollback
  exit 1
fi

printf '\nPublicado por %s: %s (%s).\n' "$operator" "$ref" "$sha"
systemctl show "$unit" -p WorkingDirectory -p ExecStart
