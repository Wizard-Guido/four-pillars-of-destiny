"use client";
import { cn } from "@/lib/cn";

const labels = ["缘起", "出生", "时辰", "方位", "确认"];

export function StepIndicator({ current }: { current: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex items-center justify-center gap-3 sm:gap-5 my-8">
      {labels.map((label, idx) => {
        const done = current > idx;
        const active = current === idx;
        return (
          <li key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "w-3 h-3 rounded-full border border-gold transition-all duration-300",
                  done && "bg-gold",
                  active && "bg-cinnabar border-cinnabar shadow-[0_0_12px_rgba(177,74,58,0.5)] scale-125",
                )}
                aria-current={active ? "step" : undefined}
              />
              <span className={cn("text-xs font-sans", active ? "text-ink" : "text-ink-600")}>
                {label}
              </span>
            </div>
            {idx < labels.length - 1 && <span className="w-8 sm:w-12 h-px bg-gold/50" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
