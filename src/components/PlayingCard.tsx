import { memo } from "react";
import type { Card } from "@/lib/cards";

const DIMS = {
  xs: "h-12 w-9 text-sm rounded-md",
  sm: "h-20 w-14 text-xl",
  lg: "h-52 w-36 text-5xl",
};

// Pure CSS card, memoized: during a round only the new card re-renders.
export const PlayingCard = memo(function PlayingCard({
  card,
  size = "lg",
  className = "",
  hidden = false,
}: {
  card: Card;
  size?: "xs" | "sm" | "lg";
  className?: string;
  /** Face down (dealer's hole card). */
  hidden?: boolean;
}) {
  const red = card.suit === "♥" || card.suit === "♦";
  const dims = DIMS[size];
  if (hidden)
    return (
      <div
        aria-label="Carta boca abajo"
        className={`${dims} animate-deal shrink-0 rounded-lg border-4 border-playing bg-gold shadow-playing [background-image:repeating-linear-gradient(45deg,oklch(0_0_0/0.12)_0_4px,transparent_4px_8px),var(--gold)] ${className}`}
      />
    );
  return (
    <div
      className={`${dims} animate-deal relative flex shrink-0 items-center justify-center rounded-lg border-b-4 border-playing-foreground/10 bg-playing shadow-playing font-display ${red ? "text-suit-red" : "text-playing-foreground"} ${className}`}
    >
      <span className="absolute left-2 top-1 text-[0.45em] leading-none">
        {card.rank}
        <br />
        {card.suit}
      </span>
      <span>
        {card.rank}
        {card.suit}
      </span>
      <span className="absolute bottom-1 right-2 rotate-180 text-[0.45em] leading-none">
        {card.rank}
        <br />
        {card.suit}
      </span>
    </div>
  );
});
