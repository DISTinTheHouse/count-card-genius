import { useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { PlayingCard } from "@/components/PlayingCard";
import { Button } from "@/components/ui/button";
import { saveProfile } from "@/lib/profile";

// First screen when there is no profile. Two choices, nothing else.
export function Welcome() {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  function create(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (n) saveProfile({ name: n.slice(0, 24), guest: false });
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      {/* Soft gold glow behind the cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 size-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col items-center justify-center pb-10 text-center">
        <div className="relative h-40 w-48" aria-hidden="true">
          <div className="absolute left-0 top-6 animate-float [animation-delay:-1s]">
            <PlayingCard
              card={{ rank: "5", suit: "♥" }}
              size="sm"
              className="-rotate-[14deg] scale-125"
            />
          </div>
          <div className="absolute right-0 top-6 animate-float [animation-delay:-2.5s]">
            <PlayingCard
              card={{ rank: "K", suit: "♠" }}
              size="sm"
              className="rotate-[14deg] scale-125"
            />
          </div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 animate-float">
            <PlayingCard card={{ rank: "A", suit: "♦" }} size="sm" className="scale-150" />
          </div>
        </div>

        <h1 className="mt-10 animate-rise text-[2.75rem]">
          <Logo />
        </h1>
        <p className="mt-3 max-w-72 animate-rise text-lg text-muted-foreground [animation-delay:80ms]">
          Aprende a contar cartas en Blackjack, a tu ritmo.
        </p>
      </div>

      <div className="relative animate-rise [animation-delay:160ms]">
        {creating ? (
          <form onSubmit={create} className="space-y-3">
            <label
              htmlFor="welcome-name"
              className="block text-sm font-medium text-muted-foreground"
            >
              ¿Cómo te llamamos?
            </label>
            <input
              id="welcome-name"
              autoFocus
              autoComplete="nickname"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="h-14 w-full rounded-2xl border bg-input/20 px-5 text-lg outline-none transition-colors focus:border-ring focus:bg-input/30"
            />
            <Button
              type="submit"
              disabled={!name.trim()}
              variant="gold"
              size="xl"
              className="w-full"
            >
              Empezar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xl"
              className="w-full text-muted-foreground"
              onClick={() => setCreating(false)}
            >
              Volver
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <Button variant="gold" size="xl" className="w-full" onClick={() => setCreating(true)}>
              Crear usuario
            </Button>
            <Button
              variant="glass"
              size="xl"
              className="w-full"
              onClick={() => saveProfile({ name: "Invitado", guest: true })}
            >
              Continuar como invitado
            </Button>
          </div>
        )}
        <p className="mt-5 text-center text-xs text-muted-foreground/70">
          Tu progreso se guarda en este dispositivo.
        </p>
      </div>
    </main>
  );
}
