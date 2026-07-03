import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8788";

async function signupAndLogin(email: string, password: string): Promise<string> {
  await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = loginRes.headers.get("set-cookie")!;
  return cookie;
}

describe("API Puzzles Guardados", () => {
  let sessionCookie: string;
  const testEmail = `saved-${Date.now()}@example.com`;
  const testPassword = "password12345";
  const puzzleData = {
    type: "anagram",
    title: "Anagrama de Prueba",
    data: {
      w: [
        { w: "CASA", s: "ASCA" },
        { w: "PERRO", s: "RROPE", c: "canino" },
      ],
      t: "Test",
    },
  };

  beforeAll(async () => {
    sessionCookie = await signupAndLogin(testEmail, testPassword);
  });

  it("POST /api/puzzles/save guarda un puzzle y devuelve id", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify(puzzleData),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.existing).toBe(false);
  });

  it("POST /api/puzzles/save devuelve existing=true para duplicado", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify(puzzleData),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.existing).toBe(true);
  });

  it("GET /api/puzzles/saved lista puzzles guardados", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles/saved`, {
      headers: { Cookie: sessionCookie },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body[0].title).toBeDefined();
    expect(body[0].type).toBeDefined();
  });

  it("GET /api/puzzles/saved/:id obtiene un puzzle guardado", async () => {
    const listRes = await fetch(`${BASE_URL}/api/puzzles/saved`, {
      headers: { Cookie: sessionCookie },
    });
    const list = await listRes.json();
    const puzzleId = list[0].id;

    const res = await fetch(`${BASE_URL}/api/puzzles/saved/${puzzleId}`, {
      headers: { Cookie: sessionCookie },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.type).toBe("anagram");
    expect(body.puzzle).toBeDefined();
  });

  it("POST /api/puzzles/saved/:id/share comparte un puzzle", async () => {
    const listRes = await fetch(`${BASE_URL}/api/puzzles/saved`, {
      headers: { Cookie: sessionCookie },
    });
    const list = await listRes.json();
    const puzzleId = list[0].id;

    const res = await fetch(`${BASE_URL}/api/puzzles/saved/${puzzleId}/share`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.shareId).toBeDefined();
    expect(body.url).toContain("/jugar/");
  });

  it("DELETE /api/puzzles/saved/:id elimina un puzzle", async () => {
    const listRes = await fetch(`${BASE_URL}/api/puzzles/saved`, {
      headers: { Cookie: sessionCookie },
    });
    const list = await listRes.json();
    const puzzleId = list[0].id;

    const deleteRes = await fetch(`${BASE_URL}/api/puzzles/saved/${puzzleId}`, {
      method: "DELETE",
      headers: { Cookie: sessionCookie },
    });

    expect(deleteRes.status).toBe(204);

    const res = await fetch(`${BASE_URL}/api/puzzles/saved/${puzzleId}`, {
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(404);
  });

  it("GET /api/puzzles/saved rechaza sin autenticación", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles/saved`);
    expect(res.status).toBe(401);
  });

  it("POST /api/puzzles/save rechaza sin título", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ type: "anagram", title: "", data: {} }),
    });

    expect(res.status).toBe(400);
  });

  it("POST /api/puzzles/save rechaza tipo inválido", async () => {
    const res = await fetch(`${BASE_URL}/api/puzzles/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ type: "invalid", title: "Test", data: {} }),
    });

    expect(res.status).toBe(400);
  });
});
