export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display leading-none ${className}`}>
      Cuenta<span className="text-gold">Cartas</span>
    </span>
  );
}
