"use client";
import { useEffect, useRef, useState } from "react";
import type { BaziChart } from "@/lib/bazi/types";
import type { ReadingTopic } from "@/lib/qwen/prompts";
import { PaperCard } from "@/components/common/PaperCard";
import { OrnamentDivider } from "@/components/common/OrnamentDivider";
import { generateLocalReading } from "@/lib/bazi/local-analysis";
import { loadApiKey } from "@/lib/storage/api-key";
import { cn } from "@/lib/cn";

const TOPICS: { id: ReadingTopic; label: string }[] = [
  { id: "personality", label: "性格" },
  { id: "career", label: "事业" },
  { id: "relationship", label: "感情" },
  { id: "health", label: "健康" },
];

interface Props {
  chart: BaziChart;
  onConfigureKey?: () => void;
}

type CacheMap = Partial<Record<ReadingTopic, string>>;
type ErrorMap = Partial<Record<ReadingTopic, string>>;

export function DeepAnalysisPanel({ chart, onConfigureKey }: Props) {
  const [active, setActive] = useState<ReadingTopic>("personality");
  const [texts, setTexts] = useState<CacheMap>({});
  const [errors, setErrors] = useState<ErrorMap>({});
  const [loadingTopic, setLoadingTopic] = useState<ReadingTopic | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const local = generateLocalReading(chart);

  useEffect(() => {
    setHasKey(!!loadApiKey());
    const handler = () => setHasKey(!!loadApiKey());
    window.addEventListener("bazi:apikey-changed", handler);
    return () => window.removeEventListener("bazi:apikey-changed", handler);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = async (topic: ReadingTopic, force = false) => {
    setActive(topic);
    if (!force && texts[topic]) return; // cached — just switch
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTexts((m) => ({ ...m, [topic]: "" }));
    setErrors((m) => ({ ...m, [topic]: undefined }));
    setLoadingTopic(topic);
    try {
      const saved = loadApiKey();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (saved?.key) {
        headers.Authorization = `Bearer ${saved.key}`;
        headers["X-Qwen-Region"] = saved.region;
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ chart, topic }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "请求失败");
        setErrors((m) => ({ ...m, [topic]: errText }));
        setTexts((m) => ({ ...m, [topic]: undefined }));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setTexts((m) => ({ ...m, [topic]: (m[topic] ?? "") + chunk }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setErrors((m) => ({ ...m, [topic]: String(e) }));
        setTexts((m) => ({ ...m, [topic]: undefined }));
      }
    } finally {
      setLoadingTopic((cur) => (cur === topic ? null : cur));
    }
  };

  const text = texts[active] ?? "";
  const error = errors[active];
  const loading = loadingTopic === active;

  return (
    <PaperCard>
      <header className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-2xl">深度解读</h2>
        <span className="text-xs text-ink-600">由 Qwen 参照命理典籍生成</span>
      </header>

      <div className="flex items-end justify-between border-b border-gold/40 mb-4">
        <div role="tablist" className="flex gap-1">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={active === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => run(t.id)}
              className={cn(
                "px-4 py-2 font-serif text-base min-h-[44px] transition-colors",
                active === t.id
                  ? "text-cinnabar border-b-2 border-cinnabar -mb-px"
                  : "text-ink-600 hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {!hasKey && onConfigureKey && (
          <button
            type="button"
            onClick={onConfigureKey}
            className="text-xs text-cinnabar hover:underline pb-2 pr-1 shrink-0"
          >
            未配置 AI Key，点击配置
          </button>
        )}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
      >
        {!text && !loading && !error && (
          <div className="text-ink-600 text-sm space-y-3">
            <p className="font-serif text-base text-ink">{local.summary}</p>
            <ul className="list-disc pl-5 space-y-1">
              {local.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
            <p className="text-xs italic mt-4">点击上方任一类目，调用 AI 生成深度解读。</p>
          </div>
        )}

        {(text || loading) && (
          <>
            <article className="font-serif text-base leading-[1.85] whitespace-pre-wrap">
              {text || (
                <span className="text-ink-600 inline-flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-cinnabar animate-pulse" />
                  墨迹晕开中…
                </span>
              )}
              {loading && text && (
                <span className="inline-block w-2 h-4 ml-1 bg-cinnabar/60 animate-pulse align-middle" />
              )}
            </article>
            {text && !loading && (
              <button
                type="button"
                onClick={() => run(active, true)}
                className="mt-3 text-xs text-ink-600 hover:text-cinnabar transition-colors"
              >
                ↻ 重新生成
              </button>
            )}
          </>
        )}

        {error && (
          <div className="bg-cinnabar text-paper px-4 py-2 mt-4 text-sm rounded-sm">
            解读出错：{error}
          </div>
        )}
      </div>

      <OrnamentDivider />
      <p className="text-xs text-ink-600 italic">本解读仅供文化娱乐参考，不构成任何决策建议。</p>
    </PaperCard>
  );
}
