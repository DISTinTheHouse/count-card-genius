import { useMemo } from "react";
import { readLocal, useLocal, writeLocal } from "./storage";

export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;
export const SUITS = ["♠", "♥", "♦", "♣"] as const;
export type Card = { rank: (typeof RANKS)[number]; suit: (typeof SUITS)[number] };

export function hiLo(rank: string) {
  if (["2", "3", "4", "5", "6"].includes(rank)) return 1;
  if (["7", "8", "9"].includes(rank)) return 0;
  return -1;
}

export function shoe(decks: number): Card[] {
  const out: Card[] = [];
  for (let d = 0; d < decks; d++)
    for (const s of SUITS) for (const r of RANKS) out.push({ rank: r, suit: s });
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

const KEY = "cuentacartas-pro";
/** Demo flag shared by every component; replace with the real subscription check. */
export function usePro() {
  const pro = useLocal(KEY) === "1";
  const set = (v: boolean) => writeLocal(KEY, v ? "1" : "0");
  return [pro, set] as const;
}

const STATS = "cuentacartas-stats";
export type Stats = { rounds: number; correct: number };
export function loadStats(): Stats {
  try {
    return JSON.parse(readLocal(STATS) || "") as Stats;
  } catch {
    return { rounds: 0, correct: 0 };
  }
}
/** Reactive read of the same stats, for display. */
export function useStats(): Stats {
  const raw = useLocal(STATS);
  return useMemo(() => {
    try {
      return JSON.parse(raw || "") as Stats;
    } catch {
      return { rounds: 0, correct: 0 };
    }
  }, [raw]);
}
export function saveStats(s: Stats) {
  writeLocal(STATS, JSON.stringify(s));
}
