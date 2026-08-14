# Worker de progreso

Este Worker contiene el Durable Object `PuzzleProgress`, uno por puzzle compartido. Pages lo consume mediante el binding `PROGRESS` definido en el `wrangler.toml` raíz.

```powershell
pnpm exec wrangler deploy --config progress-worker/wrangler.jsonc
```

El Worker productivo se llama `edutools-progress`. Si cambiás código en este directorio, volvé a ejecutar el deploy anterior; los deploys automáticos de Cloudflare Pages no despliegan Workers separados.

## Desarrollo local

En una terminal:

```powershell
pnpm exec wrangler dev --config progress-worker/wrangler.jsonc --port 8787
```

En otra terminal, desde la raíz:

```powershell
pnpm build
pnpm exec wrangler pages dev dist --port 8788 --kv PUZZLES --kv USERS --kv SESSIONS --do PROGRESS=PuzzleProgress@edutools-progress
```

Para confirmar el binding en producción, el `wrangler.toml` raíz debe contener:

```toml
[[durable_objects.bindings]]
name = "PROGRESS"
class_name = "PuzzleProgress"
script_name = "edutools-progress"
```
