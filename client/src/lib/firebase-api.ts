import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";

const env = import.meta.env as Record<string, string | undefined>;

// إعدادات Firebase الكاملة من Firebase Console
// يدعم النطاق المخصص (vanirgroup.com) لتجنب مشاكل ملفات تعريف الارتباط التابعة لجهات خارجية
// مع fallback آمن للنطاق الافتراضي من Firebase في بيئات التطوير
const projectId = env.VITE_FIREBASE_PROJECT_ID ?? "gen-lang-client-0364375301";
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "",
  // استخدم النطاق المخصص إذا كان محدداً، وإلا استخدم النطاق الافتراضي من Firebase
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "gen-lang-client-0364375301.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "1001729880037",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:1001729880037:web:0cf4200a2a48e96547090c",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-5ETHDXPS4L",
};

function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) return null;
  if (getApps().length) return getApps()[0];
  
  const app = initializeApp(firebaseConfig);
  
  // تهيئة Google Analytics إذا كان measurementId متوفراً
  if (firebaseConfig.measurementId) {
    getAnalytics(app);
  }
  
  return app;
}

export const isFirebaseConfigured = Boolean(env.VITE_FIREBASE_API_KEY);

function apiBase(): string {
  return (env.VITE_API_URL ?? "").replace(/\/$/, "");
}

async function callAuthEndpoint(path: string, idToken: string): Promise<void> {
  const url = `${apiBase()}${path}`;
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
}

export async function firebaseEmailLogin(email: string, password: string): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured. Set VITE_FIREBASE_API_KEY.");

  const auth = getAuth(app);
  const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  await callAuthEndpoint("/api/auth/login", idToken);
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
  await callAuthEndpoint("/api/auth/login", idToken);
}

export async function firebaseGoogleLogin(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured. Set VITE_FIREBASE_API_KEY.");

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const credential: UserCredential = await signInWithPopup(auth, provider);
  const idToken = await credential.user.getIdToken();
  await callAuthEndpoint("/api/auth/login", idToken);
}

export async function firebaseSignOut(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;
  const auth = getAuth(app);
  await auth.signOut().catch(() => {});
}
