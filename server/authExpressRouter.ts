import type { Express, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { db as firestoreDb } from "./_core/firebaseAdmin";

// Ensure Firebase Admin is initialized before this module is used
import "./_core/firebaseAdmin";

async function resolveAdminUser(uid: string, email: string | undefined, displayName: string | undefined) {
  // Upsert user into Firestore (merge so existing role/fields are preserved)
  await firestoreDb.collection("users").doc(uid).set(
    {
      uid,
      email: email ?? null,
      name: displayName || email?.split("@")[0] || null,
      loginMethod: "firebase",
      lastSignedIn: new Date(),
    },
    { merge: true }
  );

  const userDoc = await firestoreDb.collection("users").doc(uid).get();
  const userData = userDoc.data();

  if (!userData || userData.role !== "admin") {
    throw new Error("Admin access denied");
  }

  return {
    uid,
    email: email ?? (userData.email as string | null) ?? null,
    name: displayName || (userData.name as string | null) || null,
    role: userData.role as string,
  };
}

async function issueSessionForAdmin(req: Request, res: Response, uid: string, email: string | undefined, displayName: string | undefined) {
  const user = await resolveAdminUser(uid, email, displayName);
  const openId = `firebase:${uid}`;

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

async function issueSessionForUser(req: Request, res: Response, uid: string, email: string | undefined, displayName: string | undefined) {
  // Simple user session - no role restrictions
  const openId = `firebase:${uid}`;

  const sessionToken = await sdk.createSessionToken(openId, {
    name: displayName || email?.split("@")[0] || "User",
    expiresInMs: ONE_YEAR_MS,
  });

  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS,
  });

  // Upsert user into Firestore
  await firestoreDb.collection("users").doc(uid).set(
    {
      uid,
      email: email ?? null,
      name: displayName || email?.split("@")[0] || null,
      loginMethod: "firebase",
      lastSignedIn: new Date(),
    },
    { merge: true }
  );

  return { success: true, email: email || null, name: displayName || null };
}

async function issueSession(req: Request, res: Response, uid: string, email: string | undefined, displayName: string | undefined) {
  const user = await resolveAdminUser(uid, email, displayName);
  const openId = `firebase:${uid}`;

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
  // POST /api/auth/login — verify Firebase ID token from email/password sign-in (ADMIN ONLY)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      const decoded = await getAuth().verifyIdToken(idToken);
      const result = await issueSession(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err: any) {
      const msg = err?.message || "Authentication failed";
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });

  // POST /api/auth/user-login — verify Firebase ID token for regular users (email/password or Google)
  app.post("/api/auth/user-login", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      const decoded = await getAuth().verifyIdToken(idToken);
      const result = await issueSessionForUser(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err: any) {
      const msg = err?.message || "Authentication failed";
      return res.status(401).json({ error: msg });
    }
  });

  // POST /api/auth/google — verify Google ID token obtained via Firebase Google Sign-In
  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      const decoded = await getAuth().verifyIdToken(idToken);
      const result = await issueSession(req, res, decoded.uid, decoded.email, decoded.name);


      return res.json(result);
    } catch (err: any) {
      const msg = err?.message || "Google authentication failed";
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });
}
