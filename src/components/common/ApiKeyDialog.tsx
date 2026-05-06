"use client";
import { useEffect, useState } from "react";
import { InkButton } from "./InkButton";
import { OrnamentDivider } from "./OrnamentDivider";
import { loadApiKey, saveApiKey, clearApiKey, maskKey } from "@/lib/storage/api-key";
import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type Status = "idle" | "validating" | "ok" | "error";

export function ApiKeyDialog({ open, onClose, onSaved }: Props) {
  const [key, setKey] = useState("");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [existing, setExisting] = useState<{ key: string; remember: boolean } | null>(null);

  useEffect(() => {
    if (open) {
      const e = loadApiKey();
      setExisting(e);
      setKey("");
      setRemember(e?.remember ?? true);
      setStatus("idle");
      setMessage("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const validateAndSave = async () => {
    if (!key.trim()) {
      setStatus("error");
      setMessage("请先输入 API Key。");
      return;
    }
    setStatus("validating");
    setMessage("");
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      if (res.ok) {
        saveApiKey(key.trim(), remember);
        setStatus("ok");
        setMessage("校验通过，已保存。");
        setTimeout(() => {
          onSaved?.();
          onClose();
        }, 800);
      } else {
        const txt = await res.text();
        setStatus("error");
        setMessage(txt || "校验失败");
      }
    } catch (e) {
      setStatus("error");
      setMessage(`网络错误：${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const onClear = () => {
    clearApiKey();
    setExisting(null);
    setMessage("已清除本地保存的 Key。");
    setStatus("idle");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/40 flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-dialog-title"
    >
      <div className="bg-paper shadow-paper rounded-sm w-full max-w-md p-6 sm:p-8">
        <h2 id="api-key-dialog-title" className="font-serif text-2xl mb-2">
          AI 解读设置
        </h2>
        <p className="text-sm text-ink-600 mb-5">
          配置 Qwen（通义千问）API Key 以启用深度命理解读。
          <a
            href="https://bailian.console.aliyun.com/"
            target="_blank"
            rel="noreferrer"
            className="text-cinnabar underline ml-1"
          >
            前往阿里云百炼申请
          </a>
        </p>

        {existing && (
          <div className="mb-4 p-3 bg-paper-2 rounded-sm">
            <div className="text-xs text-ink-600 mb-1">当前已保存</div>
            <div className="font-mono text-sm">{maskKey(existing.key)}</div>
            <div className="text-xs text-ink-600 mt-1">
              存储位置：{existing.remember ? "本地永久（localStorage）" : "仅本次会话（sessionStorage）"}
            </div>
            <button
              type="button"
              onClick={onClear}
              className="mt-2 text-xs text-cinnabar hover:underline"
            >
              清除已保存的 Key
            </button>
          </div>
        )}

        <label className="block mb-3">
          <span className="block text-sm text-ink-600 mb-1">
            {existing ? "替换为新的 Key" : "输入 API Key"}
          </span>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-..."
            className="w-full min-h-[44px] bg-transparent border border-gold/60 rounded-sm px-3 font-mono text-sm focus:outline-none focus:border-cinnabar"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <label className="flex items-center gap-2 mb-5 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 accent-cinnabar"
          />
          <span>下次仍记住（关闭则仅当前会话有效，浏览器关掉就忘）</span>
        </label>

        <p className="text-xs text-ink-600 mb-5 italic">
          Key 仅保存在你的浏览器中，请勿在他人设备上输入。每次解读时会通过本站后端转发到阿里云。
        </p>

        {message && (
          <div
            className={cn(
              "text-sm px-3 py-2 mb-4 rounded-sm",
              status === "error" && "bg-cinnabar text-paper",
              status === "ok" && "bg-celadon text-paper",
              status === "validating" && "bg-paper-2 text-ink-600",
            )}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        <OrnamentDivider />

        <div className="flex justify-end gap-2">
          <InkButton variant="ghost" onClick={onClose}>取消</InkButton>
          <InkButton onClick={validateAndSave} disabled={status === "validating"}>
            {status === "validating" ? "校验中…" : "验证并保存"}
          </InkButton>
        </div>
      </div>
    </div>
  );
}
