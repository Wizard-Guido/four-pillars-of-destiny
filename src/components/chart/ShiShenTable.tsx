"use client";
import type { BaziChart } from "@/lib/bazi/types";
import { PaperCard } from "@/components/common/PaperCard";

export function ShiShenTable({ chart }: { chart: BaziChart }) {
  const rows = [
    { label: "年", p: chart.pillars.year },
    { label: "月", p: chart.pillars.month },
    { label: "日", p: chart.pillars.day },
    { label: "时", p: chart.pillars.hour },
  ];
  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-4">十神</h2>
      <table className="w-full font-serif">
        <thead>
          <tr className="text-xs text-ink-600 border-b border-gold/40">
            <th className="text-left py-2">柱</th>
            <th className="py-2">天干十神</th>
            <th className="py-2">地支本气十神</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, p }) => (
            <tr key={label} className="border-b border-gold/20 last:border-b-0">
              <td className="py-3 text-ink-600">{label}柱</td>
              <td className="py-3 text-center">
                {p.stemShiShen ?? <span className="text-cinnabar">日主</span>}
              </td>
              <td className="py-3 text-center">{p.branchShiShen ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PaperCard>
  );
}
