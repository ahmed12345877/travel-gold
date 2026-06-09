import type { Express, Request, Response } from "express";
import admin from "firebase-admin";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import * as db from "./db";

// Ensure Firebase Admin is initialized before this module is used
import "./_core/firebaseAdmin";

async function resolveAdminUser(uid: string, email: string | undefined, displayName: string | undefined) {
  const openId = `firebase:${uid}`;

  await db.upsertUser({
    openId,
    name: displayName || email?.split("@")[0] || null,
    email: email ?? null,
    loginMethod: "firebase",
    lastSignedIn: new Date(),
  });

  const user = await db.getUserByOpenId(openId);
  if (!user || user.role !== "admin") {
    throw new Error("Admin access denied");
  }
  return user;
}

async function issueSession(req: Request, res: Response, uid: string, email: string | undefined, displayName: string | undefined) {
  const user = await resolveAdminUser(uid, email, displayName);
  const openId = user.openId;

  const sessionToken = await sdk.createSessionToken(openId, {
    name: user.name || "Admin",
    expiresInMs: ONE_YEAR_MS,
  });

  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS,
  });

  return { success: true, email: user.email, name: user.name };
}

export function registerFirebaseAuthRoutes(app: Express) {
  // POST /api/auth/login — verify Firebase ID token from email/password sign-in
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      const decoded = await admin.auth().verifyIdToken(idToken);
      const result = await issueSession(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err: any) {
      const msg = err?.message || "Authentication failed";
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });

  // POST /api/auth/google — verify Google ID token obtained via Firebase Google Sign-In
  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      const decoded = await admin.auth().verifyIdToken(idToken);
      const result = await issueSession(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err: any) {
      const msg = err?.message || "Google authentication failed";
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });
}
