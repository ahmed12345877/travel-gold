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
import { registerVideoProxy } from "../videoProxy";
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

  // Lightweight health check for Railway (and other platform) uptime probes.
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
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
  
  registerStorageProxy(app);
  registerDownloadProxy(app);
  registerVideoProxy(app);
  registerOAuthRoutes(app);
  registerFirebaseAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  
  return app;
}

export async function startServer() {
  const app = createApp();
  const server = createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  if (process.env.VERCEL !== "1") {
    const preferredPort = parseInt(process.env.PORT || "3000");
    // In production (Railway, Render, etc.) bind to exactly the assigned PORT.
    // Scanning for an alternative port would break the platform's proxy routing.
    const port = process.env.NODE_ENV === "production"
      ? preferredPort
      : await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${port}/`);
    });
    
    // Graceful shutdown handling to prevent crashes
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  }

  return app;
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
