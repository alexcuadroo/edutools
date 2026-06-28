import { argon2id } from "@noble/hashes/argon2";
import { randomBytes } from "@noble/hashes/utils";
import type { Env } from "./env";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "./env";
import { corsHeaders } from "./env";
import type { UserRecord, PublicUser, SessionRecord } from "./types";

export function parseCookie(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split("=");
    if (key.trim() === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }
  return null;
}

export function setSessionCookie(token: string): string {
  const maxAge = SESSION_TTL_SECONDS;
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Max-Age=0; Path=/`;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = argon2id(password, salt, { t: 2, m: 19456, p: 1 });
  return JSON.stringify({
    salt: Array.from(salt),
    hash: Array.from(hash),
    t: 2,
    m: 19456,
    p: 1,
  });
}

export function verifyPassword(storedHash: string, password: string): boolean {
  let parsed: { salt: number[]; hash: number[]; t: number; m: number; p: number };
  try {
    parsed = JSON.parse(storedHash);
  } catch {
    return false;
  }

  if (!parsed.salt || !parsed.hash) return false;

  const salt = new Uint8Array(parsed.salt);
  const expectedHex = parsed.hash.map((b) => b.toString(16).padStart(2, "0")).join("");

  const computedHash = argon2id(password, salt, {
    t: parsed.t,
    m: parsed.m,
    p: parsed.p,
  });
  const computedHex = Array.from(new Uint8Array(computedHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHex === expectedHex;
}

export function generateToken(bytes: number = 32): string {
  const array = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function createSession(env: Env, userId: string): Promise<string> {
  const token = generateToken(32);
  const now = Date.now();
  const session: SessionRecord = {
    userId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
  };
  await env.SESSIONS.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
  return token;
}

export async function destroySession(env: Env, token: string): Promise<void> {
  await env.SESSIONS.delete(`session:${token}`);
}

export async function requireAuth(
  request: Request,
  env: Env
): Promise<{ userId: string; user: UserRecord; sessionToken: string }> {
  const cookieHeader = request.headers.get("Cookie") || "";
  const token = parseCookie(cookieHeader, SESSION_COOKIE_NAME);
  if (!token) {
    throw new AuthError("No autenticado", 401);
  }

  const sessionStr = await env.SESSIONS.get(`session:${token}`);
  if (!sessionStr) {
    throw new AuthError("Sesión expirada", 401);
  }

  const session: SessionRecord = JSON.parse(sessionStr);
  const userStr = await env.USERS.get(`user:${session.userId}`);
  if (!userStr) {
    throw new AuthError("Usuario no encontrado", 401);
  }

  const user: UserRecord = JSON.parse(userStr);
  return { userId: user.id, user, sessionToken: token };
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function jsonResponse(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return Response.json(data, {
    status,
    headers: { ...corsHeaders, ...extraHeaders },
  });
}
