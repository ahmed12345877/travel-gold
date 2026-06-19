/**
 * Safe error message formatter for user-facing errors.
 * Handles various error shapes (tRPC, network, validation).
 * Never exposes raw implementation details to users.
 */

interface TRPCError {
  data?: {
    zodError?: Record<string, string[]>;
    code?: string;
  };
  message?: string;
}

/**
 * Extract user-facing error message from a tRPC / network error.
 *
 * The previous code had separate `getGalleryErrorMessage` and
 * `getDestinationErrorMessage` that differed only in their fallback
 * string. This unified version accepts a `context` label instead.
 */
export function getEntityErrorMessage(
  error: unknown,
  context: string = "العملية",
): string {
  const err = error as TRPCError;

  if (err?.data?.zodError) {
    const issues = Object.values(
      err.data.zodError as Record<string, string[]>,
    ).flat();
    if (issues.length > 0) {
      return `خطأ في البيانات: ${issues[0]}`;
    }
  }

  if (err?.data?.code === "UNAUTHORIZED") {
    return "ليس لديك صلاحية للقيام بهذه العملية";
  }

  if (err?.data?.code === "NOT_FOUND") {
    return `لم يتم العثور على ${context}`;
  }

  if (err?.data?.code === "CONFLICT") {
    return `حدث تضارب - قد يكون ${context} موجود بالفعل`;
  }

  if (typeof err?.message === "string" && err.message.trim().length > 0) {
    if (err.message.includes("at ") || err.message.includes("stack")) {
      return `حدث خطأ غير متوقع أثناء ${context}`;
    }
    if (err.message.startsWith("خ") || err.message.startsWith("ت")) {
      return err.message;
    }
  }

  return `تعذر ${context} حالياً. حاول مرة أخرى لاحقاً.`;
}

/** @deprecated Use {@link getEntityErrorMessage} with context="تحميل المعرض" */
export function getGalleryErrorMessage(error: unknown): string {
  return getEntityErrorMessage(error, "تحميل المعرض");
}

/** @deprecated Use {@link getEntityErrorMessage} with context="حفظ الوجهة" */
export function getDestinationErrorMessage(error: unknown): string {
  return getEntityErrorMessage(error, "حفظ الوجهة");
}

/**
 * Generic error formatter for any API error.
 * Falls back to safe default message.
 */
export function getSafeErrorMessage(
  error: unknown,
  fallback: string = "حدث خطأ غير متوقع",
): string {
  if (typeof error === "string") {
    return error.length > 0 ? error : fallback;
  }

  const err = error as TRPCError;
  if (typeof err?.message === "string" && err.message.trim().length > 0) {
    if (!err.message.includes("at ") && !err.message.includes("stack")) {
      return err.message;
    }
  }

  return fallback;
}
