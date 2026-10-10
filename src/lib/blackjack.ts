import { type Card, hiLo, shoe } from "./cards";

// Pure Blackjack engine. Every action takes a Game and returns a new one, so the
// UI only renders state and schedules the next step. Rules: 6 decks, Blackjack
// pays 3:2, dealer stands on all 17s and peeks for Blackjack, double on any two
// cards, one split per hand (split aces get one card each).

export const DECKS = 6;
const RESHUFFLE_AT = DECKS * 52 * 0.25;

export type Hand = { cards: Card[]; bet: number; doubled: boolean; done: boolean; split: boolean };
export type Seat = { name: string; bot: boolean; hands: Hand[]; active: number };
export type Phase = "bet" | "player" | "bots" | "dealer" | "done";
export type Game = {
  shoe: Card[];
  /** Hi-Lo running count of every face-up card since the last shuffle. */
  running: number;
  seats: Seat[];
  dealer: Card[];
  holeHidden: boolean;
  phase: Phase;
};
export type Outcome = "blackjack" | "win" | "push" | "lose" | "bust";

export function newGame(): Game {
  return { shoe: shoe(DECKS), running: 0, seats: [], dealer: [], holeHidden: true, phase: "bet" };
}

export function value(cards: Card[]) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === "A") {
      aces++;
      total += 11;
    } else total += ["J", "Q", "K"].includes(c.rank) ? 10 : Number(c.rank);
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

const cardValue = (c: Card) => value([c]).total;
export const isBlackjack = (h: Hand) =>
  h.cards.length === 2 && !h.split && value(h.cards).total === 21;
export const canDouble = (h: Hand) => h.cards.length === 2 && !h.done;
export const canSplit = (s: Seat, h: Hand) =>
  s.hands.length === 1 && h.cards.length === 2 && cardValue(h.cards[0]!) === cardValue(h.cards[1]!);

export function trueCount(g: Game) {
  return g.running / Math.max(g.shoe.length / 52, 0.5);
}

function draw(g: Game, faceUp = true): Card {
  if (g.shoe.length === 0) {
    g.shoe = shoe(DECKS);
    g.running = 0;
  }
  const c = g.shoe.pop()!;
  if (faceUp) g.running += hiLo(c.rank);
  return c;
}

const clone = (g: Game): Game => structuredClone(g);
const hand = (bet: number): Hand => ({ cards: [], bet, doubled: false, done: false, split: false });
const BOT_BETS = [50, 100, 200, 500];

export function deal(prev: Game, bet: number, bots: number): Game {
  const g = clone(prev);
  if (g.shoe.length < RESHUFFLE_AT) {
    g.shoe = shoe(DECKS);
    g.running = 0;
  }
  g.seats = [
    { name: "Tú", bot: false, hands: [hand(bet)], active: 0 },
    ...Array.from({ length: bots }, (_, i) => ({
      name: `Bot ${i + 1}`,
      bot: true,
      hands: [hand(BOT_BETS[(Math.random() * BOT_BETS.length) | 0]!)],
      active: 0,
    })),
  ];
  g.dealer = [];
  g.holeHidden = true;
  for (let round = 0; round < 2; round++) {
    for (const s of g.seats) s.hands[0]!.cards.push(draw(g));
    g.dealer.push(draw(g, round === 0));
  }
  for (const s of g.seats) if (isBlackjack(s.hands[0]!)) s.hands[0]!.done = true;

  // Dealer peeks when showing an Ace or a ten.
  if (cardValue(g.dealer[0]!) >= 10 && value(g.dealer).total === 21) return reveal(g, "done");
  g.phase = g.seats[0]!.hands[0]!.done ? "bots" : "player";
  return g;
}

function reveal(g: Game, phase: Phase): Game {
  if (g.holeHidden) {
    g.holeHidden = false;
    g.running += hiLo(g.dealer[1]!.rank);
  }
  g.phase = phase;
  return g;
}

function finish(g: Game, s: Seat) {
  s.hands[s.active]!.done = true;
  const next = s.hands.findIndex((h) => !h.done);
  if (next >= 0) s.active = next;
  else if (!s.bot) g.phase = "bots";
}

/** Player actions on seat 0. */
export function act(prev: Game, action: "hit" | "stand" | "double" | "split"): Game {
  const g = clone(prev);
  const s = g.seats[0]!;
  const h = s.hands[s.active]!;
  if (g.phase !== "player" || h.done) return prev;
  apply(g, s, h, action);
  return g;
}

function apply(g: Game, s: Seat, h: Hand, action: "hit" | "stand" | "double" | "split") {
  if (action === "hit") {
    h.cards.push(draw(g));
    if (value(h.cards).total >= 21) finish(g, s);
  } else if (action === "stand") finish(g, s);
  else if (action === "double") {
    h.bet *= 2;
    h.doubled = true;
    h.cards.push(draw(g));
    finish(g, s);
  } else if (action === "split" && canSplit(s, h)) {
    const second: Hand = { ...hand(h.bet), split: true, cards: [h.cards.pop()!] };
    h.split = true;
    const aces = h.cards[0]!.rank === "A";
    for (const x of [h, second]) {
      x.cards.push(draw(g));
      if (aces || value(x.cards).total === 21) x.done = true;
    }
    s.hands.push(second);
    if (h.done) finish(g, s);
  }
}

/** Simplified basic strategy for bots. */
function botMove(h: Hand, up: Card): "hit" | "stand" | "double" {
  const { total, soft } = value(h.cards);
  const u = cardValue(up);
  if (total >= 21) return "stand";
  if (soft) return total >= 19 || (total === 18 && u <= 8) ? "stand" : "hit";
  if (h.cards.length === 2 && (total === 11 || (total === 10 && u <= 9))) return "double";
  if (total >= 17) return "stand";
  if (total >= 13) return u <= 6 ? "stand" : "hit";
  if (total === 12) return u >= 4 && u <= 6 ? "stand" : "hit";
  return "hit";
}

/** One bot action, or move on to the dealer when every bot is done. */
export function stepBots(prev: Game): Game {
  const g = clone(prev);
  const s = g.seats.find((x) => x.bot && x.hands.some((h) => !h.done));
  if (!s) return reveal(g, "dealer");
  const h = s.hands[s.active]!;
  apply(g, s, h, botMove(h, g.dealer[0]!));
  return g;
}

/** One dealer card, or finish the round. */
export function stepDealer(prev: Game): Game {
  const g = clone(prev);
  const live = g.seats.some((s) =>
    s.hands.some((h) => value(h.cards).total <= 21 && !isBlackjack(h)),
  );
  if (live && value(g.dealer).total < 17) g.dealer.push(draw(g));
  else g.phase = "done";
  return g;
}

export function outcome(h: Hand, dealer: Card[]): Outcome {
  const p = value(h.cards).total;
  const d = value(dealer).total;
  const dealerBJ = dealer.length === 2 && d === 21;
  if (p > 21) return "bust";
  if (isBlackjack(h)) return dealerBJ ? "push" : "blackjack";
  if (dealerBJ) return "lose";
  if (d > 21 || p > d) return "win";
  return p === d ? "push" : "lose";
}

/** Chips returned to the player for a hand (the bet was already taken). */
export function payout(h: Hand, dealer: Card[]): number {
  const o = outcome(h, dealer);
  return o === "blackjack" ? h.bet * 2.5 : o === "win" ? h.bet * 2 : o === "push" ? h.bet : 0;
}
