import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Crown, GraduationCap, Layers } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Welcome } from "@/components/Welcome";
import { saveProfile, useProfile } from "@/lib/profile";

const tabs = [
  { to: "/", label: "Aprender", icon: GraduationCap },
  { to: "/practicar", label: "Practicar", icon: Layers },
  { to: "/pro", label: "PRO", icon: Crown },
] as const;

// Every page goes through here, so the welcome gate lives here too.
export function AppShell({ children }: { children: ReactNode }) {
  const profile = useProfile();

  // Server render / hydration: we don't know the profile yet, show only the logo.
  if (profile === undefined)
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Logo className="text-2xl opacity-60" />
      </div>
    );
  if (profile === null) return <Welcome />;

  function leave() {
    if (window.confirm("¿Cambiar de usuario?")) saveProfile(null);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-background/70 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
        <Logo className="text-xl" />
        <button
          onClick={leave}
          title="Cambiar de usuario"
          aria-label={`${profile.name}: cambiar de usuario`}
          className="flex size-9 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-primary-foreground shadow-action transition-transform active:scale-95"
        >
          {profile.name.charAt(0).toUpperCase()}
        </button>
      </header>
      <main className="flex-1 px-4 pb-32">{children}</main>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        aria-label="Navegación principal"
      >
        <ul className="grid h-16 grid-cols-3 gap-1 rounded-2xl border bg-popover/85 p-1.5 shadow-[0_12px_40px_-12px_oklch(0_0_0/0.6)] backdrop-blur-xl">
          {tabs.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                activeOptions={{ exact: true }}
                className="flex h-full flex-col items-center justify-center gap-0.5 rounded-xl text-[0.68rem] font-semibold text-muted-foreground transition-colors duration-200 active:scale-95"
                activeProps={{ className: "bg-primary/15 text-primary" }}
              >
                <t.icon className="size-5" aria-hidden="true" />
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
