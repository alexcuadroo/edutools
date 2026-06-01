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
├── lib/puzzles/
│   ├── registry.ts      # Registro central de generadores
│   ├── word-search/     # Sopa de letras
│   ├── crossword/       # Crucigramas
│   └── fill-blanks/     # Rellenar huecos
├── pages/               # HomePage, WordSearchPage, CrosswordPage, FillBlanksPage, NotFoundPage
└── store/               # Zustand stores
```

## Rutas

| Path | Componente |
|------|-----------|
| `/` | `HomePage` |
| `/sopa-de-letras` | `WordSearchPage` |
| `/crucigrama` | `CrosswordPage` |
| `/rellenar-huecos` | `FillBlanksPage` |
| `*` | `NotFoundPage` |

## Agregar un nuevo puzzle

1. Crear `src/lib/puzzles/<nombre>/generator.ts` implementando la interfaz del registry
2. Registrar en `src/App.tsx` con `registerPuzzle()`
3. Crear `src/pages/<Nombre>Page.tsx`
4. Agregar `<Route>` en `App.tsx`
5. Agregar entrada en `TABS` de `src/components/layout/Header.tsx`
6. Agregar card en `src/pages/HomePage.tsx`

## Deployment

- **Plataforma:** Vercel
- **URL:** https://tools.edualex.uy
- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **SPA routing:** `vercel.json` con rewrites a `/index.html`
- **SEO:** `robots.txt`, `sitemap.xml`, OpenGraph y Twitter Cards en `index.html`
- **OG image:** `https://res.cloudinary.com/drfdwvrzc/image/upload/v1780247505/tools-og_tx3eya.png`

## Archivos estáticos

Los archivos en `public/` se copian directamente a `dist/` durante el build:

- `favicon.svg` — icono Puzzle (Lucide) en indigo-600
- `robots.txt` — permite crawleo, apunta al sitemap
- `sitemap.xml` — rutas indexables
