# AGENTS

## Package Manager

Always use **pnpm** (version 11.4.0) for all package management operations. Do not use npm or yarn.

```bash
pnpm <command>
```

### Scripts

```bash
pnpm dev       # Iniciar servidor de desarrollo
pnpm build     # Compilar para producción (tsc + vite build)
pnpm lint      # Ejecutar ESLint
pnpm preview   # Previsualizar build de producción
pnpm test      # Tests unitarios (vitest run)
pnpm test:unit # Igual que test
pnpm test:integration  # Tests de integración (levanta wrangler + API)
pnpm test:all  # Unit + Integration
```

### Agregar dependencias

```bash
pnpm add <package>
pnpm add -D <package>  # devDependency
```

## Verificación post-cambios

Después de cualquier modificación al código, ejecutar:

```bash
pnpm lint
pnpm build
pnpm test
```

Los tres deben pasar sin errores antes de considerar el trabajo terminado.

Para verificar la API completa:

```bash
pnpm test:integration
```

## Testing

### Tests unitarios

Ubicados junto al código que prueban (`src/lib/puzzles/*/generator.test.ts`) o en `src/__tests__/`. Usan **Vitest** con entorno Node.

```bash
pnpm test         # Todos los tests unitarios
pnpm test:unit    # Igual que arriba
pnpm test:watch   # Watch mode
```

Configuración en `vite.config.ts` (campo `test`), excluye el directorio `src/__tests__/integration/`.

### Tests de integración

Ubicados en `src/__tests__/integration/`. Prueban la API completa contra un servidor wrangler pages dev local con KV namespaces.

```bash
pnpm test:integration   # Build + wrangler pages dev + vitest
```

El script `scripts/run-integration-tests.sh`:
1. Ejecuta `pnpm build`
2. Levanta `wrangler pages dev dist` con KV local y `ENVIRONMENT=development` (sin rate limits)
3. Espera a que el servidor responda
4. Ejecuta vitest con `vitest.integration.config.ts`
5. Detiene wrangler al terminar

### Todos los tests

```bash
pnpm test:all   # Unit + Integration
```

## Stack y convenciones

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 4** (vite plugin `@tailwindcss/vite`, no PostCSS)
- **Zustand** para estado global (stores en `src/store/`)
- **React Router 7** con `BrowserRouter` (rutas en `src/App.tsx`)
- **Lucide React** para iconos
- **jsPDF** + **html2canvas** para exportación PDF
- **React Toastify** para notificaciones
- **nanoid** para IDs cortos de puzzles
- **@noble/hashes** para Argon2id (hashing de contraseñas en Workers)
- **Vitest** para tests unitarios y de integración
- **qrcode.react** para generación local de QR
- **Cloudflare Pages** + **Pages Functions** + **KV** para deploy y API
- **Resend** para emails transaccionales (verificación, reset de contraseña)

### Convenciones de código

- Componentes funcionales con hooks, sin clases
- Named exports para componentes (default export solo en páginas y `App.tsx`)
- Tailwind utility classes directamente en JSX, sin CSS modules
- Idioma del proyecto: **español** (UI, comentarios, variables de texto)
- Archivos de páginas: `*Page.tsx` en `src/pages/`
- Archivos de componentes: PascalCase en `src/components/`
- Lógica de puzzles: `src/lib/puzzles/<nombre>/generator.ts`
- **Imports con alias `@/`**: usar `@/` en vez de rutas relativas (`../../../`). Ej: `import { foo } from "@/lib/utils"` en lugar de `import { foo } from "../../../lib/utils"`. Configurado en `tsconfig.app.json` (paths) y `vite.config.ts` (resolve.alias).

## Estructura

```
src/
├── App.tsx              # Router + registro de puzzles (initPuzzles) + checkSession
├── main.tsx             # Entry point (ReactDOM)
├── index.css            # Tailwind imports
├── components/
│   ├── layout/          # Header, Layout, PuzzlePageLayout
│   ├── ui/              # Button, PageHeader, DownloadDropdown
│   ├── auth/            # UserMenu, SavePuzzleButton
│   └── ErrorBoundary.tsx
├── hooks/               # Custom hooks (useAuth, usePuzzleLoader, etc.)
├── lib/
│   ├── puzzles/         # Generadores de puzzles
│   ├── share/           # api.ts (savePuzzle/loadPuzzle) + types.ts
│   ├── pdf/             # Exportación PDF
│   └── png/             # Exportación PNG
├── __tests__/
│   ├── shuffle.test.ts
│   ├── share-types.test.ts
│   └── integration/     # Tests de integración (API)
├── pages/               # Páginas de la app
│   └── play/            # Páginas de juego (Play*Page.tsx)
└── store/               # Zustand stores (auth-store, saved-puzzles-store, puzzle-store)

functions/
├── api/
│   ├── auth/            # signup, login, logout, me, verify, forgot, reset
│   └── puzzles/
│       ├── index.ts     # POST /api/puzzles (crear puzzle)
│       ├── [id].ts      # GET /api/puzzles/:id (obtener puzzle)
│       ├── saved.ts     # GET /api/puzzles/saved (listar), POST /api/puzzles/save
│       └── saved/[id].ts # GET/DELETE /api/puzzles/saved/:id, POST share
└── lib/                 # Helpers compartidos (auth, email, rate-limit, types, validation, puzzle-id)
```

