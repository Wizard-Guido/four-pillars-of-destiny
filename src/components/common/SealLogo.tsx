export function SealLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-label="八字"
      role="img"
    >
      <rect width="64" height="64" rx="8" fill="var(--cinnabar)" />
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="5"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.8"
        opacity="0.55"
      />
      <text
        x="50%"
        y="53%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-noto-serif), 'Songti SC', 'STSong', serif"
        fontSize="28"
        fontWeight="700"
        fill="var(--paper)"
        letterSpacing="-1"
      >
        八字
      </text>
    </svg>
  );
}
