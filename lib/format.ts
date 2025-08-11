/**
 * Format a date string to a locale-aware readable string.
 * @param dateStr ISO date string
 * @returns Formatted date string
 *
 * Example:
 *   formatDate('2024-06-01T12:00:00Z')
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date);
}

/**
 * Check if a date string is recent (within 24 hours).
 * @param dateStr ISO date string
 * @returns true if recent
 *
 * Example:
 *   isRecent(new Date().toISOString()) // true
 */
export function isRecent(dateStr: string): boolean {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  return now - then < 24 * 60 * 60 * 1000;
}
