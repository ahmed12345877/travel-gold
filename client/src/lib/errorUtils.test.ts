import { describe, it, expect } from "vitest";
import {
  getGalleryErrorMessage,
  getDestinationErrorMessage,
  getSafeErrorMessage,
} from "./errorUtils";

describe("getGalleryErrorMessage", () => {
  it("returns zod validation message when zodError present", () => {
    const err = { data: { zodError: { field: ["Name is required"] } } };
    expect(getGalleryErrorMessage(err)).toContain("Name is required");
  });

  it("returns unauthorized message for UNAUTHORIZED code", () => {
    const err = { data: { code: "UNAUTHORIZED" } };
    expect(getGalleryErrorMessage(err)).toBe("ليس لديك صلاحية للقيام بهذه العملية");
  });

  it("returns not-found message for NOT_FOUND code", () => {
    const err = { data: { code: "NOT_FOUND" } };
    expect(getGalleryErrorMessage(err)).toBe("لم يتم العثور على الصورة المطلوبة");
  });

  it("returns conflict message for CONFLICT code", () => {
    const err = { data: { code: "CONFLICT" } };
    expect(getGalleryErrorMessage(err)).toBe("حدث تضارب - قد تكون الصورة موجودة بالفعل");
  });

  it("sanitizes messages containing stack traces", () => {
    const err = { message: "Error at Object.fn (/some/path.ts:42)" };
    expect(getGalleryErrorMessage(err)).toBe("حدث خطأ غير متوقع أثناء تحميل المعرض");
  });

  it("passes through Arabic user-friendly messages starting with خ", () => {
    const err = { message: "خطأ في الاتصال" };
    expect(getGalleryErrorMessage(err)).toBe("خطأ في الاتصال");
  });

  it("passes through Arabic user-friendly messages starting with ت", () => {
    const err = { message: "تعذر الاتصال" };
    expect(getGalleryErrorMessage(err)).toBe("تعذر الاتصال");
  });

  it("returns fallback for unknown errors", () => {
    expect(getGalleryErrorMessage(null)).toBe("تعذر تحميل المعرض حالياً. حاول مرة أخرى لاحقاً.");
  });

  it("returns fallback for empty error objects", () => {
    expect(getGalleryErrorMessage({})).toBe("تعذر تحميل المعرض حالياً. حاول مرة أخرى لاحقاً.");
  });
});

describe("getDestinationErrorMessage", () => {
  it("returns zod validation message", () => {
    const err = { data: { zodError: { name: ["Required"] } } };
    expect(getDestinationErrorMessage(err)).toContain("Required");
  });

  it("returns unauthorized message for UNAUTHORIZED code", () => {
    const err = { data: { code: "UNAUTHORIZED" } };
    expect(getDestinationErrorMessage(err)).toBe("ليس لديك صلاحية لإنشاء وجهة");
  });

  it("returns generic fallback for other errors", () => {
    expect(getDestinationErrorMessage({})).toBe("فشل حفظ الوجهة. حاول مرة أخرى.");
  });
});

describe("getSafeErrorMessage", () => {
  it("returns string errors directly", () => {
    expect(getSafeErrorMessage("something failed")).toBe("something failed");
  });

  it("returns fallback for empty string", () => {
    expect(getSafeErrorMessage("")).toBe("حدث خطأ غير متوقع");
  });

  it("returns error message when safe", () => {
    const err = { message: "Connection timeout" };
    expect(getSafeErrorMessage(err)).toBe("Connection timeout");
  });

  it("returns fallback when message contains stack trace", () => {
    const err = { message: "Error at Object.fn stack trace" };
    expect(getSafeErrorMessage(err)).toBe("حدث خطأ غير متوقع");
  });

  it("uses custom fallback when provided", () => {
    expect(getSafeErrorMessage(null, "custom fallback")).toBe("custom fallback");
  });

  it("returns default fallback for null", () => {
    expect(getSafeErrorMessage(null)).toBe("حدث خطأ غير متوقع");
  });
});
