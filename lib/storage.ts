/**
 * Get a session value from localStorage (SSR safe)
 * @param key
 * @returns parsed value or undefined
 *
 * Example:
 *   saveSession('foo', {a:1});
 *   getSession('foo'); // {a:1}
 */
export function getSession<T = any>(key: string): T | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/**
 * Save a session value to localStorage (SSR safe)
 * @param key
 * @param value
 *
 * Example:
 *   saveSession('foo', {a:1});
 */
export function saveSession(key: string, value: any) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Remove a session value from localStorage (SSR safe)
 * @param key
 *
 * Example:
 *   removeSession('foo');
 */
export function removeSession(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}
