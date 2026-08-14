import { describe, expect, it } from "vitest";
import { parsePendingPuzzleSave } from "@/lib/share/pending-puzzle-save";

describe("pending puzzle save", () => {
  it("recupera un puzzle pendiente válido", () => {
    expect(parsePendingPuzzleSave(JSON.stringify({ type: "rosco", title: "Ciencias", data: { d: 180 } }))).toEqual({ type: "rosco", title: "Ciencias", data: { d: 180 } });
  });

  it("descarta contenido inválido", () => {
    expect(parsePendingPuzzleSave("no-json")).toBeNull();
    expect(parsePendingPuzzleSave(JSON.stringify({ type: "invalid", title: "x", data: {} }))).toBeNull();
  });
});
