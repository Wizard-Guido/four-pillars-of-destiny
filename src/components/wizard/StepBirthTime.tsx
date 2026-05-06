"use client";
import { useState } from "react";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

const SHICHEN: { branch: string; range: string; hour: number }[] = [
  { branch: "子", range: "23-01", hour: 23 },
  { branch: "丑", range: "01-03", hour: 1 },
  { branch: "寅", range: "03-05", hour: 3 },
  { branch: "卯", range: "05-07", hour: 5 },
  { branch: "辰", range: "07-09", hour: 7 },
  { branch: "巳", range: "09-11", hour: 9 },
  { branch: "午", range: "11-13", hour: 11 },
  { branch: "未", range: "13-15", hour: 13 },
  { branch: "申", range: "15-17", hour: 15 },
  { branch: "酉", range: "17-19", hour: 17 },
  { branch: "戌", range: "19-21", hour: 19 },
  { branch: "亥", range: "21-23", hour: 21 },
];

export function StepBirthTime() {
  const { setTime, next, prev, draft } = useWizard();
  const [selected, setSelected] = useState<number>(draft.hour ?? 12);

  const submit = () => {
    setTime(selected, 0);
    next();
  };

  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">出生时辰</h2>
      <p className="text-ink-600 text-sm mb-6">十二时辰，选其一即可。</p>

      <div className="relative mx-auto w-[280px] h-[280px] my-4">
        <div className="absolute inset-0 rounded-full border border-gold/60" />
        <div className="absolute inset-6 rounded-full border border-gold/30" />
        {SHICHEN.map((sc, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
          const r = 110;
          const x = Math.cos(angle) * r + 140;
          const y = Math.sin(angle) * r + 140;
          const isSel = sc.hour === selected;
          return (
            <button
              key={sc.branch}
              onClick={() => setSelected(sc.hour)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full transition-all duration-300",
                "flex flex-col items-center justify-center font-serif",
                isSel
                  ? "bg-cinnabar text-paper scale-125 shadow-[0_0_20px_rgba(177,74,58,0.4)]"
                  : "bg-paper-2 text-ink hover:bg-paper",
              )}
              style={{ left: `${x}px`, top: `${y}px` }}
              aria-pressed={isSel}
              aria-label={`${sc.branch}时 ${sc.range}`}
            >
              <span className="text-lg leading-none">{sc.branch}</span>
              <span className="text-[10px] opacity-70">{sc.range}</span>
            </button>
          );
        })}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold"
          aria-hidden
        />
      </div>

      <div className="flex justify-between mt-4">
        <InkButton variant="ghost" onClick={prev}>上一步</InkButton>
        <InkButton onClick={submit}>下一步</InkButton>
      </div>
    </PaperCard>
  );
}
