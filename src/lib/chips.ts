import { useLocal, writeLocal } from "./storage";

// Fictitious chips only: no purchase, no cash-out.

export const START_CHIPS = 10_000;
const KEY = "cuentacartas-chips";

/** undefined = loading, null = never received the welcome bonus. */
export function useChips(): number | null | undefined {
  const raw = useLocal(KEY);
  return raw === undefined ? undefined : raw === null ? null : Number(raw) || 0;
}

export function setChips(n: number) {
  writeLocal(KEY, String(Math.max(0, Math.round(n))));
}

export const fmt = (n: number) => n.toLocaleString("es-MX");
