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

// Benefits + activation. Shown in the PRO sheet and on /pro.
// Beta: PRO is free and no prices are shown. Store builds can't show a price for a
// purchase that doesn't go through Apple/Google billing, so prices only come back
// together with real in-app purchases.
export function ProPanel() {
  const [pro, setPro] = usePro();

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
        <p className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-center text-sm">
          <b className="text-gold">Gratis durante la beta.</b> Actívalo y ayúdanos a mejorarlo.
        </p>
      )}

      <Button
        onClick={() => setPro(!pro)}
        variant={pro ? "glass" : "gold"}
        size="xl"
        className="mt-6 w-full"
      >
        {pro ? "Desactivar PRO" : "Activar PRO gratis"}
      </Button>
    </div>
  );
}
