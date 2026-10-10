import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePro } from "@/lib/cards";

const features = [
  "Rondas ilimitadas cada día",
  "Hasta 52 cartas por ronda",
  "Velocidad ajustable",
  "Multi-baraja, hasta 8",
  "Lecciones avanzadas: cuenta verdadera, apuestas y desviaciones",
];

const plans = [
  { id: "month", label: "Mensual", price: "$4.99", note: "al mes" },
  { id: "year", label: "Anual", price: "$29.99", note: "$2.50 al mes", badge: "−50%" },
] as const;

// Benefits + plan picker. Shown in the PRO sheet and on /pro.
export function ProPanel() {
  const [pro, setPro] = usePro();
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("year");

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-gold shadow-action">
          <Crown className="size-7 text-primary-foreground" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-[1.75rem] leading-tight">
          {pro ? (
            "Ya eres PRO"
          ) : (
            <>
              Entrena sin <span className="text-gold">límites</span>
            </>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Todo lo que necesitas para contar como un profesional.
        </p>
      </div>

      <ul className="mt-6 space-y-3.5">
        {features.map((f, i) => (
          <li
            key={f}
            className="flex animate-rise items-start gap-3"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15">
              <Check className="size-3 text-success" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="text-[0.95rem] leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {!pro && (
        <div role="radiogroup" aria-label="Plan" className="mt-6 grid grid-cols-2 gap-3">
          {plans.map((p) => {
            const selected = plan === p.id;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={selected}
                onClick={() => setPlan(p.id)}
                className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${selected ? "border-primary bg-primary/10" : "border-border bg-card"}`}
              >
                {"badge" in p && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
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
      )}

      <Button
        onClick={() => setPro(!pro)}
        variant={pro ? "glass" : "gold"}
        size="xl"
        className="mt-6 w-full"
      >
        {pro ? "Desactivar PRO (demo)" : "Activar PRO (demo)"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Modo demo: los pagos reales se conectan en el siguiente paso.
      </p>
    </div>
  );
}
