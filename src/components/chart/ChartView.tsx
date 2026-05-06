"use client";
import type { BaziChart } from "@/lib/bazi/types";
import { FourPillarsCard } from "./FourPillarsCard";
import { WuxingChart } from "./WuxingChart";
import { ShiShenTable } from "./ShiShenTable";
import { DayunTimeline } from "./DayunTimeline";
import { DeepAnalysisPanel } from "./DeepAnalysisPanel";
import { OrnamentDivider } from "@/components/common/OrnamentDivider";
import { InkButton } from "@/components/common/InkButton";

interface ChartViewProps {
  chart: BaziChart;
  onReset: () => void;
  onConfigureKey?: () => void;
}

export function ChartView({ chart, onReset, onConfigureKey }: ChartViewProps) {
  return (
    <main className="w-full max-w-content mx-auto px-4 sm:px-6 pb-20 space-y-6">
      <div className="flex justify-between items-baseline pt-4">
        <h1 className="font-serif text-3xl">{chart.input.name || "命主"}的命盘</h1>
        <InkButton variant="ghost" onClick={onReset}>重新排盘</InkButton>
      </div>
      <FourPillarsCard chart={chart} />
      <WuxingChart chart={chart} />
      <ShiShenTable chart={chart} />
      <DayunTimeline chart={chart} />
      <OrnamentDivider />
      <DeepAnalysisPanel chart={chart} onConfigureKey={onConfigureKey} />
    </main>
  );
}
