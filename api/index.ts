import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server/_core/index";

// Cache the Express app instance across warm invocations
let cachedApp: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!cachedApp) {
    cachedApp = createApp();
  }
  return cachedApp;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const app = getApp();
  return (app as any)(req, res);
}

export const config = {
  api: { bodyParser: false },
};
