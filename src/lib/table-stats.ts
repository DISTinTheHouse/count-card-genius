import { useMemo } from "react";
import { readLocal, useLocal, writeLocal } from "./storage";

// Blackjack table stats for the profile. Every player decision is graded against
// basic strategy (see strategy() in blackjack.ts).

export type TableStats = {
  hands: number;
  won: number;
  blackjacks: number;
  decisions: number;
  correct: number;
  /** Correct decisions in a row, right now and best ever. */
  streak: number;
  bestStreak: number;
  /** Highest chip balance reached. */
  peak: number;
};

const KEY = "cuentacartas-table-stats";
const EMPTY: TableStats = {
  hands: 0,
  won: 0,
  blackjacks: 0,
  decisions: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  peak: 0,
};

function parse(raw: string | null | undefined): TableStats {
  try {
    return { ...EMPTY, ...(JSON.parse(raw || "") as Partial<TableStats>) };
  } catch {
    return EMPTY;
  }
}

export function useTableStats(): TableStats {
  const raw = useLocal(KEY);
  return useMemo(() => parse(raw), [raw]);
}

function update(fn: (s: TableStats) => TableStats) {
  writeLocal(KEY, JSON.stringify(fn(parse(readLocal(KEY)))));
}

export function recordDecision(ok: boolean) {
  update((s) => {
    const streak = ok ? s.streak + 1 : 0;
    return {
      ...s,
      decisions: s.decisions + 1,
      correct: s.correct + (ok ? 1 : 0),
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
    };
  });
}

/** `net` = chips won (or lost, negative) in the round; `balance` = after paying out. */
export function recordHand(net: number, blackjack: boolean, balance: number) {
  update((s) => ({
    ...s,
    hands: s.hands + 1,
    won: s.won + (net > 0 ? 1 : 0),
    blackjacks: s.blackjacks + (blackjack ? 1 : 0),
    peak: Math.max(s.peak, balance),
  }));
}
