"use client";
import type { BaziChart, Pillar } from "@/lib/bazi/types";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

const ELEMENT_TONE: Record<string, string> = {
  木: "text-celadon",
  火: "text-cinnabar",
  土: "text-gold",
  金: "text-ink",
  水: "text-indigo",
};

export function FourPillarsCard({ chart }: { chart: BaziChart }) {
  const labels: { key: keyof BaziChart["pillars"]; label: string }[] = [
    { key: "year", label: "年柱" },
    { key: "month", label: "月柱" },
    { key: "day", label: "日柱" },
    { key: "hour", label: "时柱" },
  ];
  return (
    <PaperCard>
      <header className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-2xl">四柱</h2>
        <span className="text-sm text-ink-600">
          {chart.zodiac}年生 · 日主{chart.dayMaster.stem}{chart.dayMaster.element}
        </span>
      </header>
      <div className="grid grid-cols-4 gap-0 divide-x divide-gold/40">
        {labels.map(({ key, label }) => (
          <PillarColumn key={key} label={label} pillar={chart.pillars[key]} isDay={key === "day"} />
        ))}
      </div>
    </PaperCard>
  );
}

function PillarColumn({ label, pillar, isDay }: { label: string; pillar: Pillar; isDay: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-2 sm:px-4 py-2", isDay && "bg-paper/60")}>
      <span className="text-xs font-sans text-ink-600">{label}</span>
      <span className={cn("font-serif text-4xl sm:text-5xl leading-none", ELEMENT_TONE[pillar.stemElement])}>
        {pillar.stem}
      </span>
      <span className={cn("font-serif text-4xl sm:text-5xl leading-none", ELEMENT_TONE[pillar.branchElement])}>
        {pillar.branch}
      </span>
      <div className="text-[11px] text-ink-600 text-center min-h-[1rem]">
        {pillar.hiddenStems.join(" ")}
      </div>
      {pillar.stemShiShen && (
        <span className="text-[10px] text-ink-600 font-sans">{pillar.stemShiShen}</span>
      )}
      {pillar.naYin && <span className="text-[10px] text-gold font-sans">{pillar.naYin}</span>}
    </div>
  );
}
