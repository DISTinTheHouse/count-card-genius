import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProPanel } from "@/components/ProPanel";

// PRO is normally a sheet (openSheet("pro")); this page keeps old /pro links working.
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
  component: () => (
    <AppShell>
      <div className="mt-4 rounded-[2rem] border bg-card p-6">
        <ProPanel />
      </div>
    </AppShell>
  ),
});
