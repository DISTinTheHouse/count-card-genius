import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Coins, Crown, GraduationCap, LogOut, Spade } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProPanel } from "@/components/ProPanel";
import { Sheet } from "@/components/Sheet";
import { Welcome } from "@/components/Welcome";
import { Button } from "@/components/ui/button";
import { usePro, useStats } from "@/lib/cards";
import { START_CHIPS, fmt, setChips, useChips } from "@/lib/chips";
import { saveProfile, useProfile, type Profile } from "@/lib/profile";
import { openSheet, useSheet } from "@/lib/sheets";

const tabs = [
  { to: "/", label: "Entrenar", icon: GraduationCap, paths: ["/", "/practicar"] },
  { to: "/jugar", label: "Jugar", icon: Spade, paths: ["/jugar"] },
] as const;

// Every page goes through here, so the welcome gate and global sheets live here too.
export function AppShell({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const [pro] = usePro();
  const sheet = useSheet();
  const chips = useChips();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Welcome bonus: every new player gets fictitious chips once.
  useEffect(() => {
    if (profile && chips === null) {
      setChips(START_CHIPS);
      openSheet("bonus");
    }
  }, [profile, chips]);

  // Server render / hydration: we don't know the profile yet, show only the logo.
  if (profile === undefined)
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Logo className="text-2xl opacity-60" />
      </div>
    );
  if (profile === null) return <Welcome />;

  const close = (open: boolean) => !open && openSheet(null);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
        <Logo className="text-xl" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => openSheet("pro")}
            className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-transform active:scale-95 ${pro ? "border border-primary/40 text-primary" : "bg-gold text-primary-foreground shadow-action"}`}
          >
            <Crown className="size-3.5" aria-hidden="true" />
            PRO
          </button>
          <button
            onClick={() => openSheet("profile")}
            aria-label={`Perfil de ${profile.name}`}
            className="flex size-9 items-center justify-center rounded-full border bg-card text-sm font-extrabold text-foreground transition-transform active:scale-95"
          >
            {profile.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        aria-label="Navegación principal"
      >
        <ul className="grid h-16 grid-cols-2 gap-1 rounded-2xl border bg-popover/85 p-1.5 shadow-[0_12px_40px_-12px_oklch(0_0_0/0.6)] backdrop-blur-xl">
          {tabs.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                className={`flex h-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-200 active:scale-95 ${(t.paths as readonly string[]).includes(path) ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
              >
                <t.icon className="size-5" aria-hidden="true" />
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Sheet open={sheet === "pro"} onOpenChange={close} title="CuentaCartas PRO">
        <ProPanel />
      </Sheet>
      <Sheet open={sheet === "bonus"} onOpenChange={close} title="Bono de bienvenida">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 animate-float items-center justify-center rounded-full bg-gold shadow-action">
            <Coins className="size-8 text-primary-foreground" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-[1.75rem] leading-tight">
            ¡Bienvenido, {profile.name}!
          </h2>
          <p className="mt-2 text-muted-foreground">Te regalamos</p>
          <p className="font-display text-5xl text-gold">{fmt(START_CHIPS)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            fichas para jugar Blackjack. Son ficticias: no se compran ni se cobran.
          </p>
          <Button asChild variant="gold" size="xl" className="mt-6 w-full">
            <Link to="/jugar" onClick={() => openSheet(null)}>
              Ir a la mesa
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="xl"
            className="mt-2 w-full text-muted-foreground"
            onClick={() => openSheet(null)}
          >
            Primero entrenar
          </Button>
        </div>
      </Sheet>
      <Sheet open={sheet === "profile"} onOpenChange={close} title="Tu perfil">
        <ProfilePanel profile={profile} pro={pro} />
      </Sheet>
    </div>
  );
}

function ProfilePanel({ profile, pro }: { profile: Profile; pro: boolean }) {
  const stats = useStats();
  const accuracy = stats.rounds ? Math.round((stats.correct / stats.rounds) * 100) : 0;
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-gold font-display text-2xl text-primary-foreground">
        {profile.name.charAt(0).toUpperCase()}
      </span>
      <h2 className="mt-3 font-display text-2xl">{profile.name}</h2>
      <p className="text-sm text-muted-foreground">
        {profile.guest ? "Invitado" : "Perfil local"} · {pro ? "PRO" : "Gratis"}
      </p>
      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="font-display text-2xl">{stats.rounds}</p>
          <p className="text-xs text-muted-foreground">Rondas</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="font-display text-2xl">{stats.rounds ? `${accuracy}%` : "—"}</p>
          <p className="text-xs text-muted-foreground">Precisión</p>
        </div>
      </div>
      <Button
        variant="glass"
        size="xl"
        className="mt-6 w-full text-destructive"
        onClick={() => {
          openSheet(null);
          saveProfile(null);
        }}
      >
        <LogOut aria-hidden="true" />
        Cambiar de usuario
      </Button>
    </div>
  );
}
