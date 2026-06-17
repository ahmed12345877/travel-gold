import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import cors from 'cors';
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerDownloadProxy } from "../downloadProxy";
import { registerFirebaseAuthRoutes } from "../authExpressRouter";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const DIRNAME = typeof __dirname !== "undefined"
  ? __dirname
  : new URL('.', import.meta.url).pathname;

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Build a minimal Express app with only the tRPC + proxy routes.
 * Safe to call in Vercel Serverless — never calls listen() or imports Vite.
 */
export function createApp() {
  const app = express();
  
  console.log("[Server] Initializing Express app...");
  console.log("[Server] NODE_ENV:", process.env.NODE_ENV);
  console.log("[Server] SUPABASE_STORAGE_BUCKET:", process.env.SUPABASE_STORAGE_BUCKET ? "configured" : "NOT configured");
  
  // Enable CORS for all origins in development, restrict in production.
  // In production, CORS_ORIGINS (comma-separated) overrides the default allowlist
  // so Render-hosted frontends can be added without a code change.
  let allowedOrigins: string[] | boolean;
  if (process.env.NODE_ENV === 'production') {
    const extra = (process.env.CORS_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    allowedOrigins = [
      'https://vanirgroup.com',
      'https://www.vanirgroup.com',
      ...extra,
    ];
  } else {
    allowedOrigins = true; // allow all in development
  }

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));

  // Allow Firebase Google Sign-In popup to communicate back.
  // COOP: same-origin blocks popup.closed checks which Firebase signInWithPopup depends on.
  app.use((_req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Serve locally-uploaded files (fallback when Supabase is not configured)
  app.use("/uploads", express.static(path.resolve(DIRNAME, "..", "public", "uploads")));
  
  console.log("[Server] Registering routes...");
  registerStorageProxy(app);
  console.log("[Server] ✓ /api/storage/* route registered");
  
  registerDownloadProxy(app);
  console.log("[Server] ✓ Download proxy registered");
  
  registerOAuthRoutes(app);
  console.log("[Server] ✓ OAuth routes registered");
  
  registerFirebaseAuthRoutes(app);
  console.log("[Server] ✓ Firebase auth routes registered");
  
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  console.log("[Server] ✓ tRPC middleware registered at /api/trpc");
  
  // Health check and diagnostics endpoint
  app.get("/api/health", (req, res) => {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL === "1" ? "yes" : "no",
        supabaseConfigured: Boolean(process.env.SUPABASE_STORAGE_BUCKET),
        firebaseConfigured: Boolean(process.env.VITE_FIREBASE_PROJECT_ID),
      },
      routes: {
        trpc: "/api/trpc",
        storage: "/api/storage/*",
        auth: "/api/auth/*",
        oauth: "/api/oauth/*",
      },
    };
    res.json(health);
  });
  
  console.log("[Server] ✓ Health check endpoint registered at /api/health");
  
  return app;
}

export async function startServer() {
  console.log("[Server] Starting server initialization...");
  const app = createApp();
  const server = createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  if (process.env.VERCEL !== "1") {
    const preferredPort = parseInt(process.env.PORT || "3000");
    const port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`[Server] Port ${preferredPort} is busy, using port ${port} instead`);
    }
    server.listen(port, () => {
      console.log(`[Server] ✓ Server running on http://localhost:${port}/`);
      console.log(`[Server] ✓ tRPC API available at http://localhost:${port}/api/trpc`);
      console.log(`[Server] ✓ Storage proxy available at http://localhost:${port}/api/storage/*`);
    });
  } else {
    console.log("[Server] Running on Vercel (no listen call)");
  }

  return app;
}

startServer().catch(console.error);
