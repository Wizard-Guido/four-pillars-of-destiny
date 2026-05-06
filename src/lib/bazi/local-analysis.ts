import type { BaziChart } from "./types";

export interface LocalReading {
  summary: string;
  bullets: string[];
}

export function generateLocalReading(chart: BaziChart): LocalReading {
  const dm = chart.dayMaster;
  const strength = chart.dayMasterStrength;
  const fav = chart.favorableElements.join("、");
  const unfav = chart.unfavorableElements.join("、");
  const currentDayun = chart.dayun.find((d) => d.isCurrent);

  const summary =
    `命主以${dm.stem}${dm.element}为日主，` +
    `${dm.polarity}干，性属${dm.element}。` +
    `综合月令与地支藏干，日主气势${strength}，喜${fav}，忌${unfav}。`;

  const bullets: string[] = [
    `日主：${dm.stem}（${dm.element}${dm.polarity}）`,
    `强弱：${strength}`,
    `喜用：${fav}`,
    `忌神：${unfav}`,
  ];
  if (currentDayun) {
    bullets.push(
      `现行大运：${currentDayun.pillar.stem}${currentDayun.pillar.branch}` +
        `（${currentDayun.startYear}—${currentDayun.startYear + 9}）`,
    );
  }
  bullets.push("以上为基础排盘，更详尽解读请配置 AI 服务。");
  return { summary, bullets };
}
