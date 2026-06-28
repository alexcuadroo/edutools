import type { Env } from "@/lib/env";
import { getSiteUrl } from "@/lib/env";
import type { UserRecord, VerifyTokenRecord } from "@/lib/types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const siteUrl = getSiteUrl(context.request);
    const url = new URL(context.request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return Response.redirect(`${siteUrl}/verificar?ok=0`, 302);
    }

    const tokenStr = await context.env.USERS.get(`verify-token:${token}`);
    if (!tokenStr) {
      return Response.redirect(`${siteUrl}/verificar?ok=0`, 302);
    }

    const tokenRecord: VerifyTokenRecord = JSON.parse(tokenStr);
    const now = Date.now();
    if (now > tokenRecord.expiresAt) {
      return Response.redirect(`${siteUrl}/verificar?ok=0`, 302);
    }

    const userStr = await context.env.USERS.get(`user:${tokenRecord.userId}`);
    if (!userStr) {
      return Response.redirect(`${siteUrl}/verificar?ok=0`, 302);
    }

    const user: UserRecord = JSON.parse(userStr);
    user.verified = true;
    user.verifiedAt = now;

    await context.env.USERS.put(`user:${user.id}`, JSON.stringify(user));
    await context.env.USERS.delete(`verify-token:${token}`);

    return Response.redirect(`${siteUrl}/verificar?ok=1`, 302);
  } catch (err) {
    const siteUrl = getSiteUrl(context.request);
    console.error("Error en verify:", err);
    return Response.redirect(`${siteUrl}/verificar?ok=0`, 302);
  }
};
