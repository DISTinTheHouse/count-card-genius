import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PlayingCard } from "@/components/PlayingCard";
import { Button } from "@/components/ui/button";
import { Check, Lock, Play } from "lucide-react";
import { usePro, useStats } from "@/lib/cards";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CuentaCartas — Aprende a contar cartas en Blackjack" },
      {
        name: "description",
        content: "Domina el sistema Hi-Lo para contar cartas con lecciones y práctica en tu móvil.",
      },
      { property: "og:title", content: "CuentaCartas — Aprende a contar cartas" },
      {
        property: "og:description",
        content: "Lecciones y práctica del sistema Hi-Lo, gratis y PRO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Learn,
});

const lessons = [
  { t: "El sistema Hi-Lo", d: "Cada carta suma +1, 0 o −1 a tu cuenta.", pro: false },
  { t: "Cuenta corriente", d: "Empieza en 0 y lleva la suma mentalmente.", pro: false },
  { t: "Cuenta verdadera", d: "Divide entre las barajas restantes.", pro: true },
  { t: "Apuestas según la cuenta", d: "Sube la apuesta cuando la cuenta es alta.", pro: true },
  { t: "Estrategia y desviaciones", d: "Jugadas óptimas y los Illustrious 18.", pro: true },
];

const values = [
  { c: { rank: "5", suit: "♥" }, v: "+1", l: "2 a 6", cls: "text-success" },
  { c: { rank: "8", suit: "♣" }, v: "0", l: "7 a 9", cls: "text-muted-foreground" },
  { c: { rank: "K", suit: "♠" }, v: "−1", l: "10 a A", cls: "text-destructive" },
] as const;

function Learn() {
  const [pro] = usePro();
  const profile = useProfile();
  const stats = useStats();
  const accuracy = stats.rounds ? Math.round((stats.correct / stats.rounds) * 100) : 0;

  return (
    <AppShell>
      <div className="mt-2 animate-rise px-1">
        <p className="text-sm text-muted-foreground">Hola,</p>
        <h1 className="font-display text-3xl">{profile?.name ?? "Invitado"}</h1>
      </div>

      <div className="mt-5 grid animate-rise grid-cols-3 gap-2 [animation-delay:60ms]">
        <Stat label="Rondas" value={String(stats.rounds)} />
        <Stat label="Precisión" value={stats.rounds ? `${accuracy}%` : "—"} />
        <Stat label="Plan" value={pro ? "PRO" : "Gratis"} highlight={pro} />
      </div>

      <section className="relative mt-4 animate-rise overflow-hidden rounded-3xl border bg-card p-5 shadow-playing [animation-delay:120ms]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Valores Hi-Lo
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {values.map((x) => (
            <div key={x.v} className="flex flex-col items-center gap-2">
              <PlayingCard card={x.c} size="sm" />
              <span className={`font-display text-2xl ${x.cls}`}>{x.v}</span>
              <span className="text-xs text-muted-foreground">{x.l}</span>
            </div>
          ))}
        </div>
        <Button asChild variant="gold" size="xl" className="mt-6 w-full">
          <Link to="/practicar">
            <Play className="fill-current" aria-hidden="true" />
            Practicar ahora
          </Link>
        </Button>
      </section>

      <h2 className="mt-8 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Lecciones
      </h2>
      <ul className="mt-3 divide-y overflow-hidden rounded-3xl border bg-card">
        {lessons.map((l, i) => {
          const locked = l.pro && !pro;
          const row = (
            <div className="flex items-center gap-4 p-4">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${locked ? "bg-muted text-muted-foreground" : "bg-success/15 text-success"}`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold leading-tight">{l.t}</h3>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {locked ? "Disponible en PRO" : l.d}
                </p>
              </div>
              {locked ? (
                <Lock className="size-4 shrink-0 text-primary" aria-label="PRO" />
              ) : (
                <Check className="size-4 shrink-0 text-success" aria-hidden="true" />
              )}
            </div>
          );
          return (
            <li key={l.t} className="animate-rise" style={{ animationDelay: `${180 + i * 50}ms` }}>
              {locked ? (
                <Link to="/pro" className="block transition-colors active:bg-accent/60">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card px-3 py-3">
      <p className="text-[0.7rem] font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-display text-xl ${highlight ? "text-gold" : ""}`}>{value}</p>
    </div>
  );
}
