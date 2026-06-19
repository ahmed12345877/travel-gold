/**
 * Shared error logging and formatting utilities.
 *
 * Every router was duplicating the same `console.error("[tag] ...", { error: ... })`
 * pattern. This module centralises that logic so callers only need one call.
 */

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function formatErrorDetail(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

/**
 * Log a structured error to stderr.
 *
 * @param tag   e.g. "adminBlog.create"
 * @param kind  "query error" | "mutation error" | "database error" etc.
 * @param error the caught value
 * @param extra arbitrary context merged into the log payload
 */
export function logError(
  tag: string,
  kind: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  console.error(`[${tag}] ${kind}:`, {
    error: formatErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...extra,
  });
}
