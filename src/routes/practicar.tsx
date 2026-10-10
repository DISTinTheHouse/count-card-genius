import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Lock, SlidersHorizontal } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { PlayingCard } from "@/components/PlayingCard";
import { Button } from "@/components/ui/button";
import { type Card, hiLo, loadStats, saveStats, shoe, usePro, type Stats } from "@/lib/cards";
import { openSheet } from "@/lib/sheets";
import { readLocal, writeLocal } from "@/lib/storage";

export const Route = createFileRoute("/practicar")({
  head: () => ({
    meta: [
      { title: "Practicar conteo — CuentaCartas" },
      {
        name: "description",
        content: "Entrena tu cuenta corriente Hi-Lo con cartas reales a tu ritmo.",
      },
      { property: "og:title", content: "Practicar conteo — CuentaCartas" },
      { property: "og:description", content: "Entrena el conteo de cartas Hi-Lo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Practice,
});

const FREE_DAILY = 5;
const FREE_MAX_CARDS = 15;
const DEFAULT_SPEED = 1200;

// Accepts "-2", "−2" (unicode minus) and "+2".
const toNumber = (s: string) => Number(s.replace("−", "-"));

function Practice() {
  const [pro] = usePro();
  const [count, setCount] = useState(10);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [decks, setDecks] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [i, setI] = useState(-1);
  const [phase, setPhase] = useState<"idle" | "deal" | "answer" | "result">("idle");
  const [guess, setGuess] = useState("");
  const [stats, setStats] = useState<Stats>({ rounds: 0, correct: 0 });
  const [today, setToday] = useState(0);
  const timer = useRef<number>(0);

  useEffect(() => {
    setStats(loadStats());
    const d = new Date().toDateString();
    try {
      const t = JSON.parse(readLocal("cc-today") || "{}");
      setToday(t.d === d ? t.n : 0);
    } catch {
      setToday(0);
    }
  }, []);

  // Free users can't keep PRO-only settings after turning PRO off.
  const n = pro ? count : Math.min(count, FREE_MAX_CARDS);
  const pace = pro ? speed : DEFAULT_SPEED;
  const truth = useMemo(() => cards.slice(0, n).reduce((a, c) => a + hiLo(c.rank), 0), [cards, n]);
  const limited = !pro && today >= FREE_DAILY;

  function start() {
    if (limited) return;
    setCards(shoe(pro ? decks : 1));
    setI(0);
    setGuess("");
    setPhase("deal");
  }

  useEffect(() => {
    if (phase !== "deal") return;
    timer.current = window.setTimeout(() => {
      if (i + 1 >= n) setPhase("answer");
      else setI(i + 1);
    }, pace);
    return () => clearTimeout(timer.current);
  }, [phase, i, n, pace]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (guess.trim() === "" || Number.isNaN(toNumber(guess))) return;
    const ok = toNumber(guess) === truth;
    const s = { rounds: stats.rounds + 1, correct: stats.correct + (ok ? 1 : 0) };
    setStats(s);
    saveStats(s);
    const next = today + 1;
    setToday(next);
    writeLocal("cc-today", JSON.stringify({ d: new Date().toDateString(), n: next }));
    setPhase("result");
  }

  const ok = toNumber(guess) === truth;

  return (
    <AppShell>
      <div className="mt-1 flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
        <span>
          Aciertos{" "}
          <span className="text-foreground">
            {stats.correct}/{stats.rounds}
          </span>
        </span>
        <span>
          {pro ? (
            "PRO · ilimitado"
          ) : (
            <>
              Hoy{" "}
              <span className="text-foreground">
                {today}/{FREE_DAILY}
              </span>
            </>
          )}
        </span>
      </div>

      <div className="relative mt-3 flex h-60 items-center justify-center overflow-hidden rounded-3xl border bg-card/50 [contain:layout_style]">
        {phase === "deal" && cards[i] && <PlayingCard key={i} card={cards[i]} />}
        {phase === "idle" && (
          <p className="max-w-56 text-center text-muted-foreground">
            Memoriza la cuenta mientras salen las cartas.
          </p>
        )}
        {phase === "answer" && <p className="font-display text-3xl">¿Cuál es la cuenta?</p>}
        {phase === "result" && (
          <div className="animate-rise px-6 text-center">
            <p className={`font-display text-5xl ${ok ? "text-success" : "text-destructive"}`}>
              {ok ? "¡Correcto!" : "Fallaste"}
            </p>
            <p className="mt-2 text-muted-foreground">
              {ok ? "La cuenta era " : `Dijiste ${guess}, la cuenta era `}
              <b className="text-foreground">{truth > 0 ? `+${truth}` : truth}</b>
            </p>
          </div>
        )}
        {phase === "deal" && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground/10">
            <div
              className="h-full bg-gold transition-[width] duration-200"
              style={{ width: `${((i + 1) / n) * 100}%` }}
            />
          </div>
        )}
      </div>

      {phase === "deal" && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Carta {i + 1} de {n}
        </p>
      )}

      {phase === "answer" && (
        <form onSubmit={submit} className="mt-3 flex h-14 gap-2">
          {/* iOS numeric keypads have no minus key, hence the ± button. */}
          <Button
            type="button"
            variant="glass"
            className="h-full w-14 rounded-2xl text-xl"
            aria-label="Cambiar signo"
            onClick={() =>
              setGuess((g) => (g.startsWith("-") || g.startsWith("−") ? g.slice(1) : `-${g}`))
            }
          >
            ±
          </Button>
          <input
            autoFocus
            inputMode="numeric"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Ej: -2"
            aria-label="Tu cuenta"
            className="min-w-0 flex-1 rounded-2xl border bg-input/20 px-4 text-center font-display text-2xl outline-none focus:border-ring"
          />
          <Button
            type="submit"
            disabled={guess === ""}
            variant="gold"
            className="h-full rounded-2xl px-6 text-base"
          >
            OK
          </Button>
        </form>
      )}

      {phase === "result" && ok && <Confetti key={stats.rounds} />}

      {phase === "result" && (
        <div className="mt-3 animate-rise space-y-3">
          {!ok && (
            <p className="px-1 text-center text-sm text-muted-foreground">
              ¿Lo intentas de nuevo o ajustas la dificultad?
            </p>
          )}
          {limited ? (
            <Button onClick={() => openSheet("pro")} variant="gold" size="xl" className="w-full">
              Límite diario alcanzado · Hazte PRO
            </Button>
          ) : (
            <Button onClick={start} variant="gold" size="xl" className="w-full">
              {ok ? "Siguiente ronda" : "Reintentar"}
            </Button>
          )}
          <Button onClick={() => setPhase("idle")} variant="glass" size="xl" className="w-full">
            <SlidersHorizontal aria-hidden="true" />
            Ajustar dificultad
          </Button>
        </div>
      )}

      {phase === "idle" && (
        <>
          {/* Main action sits right under the table so it's always on screen. */}
          {limited ? (
            <Button
              onClick={() => openSheet("pro")}
              variant="gold"
              size="xl"
              className="mt-3 w-full"
            >
              Límite diario alcanzado · Hazte PRO
            </Button>
          ) : (
            <Button onClick={start} variant="gold" size="xl" className="mt-3 w-full">
              Repartir
            </Button>
          )}
          <section className="mt-3 space-y-4 rounded-3xl border bg-card p-4">
            <Setting label="Cartas" value={String(n)} locked={false}>
              <input
                type="range"
                min={5}
                max={pro ? 52 : FREE_MAX_CARDS}
                value={n}
                onChange={(e) => setCount(+e.target.value)}
                className="w-full accent-primary"
              />
            </Setting>
            {/* Free users see PRO settings as one quiet row, not as locked sliders. */}
            {!pro && (
              <button
                onClick={() => openSheet("pro")}
                className="flex w-full items-center gap-2 border-t pt-3 text-left text-xs text-muted-foreground"
              >
                <Lock className="size-3.5 text-primary/80" aria-hidden="true" />
                <span className="flex-1">Velocidad, multi-baraja y hasta 52 cartas</span>
                <span className="font-bold text-primary">PRO</span>
              </button>
            )}
            {pro && (
              <>
                <Setting label="Velocidad" value={`${(pace / 1000).toFixed(1)}s`} locked={!pro}>
                  <input
                    type="range"
                    min={300}
                    max={2000}
                    step={100}
                    disabled={!pro}
                    value={pace}
                    onChange={(e) => setSpeed(+e.target.value)}
                    className="w-full accent-primary"
                  />
                </Setting>
                <Setting label="Barajas" value={String(pro ? decks : 1)} locked={!pro}>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    disabled={!pro}
                    value={pro ? decks : 1}
                    onChange={(e) => setDecks(+e.target.value)}
                    className="w-full accent-primary"
                  />
                </Setting>
              </>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function Setting({
  label,
  value,
  locked,
  children,
}: {
  label: string;
  value: string;
  locked: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>
          {label}{" "}
          {locked && (
            <button
              onClick={() => openSheet("pro")}
              className="ml-1 rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary"
            >
              PRO
            </button>
          )}
        </span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className={locked ? "opacity-40" : ""}>{children}</div>
    </div>
  );
}
