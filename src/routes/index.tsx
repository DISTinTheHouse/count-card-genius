import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PlayingCard } from "@/components/PlayingCard";
import { Button } from "@/components/ui/button";
import { usePro } from "@/lib/cards";
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
  {
    t: "1. El sistema Hi-Lo",
    d: "Cada carta tiene un valor. Suma mientras salen: es tu cuenta corriente.",
    pro: false,
  },
  {
    t: "2. Cuenta corriente",
    d: "Empieza en 0 con cada baraja nueva y lleva la suma mentalmente.",
    pro: false,
  },
  {
    t: "3. Cuenta verdadera",
    d: "Divide la cuenta corriente entre las barajas restantes.",
    pro: true,
  },
  {
    t: "4. Apuestas según la cuenta",
    d: "Cómo subir la apuesta cuando la cuenta es positiva.",
    pro: true,
  },
  {
    t: "5. Estrategia básica + desviaciones",
    d: "Las jugadas óptimas y los 'Illustrious 18'.",
    pro: true,
  },
];

function Learn() {
  const [pro] = usePro();
  const profile = useProfile();
  return (
    <AppShell>
      {profile && !profile.guest && (
        <p className="mt-1 px-1 text-muted-foreground">
          Hola, <span className="font-semibold text-foreground">{profile.name}</span>
        </p>
      )}
      <section className="mt-3 rounded-2xl border bg-card p-5 shadow-playing backdrop-blur-sm">
        <p className="text-center text-[0.68rem] font-bold uppercase text-muted-foreground">
          Valores Hi-Lo
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            { c: { rank: "5", suit: "♥" }, v: "+1", l: "2 a 6", cls: "text-success" },
            { c: { rank: "8", suit: "♣" }, v: "0", l: "7 a 9", cls: "text-muted-foreground" },
            { c: { rank: "K", suit: "♠" }, v: "−1", l: "10 a A", cls: "text-destructive" },
          ].map((x) => (
            <div key={x.v} className="flex flex-col items-center gap-2">
              <PlayingCard card={x.c as never} size="sm" />
              <span className={`font-display text-2xl ${x.cls}`}>{x.v}</span>
              <span className="text-xs text-muted-foreground">{x.l}</span>
            </div>
          ))}
        </div>
        <Button asChild variant="gold" size="lg" className="mt-6 w-full">
          <Link to="/practicar">Empezar a practicar</Link>
        </Button>
      </section>

      <h2 className="mt-7 px-1 font-display text-sm uppercase">Lecciones</h2>
      <ul className="mt-3 space-y-3">
        {lessons.map((l) => {
          const locked = l.pro && !pro;
          return (
            <li
              key={l.t}
              className={`rounded-xl border p-4 transition-colors ${locked ? "bg-background/25 opacity-65" : "bg-card hover:bg-accent/60"}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${locked ? "border-border bg-muted text-muted-foreground" : "border-success/30 bg-success/15 text-success"}`}
                >
                  {l.t.split(".")[0]}
                </span>
                <h3 className="min-w-0 flex-1 font-semibold leading-tight">{l.t.slice(3)}</h3>
                {l.pro && (
                  <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    PRO
                  </span>
                )}
              </div>
              <p className="mt-2 pl-11 text-sm leading-relaxed text-muted-foreground">
                {locked ? "Desbloquea PRO para ver esta lección." : l.d}
              </p>
              {locked && (
                <Link
                  to="/pro"
                  className="mt-2 inline-block pl-11 text-xs font-semibold text-primary"
                >
                  Desbloquear →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
