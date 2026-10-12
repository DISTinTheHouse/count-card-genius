import { describe, expect, it } from "vitest";
import type { Card } from "@/lib/cards";
import {
  type Game,
  act,
  deal,
  insurancePayout,
  insure,
  newGame,
  outcome,
  payout,
  stepBots,
  stepDealer,
  strategy,
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
      if (g.phase === "insurance") g = insure(g, false);
      else if (g.phase === "player") g = act(g, "stand");
      else if (g.phase === "bots") g = stepBots(g);
      else if (g.phase === "dealer") g = stepDealer(g);
    }
    expect(g.phase).toBe("done");
    expect(g.holeHidden).toBe(false);
  });

  it("keeps the running count equal to the visible cards", () => {
    let g: Game = deal(newGame(), 100, 2);
    while (g.phase !== "done") {
      g =
        g.phase === "insurance"
          ? insure(g, false)
          : g.phase === "player"
            ? act(g, "stand")
            : g.phase === "bots"
              ? stepBots(g)
              : stepDealer(g);
    }
    const seen = [...g.seats.flatMap((s) => s.hands.flatMap((x) => x.cards)), ...g.dealer];
    const hilo = (r: string) =>
      "23456".includes(r) && r !== "10" ? 1 : "789".includes(r) ? 0 : -1;
    expect(g.running).toBe(seen.reduce((a, x) => a + hilo(x.rank), 0));
  });

  it("follows basic strategy for 6 decks, S17, DAS, late surrender", () => {
    const all = { double: true, split: true, surrender: true };
    const best = (ranks: Card["rank"][], up: Card["rank"], allowed = all) =>
      strategy({ ...h(ranks), done: false }, c(up), allowed);
    expect(best(["10", "6"], "10")).toBe("surrender");
    expect(best(["10", "6"], "10", { ...all, surrender: false })).toBe("hit");
    expect(best(["10", "5"], "9")).toBe("hit");
    expect(best(["10", "2"], "4")).toBe("stand");
    expect(best(["10", "2"], "3")).toBe("hit");
    expect(best(["6", "5"], "10")).toBe("double");
    expect(best(["6", "5"], "A")).toBe("hit");
    expect(best(["A", "7"], "2")).toBe("stand");
    expect(best(["A", "7"], "6")).toBe("double");
    expect(best(["A", "7"], "9")).toBe("hit");
    expect(best(["A", "8"], "6")).toBe("stand");
    expect(best(["8", "8"], "A")).toBe("split");
    expect(best(["9", "9"], "7")).toBe("stand");
    expect(best(["5", "5"], "6")).toBe("double");
    expect(best(["K", "Q"], "6")).toBe("stand");
    expect(best(["A", "A"], "10")).toBe("split");
  });

  it("settles surrender and insurance", () => {
    expect(payout({ ...h(["10", "6"]), surrendered: true }, [c("10"), c("7")])).toBe(50);
    expect(outcome({ ...h(["10", "6"]), surrendered: true }, [c("10"), c("7")])).toBe("surrender");
    const seat = { name: "Tú", bot: false, hands: [h(["10", "9"])], active: 0, insurance: 50 };
    expect(insurancePayout(seat, [c("A"), c("K")])).toBe(150);
    expect(insurancePayout(seat, [c("A"), c("7")])).toBe(0);
  });
});
