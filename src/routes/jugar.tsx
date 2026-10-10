import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Coins, Eye, EyeOff, Minus, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Confetti } from "@/components/Confetti";
import { PlayingCard } from "@/components/PlayingCard";
import { Button } from "@/components/ui/button";
import {
  type Game,
  type Hand,
  type Outcome,
  act,
  canDouble,
  canSplit,
  deal,
  newGame,
  outcome,
  payout,
  stepBots,
  stepDealer,
  trueCount,
  value,
} from "@/lib/blackjack";
import { START_CHIPS, fmt, setChips, useChips } from "@/lib/chips";
import { useLocal, writeLocal } from "@/lib/storage";

export const Route = createFileRoute("/jugar")({
  head: () => ({
    meta: [
      { title: "Jugar Blackjack — CuentaCartas" },
      {
        name: "description",
        content: "Juega Blackjack con fichas ficticias contra la máquina y practica tu conteo.",
      },
      { property: "og:title", content: "Jugar Blackjack — CuentaCartas" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Play,
});

const CHIPS = [10, 50, 100, 500, 1000] as const;
const CHIP_STYLE: Record<number, string> = {
  10: "bg-foreground/90 text-background",
  50: "bg-destructive text-white",
  100: "bg-success text-background",
  500: "bg-[oklch(0.55_0.18_290)] text-white",
  1000: "bg-gold text-primary-foreground",
};
const STEP_MS = 550;
const COUNT_HELP = "cuentacartas-count-help";

const LABEL: Record<Outcome, string> = {
  blackjack: "Blackjack",
  win: "Ganas",
  push: "Empate",
  lose: "Pierdes",
  bust: "Te pasaste",
};

function Play() {
  const chips = useChips();
  const balance = chips ?? 0;
  const [game, setGame] = useState<Game>(newGame);
  const [bet, setBet] = useState(100);
  const [bots, setBots] = useState(2);
  const [result, setResult] = useState<number | null>(null);
  const showCount = useLocal(COUNT_HELP) !== "0";

  // Bots and dealer play themselves, one step at a time so cards are readable.
  useEffect(() => {
    if (game.phase !== "bots" && game.phase !== "dealer") return;
    const t = setTimeout(
      () => setGame((g) => (g.phase === "bots" ? stepBots(g) : stepDealer(g))),
      STEP_MS,
    );
    return () => clearTimeout(t);
  }, [game]);

  // Pay out once when the round ends.
  useEffect(() => {
    if (game.phase !== "done" || result !== null) return;
    const you = game.seats[0]!;
    const back = you.hands.reduce((a, h) => a + payout(h, game.dealer), 0);
    const staked = you.hands.reduce((a, h) => a + h.bet, 0);
    setChips(balance + back);
    setResult(back - staked);
  }, [game, result, balance]);

  const you = game.seats[0];
  const current = you?.hands[you.active];
  const staked = you?.hands.reduce((a, h) => a + h.bet, 0) ?? 0;
  const inRound = game.phase !== "bet" && game.phase !== "done";
  const bettable = Math.min(bet, balance);

  function start() {
    if (bettable <= 0) return;
    setChips(balance - bettable);
    setResult(null);
    setGame((g) => deal(g, bettable, bots));
  }

  function double() {
    if (!current || balance < current.bet) return;
    setChips(balance - current.bet);
    setGame((g) => act(g, "double"));
  }

  function split() {
    if (!current || balance < current.bet) return;
    setChips(balance - current.bet);
    setGame((g) => act(g, "split"));
  }

  return (
    <AppShell>
      {/* Balance + count help */}
      <div className="mt-1 flex items-center justify-between">
        <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-bold">
          <Coins className="size-4 text-primary" aria-hidden="true" />
          {chips === undefined ? "—" : fmt(balance)}
        </span>
        <button
          onClick={() => writeLocal(COUNT_HELP, showCount ? "0" : "1")}
          className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors active:bg-accent"
          aria-pressed={showCount}
        >
          {showCount ? (
            <>
              <Eye className="size-3.5" aria-hidden="true" />
              Cuenta <b className="text-foreground">{signed(game.running)}</b> · Real{" "}
              <b className="text-foreground">{signed(Math.round(trueCount(game) * 10) / 10)}</b>
            </>
          ) : (
            <>
              <EyeOff className="size-3.5" aria-hidden="true" />
              Mostrar cuenta
            </>
          )}
        </button>
      </div>

      {/* Table */}
      <section className="relative mt-3 overflow-hidden rounded-[2rem] border bg-[radial-gradient(120%_80%_at_50%_0%,oklch(0.36_0.08_158/0.6),transparent_70%)] bg-card/40 px-4 pt-4 pb-5">
        <SeatLabel name="Crupier" total={game.dealer.length ? dealerTotal(game) : null} />
        <Cards cards={game.dealer} hideSecond={game.holeHidden} size="sm" />

        {game.seats.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {game.seats.slice(1).map((s) => (
              <div key={s.name} className="overflow-hidden rounded-2xl bg-background/30 p-2">
                <p className="truncate text-[0.65rem] font-semibold text-muted-foreground">
                  {s.name} · {s.hands[0]!.bet}
                </p>
                {s.hands.map((h, i) => (
                  <div key={i} className="mt-1">
                    <Cards cards={h.cards} size="xs" />
                    <p className="mt-1 text-[0.65rem] font-bold">
                      {value(h.cards).total}
                      {game.phase === "done" && (
                        <span className={`ml-1 ${tone(outcome(h, game.dealer))}`}>
                          {LABEL[outcome(h, game.dealer)]}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 border-t border-dashed border-foreground/10 pt-4">
          {you ? (
            <div className="flex gap-4 overflow-x-auto">
              {you.hands.map((h, i) => (
                <YourHand
                  key={i}
                  hand={h}
                  active={game.phase === "player" && you.active === i && you.hands.length > 1}
                  result={game.phase === "done" ? outcome(h, game.dealer) : null}
                />
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Elige tu apuesta y reparte.
            </p>
          )}
        </div>

        {game.phase === "done" && result !== null && (
          <p
            className={`mt-3 animate-rise text-center font-display text-2xl ${result > 0 ? "text-success" : result < 0 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {result > 0 ? `+${fmt(result)}` : result < 0 ? `−${fmt(-result)}` : "Empate"}
          </p>
        )}
      </section>

      {game.phase === "done" && result !== null && result > 0 && (
        <Confetti key={game.shoe.length} />
      )}

      {/* Actions */}
      {game.phase === "player" && current && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="gold" size="xl" onClick={() => setGame((g) => act(g, "hit"))}>
            Pedir
          </Button>
          <Button variant="glass" size="xl" onClick={() => setGame((g) => act(g, "stand"))}>
            Plantarse
          </Button>
          <Button
            variant="glass"
            size="xl"
            disabled={!canDouble(current) || balance < current.bet}
            onClick={double}
          >
            Doblar
          </Button>
          <Button
            variant="glass"
            size="xl"
            disabled={!canSplit(you!, current) || balance < current.bet}
            onClick={split}
          >
            Dividir
          </Button>
        </div>
      )}

      {inRound && game.phase !== "player" && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {game.phase === "bots" ? "Juegan los bots…" : "Juega el crupier…"}
        </p>
      )}

      {(game.phase === "bet" || game.phase === "done") && (
        <div className="mt-3 space-y-3">
          {balance < CHIPS[0] && chips !== undefined ? (
            <Button
              variant="gold"
              size="xl"
              className="w-full"
              onClick={() => setChips(START_CHIPS)}
            >
              <Coins aria-hidden="true" />
              Recargar {fmt(START_CHIPS)} gratis
            </Button>
          ) : (
            <Button
              variant="gold"
              size="xl"
              className="w-full"
              disabled={bettable <= 0}
              onClick={start}
            >
              {game.phase === "done" ? "Nueva mano" : "Repartir"} · {fmt(bettable)}
            </Button>
          )}

          <div className="rounded-3xl border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Apuesta</span>
              <span className="font-display text-lg">{fmt(bettable)}</span>
            </div>
            <div className="mt-3 flex justify-between gap-2">
              {CHIPS.map((v) => (
                <button
                  key={v}
                  onClick={() => setBet((b) => Math.min(b + v, balance))}
                  disabled={balance - bettable < v}
                  className={`flex size-12 items-center justify-center rounded-full border-4 border-dashed border-white/40 text-[0.7rem] font-extrabold shadow-playing transition-transform active:scale-90 disabled:opacity-30 ${CHIP_STYLE[v]}`}
                >
                  {v >= 1000 ? "1K" : v}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
              <button
                className="text-xs font-semibold text-muted-foreground"
                onClick={() => setBet(0)}
              >
                Limpiar
              </button>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Jugadores</span>
                <Stepper value={bots + 1} onChange={(n) => setBots(n - 1)} min={1} max={5} />
              </div>
            </div>
          </div>
        </div>
      )}

      {staked > 0 && inRound && (
        <p className="mt-2 text-center text-xs text-muted-foreground">En juego: {fmt(staked)}</p>
      )}
    </AppShell>
  );
}

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
const tone = (o: Outcome) =>
  o === "blackjack" || o === "win"
    ? "text-success"
    : o === "push"
      ? "text-muted-foreground"
      : "text-destructive";

function dealerTotal(g: Game) {
  return g.holeHidden ? value([g.dealer[0]!]).total : value(g.dealer).total;
}

function SeatLabel({ name, total }: { name: string; total: number | null }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      {name}
      {total !== null && (
        <span className="rounded-full bg-background/40 px-2 py-0.5 text-foreground">{total}</span>
      )}
    </div>
  );
}

function Cards({
  cards,
  size,
  hideSecond = false,
}: {
  cards: Game["dealer"];
  size: "xs" | "sm";
  hideSecond?: boolean;
}) {
  return (
    <div className={`flex ${size === "xs" ? "min-h-12 -space-x-7" : "min-h-20 -space-x-6"}`}>
      {cards.map((c, i) => (
        <PlayingCard key={i} card={c} size={size} hidden={hideSecond && i === 1} />
      ))}
    </div>
  );
}

function YourHand({
  hand,
  active,
  result,
}: {
  hand: Hand;
  active: boolean;
  result: Outcome | null;
}) {
  return (
    <div className={`shrink-0 rounded-2xl p-1 ${active ? "ring-2 ring-primary" : ""}`}>
      <SeatLabel
        name={`Tú · ${fmt(hand.bet)}${hand.doubled ? " (x2)" : ""}`}
        total={value(hand.cards).total}
      />
      <Cards cards={hand.cards} size="sm" />
      {result && (
        <p className={`mt-2 animate-rise text-sm font-bold ${tone(result)}`}>{LABEL[result]}</p>
      )}
    </div>
  );
}

function Stepper({
  value: v,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border bg-background/30 p-0.5">
      <button
        aria-label="Menos jugadores"
        disabled={v <= min}
        onClick={() => onChange(v - 1)}
        className="flex size-7 items-center justify-center rounded-full disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-4 text-center font-bold">{v}</span>
      <button
        aria-label="Más jugadores"
        disabled={v >= max}
        onClick={() => onChange(v + 1)}
        className="flex size-7 items-center justify-center rounded-full disabled:opacity-30"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
