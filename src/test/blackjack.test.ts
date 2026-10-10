import { describe, expect, it } from "vitest";
import type { Card } from "@/lib/cards";
import {
  type Game,
  act,
  deal,
  newGame,
  outcome,
  payout,
  stepBots,
  stepDealer,
  value,
} from "@/lib/blackjack";

const c = (rank: Card["rank"]): Card => ({ rank, suit: "♠" });
const h = (ranks: Card["rank"][], bet = 100) => ({
  cards: ranks.map(c),
  bet,
  doubled: false,
  done: true,
  split: false,
});

describe("blackjack", () => {
  it("counts aces as 1 or 11", () => {
    expect(value([c("A"), c("6")])).toEqual({ total: 17, soft: true });
    expect(value([c("A"), c("6"), c("K")])).toEqual({ total: 17, soft: false });
    expect(value([c("A"), c("A"), c("9")]).total).toBe(21);
  });

  it("pays 3:2 on Blackjack and settles pushes and busts", () => {
    expect(payout(h(["A", "K"]), [c("10"), c("9")])).toBe(250);
    expect(payout(h(["A", "K"]), [c("A"), c("Q")])).toBe(100);
    expect(payout(h(["10", "9"]), [c("10"), c("7")])).toBe(200);
    expect(payout(h(["10", "6", "K"]), [c("10"), c("6"), c("K")])).toBe(0);
    expect(outcome(h(["10", "7"]), [c("10"), c("7")])).toBe("push");
  });

  it("plays a full round to the end", () => {
    let g: Game = deal(newGame(), 100, 4);
    expect(g.seats).toHaveLength(5);
    for (let i = 0; i < 200 && g.phase !== "done"; i++) {
      if (g.phase === "player") g = act(g, "stand");
      else if (g.phase === "bots") g = stepBots(g);
      else if (g.phase === "dealer") g = stepDealer(g);
    }
    expect(g.phase).toBe("done");
    expect(g.holeHidden).toBe(false);
  });

  it("keeps the running count equal to the visible cards", () => {
    let g: Game = deal(newGame(), 100, 2);
    while (g.phase !== "done") {
      g = g.phase === "player" ? act(g, "stand") : g.phase === "bots" ? stepBots(g) : stepDealer(g);
    }
    const seen = [...g.seats.flatMap((s) => s.hands.flatMap((x) => x.cards)), ...g.dealer];
    const hilo = (r: string) =>
      "23456".includes(r) && r !== "10" ? 1 : "789".includes(r) ? 0 : -1;
    expect(g.running).toBe(seen.reduce((a, x) => a + hilo(x.rank), 0));
  });
});