## Rutas

| Path | Componente |
|------|-----------|
| `/` | `HomePage` |
| `/sopa-de-letras` | `WordSearchPage` |
| `/crucigrama` | `CrosswordPage` |
| `/rellenar-huecos` | `FillBlanksPage` |
| `/adivina-la-palabra` | `HangmanPage` |
| `/anagrama` | `AnagramPage` |
| `/ordenar-oracion` | `SentenceOrderPage` |
| `/relacionar-columnas` | `MatchColumnsPage` |
| `/memoria` | `MemoryPage` |
| `/iniciar-sesion` | `LoginPage` |
| `/crear-cuenta` | `SignupPage` |
| `/verificar` | `VerifyPage` |
| `/recuperar-cuenta` | `ForgotPasswordPage` |
| `/restablecer-contrasena` | `ResetPasswordPage` |
| `/mis-puzzles` | `MyPuzzlesPage` |
| `/jugar/sopa-de-letras/:id` | `PlayWordSearchPage` |
| `/jugar/crucigrama/:id` | `PlayCrosswordPage` |
| `/jugar/rellenar-huecos/:id` | `PlayFillBlanksPage` |
| `/jugar/adivina-la-palabra/:id` | `PlayHangmanPage` |
| `/jugar/anagrama/:id` | `PlayAnagramPage` |
| `/jugar/ordenar-oracion/:id` | `PlaySentenceOrderPage` |
| `/jugar/relacionar-columnas/:id` | `PlayMatchColumnsPage` |
| `/jugar/memoria/:id` | `PlayMemoryPage` |
| `*` | `NotFoundPage` |

## API Endpoints (Pages Functions)

| Method | Path | Descripción |
|--------|------|-------------|
| POST | `/api/puzzles` | Crear puzzle (body: `{ type, puzzle }`) → retorna `{ id }` |
| GET | `/api/puzzles/:id` | Obtener puzzle → retorna `{ type, puzzle }` o 404 |
| POST | `/api/auth/signup` | Crear cuenta (body: `{ email, password, displayName? }`) |
| POST | `/api/auth/login` | Iniciar sesión (body: `{ email, password }`) |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Obtener usuario autenticado |
| GET | `/api/auth/verify` | Verificar email (query: `?token=xxx`) |
| POST | `/api/auth/forgot` | Solicitar reset de contraseña (body: `{ email }`) |
| POST | `/api/auth/reset` | Resetear contraseña (body: `{ token, newPassword }`) |
| DELETE | `/api/account` | Eliminar cuenta autenticada (body: `{ confirm: email }`) |
| POST | `/api/puzzles/save` | Guardar puzzle (body: `{ type, title, data }`) |
| GET | `/api/puzzles/saved` | Listar puzzles guardados del usuario |
| GET | `/api/puzzles/saved/:id` | Obtener puzzle guardado |
| DELETE | `/api/puzzles/saved/:id` | Eliminar puzzle guardado |
| POST | `/api/puzzles/saved/:id/share` | Compartir puzzle guardado |

## Agregar un nuevo puzzle

1. Crear `src/lib/puzzles/<nombre>/generator.ts` implementando la interfaz del registry
2. Registrar en `src/App.tsx` con `registerPuzzle()`
3. Crear `src/pages/<Nombre>Page.tsx`
4. Agregar `<Route>` en `App.tsx`
5. Agregar entrada en `TABS` de `src/components/layout/Header.tsx`
6. Agregar card en `src/pages/HomePage.tsx`

## Deployment

- **Plataforma:** Cloudflare Pages
- **URL:** https://tools.edualex.uy
- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **SPA routing:** `public/_redirects` con `/* /index.html 200`
- **API:** Pages Functions en `functions/` con KV bindings `PUZZLES`, `USERS`, `SESSIONS`
- **Secrets:** `RESEND_API_KEY` (vía `wrangler secret put`)
- **SEO:** `robots.txt`, `sitemap.xml`, OpenGraph y Twitter Cards en `index.html`
- **OG image:** `https://res.cloudinary.com/drfdwvrzc/image/upload/v1780247505/tools-og_tx3eya.png`

### Desarrollo local

```bash
pnpm dev          # Vite dev server (frontend)
wrangler pages dev dist --binding PUZZLES=puzzles-dev --binding USERS=users-dev --binding SESSIONS=sessions-dev  # Con API + KV local
```

### Deploy

```bash
pnpm build        # Build de producción
wrangler pages deploy dist  # Deploy a Cloudflare Pages
```

## Archivos estáticos

Los archivos en `public/` se copian directamente a `dist/` durante el build:

- `favicon.svg` — icono Puzzle (Lucide) en indigo-600
- `robots.txt` — permite crawleo, apunta al sitemap
- `sitemap.xml` — rutas indexables
