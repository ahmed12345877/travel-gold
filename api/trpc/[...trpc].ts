import type { IncomingMessage, ServerResponse } from "node:http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from '../../server/routers/index.js';
import { createContext } from "../../server/_core/context.js";
// Initialize Firebase Admin so getAuth() works in createContext
import "../../server/_core/firebaseAdmin.js";

// Cookie options type (inline to avoid express dependency issues)
interface CookieOpts {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  maxAge?: number;
  domain?: string;
  expires?: Date;
}

// Minimal cookie serializer (no external deps)
function serializeCookie(name: string, value: string, options: CookieOpts = {}) {
  const segments: string[] = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) segments.push(`Path=${options.path}`);
  if (options.httpOnly) segments.push("HttpOnly");
  if (options.secure) segments.push("Secure");
  if (options.sameSite) {
    const sm = typeof options.sameSite === "boolean" ? "Strict" : options.sameSite;
    segments.push(`SameSite=${sm}`);
  }
  if (options.maxAge != null) {
    // Express maxAge is ms; Set-Cookie Max-Age is seconds
    const maxAgeMs = Number(options.maxAge);
    segments.push(`Max-Age=${Math.floor(maxAgeMs > 1e9 ? maxAgeMs / 1000 : maxAgeMs)}`);
  }
  if (options.domain) segments.push(`Domain=${options.domain}`);
  if (options.expires instanceof Date) {
    segments.push(`Expires=${options.expires.toUTCString()}`);
  }
  return segments.join("; ");
}

function appendSetCookie(res: ServerResponse, header: string) {
  const current = res.getHeader("Set-Cookie");
  const next = current
    ? Array.isArray(current) ? [...current, header] : [String(current), header]
    : [header];
  res.setHeader("Set-Cookie", next);
}

// --- إضافة دالة لمعالجة CORS ---
function handleCORS(req: IncomingMessage, res: ServerResponse): boolean {
  // نطاق الواجهة الأمامية المصرح له
  const allowedOrigin = "https://www.vanirgroup.com"; // تأكد أن هذا هو نطاق الواجهة الأمامية بالظبط

  const origin = req.headers.origin;
  if (origin && origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // مهم جدا إذا كنت تستخدم الكوكيز أو Authorization headers
  }
  // معالجة طلبات preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204); // No Content
    res.end();
    return true; // تم معالجة طلب CORS preflight، لا داعي للمتابعة
  }
  return false; // ليس طلب CORS preflight أو ليس من نطاق مصرح به، تابع
}
// --- نهاية إضافة دالة لمعالجة CORS ---

export default async function trpcHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    // --- استدعاء دالة CORS في بداية المعالج ---
    if (handleCORS(req, res)) {
      return; // إذا تم معالجة CORS، توقف هنا
    }
    // --- نهاية استدعاء دالة CORS ---

    const resShim = {
      clearCookie(name: string, cookieOptions?: CookieOpts) {
        appendSetCookie(res, serializeCookie(name, "", { ...(cookieOptions ?? {}), maxAge: 0 }));
      },
      cookie(name: string, value: string, cookieOptions?: CookieOpts) {
        appendSetCookie(res, serializeCookie(name, value, cookieOptions ?? {}));
      },
      setHeader(key: string, value: string | string[]) {
        res.setHeader(key, value);
      },
      get headers() { return req.headers; },
      get protocol() {
        const fwd = req.headers["x-forwarded-proto"];
        if (typeof fwd === "string") return fwd.split(",")[0].trim();
        return "http";
      },
    } as any;

    return await nodeHTTPRequestHandler({
      req,
      res,
      path: req.url?.replace("/api/trpc", "") || "",
      router: appRouter,
      createContext: async () => createContext({ req: req as any, res: resShim }),
    });
  } catch (err: unknown) {
    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : "Internal server error";
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: { message, code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } },
      }));
    }
  }
}

// تفعيل الـ Body Parser مع رفع الحد الأقصى لحجم البيانات ليتناسب مع ملفات الرفع الكبيرة
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // رفع الحد لمنع ظهور خطأ الـ JSON وحرف الـ A
    },
    responseLimit: false, // إلغاء قيود حجم الرد البرمجي لتجنب الأخطاء
  },
};

// اترك سطر الـ runtime كما هو لضمان تشغيله ببيئة Node.js المستقرة
export const runtime = "nodejs";
