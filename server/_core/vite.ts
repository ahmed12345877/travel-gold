import express from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
// Vite and its config are only needed in development. To avoid bundling
// them into the production server build (and breaking CJS), load them
// dynamically inside `setupVite`.

// Resolve current directory in both ESM (dev via tsx) and CJS (prod bundle)
const DIRNAME = typeof __dirname !== "undefined"
  ? __dirname
  // eslint-disable-next-line no-undef
  : new URL('.', import.meta.url).pathname;

export async function setupVite(app: import("express").Application, server: Server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await import("../../vite.config")).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req: any, res: any, next: (err?: unknown) => void) => {
    const url = req.originalUrl as string;

    try {
      const clientTemplate = path.resolve(DIRNAME, "../..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: import("express").Application) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(DIRNAME, "../..", "dist", "public")
      : path.resolve(DIRNAME, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // خدمة الملفات الثابتة مع إعدادات كاش ذكية
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          // ملفات assets ذات البصمة (hash): تخزين طويل الأمد
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  app.use("*", (_req: any, res: any) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
