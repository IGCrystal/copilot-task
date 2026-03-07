/**
 * Mock: Session storage helpers.
 */

export function getSessionStorageValue(key: string): number | null {
  try {
    const val = sessionStorage.getItem(key);
    return val ? Number(val) : null;
  } catch {
    return null;
  }
}

export function setSessionStorageValue(key: string, value: number): void {
  try {
    sessionStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

export function clearSessionStorageValue(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}
