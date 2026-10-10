import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PlayingCard } from "@/components/PlayingCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, ChevronRight, Lightbulb, Lock, Play } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import { LESSONS, markLessonRead, useReadLessons } from "@/lib/lessons";
import { openSheet } from "@/lib/sheets";
import { usePro, useStats } from "@/lib/cards";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CuentaCartas — Aprende a contar cartas en Blackjack" },
      {
        name: "description",
        content: "Domina el sistema Hi-Lo para contar cartas con lecciones y práctica en tu móvil.",
      },
      { property: "og:title", content: "CuentaCartas — Aprende a contar cartas" },
      {
        property: "og:description",
        content: "Lecciones y práctica del sistema Hi-Lo, gratis y PRO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Learn,
});

const values = [
  { c: { rank: "5", suit: "♥" }, v: "+1", l: "2 a 6", cls: "text-success" },
  { c: { rank: "8", suit: "♣" }, v: "0", l: "7 a 9", cls: "text-muted-foreground" },
  { c: { rank: "K", suit: "♠" }, v: "−1", l: "10 a A", cls: "text-destructive" },
] as const;

function Learn() {
  const [pro] = usePro();
  const profile = useProfile();
  const stats = useStats();
  const read = useReadLessons();
  const [open, setOpen] = useState<number | null>(null);
  const accuracy = stats.rounds ? Math.round((stats.correct / stats.rounds) * 100) : 0;

  function openLesson(i: number) {
    if (LESSONS[i]!.pro && !pro) return openSheet("pro");
    markLessonRead(i, read);
    setOpen(i);
  }

  return (
    <AppShell>
      <div className="mt-2 animate-rise px-1">
        <p className="text-sm text-muted-foreground">Hola,</p>
        <h1 className="font-display text-3xl">{profile?.name ?? "Invitado"}</h1>
      </div>

      <div className="mt-5 grid animate-rise grid-cols-3 gap-2 [animation-delay:60ms]">
        <Stat label="Rondas" value={String(stats.rounds)} />
        <Stat label="Precisión" value={stats.rounds ? `${accuracy}%` : "—"} />
        <Stat label="Lecciones" value={`${read.length}/${LESSONS.length}`} />
      </div>

      <section className="relative mt-4 animate-rise overflow-hidden rounded-3xl border bg-card p-5 shadow-playing [animation-delay:120ms]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Valores Hi-Lo
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {values.map((x) => (
            <div key={x.v} className="flex flex-col items-center gap-2">
              <PlayingCard card={x.c} size="sm" />
              <span className={`font-display text-2xl ${x.cls}`}>{x.v}</span>
              <span className="text-xs text-muted-foreground">{x.l}</span>
            </div>
          ))}
        </div>
        <Button asChild variant="gold" size="xl" className="mt-6 w-full">
          <Link to="/practicar">
            <Play className="fill-current" aria-hidden="true" />
            Practicar ahora
          </Link>
        </Button>
      </section>

      <h2 className="mt-8 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Lecciones
      </h2>
      <ul className="mt-3 divide-y overflow-hidden rounded-3xl border bg-card">
        {LESSONS.map((l, i) => {
          const locked = l.pro && !pro;
          const done = read.includes(i);
          return (
            <li
              key={l.title}
              className="animate-rise"
              style={{ animationDelay: `${180 + i * 50}ms` }}
            >
              <button
                onClick={() => openLesson(i)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors active:bg-accent/60"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${locked ? "bg-muted text-muted-foreground" : done ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}
                >
                  {done && !locked ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-tight">{l.title}</span>
                  <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                    {locked ? "Disponible en PRO" : l.summary}
                  </span>
                </span>
                {locked ? (
                  <Lock className="size-4 shrink-0 text-primary" aria-label="PRO" />
                ) : (
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open !== null ? LESSONS[open]!.title : "Lección"}
      >
        {open !== null && (
          <LessonView
            index={open}
            onNext={
              open + 1 < LESSONS.length
                ? () => {
                    setOpen(null);
                    openLesson(open + 1);
                  }
                : undefined
            }
          />
        )}
      </Sheet>
    </AppShell>
  );
}

function LessonView({ index, onNext }: { index: number; onNext?: (() => void) | undefined }) {
  const l = LESSONS[index]!;
  return (
    <article>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Lección {index + 1} de {LESSONS.length}
      </p>
      <h2 className="mt-1 font-display text-[1.75rem] leading-tight">{l.title}</h2>

      <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-foreground/85">
        {l.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {l.table && (
        <table className="mt-5 w-full overflow-hidden rounded-2xl border text-sm">
          <thead className="bg-card text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">{l.table.head[0]}</th>
              <th className="px-4 py-2.5 text-right font-medium">{l.table.head[1]}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {l.table.rows.map(([k, v]) => (
              <tr key={k}>
                <td className="px-4 py-3">{k}</td>
                <td className="px-4 py-3 text-right font-display">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {l.tip && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm leading-relaxed">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>{l.tip}</p>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        <Button asChild variant="gold" size="xl" className="w-full">
          <Link to="/practicar">Practicar ahora</Link>
        </Button>
        {onNext && (
          <Button variant="glass" size="xl" className="w-full" onClick={onNext}>
            Siguiente lección
            <ChevronRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card px-3 py-3">
      <p className="text-[0.7rem] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-xl">{value}</p>
    </div>
  );
}
