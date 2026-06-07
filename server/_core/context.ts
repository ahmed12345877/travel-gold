import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "./supabase";
import { sdk } from "./sdk";
import * as db from "../db";

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
  supabase: SupabaseClient | null;
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
  const supabase = getServerSupabase();

  // 1) Try Supabase JWT from Authorization header first
  const bearer = getBearerToken(opts.req);
  if (bearer && supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(bearer);
      if (!error && data.user) {
        const u = data.user;

        const name =
          (u.user_metadata && (u.user_metadata as any).name) ||
          u.user_metadata?.full_name ||
          u.email?.split("@")[0] ||
          null;

        const appMeta = (u.app_metadata ?? {}) as Record<string, unknown>;
        const supabaseRole = appMeta["role"] === "admin" ? "admin" : undefined;

        // Upsert user in your DB
        await db.upsertUser({
          openId: u.id,
          name,
          email: u.email ?? null,
          loginMethod: "supabase",
          lastSignedIn: new Date(),
          ...(supabaseRole ? { role: supabaseRole } : {}),
        });

        // Refetch from DB to ensure role is correct
        const found = await db.getUserByOpenId(u.id);
        if (found) user = found;
      }
    } catch {
      // ignore and fall back to Manus
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

  // Final DB refresh (in case Manus returned a user without latest role)
  if (user?.openId) {
    const fresh = await db.getUserByOpenId(user.openId);
    if (fresh) user = fresh;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    supabase,
    contextData: {
      role: user?.role ?? null,
      userId: user?.openId ?? null,
      email: user?.email ?? null,
    },
  };
}
