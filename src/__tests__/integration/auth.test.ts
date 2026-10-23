import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8788";

async function signupAndLogin(email: string, password: string): Promise<string> {
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (signupRes.status !== 201 && signupRes.status !== 409) {
    throw new Error(`Signup failed: ${signupRes.status} ${await signupRes.text()}`);
  }

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  const cookie = loginRes.headers.get("set-cookie");
  if (!cookie) throw new Error("No session cookie returned");
  return cookie;
}

describe("API Auth", () => {
  let sessionCookie: string;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password12345";

  beforeAll(async () => {
    sessionCookie = await signupAndLogin(testEmail, testPassword);
  });

  it("POST /api/auth/signup crea cuenta y devuelve ok", async () => {
    const email = `signup-${Date.now()}@example.com`;
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: testPassword }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("POST /api/auth/signup rechaza email duplicado", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("Ya existe");
  });

  it("POST /api/auth/signup rechaza email inválido", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "no-es-un-email", password: testPassword }),
    });

    expect(res.status).toBe(400);
  });

  it("POST /api/auth/signup rechaza contraseña corta", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `short-${Date.now()}@example.com`, password: "123" }),
    });

    expect(res.status).toBe(400);
  });

  it("POST /api/auth/login inicia sesión con credenciales válidas", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testEmail);
  });

  it("POST /api/auth/login rechaza contraseña incorrecta", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "wrong-password-123" }),
    });

    expect(res.status).toBe(401);
  });

  it("POST /api/auth/login rechaza email inexistente", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `noexiste-${Date.now()}@example.com`, password: testPassword }),
    });

    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me devuelve usuario autenticado", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testEmail);
  });

  it("GET /api/auth/me rechaza sin sesión", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    expect(res.status).toBe(401);
  });

  describe("MCP EduTools", () => {
    let mcpToken: string;
    let mcpTokenId: string;

    it("crea un token sin volver a exponerlo en el listado", async () => {
      const created = await fetch(`${BASE_URL}/api/mcp-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: sessionCookie },
        body: JSON.stringify({ name: "Test MCP" }),
      });

      expect(created.status).toBe(201);
      const body = await created.json();
      mcpToken = body.token;
      mcpTokenId = body.tokenInfo.id;
      expect(mcpToken).toMatch(/^edutools_mcp_/);

      const list = await fetch(`${BASE_URL}/api/mcp-tokens`, { headers: { Cookie: sessionCookie } });
      expect(list.status).toBe(200);
      const entries = await list.json();
      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe("Test MCP");
      expect(JSON.stringify(entries)).not.toContain(mcpToken);
    });

    it("genera la sopa en el backend, la guarda y devuelve el link", async () => {
      const headers = {
        Authorization: `Bearer ${mcpToken}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      };
      const initialized = await fetch(`${BASE_URL}/api/mcp`, {
        method: "POST",
        headers,
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } }),
      });
      expect(initialized.status).toBe(200);
      expect((await initialized.json()).result.serverInfo.name).toBe("edutools");

      const tools = await fetch(`${BASE_URL}/api/mcp`, {
        method: "POST",
        headers,
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
      });
      expect((await tools.json()).result.tools.map((tool: { name: string }) => tool.name)).toContain("save_puzzle");

      const response = await fetch(`${BASE_URL}/api/mcp`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: {
            name: "save_puzzle",
            arguments: {
              type: "word-search",
              title: "Sopa de prueba",
              input: {
                words: "CASA - Hogar\nPERRO - Animal doméstico\nLUNA - Satélite natural",
                size: 10,
              },
            },
          },
        }),
      });

      expect(response.status).toBe(200);
      const result = (await response.json()).result;
      expect(result.isError).toBeUndefined();
      const puzzleUrl = result.content[0].text as string;
      expect(puzzleUrl).toContain("/jugar/sopa-de-letras/");

      const puzzleId = new URL(puzzleUrl).pathname.split("/").at(-1);
      const publicPuzzle = await fetch(`${BASE_URL}/api/puzzles/${puzzleId}`);
      expect(publicPuzzle.status).toBe(200);
      const shared = await publicPuzzle.json();
      expect(shared.type).toBe("word-search");
      expect(shared.puzzle.g).toHaveLength(10);
      expect(shared.puzzle.w).toHaveLength(3);

      const list = await fetch(`${BASE_URL}/api/puzzles/saved`, { headers: { Cookie: sessionCookie } });
      expect(await list.json()).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: puzzleId, type: "word-search", title: "Sopa de prueba" }),
      ]));
    });

    it("genera y guarda los otros tipos de puzzle desde entradas simples", async () => {
      const roscoEntries = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
        letter,
        answer: letter,
        clue: `Respuesta para ${letter}`,
        rule: "starts-with",
      }));
      const cases = [
        { type: "crossword", input: { words: ["CASA", "MESA", "SALA", "PALA"].map((word) => ({ word, clue: `Pista ${word}` })) } },
        { type: "fill-blanks", input: { text: "El planeta Tierra gira alrededor del Sol y permite la vida.", blankCount: 3 } },
        { type: "hangman", input: { words: [{ word: "PLANETA", clue: "Cuerpo celeste" }] } },
        { type: "anagram", input: { words: [{ word: "CASA", clue: "Hogar" }] } },
        { type: "sentence-order", input: { words: [{ word: "El gato duerme sobre la alfombra" }] } },
        { type: "match-columns", input: { words: [{ word: "GATO", clue: "Animal doméstico" }, { word: "ROSA", clue: "Una flor" }] } },
        { type: "memory", input: { words: [{ word: "GATO", clue: "Animal doméstico" }, { word: "ROSA", clue: "Una flor" }] } },
        { type: "rosco", input: { entries: roscoEntries, durationSeconds: 60 } },
        { type: "wordle", input: { words: [{ word: "CASA", clue: "Hogar" }] } },
      ];

      for (const [index, puzzleCase] of cases.entries()) {
        const response = await fetch(`${BASE_URL}/api/mcp`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${mcpToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: index + 10,
            method: "tools/call",
            params: {
              name: "save_puzzle",
              arguments: { type: puzzleCase.type, title: `Test ${puzzleCase.type}`, input: puzzleCase.input },
            },
          }),
        });
        expect(response.status).toBe(200);
        const result = (await response.json()).result;
        expect(result.isError, `Falló el generador ${puzzleCase.type}`).toBeUndefined();

        const puzzleUrl = result.content[0].text as string;
        const puzzleId = new URL(puzzleUrl).pathname.split("/").at(-1);
        const publicPuzzle = await fetch(`${BASE_URL}/api/puzzles/${puzzleId}`);
        expect(publicPuzzle.status, `No se guardó ${puzzleCase.type}`).toBe(200);
        expect((await publicPuzzle.json()).type).toBe(puzzleCase.type);
      }
    });

    it("rechaza tokens inválidos y revocados", async () => {
      const invalid = await fetch(`${BASE_URL}/api/mcp`, {
        method: "POST",
        headers: { Authorization: "Bearer edutools_mcp_invalid", "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
      });
      expect(invalid.status).toBe(401);

      const revoked = await fetch(`${BASE_URL}/api/mcp-tokens/${mcpTokenId}`, {
        method: "DELETE",
        headers: { Cookie: sessionCookie },
      });
      expect(revoked.status).toBe(204);

      const afterRevoke = await fetch(`${BASE_URL}/api/mcp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${mcpToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
      });
      expect(afterRevoke.status).toBe(401);
    });
  });

  it("POST /api/auth/logout cierra sesión", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });

    expect(res.status).toBe(204);

    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    expect(meRes.status).toBe(401);
  });
});
