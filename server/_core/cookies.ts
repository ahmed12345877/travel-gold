import type { IncomingMessage } from "http";

// Inline cookie options type to avoid express type dependency issues
interface SessionCookieOptions {
  httpOnly: boolean;
  path: string;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
}

// Minimal request type that works with both Express and raw node-http
interface MinimalReq {
  headers: Record<string, string | string[] | undefined>;
  protocol?: string;
}

function isSecureRequest(req: MinimalReq) {
  // Express provides req.protocol
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: MinimalReq): SessionCookieOptions {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // SameSite=None requires Secure=true; fall back to Lax on plain HTTP (local dev)
    sameSite: secure ? "none" : "lax",
    secure,
  };
}
