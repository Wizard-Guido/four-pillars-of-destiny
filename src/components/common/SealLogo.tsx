export function SealLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-label="四柱">
      <rect x="2" y="2" width="32" height="32" fill="var(--cinnabar)" rx="2" />
      <text
        x="50%" y="54%"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="var(--font-noto-serif), serif"
        fontSize="20" fontWeight="700"
        fill="var(--paper)"
      >四柱</text>
    </svg>
  );
}
