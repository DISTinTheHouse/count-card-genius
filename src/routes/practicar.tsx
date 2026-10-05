import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PlayingCard } from "@/components/PlayingCard";
import { Button } from "@/components/ui/button";
import { type Card, hiLo, loadStats, saveStats, shoe, usePro, type Stats } from "@/lib/cards";

export const Route = createFileRoute("/practicar")({
  head: () => ({
    meta: [
      { title: "Practicar conteo — CuentaCartas" },
      { name: "description", content: "Entrena tu cuenta corriente Hi-Lo con cartas reales a tu ritmo." },
      { property: "og:title", content: "Practicar conteo — CuentaCartas" },
      { property: "og:description", content: "Entrena el conteo de cartas Hi-Lo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Practice,
});

const FREE_DAILY = 5;

function Practice() {
  const [pro] = usePro();
  const [count, setCount] = useState(10);
  const [speed, setSpeed] = useState(1200);
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
    const t = JSON.parse(localStorage.getItem("cc-today") || "{}");
    setToday(t.d === d ? t.n : 0);
  }, []);

  const truth = cards.slice(0, count).reduce((a, c) => a + hiLo(c.rank), 0);
  const limited = !pro && today >= FREE_DAILY;

  function start() {
    if (limited) return;
    setCards(shoe(decks));
    setI(0);
    setGuess("");
    setPhase("deal");
  }

  useEffect(() => {
    if (phase !== "deal") return;
    timer.current = window.setTimeout(() => {
      if (i + 1 >= count) setPhase("answer");
      else setI(i + 1);
    }, speed);
    return () => clearTimeout(timer.current);
  }, [phase, i, count, speed]);

  function submit() {
    const ok = Number(guess) === truth;
    const s = { rounds: stats.rounds + 1, correct: stats.correct + (ok ? 1 : 0) };
    setStats(s); saveStats(s);
    const n = today + 1; setToday(n);
    localStorage.setItem("cc-today", JSON.stringify({ d: new Date().toDateString(), n }));
    setPhase("result");
  }

  const ok = Number(guess) === truth;

  return (
    <AppShell>
      <div className="mt-2 flex justify-between rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
        <span>Aciertos: {stats.correct}/{stats.rounds}</span>
        <span>{pro ? "PRO · ilimitado" : `Hoy: ${today}/${FREE_DAILY}`}</span>
      </div>

      <div className="mt-4 flex h-60 items-center justify-center rounded-2xl border bg-card/50">
        {phase === "deal" && cards[i] && <PlayingCard key={i} card={cards[i]} />}
        {phase === "idle" && <p className="text-center text-muted-foreground">Memoriza la cuenta mientras salen las cartas.</p>}
        {phase === "answer" && <p className="font-display text-4xl">¿Cuál es la cuenta?</p>}
        {phase === "result" && (
          <div className="text-center">
            <p className={`font-display text-6xl ${ok ? "text-success" : "text-destructive"}`}>{ok ? "¡Correcto!" : "Fallaste"}</p>
            <p className="mt-2 text-muted-foreground">La cuenta era <b className="text-foreground">{truth > 0 ? `+${truth}` : truth}</b></p>
          </div>
        )}
      </div>

      {phase === "deal" && <p className="text-center text-sm text-muted-foreground">Carta {i + 1} de {count}</p>}

      {phase === "answer" && (
        <div className="mt-4 flex gap-2">
          <input autoFocus inputMode="numeric" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Ej: -2" className="flex-1 rounded-xl border bg-input/20 px-4 py-3 text-lg outline-none focus:border-ring" />
          <Button onClick={submit} disabled={guess === ""} variant="gold" size="lg" className="h-auto px-6">OK</Button>
        </div>
      )}

      {(phase === "idle" || phase === "result") && (
        <>
          <section className="mt-4 space-y-5 rounded-xl border bg-card p-4">
            <Setting label="Cartas" value={String(count)} locked={false}>
              <input type="range" min={5} max={pro ? 52 : 15} value={count} onChange={(e) => setCount(+e.target.value)} className="w-full accent-primary" />
            </Setting>
            <Setting label="Velocidad" value={`${(speed / 1000).toFixed(1)}s`} locked={!pro}>
              <input type="range" min={300} max={2000} step={100} disabled={!pro} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-primary" />
            </Setting>
            <Setting label="Barajas" value={String(decks)} locked={!pro}>
              <input type="range" min={1} max={8} disabled={!pro} value={decks} onChange={(e) => setDecks(+e.target.value)} className="w-full accent-primary" />
            </Setting>
          </section>
          {limited ? (
            <Button asChild variant="gold" size="lg" className="mt-4 w-full"><Link to="/pro">Límite diario alcanzado · Hazte PRO</Link></Button>
          ) : (
            <Button onClick={start} variant="gold" size="lg" className="mt-4 w-full">{phase === "result" ? "Otra ronda" : "Repartir"}</Button>
          )}
        </>
      )}
    </AppShell>
  );
}

function Setting({ label, value, locked, children }: { label: string; value: string; locked: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label} {locked && <Link to="/pro" className="ml-1 rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">PRO</Link>}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className={locked ? "opacity-40" : ""}>{children}</div>
    </div>
  );
}
