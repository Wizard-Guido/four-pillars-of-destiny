export function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 my-6 ${className}`} aria-hidden>
      <span className="flex-1 h-px bg-gold/60" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 7h2v-2h2v2h2v-2h2v2h2M7 2v2h-2v2h2v2h-2v2h2"
          stroke="var(--gold)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex-1 h-px bg-gold/60" />
    </div>
  );
}
