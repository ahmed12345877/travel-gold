import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";

const env = import.meta.env as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? `${env.VITE_FIREBASE_PROJECT_ID ?? ""}.firebaseapp.com`,
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? `${env.VITE_FIREBASE_PROJECT_ID ?? ""}.appspot.com`,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: env.VITE_FIREBASE_APP_ID ?? "",
};

function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) return null;
  if (getApps().length) return getApps()[0];
  return initializeApp(firebaseConfig);
}

export const isFirebaseConfigured = Boolean(env.VITE_FIREBASE_API_KEY);

// Resolve the backend base URL: use VITE_API_URL in production, or same origin in dev
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

export async function firebaseGoogleLogin(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured. Set VITE_FIREBASE_API_KEY.");

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const credential: UserCredential = await signInWithPopup(auth, provider);
  const idToken = await credential.user.getIdToken();
  await callAuthEndpoint("/api/auth/google", idToken);
}

export async function firebaseSignOut(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;
  const auth = getAuth(app);
  await auth.signOut().catch(() => {});
}
