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
