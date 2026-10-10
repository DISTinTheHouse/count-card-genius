import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { usePro } from "@/lib/cards";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "CuentaCartas PRO — Entrena sin límites" },
      {
        name: "description",
        content: "Práctica ilimitada, multi-baraja, velocidad ajustable y lecciones avanzadas.",
      },
      { property: "og:title", content: "CuentaCartas PRO" },
      { property: "og:description", content: "Entrena como un profesional del Blackjack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pro,
});

const features = [
  "Rondas ilimitadas cada día",
  "Hasta 52 cartas por ronda",
  "Velocidad ajustable",
  "Multi-baraja, hasta 8",
  "Las 5 lecciones, incluidas las avanzadas",
];

const plans = [
  { id: "month", label: "Mensual", price: "$4.99", note: "al mes" },
  { id: "year", label: "Anual", price: "$29.99", note: "$2.50 al mes", badge: "−50%" },
] as const;

function Pro() {
  const [pro, setPro] = usePro();
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("year");

  return (
    <AppShell>
      <div className="mt-4 flex animate-rise flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-gold shadow-action">
          <Crown className="size-8 text-primary-foreground" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-3xl">
          {pro ? (
            "Eres PRO"
          ) : (
            <>
              Hazte <span className="text-gold">PRO</span>
            </>
          )}
        </h1>
        <p className="mt-1 text-muted-foreground">Entrena como un profesional.</p>
      </div>

      <ul className="mt-6 animate-rise space-y-3 rounded-3xl border bg-card p-5 [animation-delay:80ms]">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15">
              <Check className="size-3.5 text-success" aria-hidden="true" />
            </span>
            <span className="text-sm">{f}</span>
          </li>
        ))}
      </ul>

      <div
        role="radiogroup"
        aria-label="Plan"
        className="mt-4 grid animate-rise grid-cols-2 gap-3 [animation-delay:160ms]"
      >
        {plans.map((p) => {
          const selected = plan === p.id;
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={selected}
              onClick={() => setPlan(p.id)}
              className={`relative rounded-3xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${selected ? "border-primary bg-primary/10 shadow-action" : "bg-card"}`}
            >
              {"badge" in p && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {p.badge}
                </span>
              )}
              <p className="text-sm font-medium text-muted-foreground">{p.label}</p>
              <p className="mt-1 font-display text-2xl">{p.price}</p>
              <p className="text-xs text-muted-foreground">{p.note}</p>
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => setPro(!pro)}
        variant={pro ? "glass" : "gold"}
        size="xl"
        className="mt-6 w-full animate-rise [animation-delay:240ms]"
      >
        {pro ? "Desactivar PRO (demo)" : "Activar PRO (demo)"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Modo demo: los pagos reales se conectan en el siguiente paso.
      </p>
    </AppShell>
  );
}
