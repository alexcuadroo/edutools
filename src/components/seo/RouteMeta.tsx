import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageMeta {
  title: string;
  description: string;
}

const DEFAULT_DESCRIPTION =
  "Genera puzzles educativos personalizados gratis: sopa de letras, crucigrama, rosco, rellenar huecos, memoria y más. Exportá en PDF o compartilos como juegos digitales.";

const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "EduTools - Generador de Puzzles Educativos",
    description: DEFAULT_DESCRIPTION,
  },
  "/sopa-de-letras": {
    title: "Sopa de Letras - Generador gratuito | EduTools",
    description:
      "Creá sopas de letras personalizadas con tus palabras y temas. Exportá en PDF o PNG y compartilas como juego digital.",
  },
  "/crucigrama": {
    title: "Crucigrama - Generador gratuito | EduTools",
    description:
      "Generá crucigramas con pistas personalizadas, listos para imprimir en PDF o jugar en línea.",
  },
  "/rellenar-huecos": {
    title: "Rellenar Huecos - Generador gratuito | EduTools",
    description:
      "Creá ejercicios de completar texto con palabras faltantes y distractores.",
  },
  "/adivina-la-palabra": {
    title: "Adivina la Palabra - Generador gratuito | EduTools",
    description:
      "Generá ejercicios de definiciones para descubrir la respuesta con intentos limitados.",
  },
  "/anagrama": {
    title: "Anagrama - Generador gratuito | EduTools",
    description:
      "Creá anagramas a partir de tus palabras y reforzá vocabulario en clase.",
  },
  "/ordenar-oracion": {
    title: "Ordenar Oración - Generador gratuito | EduTools",
    description:
      "Construí ejercicios para ordenar palabras y armar la oración correcta.",
  },
  "/relacionar-columnas": {
    title: "Relacionar Columnas - Generador gratuito | EduTools",
    description:
      "Creá actividades para unir conceptos con sus definiciones.",
  },
  "/memoria": {
    title: "Memoria - Generador gratuito | EduTools",
    description:
      "Generá juegos de memoria con pares de palabras y definiciones.",
  },
  "/rosco": {
    title: "Rosco - Generador gratuito | EduTools",
    description:
      "Creá un rosco estilo pasapalabra con preguntas, cronómetro y letras.",
  },
  "/cadenas-de-palabras": {
    title: "Cadenas de Palabras - Generador gratuito | EduTools",
    description:
      "Creá un Wordle temático de 5 letras con pistas para tu clase.",
  },
  "/jugar": {
    title: "Jugar Puzzles Educativos | EduTools",
    description:
      "Ingresá el código que te compartió tu docente para jugar tu puzzle educativo en línea.",
  },
};

const PLAY_META: PageMeta = {
  title: "Jugar Puzzle Educativo | EduTools",
  description:
    "Jugá un puzzle educativo en línea compartido por tu docente. Sin registro necesario.",
};

/**
 * Actualiza el <title> y la meta description según la ruta actual.
 * Las rutas que no están en el mapa (auth, mis-puzzles, etc.) se omiten
 * porque esas páginas configuran sus propios metadatos con useNoIndexMeta.
 */
export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta =
      PAGE_META[pathname] ??
      (pathname.startsWith("/jugar/") ? PLAY_META : undefined);
    if (!meta) return;

    document.title = meta.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", meta.description);
  }, [pathname]);

  return null;
}