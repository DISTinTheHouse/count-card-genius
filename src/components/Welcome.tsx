import { useState, type FormEvent } from "react";
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 pt-20 pb-10">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-24 w-28" aria-hidden="true">
          <PlayingCard
            card={{ rank: "5", suit: "♥" }}
            size="sm"
            className="absolute left-0 top-2 -rotate-12"
          />
          <PlayingCard
            card={{ rank: "K", suit: "♠" }}
            size="sm"
            className="absolute right-0 top-2 rotate-12"
          />
          <PlayingCard
            card={{ rank: "A", suit: "♦" }}
            size="sm"
            className="absolute left-1/2 top-0 -translate-x-1/2"
          />
        </div>
        <h1 className="mt-10 font-display text-4xl uppercase leading-none">
          Cuenta<span className="text-gold">Cartas</span>
        </h1>
        <p className="mt-4 max-w-64 text-muted-foreground">
          Aprende a contar cartas en Blackjack, a tu ritmo.
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {creating ? (
          <form onSubmit={create} className="space-y-3">
            <label htmlFor="welcome-name" className="block text-sm text-muted-foreground">
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
              className="w-full rounded-xl border bg-input/20 px-4 py-3 text-lg outline-none focus:border-ring"
            />
            <Button
              type="submit"
              disabled={!name.trim()}
              variant="gold"
              size="lg"
              className="w-full"
            >
              Empezar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground"
              onClick={() => setCreating(false)}
            >
              Volver
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <Button variant="gold" size="lg" className="w-full" onClick={() => setCreating(true)}>
              Crear usuario
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground"
              onClick={() => saveProfile({ name: "Invitado", guest: true })}
            >
              Continuar como invitado
            </Button>
          </div>
        )}
        <p className="mt-4 text-center text-xs text-muted-foreground/70">
          Tu progreso se guarda en este dispositivo.
        </p>
      </div>
    </main>
  );
}
