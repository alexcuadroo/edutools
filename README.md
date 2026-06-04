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
- **fflate** para compresión de URLs compartibles

## Puzzles disponibles

| Puzzle | Ruta | Jugable |
|--------|------|---------|
| Sopa de letras | `/sopa-de-letras` | `/jugar/sopa-de-letras` |
| Crucigrama | `/crucigrama` | `/jugar/crucigrama` |
| Rellenar huecos | `/rellenar-huecos` | `/jugar/rellenar-huecos` |
| Adivina la palabra | `/adivina-la-palabra` | `/jugar/adivina-la-palabra` |
| Anagrama | `/anagrama` | `/jugar/anagrama` |
| Ordenar oración | `/ordenar-oracion` | `/jugar/ordenar-oracion` |

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
── App.tsx                    # Router y registro de puzzles
├── main.tsx                   # Entry point
├── index.css                  # Estilos globales (Tailwind)
├── components/
│   ├── layout/                # Header, Layout, PuzzlePageLayout, PlayableLayout
│   ├── playable/              # Componentes de juegos interactivos
│   ├── puzzles/               # Previews y inputs de cada puzzle
│   ── ui/                    # Button, PageHeader, DownloadDropdown, ShareModal
├── hooks/                     # Custom hooks (useAttemptCounter)
├── lib/
│   ├── puzzles/               # Generadores de cada puzzle
│   ├── pdf/                   # Generación de PDFs
│   └── share/                 # Encoder/decoder y tipos para URLs compartibles
── pages/
│   ├── HomePage.tsx           # Landing page
│   ├── play/                  # Páginas jugables (/jugar/*)
│   ── NotFoundPage.tsx
└── store/                     # Zustand stores
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
| `/jugar` | Hub con demo interactiva |
| `/jugar/sopa-de-letras#hash` | Sopa de letras jugable |
| `/jugar/crucigrama#hash` | Crucigrama jugable |
| `/jugar/rellenar-huecos#hash` | Rellenar huecos jugable |
| `/jugar/adivina-la-palabra#hash` | Ahorcado jugable |
| `/jugar/anagrama#hash` | Anagrama jugable |
| `/jugar/ordenar-oracion#hash` | Ordenar oración jugable |

## Funcionalidades

### Generación y exportación
- Generación automática de puzzles a partir de texto o palabras ingresadas
- Exportación a PDF (versión estudiante y versión solución)
- Previsualización interactiva antes de descargar

### Juegos digitales compartibles
- URLs compartibles con datos codificados (gzip + base64url en hash)
- QR code generado vía proxy externo para URLs cortas
- Sin backend: todo el decoding es client-side
- Contador de intentos por URL en localStorage
- Sin login ni almacenamiento de datos de estudiantes

## Agregar un nuevo puzzle

1. Crear la carpeta en `src/lib/puzzles/<nombre>/` con un `generator.ts` que implemente la interfaz del registry.
2. Registrar el puzzle en `src/App.tsx` con `registerPuzzle()`.
3. Crear la página en `src/pages/<Nombre>Page.tsx`.
4. Agregar la ruta en `App.tsx` dentro del `<Routes>`.
5. Agregar la entrada en el array `TABS` de `src/components/layout/Header.tsx`.
6. Agregar la card en `src/pages/HomePage.tsx`.
7. Crear el componente jugable en `src/components/playable/<Nombre>Game.tsx`.
8. Crear la página jugable en `src/pages/play/Play<Nombre>Page.tsx`.
9. Agregar la ruta `/jugar/<nombre>` en `App.tsx`.
10. Agregar tipos y conversores en `src/lib/share/types.ts`.

## Deployment

El proyecto está desplegado en **Vercel** con dominio propio `tools.edualex.uy`.

- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **SPA routing:** manejado con `vercel.json` (rewrites a `index.html`)
- **SEO:** `robots.txt`, `sitemap.xml`, OpenGraph y Twitter Cards configurados en `index.html`

## Autor

**alexcuadro** — [tools.edualex.uy](https://tools.edualex.uy)
