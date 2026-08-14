import { DurableObject } from "cloudflare:workers";

export interface ProgressEntry {
  participantId: string;
  alias: string;
  type: "word-search" | "crossword" | "rosco";
  correctItems: string[];
  incorrectItems: string[];
  total: number;
  completed: boolean;
  updatedAt: number;
}

export class PuzzleProgress extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/report") {
      const entry = await request.json<ProgressEntry>();
      await this.ctx.storage.put(`participant:${entry.participantId}`, { ...entry, updatedAt: Date.now() });
      return new Response(null, { status: 204 });
    }
    if (request.method === "GET" && url.pathname === "/participants") {
      const entries = await this.ctx.storage.list<ProgressEntry>({ prefix: "participant:" });
      return Response.json([...entries.values()].sort((a, b) => b.updatedAt - a.updatedAt));
    }
    if (request.method === "DELETE" && url.pathname === "/participants") {
      const entries = await this.ctx.storage.list({ prefix: "participant:" });
      await this.ctx.storage.delete([...entries.keys()]);
      return new Response(null, { status: 204 });
    }
    return new Response("Not found", { status: 404 });
  }
}

export default { fetch: () => new Response("Not found", { status: 404 }) } satisfies ExportedHandler;
