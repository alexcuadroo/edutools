import { ROSCO_LETTERS, type RoscoEntry, type RoscoRule } from "@/lib/puzzles/rosco/types";

function parseRows(csv: string, separator: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]!;
    if (char === '"') {
      if (quoted && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === separator && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error("El CSV tiene comillas sin cerrar.");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function parseRule(value: string): RoscoRule | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "empieza con" || normalized === "starts-with") return "starts-with";
  if (normalized === "contiene" || normalized === "contains") return "contains";
  return null;
}

export function parseRoscoCsv(csv: string): RoscoEntry[] {
  const firstLine = csv.split(/\r?\n/, 1)[0] ?? "";
  const separator = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows = parseRows(csv.replace(/^\uFEFF/, ""), separator);
  const [header, ...dataRows] = rows;
  if (!header || header.map((cell) => cell.toLowerCase()).join(",") !== "letra,respuesta,regla,pista") {
    throw new Error("El CSV debe comenzar con: letra,respuesta,regla,pista");
  }
  if (dataRows.length !== ROSCO_LETTERS.length) throw new Error("El CSV debe contener exactamente 26 filas, de la A a la Z.");

  return dataRows.map((row, index) => {
    if (row.length !== 4) throw new Error(`La fila ${index + 2} debe tener 4 columnas.`);
    const [letter, answer, ruleText, clue] = row;
    const expectedLetter = ROSCO_LETTERS[index]!;
    if (letter?.toUpperCase() !== expectedLetter) throw new Error(`La fila ${index + 2} debe corresponder a la letra ${expectedLetter}.`);
    const rule = parseRule(ruleText ?? "");
    if (!rule) throw new Error(`La regla de ${expectedLetter} debe ser “empieza con” o “contiene”.`);
    return { letter: expectedLetter, answer: answer ?? "", clue: clue ?? "", rule };
  });
}

export const ROSCO_LLM_PROMPT = `Creá un rosco educativo en español sobre [TEMÁTICA].

Respondé ÚNICAMENTE con CSV UTF-8, sin Markdown, explicaciones ni bloques de código. Usá exactamente este encabezado:
letra,respuesta,regla,pista

Incluí exactamente 26 filas, en este orden: A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z. No incluyas la Ñ.

Reglas:
- “regla” debe ser exactamente “empieza con” o “contiene”.
- La respuesta debe respetar la regla respecto de su letra.
- Cada pista debe ser clara, educativa y no revelar la respuesta.
- Si una pista contiene coma, punto y coma o comillas, encerrala entre comillas dobles y escapá las comillas internas duplicándolas.
- No dejes ninguna celda vacía.`;
