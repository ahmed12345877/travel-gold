import { describe, it, expect } from "vitest";
import {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "./errors";

describe("HttpError", () => {
  it("stores statusCode and message", () => {
    const err = new HttpError(418, "I'm a teapot");
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe("I'm a teapot");
    expect(err.name).toBe("HttpError");
  });

  it("is an instance of Error", () => {
    const err = new HttpError(500, "boom");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("convenience constructors", () => {
  it("BadRequestError returns 400", () => {
    const err = BadRequestError("bad input");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("bad input");
  });

  it("UnauthorizedError returns 401", () => {
    const err = UnauthorizedError("no token");
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("no token");
  });

  it("ForbiddenError returns 403", () => {
    const err = ForbiddenError("not allowed");
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("not allowed");
  });

  it("NotFoundError returns 404", () => {
    const err = NotFoundError("missing");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("missing");
  });
});
