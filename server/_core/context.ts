import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as db from "../db";
import { db as firestoreDb } from "./firebaseAdmin";
import { ENV } from "./env";

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

  // 1) Verify Firebase ID token from Authorization header.
  // IMPORTANT: Firebase user docs are keyed by the raw uid (users/<uid>) by the
  // auth layer (sdk.ts). We MUST read/write that same document here so the role
  // (e.g. "admin") is read correctly. Using the openId field would target a
  // different doc and silently demote admins to "user".
  const bearer = getBearerToken(opts.req);
  if (bearer) {
    try {
      const decoded = await getAuth().verifyIdToken(bearer);
      const uid = decoded.uid;
      const openId = `firebase:${uid}`;
      const now = new Date();
      const name =
        decoded.name ||
        (decoded.email ? decoded.email.split("@")[0] : null) ||
        null;

      const userRef = firestoreDb.collection("users").doc(uid);
      const snap = await userRef.get();

      if (snap.exists) {
        const data = snap.data()!;
        await userRef.set({ lastSignedIn: now }, { merge: true });
        user = {
          id: (data.id as number) ?? 0,
          openId,
          name: (data.name as string) ?? name,
          email: (data.email as string) ?? decoded.email ?? null,
          phone: null,
          loginMethod: "firebase",
          avatarUrl: (data.avatarUrl as string) ?? null,
          role: ((data.role as string) ?? "user") as User["role"],
          createdAt: now,
          updatedAt: now,
          lastSignedIn: now,
        } as User;
      } else {
        // First time we see this Firebase user — create the doc keyed by uid.
        const role = openId === ENV.ownerOpenId ? "admin" : "user";
        await userRef.set({
          openId,
          name,
          email: decoded.email ?? null,
          loginMethod: "firebase",
          role,
          createdAt: now,
          lastSignedIn: now,
        });
        user = {
          id: 0,
          openId,
          name,
          email: decoded.email ?? null,
          phone: null,
          loginMethod: "firebase",
          avatarUrl: null,
          role: role as User["role"],
          createdAt: now,
          updatedAt: now,
          lastSignedIn: now,
        } as User;
      }
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
