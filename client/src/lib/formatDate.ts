/**
 * Shared date formatting utilities.
 *
 * BlogAdmin and OffersAdmin each had their own `formatDate` implementations.
 * This module provides a single, consistent formatter.
 */

/**
 * Format a date value (string, number, or Date) for display.
 * Returns `"-"` for falsy / invalid values.
 */
export function formatDate(
  dateValue: string | number | Date | null | undefined,
  locale: string = "ar-EG",
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateValue) return "-";
  try {
    const date =
      dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(
      locale,
      options ?? { year: "numeric", month: "short", day: "numeric" },
    );
  } catch {
    return "-";
  }
}
