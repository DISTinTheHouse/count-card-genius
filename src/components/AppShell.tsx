import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Diamond, Spade, Star } from "lucide-react";

const tabs = [
  { to: "/", label: "Aprender", icon: Spade },
  { to: "/practicar", label: "Practicar", icon: Diamond },
  { to: "/pro", label: "PRO", icon: Star },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col overflow-x-hidden">
      <header className="flex items-center justify-between px-5 pt-7 pb-3">
        <h1 className="font-display text-[1.45rem] uppercase leading-none">Cuenta<span className="text-gold">Cartas</span></h1>
      </header>
      <main className="flex-1 px-4 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t bg-background/95 shadow-[0_-10px_30px_oklch(0_0_0/0.35)] backdrop-blur-md" aria-label="Navegación principal">
        <ul className="grid h-16 grid-cols-3">
          {tabs.map((t) => (
            <li key={t.to}>
              <Link to={t.to} activeOptions={{ exact: true }} className="flex h-full flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold text-muted-foreground transition-colors" activeProps={{ className: "text-primary" }}>
                <t.icon className="size-[1.15rem]" aria-hidden="true" />{t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
