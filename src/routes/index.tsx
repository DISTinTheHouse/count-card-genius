import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PlayingCard } from "@/components/PlayingCard";
import { usePro } from "@/lib/cards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CuentaCartas — Aprende a contar cartas en Blackjack" },
      { name: "description", content: "Domina el sistema Hi-Lo para contar cartas con lecciones y práctica en tu móvil." },
      { property: "og:title", content: "CuentaCartas — Aprende a contar cartas" },
      { property: "og:description", content: "Lecciones y práctica del sistema Hi-Lo, gratis y PRO." },
    ],
  }),
  component: Learn,
});

const lessons = [
  { t: "1. El sistema Hi-Lo", d: "Cada carta tiene un valor. Suma mientras salen: es tu cuenta corriente.", pro: false },
  { t: "2. Cuenta corriente", d: "Empieza en 0 con cada baraja nueva y lleva la suma mentalmente.", pro: false },
  { t: "3. Cuenta verdadera", d: "Divide la cuenta corriente entre las barajas restantes.", pro: true },
  { t: "4. Apuestas según la cuenta", d: "Cómo subir la apuesta cuando la cuenta es positiva.", pro: true },
  { t: "5. Estrategia básica + desviaciones", d: "Las jugadas óptimas y los 'Illustrious 18'.", pro: true },
];

function Learn() {
  const [pro] = usePro();
  return (
    <AppShell>
      <section className="mt-4 rounded-2xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">Valores Hi-Lo</p>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          {[
            { c: { rank: "5", suit: "♥" }, v: "+1", l: "2 a 6", cls: "text-success" },
            { c: { rank: "8", suit: "♣" }, v: "0", l: "7 a 9", cls: "text-muted-foreground" },
            { c: { rank: "K", suit: "♠" }, v: "−1", l: "10 a A", cls: "text-destructive" },
          ].map((x) => (
            <div key={x.v} className="flex flex-col items-center gap-2">
              <PlayingCard card={x.c as never} size="sm" />
              <span className={`font-display text-3xl ${x.cls}`}>{x.v}</span>
              <span className="text-xs text-muted-foreground">{x.l}</span>
            </div>
          ))}
        </div>
        <Link to="/practicar" className="mt-5 block rounded-xl bg-gold py-3 text-center font-semibold text-primary-foreground">Empezar a practicar</Link>
      </section>

      <h2 className="mt-8 font-display text-2xl tracking-wide">Lecciones</h2>
      <ul className="mt-3 space-y-3">
        {lessons.map((l) => {
          const locked = l.pro && !pro;
          return (
            <li key={l.t} className={`rounded-xl border bg-card p-4 ${locked ? "opacity-70" : ""}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{l.t}</h3>
                {l.pro && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-primary-foreground">PRO</span>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{locked ? "Desbloquea PRO para ver esta lección." : l.d}</p>
              {locked && <Link to="/pro" className="mt-2 inline-block text-sm text-primary">Desbloquear →</Link>}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
