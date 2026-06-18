/**
 * Safe error message formatter for user-facing errors
 * Handles various error shapes (tRPC, network, validation)
 * Never exposes raw implementation details to users
 */

interface TRPCError {
  data?: {
    zodError?: Record<string, string[]>;
    code?: string;
  };
  message?: string;
}

/**
 * Formats gallery-specific errors into safe user messages
 * Handles: Zod validation, network errors, permission errors, etc.
 */
export function getGalleryErrorMessage(error: unknown): string {
  const err = error as TRPCError;

  // Handle Zod validation errors
  if (err?.data?.zodError) {
    const issues = Object.values(err.data.zodError as Record<string, string[]>).flat();
    if (issues.length > 0) {
      return `خطأ في البيانات: ${issues[0]}`;
    }
  }

  // Handle tRPC-specific codes
  if (err?.data?.code === "UNAUTHORIZED") {
    return "ليس لديك صلاحية للقيام بهذه العملية";
  }

  if (err?.data?.code === "NOT_FOUND") {
    return "لم يتم العثور على الصورة المطلوبة";
  }

  if (err?.data?.code === "CONFLICT") {
    return "حدث تضارب - قد تكون الصورة موجودة بالفعل";
  }

  // Handle generic message if available and safe
  if (typeof err?.message === "string" && err.message.trim().length > 0) {
    // Don't expose raw stack traces or internal details
    if (err.message.includes("at ") || err.message.includes("stack")) {
      return "حدث خطأ غير متوقع أثناء تحميل المعرض";
    }
    // For user-friendly messages, pass through
    if (err.message.startsWith("خ") || err.message.startsWith("ت")) {
      return err.message;
    }
  }

  // Fallback generic message
  return "تعذر تحميل المعرض حالياً. حاول مرة أخرى لاحقاً.";
}

/**
 * Formats destination-specific errors
 */
export function getDestinationErrorMessage(error: unknown): string {
  const err = error as TRPCError;

  if (err?.data?.zodError) {
    const issues = Object.values(err.data.zodError as Record<string, string[]>).flat();
    if (issues.length > 0) {
      return `خطأ في البيانات: ${issues[0]}`;
    }
  }

  if (err?.data?.code === "UNAUTHORIZED") {
    return "ليس لديك صلاحية لإنشاء وجهة";
  }

  return "فشل حفظ الوجهة. حاول مرة أخرى.";
}

/**
 * Generic error formatter for any API error
 * Falls back to safe default message
 */
export function getSafeErrorMessage(
  error: unknown,
  fallback: string = "حدث خطأ غير متوقع"
): string {
  if (typeof error === "string") {
    return error.length > 0 ? error : fallback;
  }

  const err = error as TRPCError;
  if (typeof err?.message === "string" && err.message.trim().length > 0) {
    // Sanitize message - don't expose implementation details
    if (!err.message.includes("at ") && !err.message.includes("stack")) {
      return err.message;
    }
  }

  return fallback;
}
