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
```

Ambos deben pasar sin errores antes de considerar el trabajo terminado.

## Stack y convenciones

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 4** (vite plugin `@tailwindcss/vite`, no PostCSS)
- **Zustand** para estado global (stores en `src/store/`)
- **React Router 7** con `BrowserRouter` (rutas en `src/App.tsx`)
- **Lucide React** para iconos
- **jsPDF** + **html2canvas** para exportación PDF
- **React Toastify** para notificaciones
- **nanoid** para IDs cortos de puzzles
- **qrcode.react** para generación local de QR
- **Cloudflare Pages** + **Pages Functions** + **KV** para deploy y API

### Convenciones de código

- Componentes funcionales con hooks, sin clases
- Named exports para componentes (default export solo en páginas y `App.tsx`)
- Tailwind utility classes directamente en JSX, sin CSS modules
- Idioma del proyecto: **español** (UI, comentarios, variables de texto)
- Archivos de páginas: `*Page.tsx` en `src/pages/`
- Archivos de componentes: PascalCase en `src/components/`
- Lógica de puzzles: `src/lib/puzzles/<nombre>/generator.ts`

## Estructura

```
src/
├── App.tsx              # Router + registro de puzzles (initPuzzles)
├── main.tsx             # Entry point (ReactDOM)
├── index.css            # Tailwind imports
├── components/
│   ├── layout/          # Header, Layout, PuzzlePageLayout
│   ├── ui/              # Button, PageHeader, DownloadDropdown
│   └── ErrorBoundary.tsx
├── hooks/               # Custom hooks
├── lib/
│   ├── puzzles/         # Generadores de puzzles
│   ├── share/           # api.ts (savePuzzle/loadPuzzle) + types.ts
│   ├── pdf/             # Exportación PDF
│   └── png/             # Exportación PNG
├── pages/               # Páginas de la app
│   └── play/            # Páginas de juego (Play*Page.tsx)
└── store/               # Zustand stores

functions/
└── api/puzzles/
    ├── index.ts         # POST /api/puzzles (crear puzzle)
    └── [id].ts          # GET /api/puzzles/:id (obtener puzzle)
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
| `/jugar/sopa-de-letras/:id` | `PlayWordSearchPage` |
| `/jugar/crucigrama/:id` | `PlayCrosswordPage` |
| `/jugar/rellenar-huecos/:id` | `PlayFillBlanksPage` |
| `/jugar/adivina-la-palabra/:id` | `PlayHangmanPage` |
| `/jugar/anagrama/:id` | `PlayAnagramPage` |
| `/jugar/ordenar-oracion/:id` | `PlaySentenceOrderPage` |
| `*` | `NotFoundPage` |

## API Endpoints (Pages Functions)

| Method | Path | Descripción |
|--------|------|-------------|
| POST | `/api/puzzles` | Crear puzzle (body: `{ type, puzzle }`) → retorna `{ id }` |
| GET | `/api/puzzles/:id` | Obtener puzzle → retorna `{ type, puzzle }` o 404 |

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
- **API:** Pages Functions en `functions/` con KV binding `PUZZLES`
- **SEO:** `robots.txt`, `sitemap.xml`, OpenGraph y Twitter Cards en `index.html`
- **OG image:** `https://res.cloudinary.com/drfdwvrzc/image/upload/v1780247505/tools-og_tx3eya.png`

### Desarrollo local

```bash
pnpm dev          # Vite dev server (frontend)
wrangler pages dev dist --binding PUZZLES=puzzles-dev  # Con API + KV local
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
