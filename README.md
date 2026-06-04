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
- **Cloudflare Pages** + **Pages Functions** + **KV** para backend y almacenamiento

## Puzzles disponibles

| Puzzle | Ruta | Jugable |
|--------|------|---------|
| Sopa de letras | `/sopa-de-letras` | `/jugar/sopa-de-letras/:id` |
| Crucigrama | `/crucigrama` | `/jugar/crucigrama/:id` |
| Rellenar huecos | `/rellenar-huecos` | `/jugar/rellenar-huecos/:id` |
| Adivina la palabra | `/adivina-la-palabra` | `/jugar/adivina-la-palabra/:id` |
| Anagrama | `/anagrama` | `/jugar/anagrama/:id` |
| Ordenar oración | `/ordenar-oracion` | `/jugar/ordenar-oracion/:id` |

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
pnpm build && pnpx wrangler pages dev dist --kv=PUZZLES
```

Levanta el servidor en `http://127.0.0.1:8788` con las Pages Functions y KV namespace local.

## Build

```bash
pnpm build
```

Compila TypeScript y genera el bundle de producción en `dist/`.

## Lint

```bash
pnpm lint
```

## Estructura del proyecto

```
src/
├── App.tsx                    # Router y registro de puzzles
├── main.tsx                   # Entry point
├── index.css                  # Estilos globales (Tailwind)
├── components/
│   ├── layout/                # Header, Layout, PuzzlePageLayout, PlayableLayout
│   ├── playable/              # Componentes de juegos interactivos
│   ├── puzzles/               # Previews y inputs de cada puzzle
│   └── ui/                    # Button, PageHeader, DownloadDropdown, ShareModal
├── hooks/                     # Custom hooks (useAttemptCounter)
├── lib/
│   ├── puzzles/               # Generadores de cada puzzle
│   ├── pdf/                   # Generación de PDFs
│   ├── png/                   # Exportación a PNG
│   └── share/                 # api.ts (savePuzzle/loadPuzzle) + types.ts
├── pages/
│   ├── HomePage.tsx           # Landing page
│   ├── play/                  # Páginas jugables (/jugar/*)
│   └── NotFoundPage.tsx
└── store/                     # Zustand stores

functions/
└── api/puzzles/
    ├── index.ts               # POST /api/puzzles (crear puzzle)
    └── [id].ts                # GET /api/puzzles/:id (obtener puzzle)

public/
├── _redirects                 # SPA routing (/* → /index.html 200)
├── favicon.svg
├── robots.txt
└── sitemap.xml
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

## API Endpoints (Pages Functions)

| Method | Path | Descripción |
|--------|------|-------------|
| POST | `/api/puzzles` | Crear puzzle (body: `{ type, puzzle }`) → retorna `{ id }` |
| GET | `/api/puzzles/:id` | Obtener puzzle → retorna `{ type, puzzle }` o 404 |

## Funcionalidades

### Generación y exportación
- Generación automática de puzzles a partir de texto o palabras ingresadas
- Exportación a PDF (versión estudiante y versión solución)
- Exportación a PNG
- Previsualización interactiva antes de descargar

### Juegos digitales compartibles
- **IDs cortos** (8 caracteres) para URLs limpias y compartibles
- **Backend en Cloudflare**: Pages Functions + KV para almacenamiento
- **QR local**: generado con `qrcode.react` (sin proxy externo)
- **Código de puzzle**: los alumnos pueden ingresar solo el código en `/jugar`
- **Expiración automática**: los puzzles expiran en 1 día (24 horas)
- Contador de intentos por puzzle en localStorage
- Sin login ni almacenamiento de datos de estudiantes
- Case-insensitive: `F3D78213` y `f3d78213` funcionan igual

### Flujo de compartir
1. El docente genera el puzzle y hace clic en "Compartir"
2. El sistema guarda el puzzle en KV y genera un ID de 8 caracteres
3. Se muestra el QR, el código y el link completo
4. El alumno puede:
   - Escanear el QR
   - Copiar el link completo
   - Ingresar solo el código en `/jugar`

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
11. Agregar el tipo en `ALLOWED_TYPES` en `functions/api/puzzles/index.ts`.
12. Agregar la ruta en `PUZZLE_TYPE_ROUTES` en `src/pages/play/PlayHubPage.tsx`.

## Deployment

El proyecto está desplegado en **Cloudflare Pages** con dominio propio `tools.edualex.uy`.

### Comandos de deploy

```bash
# Build de producción
pnpm build

# Deploy a Cloudflare Pages
pnpx wrangler pages deploy dist
```

### Configuración inicial

1. **Crear KV namespace:**
   ```bash
   pnpx wrangler kv namespace create PUZZLES
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
pnpm build && pnpx wrangler pages dev dist --kv=PUZZLES
```

## Autor

**alexcuadro** — [tools.edualex.uy](https://tools.edualex.uy)
