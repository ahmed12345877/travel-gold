import type { VercelRequest, VercelResponse } from "@vercel/node";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { getSessionCookieOptions } from "../../server/_core/cookies";
import * as db from "../../server/db";
import { sdk } from "../../server/_core/sdk";

function getQueryParam(req: VercelRequest, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

function serializeCookie(name: string, value: string, options: ReturnType<typeof getSessionCookieOptions> & { maxAge: number }) {
  const parts = [
    `${name}=${value}`,
    `Path=${options.path ?? "/"}`,
    options.httpOnly ? "HttpOnly" : undefined,
    options.secure ? "Secure" : undefined,
    options.sameSite ? `SameSite=${options.sameSite}` : undefined,
    `Max-Age=${Math.floor(options.maxAge / 1000)}`,
  ].filter(Boolean) as string[];
  return parts.join("; ");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const code = getQueryParam(req, "code");
  const state = getQueryParam(req, "state");

  if (!code || !state) {
    res.status(400).json({ error: "code and state are required" });
    return;
  }

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

    if (!userInfo.openId) {
      res.status(400).json({ error: "openId missing from user info" });
      return;
    }

    await db.upsertUser({
      openId: userInfo.openId,
      name: (userInfo as any).name || null,
      email: (userInfo as any).email ?? null,
      loginMethod: (userInfo as any).loginMethod ?? (userInfo as any).platform ?? null,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: (userInfo as any).name || "",
      expiresInMs: ONE_YEAR_MS,
    });

    // Emulate getSessionCookieOptions using request headers
    const cookieOptions = getSessionCookieOptions({
      headers: req.headers as any,
      protocol: (req.headers["x-forwarded-proto"] as string) ?? "http",
    } as any);

    res.setHeader("Set-Cookie", serializeCookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS }));
    res.status(302).setHeader("Location", "/").end();
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    res.status(500).json({ error: "OAuth callback failed" });
  }
}
