import { describe, it, expect } from "vitest";
import {
  COOKIE_NAME,
  ONE_YEAR_MS,
  AXIOS_TIMEOUT_MS,
  UNAUTHED_ERR_MSG,
  NOT_ADMIN_ERR_MSG,
} from "./const";

describe("shared constants", () => {
  it("COOKIE_NAME is a non-empty string", () => {
    expect(COOKIE_NAME).toBe("app_session_id");
  });

  it("ONE_YEAR_MS equals 365 days in milliseconds", () => {
    expect(ONE_YEAR_MS).toBe(1000 * 60 * 60 * 24 * 365);
  });

  it("AXIOS_TIMEOUT_MS is 30 seconds", () => {
    expect(AXIOS_TIMEOUT_MS).toBe(30_000);
  });

  it("UNAUTHED_ERR_MSG contains error code", () => {
    expect(UNAUTHED_ERR_MSG).toContain("10001");
  });

  it("NOT_ADMIN_ERR_MSG contains error code", () => {
    expect(NOT_ADMIN_ERR_MSG).toContain("10002");
  });
});
