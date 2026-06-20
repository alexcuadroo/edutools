import type { IPuzzleGenerator, PuzzleResult } from "@/lib/puzzles/types";
import type { TextToken, BlankWord, FillBlanksResult, FillBlanksInput } from "@/lib/puzzles/fill-blanks/types";
import { shuffle } from "@/lib/utils";

const DISTRACTORS: Record<number, string[]> = {
  3: ["sol", "mar", "pan", "luz", "rio", "ave", "pez", "dos", "ojo", "pie", "fin", "sal", "rey", "ley", "voz"],
  4: ["casa", "mesa", "luna", "gato", "pato", "rosa", "lobo", "toro", "mono", "rama", "copa", "beso", "piso", "nube", "hoja", "rojo", "azul", "gris", "leon", "puma"],
  5: ["perro", "gato", "arbol", "libro", "campo", "fuego", "mundo", "cielo", "verde", "negro", "playa", "noche", "tarde", "plaza", "fruta", "carne", "leche", "piedra", "tigre", "pulpo"],
  6: ["escuela", "ciudad", "blanco", "grande", "pequeno", "amigos", "familia", "tiempo", "tierra", "cuerpo", "camino", "puerta", "fuerza", "sangre", "pueblo", "centro", "punto", "forma", "jardin", "bosque"],
  7: ["persona", "momento", "ejemplo", "palabra", "problema", "trabajo", "gobierno", "historia", "servicio", "millones", "derecho", "cambio", "proceso", "sistema", "cultura", "sociedad", "familia", "manera", "estudio", "poder"],
  8: ["nacional", "internacional", "importante", "diferente", "principal", "desarrollo", "educacion", "produccion", "poblacion", "condicion", "posicion", "relacion", "situacion", "informacion", "comunicacion", "organizacion", "investigacion", "participacion", "experiencia", "necesidad"],
  9: ["importante", "diferente", "necesario", "posible", "principal", "general", "especial", "personal", "social", "cultural", "politico", "economico", "historico", "educativo", "tecnologico", "cientifico", "artistico", "deportivo", "religioso", "familiar"],
  10: ["completamente", "definitivamente", "especialmente", "generalmente", "naturalmente", "principalmente", "simplemente", "actualmente", "exactamente", "rapidamente"],
};

function tokenize(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  const regex = /(\s+)|([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)|([^\sa-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)/g;
  let match;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      tokens.push({ type: "space", value: match[1], index: index++ });
    } else if (match[2]) {
      tokens.push({ type: "word", value: match[2], index: index++ });
    } else if (match[3]) {
      tokens.push({ type: "punctuation", value: match[3], index: index++ });
    }
  }

  return tokens;
}

function getWordTokens(tokens: TextToken[]): TextToken[] {
  return tokens.filter(
    (t) => t.type === "word" && t.value.length >= 3 && t.value.length <= 12
  );
}

function getDistractors(wordLength: number, exclude: string[], count: number): string[] {
  const normalizedLength = Math.min(Math.max(wordLength, 3), 10);
  const pool = DISTRACTORS[normalizedLength] || DISTRACTORS[5];
  const excludeLower = exclude.map((w) => w.toLowerCase());

  const available = (pool ?? []).filter((w) => !excludeLower.includes(w.toLowerCase()));
  return shuffle(available).slice(0, count);
}

class FillBlanksGenerator implements IPuzzleGenerator {
  id = "fill-blanks" as const;
  name = "Rellenar Huecos";
  description = "Genera un texto con huecos para completar";

  generate(): PuzzleResult {
    throw new Error("Use generateFromText instead");
  }

  generateFromText(input: FillBlanksInput): FillBlanksResult {
    const { text, blankCount, distractorRatio = 0.4 } = input;

    if (!text || text.trim().length < 10) {
      throw new Error("El texto debe tener al menos 10 caracteres");
    }

    const tokens = tokenize(text);
    const wordTokens = getWordTokens(tokens);

    if (wordTokens.length < blankCount) {
      throw new Error(
        `El texto no tiene suficientes palabras para crear ${blankCount} huecos. Solo hay ${wordTokens.length} palabras válidas.`
      );
    }

    const selectedWords = shuffle(wordTokens).slice(0, blankCount);
    const blanks: BlankWord[] = selectedWords.map((t) => ({
      word: t.value,
      tokenIndex: t.index,
    }));

    const correctWords = blanks.map((b) => b.word);
    const totalOptions = Math.ceil(correctWords.length / (1 - distractorRatio));
    const distractorCount = totalOptions - correctWords.length;

    const avgLength = Math.round(
      correctWords.reduce((sum, w) => sum + w.length, 0) / correctWords.length
    );
    const distractors = getDistractors(avgLength, correctWords, distractorCount);

    const options = shuffle([...correctWords, ...distractors]);

    return {
      tokens,
      blanks: blanks.sort((a, b) => a.tokenIndex - b.tokenIndex),
      options,
      originalText: text,
    };
  }

  toggleBlank(
    result: FillBlanksResult,
    tokenIndex: number
  ): FillBlanksResult {
    const existingBlank = result.blanks.find((b) => b.tokenIndex === tokenIndex);

    if (existingBlank) {
      const newBlanks = result.blanks.filter((b) => b.tokenIndex !== tokenIndex);

      if (newBlanks.length === 0) {
        return {
          ...result,
          blanks: [],
          options: [],
        };
      }

      const correctWords = newBlanks.map((b) => b.word);
      const distractorCount = Math.ceil(correctWords.length * 0.4);
      const avgLength = Math.round(
        correctWords.reduce((sum, w) => sum + w.length, 0) / correctWords.length
      );
      const excludeWords = [...correctWords, existingBlank.word];
      const distractors = getDistractors(avgLength, excludeWords, distractorCount);
      const options = shuffle([...correctWords, ...distractors]);

      return {
        ...result,
        blanks: newBlanks,
        options,
      };
    }

    const token = result.tokens.find((t) => t.index === tokenIndex);
    if (!token || token.type !== "word") {
      return result;
    }

    const newBlanks = [...result.blanks, { word: token.value, tokenIndex }].sort(
      (a, b) => a.tokenIndex - b.tokenIndex
    );

    const correctWords = newBlanks.map((b) => b.word);
    const distractorCount = Math.ceil(correctWords.length * 0.4);
    const avgLength = Math.round(
      correctWords.reduce((sum, w) => sum + w.length, 0) / correctWords.length
    );
    const distractors = getDistractors(avgLength, correctWords, distractorCount);
    const options = shuffle([...correctWords, ...distractors]);

    return {
      ...result,
      blanks: newBlanks,
      options,
    };
  }
}

export const fillBlanksGenerator = new FillBlanksGenerator();
