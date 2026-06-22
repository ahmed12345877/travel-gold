import express from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { getSEOMetadata, normalizeRoute } from "@shared/seo/seoMatrix";
// Vite and its config are only needed in development. To avoid bundling
// them into the production server build (and breaking CJS), load them
// dynamically inside `setupVite`.

// Resolve current directory in both ESM (dev via tsx) and CJS (prod bundle)
const DIRNAME = typeof __dirname !== "undefined"
  ? __dirname
  // eslint-disable-next-line no-undef
  : new URL('.', import.meta.url).pathname;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectSeoMeta(html: string, rawRoute: string): string {
  const route = normalizeRoute(rawRoute);
  const seo = getSEOMetadata(route);
  if (!seo) return html;

  const title = escapeHtml(seo.metaTitle);
  const description = escapeHtml(seo.metaDescription);
  const canonical = `https://vanirgroup.com${seo.route}`;

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
}

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
      const page = injectSeoMeta(await vite.transformIndexHtml(url, template), url);
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

  const indexPath = path.resolve(distPath, "index.html");
  let cachedIndexTemplate = "";
  try {
    cachedIndexTemplate = fs.readFileSync(indexPath, "utf-8");
  } catch (error) {
    console.error("Failed to read static index.html template:", error);
  }

  app.use("*", (req: any, res: any) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const template = cachedIndexTemplate || fs.readFileSync(indexPath, "utf-8");
    const page = injectSeoMeta(template, req.originalUrl || req.url || "/");
    res.status(200).set({ "Content-Type": "text/html" }).end(page);
  });
}
