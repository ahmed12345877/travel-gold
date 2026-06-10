import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as db from "../db";

import { getAuth } from "firebase-admin/auth";

// Extended response type that includes cookie helpers (from Express or our shim)
interface CookieResponse {
  cookie(name: string, value: string, options?: Record<string, unknown>): void;
  clearCookie(name: string, options?: Record<string, unknown>): void;
  setHeader?(key: string, value: string | string[]): void;
}

// Minimal request type that works with both Express and node-http
interface MinimalRequest {
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
  protocol?: string;
}

function getBearerToken(req: MinimalRequest): string | null {
  const auth = req.headers["authorization"];
  if (!auth || Array.isArray(auth)) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export type TrpcContext = {
  req: MinimalRequest;
  res: CookieResponse;
  user: User | null;
  contextData: {
    role: string | null;
    userId: string | null;
    email: string | null;
  };
};

export async function createContext(
  opts: { req: MinimalRequest; res: CookieResponse }
): Promise<TrpcContext> {
  let user: User | null = null;

  // 1) Verify Firebase ID token from Authorization header
  const bearer = getBearerToken(opts.req);
  if (bearer) {
    try {
      const decoded = await getAuth().verifyIdToken(bearer);
      const openId = `firebase:${decoded.uid}`;
      const name =
        decoded.name ||
        (decoded.email ? decoded.email.split("@")[0] : null) ||
        null;

      await db.upsertUser({
        openId,
        name,
        email: decoded.email ?? null,
        loginMethod: "firebase",
        lastSignedIn: new Date(),
      }).catch(() => {});

      const found = await db.getUserByOpenId(openId);
      if (found) user = found;
    } catch {
      // Invalid or expired Firebase token — fall through to session cookie
    }
  }

  // 2) Fallback to Manus session cookie auth
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req as any);
    } catch {
      user = null;
    }
  }

  // Final DB refresh for SQL-backed sessions only.
  // firebase: and admin: sessions are self-contained — skip the SQL lookup.
  if (
    user?.openId &&
    !user.openId.startsWith("firebase:") &&
    !user.openId.startsWith("admin:")
  ) {
    const fresh = await db.getUserByOpenId(user.openId);
    if (fresh) user = fresh;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    contextData: {
      role: user?.role ?? null,
      userId: user?.openId ?? null,
      email: user?.email ?? null,
    },
  };
}
