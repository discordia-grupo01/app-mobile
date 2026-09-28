#!/bin/bash
# Script de deploy de app-mobile en discordia-mobile-vm.
set -euo pipefail

REPO_DIR="$HOME/discordia/app-mobile"
COMPOSE_DIR="$HOME/discordia/infrastructure/deploy"
COMPOSE_FILE="docker-compose.mobile.yml"
SHA="${SSH_ORIGINAL_COMMAND:-}"

# Solo se acepta un SHA de git completo (40 hex).
if ! [[ "$SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "sha invalido: $SHA" >&2
  exit 2
fi

PREV_SHA=$(git -C "$REPO_DIR" rev-parse HEAD)

git -C "$REPO_DIR" fetch origin develop
git -C "$REPO_DIR" reset --hard "$SHA"

cd "$COMPOSE_DIR"
docker compose -f "$COMPOSE_FILE" restart

for _ in $(seq 1 120); do
  if curl -fsS -m 3 http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
    echo "deploy OK: $SHA"
    exit 0
  fi
  sleep 5
done

echo "ERROR: Metro no respondio tras el deploy de $SHA" >&2
docker compose -f "$COMPOSE_FILE" logs --tail 30 >&2 || true

echo "rollback a $PREV_SHA" >&2
git -C "$REPO_DIR" reset --hard "$PREV_SHA"
docker compose -f "$COMPOSE_FILE" restart
exit 1
