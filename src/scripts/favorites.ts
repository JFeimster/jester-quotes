const STORAGE_KEY = 'jester-quotes:favorites:v1';
export function readFavorites(): Set<string> {
  try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); return new Set(Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : []); }
  catch { return new Set(); }
}
export function saveFavorites(values: Set<string>): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...values])); }
  catch { /* Storage may be disabled; functionality remains in the current page. */ }
}
