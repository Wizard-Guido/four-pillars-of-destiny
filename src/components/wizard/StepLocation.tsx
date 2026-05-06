"use client";
import { useMemo, useState } from "react";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { CITIES } from "@/lib/data/cn-cities";
import { cn } from "@/lib/cn";

export function StepLocation() {
  const { setLocation, next, prev, draft } = useWizard();
  const [query, setQuery] = useState(draft.city ?? "");
  const [picked, setPicked] = useState<{ name: string; longitude: number } | null>(
    draft.city && draft.longitude ? { name: draft.city, longitude: draft.longitude } : null,
  );

  const matches = useMemo(() => {
    if (!query) return CITIES.slice(0, 8);
    return CITIES.filter((c) => c.name.includes(query) || c.province.includes(query)).slice(0, 8);
  }, [query]);

  const submit = () => {
    if (!picked) return;
    setLocation(picked.name, picked.longitude);
    next();
  };

  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">出生方位</h2>
      <p className="text-ink-600 text-sm mb-6">用于真太阳时校正。可跳过，将以北京时间计算。</p>

      <label className="block mb-3">
        <span className="sr-only">搜索城市</span>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPicked(null); }}
          placeholder="搜索城市…"
          className="w-full min-h-[44px] bg-transparent border-b border-gold py-2 px-1 font-serif text-lg focus:outline-none focus:border-cinnabar"
        />
      </label>

      <ul className="space-y-1 mb-6 max-h-56 overflow-y-auto">
        {matches.map((c) => (
          <li key={c.name}>
            <button
              type="button"
              onClick={() => { setPicked({ name: c.name, longitude: c.longitude }); setQuery(c.name); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-sm font-serif transition-colors",
                picked?.name === c.name ? "bg-cinnabar text-paper" : "hover:bg-paper",
              )}
            >
              <span>{c.name}</span>
              <span className="text-xs ml-2 opacity-60">{c.province} · {c.longitude.toFixed(2)}°E</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between">
        <InkButton variant="ghost" onClick={prev}>上一步</InkButton>
        <div className="flex gap-2">
          <InkButton variant="outline" onClick={() => { setLocation("北京", 120); next(); }}>
            跳过
          </InkButton>
          <InkButton onClick={submit} disabled={!picked}>下一步</InkButton>
        </div>
      </div>
    </PaperCard>
  );
}
