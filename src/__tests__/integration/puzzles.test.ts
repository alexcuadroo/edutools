import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8788";

describe("API /api/puzzles (públicos)", () => {
  const id = "aabbccdd";

  const testPuzzle = {
    type: "word-search",
    puzzle: {
      g: [["C", "A", "S", "A"]],
      s: 4,
      w: [{ w: "CASA", r: 0, col: 0, d: "right" }],
      t: "Test Puzzle",
    },
  };

  it("POST /api/puzzles crea un puzzle y devuelve un id", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...testPuzzle, id }),
    });

    expect(res.status).toBeOneOf([200, 201]);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(typeof body.id).toBe("string");
  });

  it("GET /api/puzzles/:id recupera un puzzle creado", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles/${id}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.type).toBe("word-search");
    expect(body.puzzle).toBeDefined();
    expect(body.puzzle.g).toBeDefined();
  });

  it("GET /api/puzzles/:id devuelve 404 para puzzle inexistente", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles/deadbeef1234`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("POST /api/puzzles rechaza tipo inválido", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "invalid-type", puzzle: {} }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("no válido");
  });

  it("POST /api/puzzles rechaza body sin puzzle", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "word-search" }),
    });

    expect(res.status).toBe(400);
  });

  it("POST /api/puzzles rechaza body no JSON", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    expect(res.status).toBe(400);
  });

  it("POST /api/puzzles mismo id devuelve cached=true la segunda vez", async () => {
    const uniqueId = "ffeeddcc";
    const createRes1 = await fetch(`${BASE_URL}/api/puzzles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...testPuzzle, id: uniqueId }),
    });
    expect(createRes1.status).toBeOneOf([200, 201]);

    const createRes2 = await fetch(`${BASE_URL}/api/puzzles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...testPuzzle, id: uniqueId }),
    });

    expect(createRes2.status).toBe(200);
    const body2 = await createRes2.json();
    expect(body2.cached).toBe(true);
  });
});
