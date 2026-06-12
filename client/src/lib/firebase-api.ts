import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  type UserCredential,
} from "firebase/auth";

const env = import.meta.env as Record<string, string | undefined>;

// إعدادات Firebase الكاملة من Firebase Console
// استخدم النطاق الافتراضي من Firebase (جاهز للاستخدام)
const projectId = env.VITE_FIREBASE_PROJECT_ID ?? "gen-lang-client-0364375301";
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "",
  // النطاق الافتراضي من Firebase - معروف وموثوق
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "gen-lang-client-0364375301.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "1001729880037",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:1001729880037:web:0cf4200a2a48e96547090c",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-5ETHDXPS4L",
};

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) return null;
  if (getApps().length) return getApps()[0];

  const app = initializeApp(firebaseConfig);

  // تهيئة Google Analytics إذا كان measurementId متوفراً
  if (firebaseConfig.measurementId) {
    try {
      getAnalytics(app);
    } catch {
      // Analytics غير مدعوم في بعض البيئات (SSR / المتصفحات القديمة)
    }
  }

  return app;
}

// إرجاع نسخة Auth المرتبطة بالتطبيق الأساسي بعد التأكد من تهيئته.
// هذه الدالة آمنة للاستدعاء في أي وقت لأنها تهيّئ Firebase أولاً إن لزم.
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getAuth(app);
}

// تهيئة Firebase فوراً عند تحميل التطبيق حتى يكون التطبيق الأساسي '[DEFAULT]'
// جاهزاً قبل أي استدعاء لـ getAuth() من tRPC أو غيره.
getFirebaseApp();

export const isFirebaseConfigured = Boolean(env.VITE_FIREBASE_API_KEY);

function apiBase(): string {
  const apiUrl = env.VITE_API_URL ?? "";
  if (apiUrl) return apiUrl.replace(/\/$/, "");
  
  // Fallback: use relative path to same domain (supports dev and production)
  // In dev: http://localhost:5000, in prod: https://vanirgroup.com
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  return "";
}

async function callAuthEndpoint(path: string, idToken: string): Promise<void> {
  const url = `${apiBase()}${path}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error || `Request failed: ${res.status}`);
    }
  } catch (err: any) {
    console.error("[v0] Auth endpoint error:", { url, error: err?.message });
    throw new Error(
      err?.message?.includes("Failed to fetch")
        ? `Network error: Cannot connect to authentication server. URL: ${url}`
        : err?.message || "Authentication failed"
    );
  }
}

export async function firebaseEmailLogin(email: string, password: string): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured. Set VITE_FIREBASE_API_KEY.");

  const auth = getAuth(app);
  const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  // Use /api/auth/user-login for customer sign-in (email/password)
  await callAuthEndpoint("/api/auth/user-login", idToken);
}

export async function firebaseEmailSignUp(email: string, password: string, name?: string): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured. Set VITE_FIREBASE_API_KEY.");

  const auth = getAuth(app);
  const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }
  const idToken = await credential.user.getIdToken();
  // Use /api/auth/user-login for customer sign-up (email/password)
  await callAuthEndpoint("/api/auth/user-login", idToken);
}

export async function firebaseGoogleLogin(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured. Set VITE_FIREBASE_API_KEY.");

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const credential: UserCredential = await signInWithPopup(auth, provider);
  const idToken = await credential.user.getIdToken();
  // Use /api/auth/user-login for Google sign-in (customers)
  await callAuthEndpoint("/api/auth/user-login", idToken);
}

export async function firebaseSignOut(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;
  const auth = getAuth(app);
  await auth.signOut().catch(() => {});
}
