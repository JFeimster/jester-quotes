export const FAVORITES_STORAGE_KEY = 'jester-quotes:favorites:v1';

export function readFavorites(): Set<string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]');
    return new Set(
      Array.isArray(value)
        ? value.filter((id): id is string => typeof id === 'string' && id.length > 0)
        : []
    );
  } catch {
    return new Set();
  }
}

export function saveFavorites(values: ReadonlySet<string>): boolean {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...values]));
    return true;
  } catch {
    return false;
  }
}
