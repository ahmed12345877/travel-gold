import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "./supabase";
import { sdk } from "./sdk";
import * as db from "../db";

function getBearerToken(req: CreateExpressContextOptions["req"]): string | null {
  const auth = req.headers["authorization"];
  if (!auth || Array.isArray(auth)) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /** Optional server Supabase client (admin key). Null if env not configured */
  supabase: SupabaseClient | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  const supabase = getServerSupabase();

  // 1) Try Supabase JWT from Authorization header first
  const bearer = getBearerToken(opts.req);
  if (bearer && supabase) {
    try {
      // Race against a 4 s cap: supabase.auth.getUser makes a network call to
      // Supabase's server on every request. Without a timeout it can hang past
      // Vercel's 10 s function limit, which returns plain-text
      // "A server error occurred" — not JSON — causing the tRPC client to throw
      // "Unexpected token 'A'" on the browser side.
      const supabaseResult = await Promise.race([
        supabase.auth.getUser(bearer),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 4_000)),
      ]);
      if (supabaseResult && !supabaseResult.error && supabaseResult.data?.user) {
        const u = supabaseResult.data.user;
        const name =
          (u.user_metadata && (u.user_metadata as any).name) ||
          u.user_metadata?.full_name ||
          u.email?.split("@")[0] ||
          null;
        const appMeta = (u.app_metadata ?? {}) as Record<string, unknown>;
        const supabaseRole = appMeta["role"] === "admin" ? "admin" : undefined;

        await db.upsertUser({
          openId: u.id,
          name,
          email: u.email ?? null,
          loginMethod: "supabase",
          lastSignedIn: new Date(),
          ...(supabaseRole ? { role: supabaseRole } : {}),
        });
        const found = await db.getUserByOpenId(u.id);
        if (found) {
          user = found;
        }
      }
    } catch {
      // ignore and fall back to Manus
    }
  }

  // 2) Fallback to Manus session cookie auth
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      user = null; // public procedures remain accessible
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    supabase,
  };
}
