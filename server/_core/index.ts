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
  
  // Enable CORS for all origins in development, restrict in production
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://vanirgroup.com', 'https://www.vanirgroup.com']
    : true; // Allow all origins in development
    
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Serve locally-uploaded files (fallback when Supabase is not configured)
  app.use("/uploads", express.static(path.resolve(DIRNAME, "..", "public", "uploads")));
  registerStorageProxy(app);
  registerDownloadProxy(app);
  registerOAuthRoutes(app);
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
    const port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }

  return app;
}

startServer().catch(console.error);
