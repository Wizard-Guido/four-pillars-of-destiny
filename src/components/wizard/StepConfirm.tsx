"use client";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { OrnamentDivider } from "@/components/common/OrnamentDivider";

interface StepConfirmProps {
  onSubmit: () => void;
}

export function StepConfirm({ onSubmit }: StepConfirmProps) {
  const { draft, prev } = useWizard();
  const cal = draft.calendar === "solar" ? "阳历" : "农历";
  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">确认信息</h2>
      <p className="text-ink-600 text-sm mb-6">请核对以下信息，无误后开始排盘。</p>

      <dl className="space-y-3 font-serif text-lg">
        <Row k="姓名" v={draft.name || "（未填）"} />
        <Row k="性别" v={draft.gender ?? ""} />
        <Row k="历法" v={cal} />
        <Row k="日期" v={`${draft.year}年 ${draft.month}月 ${draft.day}日${draft.isLeapMonth ? "（闰）" : ""}`} />
        <Row k="时辰" v={`${draft.hour}时`} />
        <Row k="出生地" v={draft.city || "未填（按北京时间）"} />
      </dl>

      <OrnamentDivider />

      <div className="flex justify-between">
        <InkButton variant="ghost" onClick={prev}>上一步</InkButton>
        <InkButton onClick={onSubmit}>开始排盘</InkButton>
      </div>
    </PaperCard>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <dt className="w-20 text-sm text-ink-600">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
