import type { Express, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { db as firestoreDb } from "./_core/firebaseAdmin";

// Ensure Firebase Admin is initialized before this module is used
import "./_core/firebaseAdmin";

async function resolveAdminUser(uid: string, email: string | undefined, displayName: string | undefined) {
  // ADMIN_EMAILS: comma-separated list of emails that are granted admin role on first login.
  // Set this env var in apphosting.yaml (or locally in .env) to bootstrap the first admin
  // without needing to manually edit Firestore.
  const bootstrapEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isBootstrapAdmin = Boolean(email && bootstrapEmails.includes(email.toLowerCase()));

  console.log("[v0] resolveAdminUser:", {
    uid,
    email,
    displayName,
    bootstrapEmails: bootstrapEmails.slice(0, 1).map(e => e.substring(0, 3) + '***'),
    isBootstrapAdmin,
  });

  const baseData: Record<string, unknown> = {
    uid,
    email: email ?? null,
    name: displayName || email?.split("@")[0] || null,
    loginMethod: "firebase",
    lastSignedIn: new Date(),
  };

  // Auto-grant admin role when email is in ADMIN_EMAILS (will not downgrade an existing role).
  if (isBootstrapAdmin) {
    baseData.role = "admin";
    console.log("[v0] Bootstrap admin detected, setting role to admin");
  }

  await firestoreDb.collection("users").doc(uid).set(baseData, { merge: true });

  const userDoc = await firestoreDb.collection("users").doc(uid).get();
  const userData = userDoc.data();

  console.log("[v0] Admin user resolved:", { uid, role: userData?.role, email });

  if (!userData || userData.role !== "admin") {
    console.error("[v0] Access denied - user not admin. Role:", userData?.role);
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

export function registerFirebaseAuthRoutes(app: Express) {
  // GET /api/auth/me — lightweight session check used by client to poll for cookie readiness
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (user) {
        return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
      }
      return res.status(401).json({ error: "Not authenticated" });
    } catch {
      return res.status(401).json({ error: "Not authenticated" });
    }
  });

  // POST /api/auth/login — verify Firebase ID token from email/password sign-in (ADMIN ONLY)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        console.log("[v0] /api/auth/login: Missing idToken");
        return res.status(400).json({ error: "idToken is required" });
      }

      console.log("[v0] /api/auth/login: Verifying admin ID token");
      // checkRevoked=true rejects tokens that have been revoked (e.g. after sign-out on another device).
      const decoded = await getAuth().verifyIdToken(idToken, true);
      console.log("[v0] /api/auth/login: Token verified for email:", decoded.email);
      const result = await issueSessionForAdmin(req, res, decoded.uid, decoded.email, decoded.name);
      console.log("[v0] /api/auth/login: Admin session issued successfully");
      return res.json(result);
    } catch (err: any) {
      if (err?.code === "auth/id-token-revoked") {
        console.error("[v0] /api/auth/login: Token revoked");
        return res.status(401).json({ error: "Session revoked. Please sign in again." });
      }
      const msg = err?.message || "Authentication failed";
      console.error("[v0] /api/auth/login: Error:", msg);
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

  // POST /api/auth/admin-google — Google Sign-In restricted to admin users
  // checkRevoked=true rejects tokens that have been revoked (e.g. after sign-out on another device).
  app.post("/api/auth/admin-google", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      const decoded = await getAuth().verifyIdToken(idToken, true);
      const result = await issueSessionForAdmin(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err: any) {
      if (err?.code === "auth/id-token-revoked") {
        return res.status(401).json({ error: "Session revoked. Please sign in again." });
      }
      const msg = err?.message || "Google authentication failed";
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });
}
