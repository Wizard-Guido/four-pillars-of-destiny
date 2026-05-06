"use client";
import { useState } from "react";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => currentYear - i);

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function StepBirthDate() {
  const { draft, setCalendar, setDate, next, prev } = useWizard();
  const [year, setY] = useState<number>(draft.year ?? currentYear - 25);
  const [month, setM] = useState<number>(draft.month ?? 1);
  const [day, setD] = useState<number>(draft.day ?? 1);
  const [isLeap, setLeap] = useState<boolean>(draft.isLeapMonth ?? false);

  const days = Array.from(
    { length: draft.calendar === "lunar" ? 30 : daysInMonth(year, month) },
    (_, i) => i + 1,
  );

  const submit = () => {
    setDate(year, month, day, isLeap);
    next();
  };

  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-6">出生日期</h2>

      <div role="tablist" className="inline-flex border border-gold rounded-sm mb-6 overflow-hidden">
        {([
          { v: "solar", label: "阳历" },
          { v: "lunar", label: "农历" },
        ] as const).map((t) => (
          <button
            key={t.v}
            role="tab"
            aria-selected={draft.calendar === t.v}
            onClick={() => setCalendar(t.v)}
            className={cn(
              "px-5 py-2 font-serif transition-colors min-h-[44px]",
              draft.calendar === t.v ? "bg-cinnabar text-paper" : "text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <SelectField label="年" value={year} options={YEARS} onChange={setY} />
        <SelectField label="月" value={month} options={MONTHS} onChange={setM} />
        <SelectField label="日" value={day} options={days} onChange={setD} />
      </div>

      {draft.calendar === "lunar" && (
        <label className="flex items-center gap-2 mb-6 text-sm">
          <input
            type="checkbox"
            checked={isLeap}
            onChange={(e) => setLeap(e.target.checked)}
            className="w-4 h-4 accent-cinnabar"
          />
          <span>闰月</span>
        </label>
      )}

      <div className="flex justify-between">
        <InkButton variant="ghost" onClick={prev}>上一步</InkButton>
        <InkButton onClick={submit}>下一步</InkButton>
      </div>
    </PaperCard>
  );
}

function SelectField<T extends number>({
  label, value, options, onChange,
}: {
  label: string; value: T; options: T[]; onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-ink-600 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as T)}
        className="w-full min-h-[44px] bg-paper border border-gold/60 rounded-sm px-2 font-serif text-base focus:border-cinnabar outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
