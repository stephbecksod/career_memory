/**
 * Parse a date-only string (e.g. "2026-02-27") as local time.
 *
 * new Date("2026-02-27") parses as UTC midnight, which displays as the
 * previous day in western timezones. Appending T12:00:00 forces local-time
 * parsing at noon, keeping the date correct in any timezone.
 *
 * Full timestamps (e.g. "2026-02-27T15:30:00Z") are passed through as-is.
 */
export function parseLocalDate(dateStr: string): Date {
  // Date-only strings are exactly 10 chars: "YYYY-MM-DD"
  if (dateStr.length === 10) {
    return new Date(`${dateStr}T12:00:00`);
  }
  return new Date(dateStr);
}

/**
 * Get today's date as a YYYY-MM-DD string in local time.
 * Avoids the toISOString() UTC conversion bug.
 */
export function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
