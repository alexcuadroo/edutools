# EduTools

Generador de puzzles educativos para docentes y estudiantes. Creá sopa de letras, crucigramas y más de forma gratuita, con exportación a PDF e imagen.

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

## Puzzles disponibles

| Puzzle | Ruta |
|--------|------|
| Sopa de letras | `/sopa-de-letras` |
| Crucigrama | `/crucigrama` |
| Rellenar huecos | `/rellenar-huecos` |

## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

Levanta el servidor en `http://localhost:5173`.

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
├── App.tsx              # Router y registro de puzzles
├── main.tsx             # Entry point
├── index.css            # Estilos globales (Tailwind)
├── components/
│   ├── layout/          # Header, Layout, PuzzlePageLayout
│   ├── ui/              # Button, PageHeader, DownloadDropdown
│   └── ErrorBoundary.tsx
├── hooks/               # Custom hooks
├── lib/
│   └── puzzles/
│       ├── registry.ts  # Registro central de puzzles
│       ├── word-search/ # Generador de sopa de letras
│       ├── crossword/   # Generador de crucigramas
│       └── fill-blanks/ # Generador de rellenar huecos
├── pages/
│   ├── HomePage.tsx     # Página principal con selector de puzzles
│   ├── WordSearchPage.tsx
│   ├── CrosswordPage.tsx
│   ├── FillBlanksPage.tsx
│   └── NotFoundPage.tsx
└── store/               # Zustand stores
```

## Rutas

| Ruta | Página |
|------|--------|
| `/` | Inicio |
| `/sopa-de-letras` | Generador de sopa de letras |
| `/crucigrama` | Generador de crucigramas |
| `/rellenar-huecos` | Generador de rellenar huecos |

## Agregar un nuevo puzzle

1. Crear la carpeta en `src/lib/puzzles/<nombre>/` con un `generator.ts` que implemente la interfaz del registry.
2. Registrar el puzzle en `src/App.tsx` con `registerPuzzle()`.
3. Crear la página en `src/pages/<Nombre>Page.tsx`.
4. Agregar la ruta en `App.tsx` dentro del `<Routes>`.
5. Agregar la entrada en el array `TABS` de `src/components/layout/Header.tsx`.
6. Agregar la card en `src/pages/HomePage.tsx`.

## Deployment

El proyecto está desplegado en **Vercel** con dominio propio `tools.edualex.uy`.

- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **SPA routing:** manejado con `vercel.json` (rewrites a `index.html`)
- **SEO:** `robots.txt`, `sitemap.xml`, OpenGraph y Twitter Cards configurados en `index.html`

## Autor

**alexcuadro** — [tools.edualex.uy](https://tools.edualex.uy)
