import { useSyncExternalStore } from "react";

// Tiny reactive wrapper over localStorage. Every hook reading the same key stays in
// sync (same tab via emit, other tabs via the "storage" event).
// Returns undefined on the server and during hydration, so callers can avoid
// rendering the wrong state before the browser value is known.

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode or storage full: keep working in memory only.
  }
  listeners.forEach((l) => l());
}

export function useLocal(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readLocal(key),
    () => undefined,
  );
}
