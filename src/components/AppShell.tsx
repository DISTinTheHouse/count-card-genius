import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Aprender", icon: "♠" },
  { to: "/practicar", label: "Practicar", icon: "♦" },
  { to: "/pro", label: "PRO", icon: "★" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <h1 className="font-display text-3xl tracking-wide">Cuenta<span className="text-gold">Cartas</span></h1>
      </header>
      <main className="flex-1 px-5 pb-28">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-3">
          {tabs.map((t) => (
            <li key={t.to}>
              <Link to={t.to} activeOptions={{ exact: true }} className="flex flex-col items-center gap-0.5 py-3 text-xs text-muted-foreground" activeProps={{ className: "text-primary" }}>
                <span className="text-xl">{t.icon}</span>{t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
