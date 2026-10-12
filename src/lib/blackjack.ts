import { type Card, hiLo, shoe } from "./cards";

// Pure Blackjack engine. Every action takes a Game and returns a new one, so the
// UI only renders state and schedules the next step. Rules: 6 decks, Blackjack
// pays 3:2, dealer stands on all 17s and peeks for Blackjack, double on any two
// cards (also after a split), one split per hand (split aces get one card each),
// insurance when the dealer shows an Ace, late surrender on the first two cards.

export const DECKS = 6;
const RESHUFFLE_AT = DECKS * 52 * 0.25;

export type Hand = {
  cards: Card[];
  bet: number;
  doubled: boolean;
  done: boolean;
  split: boolean;
  surrendered?: boolean;
};
/** `insurance` = chips staked on insurance (0 = declined). */
export type Seat = {
  name: string;
  bot: boolean;
  hands: Hand[];
  active: number;
  insurance?: number;
};
export type Phase = "bet" | "insurance" | "player" | "bots" | "dealer" | "done";
export type Game = {
  shoe: Card[];
  /** Hi-Lo running count of every face-up card since the last shuffle. */
  running: number;
  seats: Seat[];
  dealer: Card[];
  holeHidden: boolean;
  phase: Phase;
};
export type Outcome = "blackjack" | "win" | "push" | "lose" | "bust" | "surrender";
export type Move = "hit" | "stand" | "double" | "split" | "surrender";

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
export const canSurrender = (s: Seat, h: Hand) =>
  s.hands.length === 1 && h.cards.length === 2 && !h.done;
/** Insurance costs half the bet. */
export const insuranceCost = (g: Game) => Math.floor(g.seats[0]!.hands[0]!.bet / 2);

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

  if (g.dealer[0]!.rank === "A") {
    g.phase = "insurance";
    return g;
  }
  return peek(g);
}

/** Take or decline insurance (the UI already took the chips), then the dealer peeks. */
export function insure(prev: Game, take: boolean): Game {
  if (prev.phase !== "insurance") return prev;
  const g = clone(prev);
  g.seats[0]!.insurance = take ? insuranceCost(g) : 0;
  return peek(g);
}

// Dealer peeks when showing an Ace or a ten.
function peek(g: Game): Game {
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
export function act(prev: Game, action: Move): Game {
  const g = clone(prev);
  const s = g.seats[0]!;
  const h = s.hands[s.active]!;
  if (g.phase !== "player" || h.done) return prev;
  apply(g, s, h, action);
  return g;
}

function apply(g: Game, s: Seat, h: Hand, action: Move) {
  if (action === "surrender") {
    if (!canSurrender(s, h)) return;
    h.surrendered = true;
    finish(g, s);
  } else if (action === "hit") {
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

/**
 * Basic strategy for these rules (6 decks, dealer stands on soft 17, double after
 * split, late surrender). `allowed` says which optional moves are possible right now;
 * when the best one isn't, it falls back to the next best.
 */
export function strategy(
  h: Hand,
  up: Card,
  allowed: { double: boolean; split: boolean; surrender: boolean },
): Move {
  const { total, soft } = value(h.cards);
  const u = cardValue(up);
  const pair = h.cards.length === 2 && cardValue(h.cards[0]!) === cardValue(h.cards[1]!);
  const dbl = (ok: boolean, otherwise: Move): Move => (ok && allowed.double ? "double" : otherwise);

  if (total >= 21) return "stand";
  if (allowed.surrender && !soft && !pair) {
    if ((total === 16 && u >= 9) || (total === 15 && u === 10)) return "surrender";
  }
  if (pair && allowed.split) {
    const r = cardValue(h.cards[0]!);
    const split =
      r === 11 ||
      r === 8 ||
      (r === 9 && u !== 7 && u <= 9) ||
      (r === 7 && u <= 7) ||
      (r === 6 && u <= 6) ||
      (r === 4 && (u === 5 || u === 6)) ||
      ((r === 2 || r === 3) && u <= 7);
    if (split) return "split";
  }
  if (soft) {
    if (total >= 19) return "stand";
    if (total === 18) return u <= 6 ? dbl(u >= 3, "stand") : u <= 8 ? "stand" : "hit";
    if (total === 17) return dbl(u >= 3 && u <= 6, "hit");
    if (total >= 15) return dbl(u >= 4 && u <= 6, "hit");
    if (total >= 13) return dbl(u >= 5 && u <= 6, "hit");
    return "hit";
  }
  if (total >= 17) return "stand";
  if (total >= 13) return u <= 6 ? "stand" : "hit";
  if (total === 12) return u >= 4 && u <= 6 ? "stand" : "hit";
  if (total === 11) return dbl(u <= 10, "hit");
  if (total === 10) return dbl(u <= 9, "hit");
  if (total === 9) return dbl(u >= 3 && u <= 6, "hit");
  return "hit";
}

/** Insurance only pays off with a true count of +3 or more. */
export const shouldInsure = (g: Game) => trueCount(g) >= 3;

const botMove = (h: Hand, up: Card) =>
  strategy(h, up, { double: canDouble(h), split: false, surrender: false });

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
    s.hands.some((h) => value(h.cards).total <= 21 && !isBlackjack(h) && !h.surrendered),
  );
  if (live && value(g.dealer).total < 17) g.dealer.push(draw(g));
  else g.phase = "done";
  return g;
}

export function outcome(h: Hand, dealer: Card[]): Outcome {
  const p = value(h.cards).total;
  const d = value(dealer).total;
  const dealerBJ = dealer.length === 2 && d === 21;
  if (h.surrendered) return "surrender";
  if (p > 21) return "bust";
  if (isBlackjack(h)) return dealerBJ ? "push" : "blackjack";
  if (dealerBJ) return "lose";
  if (d > 21 || p > d) return "win";
  return p === d ? "push" : "lose";
}

/** Chips returned to the player for a hand (the bet was already taken). */
export function payout(h: Hand, dealer: Card[]): number {
  const o = outcome(h, dealer);
  if (o === "surrender") return Math.floor(h.bet / 2);
  return o === "blackjack" ? h.bet * 2.5 : o === "win" ? h.bet * 2 : o === "push" ? h.bet : 0;
}

/** Insurance pays 2:1 (stake back + 2x) when the dealer has Blackjack. */
export function insurancePayout(s: Seat, dealer: Card[]): number {
  const dealerBJ = dealer.length === 2 && value(dealer).total === 21;
  return dealerBJ ? (s.insurance ?? 0) * 3 : 0;
}
