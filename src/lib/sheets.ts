import { useSyncExternalStore } from "react";

// Which global sheet is open. Any component can call openSheet("pro") without
// prop drilling; AppShell renders the sheets.

export type SheetId = "pro" | "profile" | "bonus" | null;

let current: SheetId = null;
const listeners = new Set<() => void>();

export function openSheet(id: SheetId) {
  current = id;
  listeners.forEach((l) => l());
}

export function useSheet(): SheetId {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}
