import type { CookieOptions, Request as ExpressRequest } from "express";
import type { IncomingMessage } from "http";

type MinimalReq = Pick<ExpressRequest, "protocol" | "headers"> | IncomingMessage;

function isSecureRequest(req: MinimalReq) {
  // Express provides req.protocol
  if ("protocol" in req && (req as ExpressRequest).protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: MinimalReq
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // SameSite=None requires Secure=true; fall back to Lax on plain HTTP (local dev)
    sameSite: secure ? "none" : "lax",
    secure,
  };
}
