import { createFileRoute } from "@tanstack/react-router";
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

const rows = [
  ["Rondas por día", "5", "Ilimitadas"],
  ["Cartas por ronda", "15", "52"],
  ["Velocidad ajustable", "—", "✓"],
  ["Multi-baraja (hasta 8)", "—", "✓"],
  ["Lecciones avanzadas", "2", "5"],
];

function Pro() {
  const [pro, setPro] = usePro();
  return (
    <AppShell>
      <div className="mt-4 text-center">
        <p className="font-display text-5xl text-gold">PRO</p>
        <p className="mt-1 text-muted-foreground">Entrena como un profesional.</p>
      </div>
      <table className="mt-6 w-full overflow-hidden rounded-xl border bg-card text-sm">
        <thead>
          <tr className="text-muted-foreground">
            <th className="p-3 text-left font-normal"></th>
            <th className="p-3">Gratis</th>
            <th className="p-3 text-primary">PRO</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t">
              <td className="p-3">{r[0]}</td>
              <td className="p-3 text-center text-muted-foreground">{r[1]}</td>
              <td className="p-3 text-center font-semibold">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Mensual</p>
          <p className="font-display text-3xl">$4.99</p>
        </div>
        <div className="relative rounded-xl border border-primary bg-card p-4 text-center shadow-action">
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 text-[10px] font-bold text-primary-foreground">
            −50%
          </span>
          <p className="text-sm text-muted-foreground">Anual</p>
          <p className="font-display text-3xl">$29.99</p>
        </div>
      </div>
      <Button onClick={() => setPro(!pro)} variant="gold" size="lg" className="mt-6 w-full">
        {pro ? "PRO activo (demo) · Desactivar" : "Activar PRO (demo)"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Modo demo: los pagos reales se conectan en el siguiente paso.
      </p>
    </AppShell>
  );
}
