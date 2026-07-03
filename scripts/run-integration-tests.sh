#!/usr/bin/env bash
set -e

PORT=8788
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() {
  if [ -n "$WRANGLER_PID" ]; then
    echo "Deteniendo wrangler..."
    kill "$WRANGLER_PID" 2>/dev/null || true
    wait "$WRANGLER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "=== Compilando proyecto ==="
cd "$ROOT_DIR"
pnpm build

echo ""
echo "=== Iniciando wrangler pages dev en puerto $PORT ==="
pnpx wrangler pages dev dist \
  --port "$PORT" \
  --binding ENVIRONMENT=development \
  --kv PUZZLES \
  --kv USERS \
  --kv SESSIONS &
WRANGLER_PID=$!

echo "Esperando a que el servidor responda..."
for i in $(seq 1 40); do
  if curl -s -o /dev/null "http://localhost:$PORT/api" 2>/dev/null; then
    echo "Servidor listo en http://localhost:$PORT"
    break
  fi
  if [ $i -eq 40 ]; then
    echo "ERROR: El servidor no inició en el tiempo esperado"
    exit 1
  fi
  sleep 1
done

echo ""
echo "=== Ejecutando tests de integración ==="
TEST_BASE_URL="http://localhost:$PORT" npx vitest run --config vitest.integration.config.ts

echo ""
echo "=== Tests completados ==="
