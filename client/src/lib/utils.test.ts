import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (className merger)", () => {
  it("merges multiple class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toContain("active");
  });

  it("removes falsy values", () => {
    expect(cn("base", false, null, undefined, "end")).toBe("base end");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });

  it("handles array inputs", () => {
    expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
  });
});
