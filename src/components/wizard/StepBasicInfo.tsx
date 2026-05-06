"use client";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

export function StepBasicInfo() {
  const { draft, setName, setGender, next } = useWizard();
  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">缘起</h2>
      <p className="text-ink-600 text-sm mb-6">命主姓名可不填，仅作记录之用。</p>

      <label className="block mb-5">
        <span className="block text-sm text-ink-600 mb-2">姓名</span>
        <input
          type="text"
          maxLength={20}
          value={draft.name ?? ""}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-gold py-2 px-1 font-serif text-lg focus:outline-none focus:border-cinnabar transition-colors"
          placeholder="（可选）"
        />
      </label>

      <fieldset className="mb-8">
        <legend className="text-sm text-ink-600 mb-3">性别</legend>
        <div className="flex gap-3">
          {(["男", "女"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={cn(
                "flex-1 min-h-[44px] border rounded-sm font-serif text-lg transition-all duration-300",
                draft.gender === g
                  ? "bg-cinnabar text-paper border-cinnabar"
                  : "border-gold text-ink hover:bg-paper",
              )}
              aria-pressed={draft.gender === g}
            >
              {g}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <InkButton onClick={next} disabled={!draft.gender}>下一步</InkButton>
      </div>
    </PaperCard>
  );
}
