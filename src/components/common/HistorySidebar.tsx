"use client";
import { useEffect, useState } from "react";
import { listHistory, removeHistory, clearHistory, type HistoryEntry } from "@/lib/storage/history";
import { cn } from "@/lib/cn";
import { InkButton } from "./InkButton";

interface Props {
  onPick: (entry: HistoryEntry) => void;
  open: boolean;
  onClose: () => void;
}

export function HistorySidebar({ onPick, open, onClose }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setEntries(listHistory());
  }, [open]);

  const refresh = () => setEntries(listHistory());

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-ink/20 z-40 transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed z-50 top-0 right-0 h-full w-[min(320px,86vw)] bg-paper shadow-paper",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="历史记录"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-gold/40">
          <h3 className="font-serif text-xl">历史</h3>
          <button onClick={onClose} aria-label="关闭" className="text-ink-600 px-2">×</button>
        </header>
        <div className="overflow-y-auto h-[calc(100%-130px)]">
          {entries.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-600">暂无记录</p>
          ) : (
            <ul>
              {entries.map((e) => (
                <li key={e.id} className="border-b border-gold/20 last:border-b-0">
                  <button
                    onClick={() => { onPick(e); onClose(); }}
                    className="w-full text-left px-5 py-3 hover:bg-paper-2 transition-colors"
                  >
                    <div className="font-serif">{e.label}</div>
                    <div className="text-xs text-ink-600 mt-1">
                      {new Date(e.savedAt).toLocaleString("zh-CN")}
                    </div>
                  </button>
                  <button
                    onClick={() => { removeHistory(e.id); refresh(); }}
                    className="px-5 py-1 text-xs text-ink-600 hover:text-cinnabar"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {entries.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-gold/40">
            <InkButton variant="ghost" onClick={() => { clearHistory(); refresh(); }} className="w-full">
              清空全部
            </InkButton>
          </div>
        )}
      </aside>
    </>
  );
}
