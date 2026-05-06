"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { BaziChart } from "@/lib/bazi/types";
import { PaperCard } from "@/components/common/PaperCard";

export function WuxingChart({ chart }: { chart: BaziChart }) {
  const data = (["木", "火", "土", "金", "水"] as const).map((el) => ({
    element: el,
    score: Math.round(chart.wuxing[el] * 10) / 10,
  }));

  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">五行旺衰</h2>
      <p className="text-sm text-ink-600 mb-4">
        日主<span className="text-cinnabar">{chart.dayMasterStrength}</span>
        ，喜<span className="text-celadon">{chart.favorableElements.join("、")}</span>
        ，忌<span className="text-indigo">{chart.unfavorableElements.join("、")}</span>。
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="var(--gold-soft)" />
            <PolarAngleAxis
              dataKey="element"
              tick={{ fill: "var(--ink-900)", fontFamily: "var(--font-noto-serif)" }}
            />
            <Radar
              dataKey="score"
              stroke="var(--cinnabar)"
              fill="var(--cinnabar)"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </PaperCard>
  );
}
