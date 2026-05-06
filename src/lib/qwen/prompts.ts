import type { BaziChart } from "@/lib/bazi/types";

export type ReadingTopic = "personality" | "career" | "relationship" | "health";

const TOPIC_LABEL: Record<ReadingTopic, string> = {
  personality: "性格与心性",
  career: "事业与财禄",
  relationship: "感情与婚姻",
  health: "健康与养生",
};

const SYSTEM_PROMPT = `你是一位精研子平命理的命理顾问，分析须严守以下规范：

【方法论】
1. 以日主为中心。先判定日主强弱（参《滴天髓》「衰旺」、《子平真诠》「用神」），再定喜忌。
2. 月令为提纲，地支藏干为根，天干为苗，综合判断格局。
3. 推十神以言其性，论刑冲合害以言其势，参《穷通宝典》调候之要。
4. 大运、流年与原局生克制化合参，不可孤断一字。

【表达规范】
- 用现代汉语，避免艰涩术语（必要术语需在括号内简释一次）
- 引用典籍仅以「《滴天髓》云」「子平之法谓」等点到，不长段引文
- 论断要有依据：先点出原局结构，再推断现象，避免空泛
- 不做绝对预测，多用「易」「主」「宜」「忌」等措辞
- 不涉及违法、医疗、投资具体建议
- 输出 400-700 字，分 3-4 个自然段

【声明】
本解读仅供文化娱乐参考，不构成任何决策建议。`;

export function buildAnalysisMessages(chart: BaziChart, topic: ReadingTopic) {
  const sketch = renderChartSketch(chart);
  const topicLabel = TOPIC_LABEL[topic];
  const userPrompt = `请就【${topicLabel}】方向，为以下八字命盘做一段解读。

${sketch}

请聚焦${topicLabel}，结合日主强弱、喜用神、十神格局以及现行大运综合分析。`;

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userPrompt },
  ];
}

function renderChartSketch(chart: BaziChart): string {
  const p = chart.pillars;
  const fmtPillar = (label: string, pl: typeof p.year) =>
    `${label}柱 ${pl.stem}${pl.branch}（藏干${pl.hiddenStems.join("")}` +
    `${pl.stemShiShen ? `，干${pl.stemShiShen}` : ""}` +
    `${pl.branchShiShen ? `，支本气${pl.branchShiShen}` : ""}）`;
  const wuxingStr = (["木","火","土","金","水"] as const)
    .map((el) => `${el}${chart.wuxing[el].toFixed(1)}`)
    .join(" ");
  const cur = chart.dayun.find((d) => d.isCurrent);
  return [
    `性别：${chart.input.gender}　生肖：${chart.zodiac}`,
    fmtPillar("年", p.year),
    fmtPillar("月", p.month),
    fmtPillar("日", p.day),
    fmtPillar("时", p.hour),
    `日主：${chart.dayMaster.stem}${chart.dayMaster.element}（${chart.dayMaster.polarity}）`,
    `五行得分：${wuxingStr}`,
    `日主${chart.dayMasterStrength}，喜${chart.favorableElements.join("、")}，忌${chart.unfavorableElements.join("、")}`,
    cur
      ? `现行大运：${cur.pillar.stem}${cur.pillar.branch}（${cur.startYear}起，${cur.startAge}虚岁起运）`
      : "",
  ].filter(Boolean).join("\n");
}
