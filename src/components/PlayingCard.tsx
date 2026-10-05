import type { Card } from "@/lib/cards";

export function PlayingCard({ card, size = "lg" }: { card: Card; size?: "sm" | "lg" }) {
  const red = card.suit === "♥" || card.suit === "♦";
  const dims = size === "lg" ? "h-52 w-36 text-5xl" : "h-20 w-14 text-xl";
  return (
    <div className={`${dims} animate-deal relative flex shrink-0 items-center justify-center rounded-lg border-b-4 border-playing-foreground/10 bg-playing shadow-playing font-display ${red ? "text-suit-red" : "text-playing-foreground"}`}>
      <span className="absolute left-2 top-1 text-[0.45em] leading-none">{card.rank}<br />{card.suit}</span>
      <span>{card.rank}{card.suit}</span>
      <span className="absolute bottom-1 right-2 rotate-180 text-[0.45em] leading-none">{card.rank}<br />{card.suit}</span>
    </div>
  );
}
