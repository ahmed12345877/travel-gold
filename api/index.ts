import type { VercelRequest, VercelResponse } from "@vercel/node";
import { startServer } from '../server/_core/index';

// Cache the app instance across warm invocations
let cachedApp: Awaited<ReturnType<typeof startServer>> | null = null;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await startServer();
  }
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  return (app as any)(req, res);
}

// Ensure Express server runs on Node.js runtime
export const runtime = "nodejs";
