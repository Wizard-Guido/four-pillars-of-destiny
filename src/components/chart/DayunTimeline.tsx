"use client";
import type { BaziChart } from "@/lib/bazi/types";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

export function DayunTimeline({ chart }: { chart: BaziChart }) {
  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-4">大运</h2>
      <ol className="flex sm:flex-row flex-col gap-3 overflow-x-auto sm:pb-2">
        {chart.dayun.map((d) => (
          <li
            key={d.index}
            className={cn(
              "flex-shrink-0 w-full sm:w-32 border rounded-sm p-3 transition-all duration-300",
              d.isCurrent ? "border-cinnabar bg-paper" : "border-gold/40",
            )}
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-ink-600">{d.startAge}虚岁</span>
              {d.isCurrent && (
                <span className="text-[10px] bg-cinnabar text-paper px-1 rounded-sm">现行</span>
              )}
            </div>
            <div className="font-serif text-2xl text-center mb-1">
              {d.pillar.stem}{d.pillar.branch}
            </div>
            <div className="text-xs text-ink-600 text-center">
              {d.startYear}—{d.startYear + 9}
            </div>
            {d.pillar.stemShiShen && (
              <div className="text-[10px] text-ink-600 text-center mt-1">{d.pillar.stemShiShen}</div>
            )}
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}
