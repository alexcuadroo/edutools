export interface Env {
  PUZZLES: KVNamespace;
  USERS: KVNamespace;
  SESSIONS: KVNamespace;
  PROGRESS?: DurableObjectNamespace;
  RESEND_API_KEY?: string;
  ENVIRONMENT?: string;
}

export const SESSION_COOKIE_NAME = "edutools_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
export const VERIFY_TOKEN_TTL_SECONDS = 60 * 60 * 24;
export const RESET_TOKEN_TTL_SECONDS = 60 * 60;

export const ALLOWED_PUZZLE_TYPES = [
  "word-search",
  "crossword",
  "fill-blanks",
  "hangman",
  "anagram",
  "sentence-order",
  "match-columns",
  "memory",
  "rosco",
  "wordle",
] as const;

export type AllowedPuzzleType = (typeof ALLOWED_PUZZLE_TYPES)[number];

export const EMAIL_FROM = "EduTools <no-reply@edualex.uy>";
export const PRODUCTION_SITE_URL = "https://tools.edualex.uy";

export function getSiteUrl(request: Request): string {
  const origin = request.headers.get("Origin");
  if (origin) return origin;
  const host = request.headers.get("Host");
  if (host) return `http://${host}`;
  try {
    return new URL(request.url).origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
