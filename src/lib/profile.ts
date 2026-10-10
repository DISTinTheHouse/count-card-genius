import { useMemo } from "react";
import { useLocal, writeLocal } from "./storage";

// Local profile only: there is no backend yet. When real accounts arrive, keep this
// hook's shape and swap the storage for the auth session.

export type Profile = { name: string; guest: boolean };

const KEY = "cuentacartas-profile";

/** undefined = still loading, null = no profile (show welcome). */
export function useProfile(): Profile | null | undefined {
  const raw = useLocal(KEY);
  return useMemo(() => {
    if (raw === undefined) return undefined;
    if (!raw) return null;
    try {
      const p = JSON.parse(raw) as Profile;
      return typeof p.name === "string" ? p : null;
    } catch {
      return null;
    }
  }, [raw]);
}

export function saveProfile(p: Profile | null) {
  writeLocal(KEY, p ? JSON.stringify(p) : null);
}
