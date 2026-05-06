"use client";
import { useState } from "react";
import { Hero } from "@/components/Hero";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StepBasicInfo } from "@/components/wizard/StepBasicInfo";
import { StepBirthDate } from "@/components/wizard/StepBirthDate";
import { StepBirthTime } from "@/components/wizard/StepBirthTime";
import { StepLocation } from "@/components/wizard/StepLocation";
import { StepConfirm } from "@/components/wizard/StepConfirm";
import { ChartView } from "@/components/chart/ChartView";
import { HistorySidebar } from "@/components/common/HistorySidebar";
import { SealLogo } from "@/components/common/SealLogo";
import { useWizard } from "@/lib/state/wizard-store";
import { computeChart } from "@/lib/bazi/calculator";
import type { BaziChart } from "@/lib/bazi/types";
import { saveHistory, type HistoryEntry } from "@/lib/storage/history";

type View = "hero" | "wizard" | "result";

export default function HomePage() {
  const [view, setView] = useState<View>("hero");
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const wizard = useWizard();

  const submit = () => {
    const input = wizard.toBirthInput();
    if (!input) return;
    const c = computeChart(input);
    setChart(c);
    setView("result");
    saveHistory({
      id: `${Date.now()}`,
      label:
        (input.name || "无名命主") +
        ` · ${input.year}.${input.month}.${input.day}`,
      chartJson: JSON.stringify(c),
      savedAt: Date.now(),
    });
  };

  const reset = () => {
    wizard.reset();
    setChart(null);
    setView("hero");
  };

  const start = () => {
    wizard.reset();
    setView("wizard");
  };

  const pickHistory = (e: HistoryEntry) => {
    try {
      setChart(JSON.parse(e.chartJson) as BaziChart);
      setView("result");
    } catch {
      // ignore corrupt entry
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gold/30">
        <button onClick={reset} aria-label="返回首页" className="flex items-center gap-2">
          <SealLogo size={28} />
          <span className="font-serif text-lg">四柱</span>
        </button>
        <button
          onClick={() => setHistoryOpen(true)}
          className="text-ink-600 font-sans text-sm min-h-[44px] px-3"
        >
          历史
        </button>
      </header>

      {view === "hero" && <Hero onStart={start} />}
      {view === "wizard" && (
        <WizardShell
          steps={[
            <StepBasicInfo key="0" />,
            <StepBirthDate key="1" />,
            <StepBirthTime key="2" />,
            <StepLocation key="3" />,
            <StepConfirm key="4" onSubmit={submit} />,
          ]}
        />
      )}
      {view === "result" && chart && <ChartView chart={chart} onReset={reset} />}

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onPick={pickHistory}
      />
    </>
  );
}
