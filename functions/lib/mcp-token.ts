import { generateToken } from "@/lib/auth";
import type { Env } from "@/lib/env";

export interface McpTokenRecord {
  userId: string;
  tokenId: string;
  name: string;
  createdAt: number;
}

export interface McpTokenIndexRecord {
  id: string;
  name: string;
  createdAt: number;
  tokenHash: string;
}

export async function hashMcpToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createMcpToken(
  env: Env,
  userId: string,
  name: string,
): Promise<{ token: string; record: McpTokenIndexRecord }> {
  const token = `edutools_mcp_${generateToken(32)}`;
  const tokenHash = await hashMcpToken(token);
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const createdAt = Date.now();
  const record: McpTokenIndexRecord = { id, name, createdAt, tokenHash };

  await env.SESSIONS.put(`mcp-token:${tokenHash}`, JSON.stringify({
    userId,
    tokenId: id,
    name,
    createdAt,
  } satisfies McpTokenRecord));
  await env.USERS.put(`mcp-token-index:${userId}:${id}`, JSON.stringify(record));

  return { token, record };
}

export async function authenticateMcpToken(
  env: Env,
  authorization: string | null,
): Promise<{ userId: string } | null> {
  const match = authorization?.match(/^Bearer\s+(edutools_mcp_[A-Za-z0-9_-]+)$/i);
  if (!match) return null;

  const tokenHash = await hashMcpToken(match[1]!);
  const recordJson = await env.SESSIONS.get(`mcp-token:${tokenHash}`);
  if (!recordJson) return null;

  const record = JSON.parse(recordJson) as McpTokenRecord;
  if (!await env.USERS.get(`user:${record.userId}`)) return null;
  return { userId: record.userId };
}
