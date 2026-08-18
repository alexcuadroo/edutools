# EduTools

Generador de puzzles educativos para docentes y estudiantes. Creá puzzles, exportalos a PDF o compartilos como juegos digitales interactivos.

**En producción:** [https://tools.edualex.uy](https://tools.edualex.uy)

## Stack

- **React 19** + **TypeScript 6**
- **Vite 8** como bundler
- **Tailwind CSS 4** para estilos
- **Zustand** para estado global
- **React Router 7** para navegación (BrowserRouter)
- **jsPDF** + **html2canvas** para exportación a PDF
- **Lucide React** para iconos
- **React Toastify** para notificaciones
- **qrcode.react** para generación local de QR
- **nanoid** para IDs cortos de puzzles
- **@noble/hashes** para Argon2id (hashing de contraseñas en Workers)
- **vite-plugin-pwa** + **workbox-window** para PWA instalable y offline
- **tailwind-animations** para animaciones de Tailwind
- **Cloudflare Pages** + **Pages Functions** + **KV** para backend y almacenamiento
- **Cloudflare Durable Objects** para seguimiento de progreso en vivo

## Puzzles disponibles

| Puzzle | Ruta | Jugable |
|--------|------|---------|
| Sopa de letras | `/sopa-de-letras` | `/jugar/sopa-de-letras/:id` |
| Crucigrama | `/crucigrama` | `/jugar/crucigrama/:id` |
| Rellenar huecos | `/rellenar-huecos` | `/jugar/rellenar-huecos/:id` |
| Adivina la palabra | `/adivina-la-palabra` | `/jugar/adivina-la-palabra/:id` |
| Anagrama | `/anagrama` | `/jugar/anagrama/:id` |
| Ordenar oración | `/ordenar-oracion` | `/jugar/ordenar-oracion/:id` |
| Relacionar columnas | `/relacionar-columnas` | `/jugar/relacionar-columnas/:id` |
| Memoria | `/memoria` | `/jugar/memoria/:id` |
| Rosco | `/rosco` | `/jugar/rosco/:id` |
| Cadenas de palabras | `/cadenas-de-palabras` | `/jugar/cadenas-de-palabras/:id` |

## Instalación

```bash
pnpm install
```

## Desarrollo

### Frontend únicamente

```bash
pnpm dev
```

Levanta el servidor en `http://localhost:5173`.

### Frontend + API local (con KV)

```bash
pnpm build
pnpm exec wrangler pages dev dist --kv=PUZZLES --kv=USERS --kv=SESSIONS
```

Levanta el servidor en `http://127.0.0.1:8788` con las Pages Functions y KV namespaces locales.

Para probar el flujo completo de autenticación (envío de emails), creá un archivo `.dev.vars` junto a `wrangler.toml` con tu clave. Este archivo no se versiona:

```bash
RESEND_API_KEY="tu_key_aqui"
```

Luego iniciá Pages Functions normalmente:

```bash
pnpm build
pnpm exec wrangler pages dev dist --kv=PUZZLES --kv=USERS --kv=SESSIONS
```

Alternativamente, para una única sesión de **PowerShell**:

```powershell
$env:RESEND_API_KEY = "tu_key_aqui"
pnpm build
pnpm exec wrangler pages dev dist --kv=PUZZLES --kv=USERS --kv=SESSIONS
```

## Build

```bash
pnpm build
```

Compila TypeScript y genera el bundle de producción en `dist/`.

## Lint

```bash
pnpm lint
```

## Tests

### Tests unitarios

Testean generadores de puzzles y utilidades. Corren con Vitest en entorno Node, sin dependencias externas.

```bash
pnpm test       # Todos los tests unitarios
pnpm test:unit  # Igual que arriba
```

### Tests de integración

Levantan un servidor wrangler pages dev local con KV namespaces y prueban la API completa (crear/recuperar puzzles, auth, puzzles guardados, flujo de juego).

```bash
pnpm test:integration
```

El script `scripts/run-integration-tests.sh`:
1. Ejecuta `pnpm build`
2. Levanta `wrangler pages dev dist` con KV namespaces locales y `ENVIRONMENT=development`
3. Espera a que el servidor responda
4. Ejecuta vitest con `vitest.integration.config.ts`
5. Detiene wrangler al terminar

### Todos los tests

```bash
pnpm test:all    # Unit + Integration
```

## Estructura del proyecto

```
src/
├── App.tsx                    # Router, registro de puzzles y checkSession
├── main.tsx                   # Entry point
├── index.css                  # Estilos globales (Tailwind)
├── components/
│   ├── layout/                # Header, Layout, PuzzlePageLayout, PlayableLayout
│   ├── playable/              # Componentes de juegos interactivos
│   ├── puzzles/               # Previews y inputs de cada puzzle
│   ├── auth/                  # UserMenu, SavePuzzleButton
│   └── ui/                    # Button, PageHeader, DownloadDropdown, ShareModal
├── hooks/                     # Custom hooks (useAuth, usePuzzleLoader, useNoIndexMeta, etc.)
├── lib/
│   ├── puzzles/               # Generadores de cada puzzle (con types y registry)
│   ├── pdf/                   # Generación de PDFs
│   ├── png/                   # Exportación a PNG
│   └── share/                 # api.ts (savePuzzle/loadPuzzle) + types.ts
├── pages/
│   ├── HomePage.tsx           # Landing page
│   ├── LoginPage.tsx          # Inicio de sesión
│   ├── SignupPage.tsx         # Registro de cuenta
│   ├── VerifyPage.tsx         # Verificación de email
│   ├── ForgotPasswordPage.tsx # Recuperar contraseña
│   ├── ResetPasswordPage.tsx  # Nueva contraseña
│   ├── MyPuzzlesPage.tsx      # Mis puzzles guardados
│   ├── PuzzleProgressPage.tsx # Progreso en vivo del docente
│   ├── play/                  # Páginas jugables (/jugar/*)
│   └── NotFoundPage.tsx
└── store/                     # Zustand stores (auth-store, saved-puzzles-store, puzzle-store)

functions/
├── api/
│   ├── auth/                  # signup, login, logout, me, verify, forgot, reset
│   ├── account.ts             # DELETE /api/account (eliminar cuenta)
│   ├── progress/[id].ts       # POST /api/progress/:id (progreso de estudiantes)
│   └── puzzles/
│       ├── index.ts           # POST /api/puzzles (crear puzzle)
│       ├── [id].ts            # GET /api/puzzles/:id (obtener puzzle)
│       └── saved/[[path]].ts  # GET/POST /api/puzzles/saved, GET/DELETE/:id, share, progreso
└── lib/                       # Helpers (auth, email, rate-limit, env, types, validation, puzzle-id)

progress-worker/               # Worker separado con Durable Objects (progreso en vivo)

public/
├── _redirects                 # SPA routing (/* → /index.html 200)
├── _headers                   # Headers de seguridad (CSP, HSTS, etc.)
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── llms.txt                   # Resumen para LLMs y herramientas de IA
├── pwa-192x192.png            # Ícono PWA
└── pwa-512x512.png            # Ícono PWA
```

## Rutas

### Creación de puzzles
| Ruta | Página |
|------|--------|
| `/` | Inicio |
| `/sopa-de-letras` | Generador de sopa de letras |
| `/crucigrama` | Generador de crucigramas |
| `/rellenar-huecos` | Generador de rellenar huecos |
| `/adivina-la-palabra` | Generador de ahorcado |
| `/anagrama` | Generador de anagrama |
| `/ordenar-oracion` | Generador de ordenar oración |
| `/relacionar-columnas` | Generador de relacionar columnas |
| `/memoria` | Generador de memoria |
| `/rosco` | Generador de rosco |
| `/cadenas-de-palabras` | Generador de cadenas de palabras (Wordle) |

### Autenticación y cuenta
| Ruta | Página |
|------|--------|
| `/iniciar-sesion` | Inicio de sesión |
| `/crear-cuenta` | Registro de cuenta |
| `/verificar` | Verificación de email |
| `/recuperar-cuenta` | Recuperar contraseña |
| `/restablecer-contrasena` | Nueva contraseña |
| `/mis-puzzles` | Mis puzzles guardados |
| `/mis-puzzles/:id/progreso` | Progreso en vivo del puzzle |

### Juegos digitales
| Ruta | Descripción |
|------|-------------|
| `/jugar` | Hub con input de código y demo interactiva |
| `/jugar/sopa-de-letras/:id` | Sopa de letras jugable |
| `/jugar/crucigrama/:id` | Crucigrama jugable |
| `/jugar/rellenar-huecos/:id` | Rellenar huecos jugable |
| `/jugar/adivina-la-palabra/:id` | Ahorcado jugable |
| `/jugar/anagrama/:id` | Anagrama jugable |
| `/jugar/ordenar-oracion/:id` | Ordenar oración jugable |
| `/jugar/relacionar-columnas/:id` | Relacionar columnas jugable |
| `/jugar/memoria/:id` | Memoria jugable |
| `/jugar/rosco/:id` | Rosco jugable |
| `/jugar/cadenas-de-palabras/:id` | Cadenas de palabras jugable |

## API Endpoints (Pages Functions)

### Puzzles compartidos (anónimos)
| Method | Path | Descripción |
|--------|------|-------------|
| POST | `/api/puzzles` | Crear puzzle (body: `{ type, puzzle }`) → retorna `{ id }` |
| GET | `/api/puzzles/:id` | Obtener puzzle → retorna `{ type, puzzle }` o 404 |

### Autenticación
| Method | Path | Descripción |
|--------|------|-------------|
| POST | `/api/auth/signup` | Crear cuenta (body: `{ email, password, displayName? }`) |
| POST | `/api/auth/login` | Iniciar sesión (body: `{ email, password }`) |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Obtener usuario autenticado |
| GET | `/api/auth/verify` | Verificar email (query: `?token=xxx`) |
| POST | `/api/auth/forgot` | Solicitar reset de contraseña (body: `{ email }`) |
| POST | `/api/auth/reset` | Resetear contraseña (body: `{ token, newPassword }`) |
| DELETE | `/api/account` | Eliminar cuenta autenticada (body: `{ confirm: email }`) |

### Puzzles guardados (requiere autenticación)
| Method | Path | Descripción |
|--------|------|-------------|
| POST | `/api/puzzles/save` | Guardar puzzle (body: `{ type, title, data }`) |
| GET | `/api/puzzles/saved` | Listar puzzles guardados del usuario |
| GET | `/api/puzzles/saved/:id` | Obtener puzzle guardado |
| DELETE | `/api/puzzles/saved/:id` | Eliminar puzzle guardado |
| POST | `/api/puzzles/saved/:id/share` | Compartir puzzle guardado |
| GET | `/api/puzzles/saved/:id/progreso` | Ver progreso en vivo del docente |
| DELETE | `/api/puzzles/saved/:id/progreso` | Borrar el progreso de la actividad |

### Progreso de estudiantes
| Method | Path | Descripción |
|--------|------|-------------|
| POST | `/api/progress/:id` | Reportar progreso anónimo (Sopa, Crucigrama, Rellenar huecos, Relacionar columnas, Memoria, Rosco y Cadenas de palabras) |

## Funcionalidades

### Generación y exportación
- Generación automática de puzzles a partir de texto o palabras ingresadas
- Exportación a PDF (versión estudiante y versión solución)
- Exportación a PNG
- Previsualización interactiva antes de descargar

### Cuentas de usuario
- Registro con verificación por email
- Inicio/cierre de sesión
- Recuperación de contraseña
- Puzzles guardados persistentes en la cuenta del usuario
- Listado y gestión de puzzles guardados

### Juegos digitales compartibles
- **IDs cortos** (8 caracteres) para URLs limpias y compartibles
- **Backend en Cloudflare**: Pages Functions + KV para almacenamiento
- **QR local**: generado con `qrcode.react` (sin proxy externo)
- **Código de puzzle**: los alumnos pueden ingresar solo el código en `/jugar`
- **Expiración automática**: los puzzles expiran en 1 día (24 horas)
- Contador de intentos por puzzle en localStorage
- Apodo anónimo y editable por dispositivo para el seguimiento docente
- Case-insensitive: `F3D78213` y `f3d78213` funcionan igual

### PWA (instalable y offline)
- Instalable como app en el escritorio y en el móvil (manifest + service worker)
- Funciona offline con el bundle precacheado (`vite-plugin-pwa` + Workbox)
- Aviso de nueva versión disponible para recargar

### Flujo de compartir
1. El docente genera el puzzle y hace clic en "Compartir"
2. El sistema guarda el puzzle en KV y genera un ID de 8 caracteres
3. Se muestra el QR, el código y el link completo
4. El alumno puede:
   - Escanear el QR
   - Copiar el link completo
   - Ingresar solo el código en `/jugar`

### Flujo de guardar puzzles (usuarios autenticados)
1. El docente genera el puzzle y hace clic en "Guardar"
2. El puzzle se guarda en su cuenta (persistente)
3. Puede acceder a sus puzzles desde `/mis-puzzles`
4. Puede jugarlos, compartirlos o eliminarlos

### Seguimiento en vivo
1. El estudiante abre un puzzle compartido compatible y confirma un apodo anónimo.
2. El juego reporta los aciertos y la presencia cada 10 segundos.
3. El docente abre **Mis puzzles → Progreso** para ver el avance, actualizado cada 4 segundos.
4. Puzzles con seguimiento en vivo: Sopa de letras, Crucigrama, Rellenar huecos, Relacionar columnas, Memoria, Rosco y Cadenas de palabras.

## Agregar un nuevo puzzle

1. Crear la carpeta en `src/lib/puzzles/<nombre>/` con un `generator.ts` que implemente la interfaz del registry.
2. Registrar el puzzle en `src/App.tsx` con `registerPuzzle()`.
3. Crear la página en `src/pages/<Nombre>Page.tsx`.
4. Agregar la ruta en `App.tsx` dentro del `<Routes>`.
5. Agregar la entrada en el array `TABS` de `src/components/layout/Header.tsx`.
6. Agregar la card en `src/pages/HomePage.tsx`.
7. Crear el componente jugable en `src/components/playable/<Nombre>Game.tsx`.
8. Crear la página jugable en `src/pages/play/Play<Nombre>Page.tsx`.
9. Agregar la ruta `/jugar/<nombre>/:id` en `App.tsx`.
10. Agregar tipos y conversores en `src/lib/share/types.ts`.
11. Agregar el slug y la etiqueta en `src/lib/puzzles/slugs.ts` (`PUZZLE_TYPE_TO_SLUG`, `SLUG_TO_PUZZLE_TYPE`, `PUZZLE_TYPE_LABELS`).
12. Agregar el tipo en `ALLOWED_TYPES` en `functions/api/puzzles/index.ts` y en `ALLOWED_PUZZLE_TYPES` en `functions/lib/env.ts`.
13. Si el puzzle es jugable en vivo, agregarlo en `functions/api/progress/[id].ts` y en el Worker `progress-worker/` si corresponde.
14. Actualizar `public/sitemap.xml`, `public/llms.txt` y este README.

## Deployment

El proyecto está desplegado en **Cloudflare Pages** con dominio propio `tools.edualex.uy`.

### Comandos de deploy

```bash
# Build de producción
pnpm build

# Deploy a Cloudflare Pages
pnpm exec wrangler pages deploy dist
```

### Configuración inicial

1. **Crear KV namespace:**
   ```bash
   pnpm exec wrangler kv namespace create PUZZLES
   ```

2. **Configurar `wrangler.toml`:**
   ```toml
   name = "edutools"
   compatibility_date = "2025-01-01"
   pages_build_output_dir = "dist"

   [[kv_namespaces]]
   binding = "PUZZLES"
   id = "<TU_KV_NAMESPACE_ID>"
   preview_id = "<TU_KV_PREVIEW_ID>"
   ```

3. **Configurar custom domain en Cloudflare Pages Dashboard:**
   - Ir a Settings → Custom domains
   - Agregar `tools.edualex.uy`

4. **Configurar KV binding en Cloudflare Pages Dashboard:**
   - Ir a Settings → Functions → Bindings
   - Agregar binding de tipo KV Namespace
   - Variable name: `PUZZLES`
   - Seleccionar el namespace creado

### Desarrollo local con KV

```bash
pnpm build
pnpm exec wrangler dev --config progress-worker/wrangler.jsonc --port 8787
pnpm exec wrangler pages dev dist --port 8788 --kv PUZZLES --kv USERS --kv SESSIONS --do PROGRESS=PuzzleProgress@edutools-progress
```

Para tests de integración, ver sección "Tests".

### Worker de progreso

El Worker separado `progress-worker/` usa un Durable Object por puzzle para conservar el estado en tiempo real.

```powershell
pnpm exec wrangler deploy --config progress-worker/wrangler.jsonc
```

Después verificá que `wrangler.toml` incluya el binding `PROGRESS` con `class_name = "PuzzleProgress"` y `script_name = "edutools-progress"`. Los deploys automáticos de Pages en `test` y `main` usan ese binding; si cambia código dentro de `progress-worker/`, desplegalo nuevamente con el comando anterior.

## Autor

**alexcuadro** — [tools.edualex.uy](https://tools.edualex.uy)
