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

/** Compact balance for tight spots: 950, 10K, 12.5K, 1.2M. */
export function short(n: number) {
  const unit = n >= 1e6 ? [1e6, "M"] : n >= 1e3 ? [1e3, "K"] : null;
  if (!unit) return String(n);
  const v = Math.floor((n / (unit[0] as number)) * 10) / 10;
  return `${String(v).replace(/\.0$/, "")}${unit[1]}`;
}
