import type { Request } from "express";

/**
 * Extended Express Request type with additional properties
 */
declare global {
  namespace Express {
    interface Request {
      protocol?: string;
      headers: {
        cookie?: string;
        "x-forwarded-proto"?: string | string[];
        [key: string]: string | string[] | undefined;
      };
      hostname?: string;
      body?: unknown;
    }
  }
}

export type ExtendedRequest = Request;
