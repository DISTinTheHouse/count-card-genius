import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Diamond, Spade, Star } from "lucide-react";
import { Welcome } from "@/components/Welcome";
import { saveProfile, useProfile } from "@/lib/profile";

const tabs = [
  { to: "/", label: "Aprender", icon: Spade },
  { to: "/practicar", label: "Practicar", icon: Diamond },
  { to: "/pro", label: "PRO", icon: Star },
] as const;

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display uppercase leading-none ${className}`}>
      Cuenta<span className="text-gold">Cartas</span>
    </span>
  );
}

// Every page goes through here, so the welcome gate lives here too.
export function AppShell({ children }: { children: ReactNode }) {
  const profile = useProfile();

  // Server render / hydration: we don't know the profile yet, show only the logo.
  if (profile === undefined)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Logo className="text-2xl opacity-60" />
      </div>
    );
  if (profile === null) return <Welcome />;

  function leave() {
    if (window.confirm("¿Cambiar de usuario?")) saveProfile(null);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col overflow-x-hidden">
      <header className="flex items-center justify-between px-5 pt-7 pb-3">
        <h1>
          <Logo className="text-[1.45rem]" />
        </h1>
        <button
          onClick={leave}
          title="Cambiar de usuario"
          aria-label={`${profile.name}: cambiar de usuario`}
          className="flex size-9 items-center justify-center rounded-full border bg-card text-sm font-bold text-primary transition-colors hover:bg-accent"
        >
          {profile.name.charAt(0).toUpperCase()}
        </button>
      </header>
      <main className="flex-1 px-4 pb-24">{children}</main>
      <nav
        className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t bg-background/95 shadow-[0_-10px_30px_oklch(0_0_0/0.35)] backdrop-blur-md"
        aria-label="Navegación principal"
      >
        <ul className="grid h-16 grid-cols-3">
          {tabs.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                activeOptions={{ exact: true }}
                className="flex h-full flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold text-muted-foreground transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                <t.icon className="size-[1.15rem]" aria-hidden="true" />
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
