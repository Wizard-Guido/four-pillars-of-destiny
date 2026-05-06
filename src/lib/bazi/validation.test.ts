import { describe, it } from "vitest";
import { computeChart } from "./calculator";

describe("cross-validation: 3 sample cases produce structurally valid charts", () => {
  const cases = [
    { name: "1980-08-15 06:30 male, Beijing", input: { gender: "男" as const, calendar: "solar" as const, year: 1980, month: 8, day: 15, hour: 6, minute: 30, longitude: 116.41 } },
    { name: "1995-12-22 22:15 female, Shanghai", input: { gender: "女" as const, calendar: "solar" as const, year: 1995, month: 12, day: 22, hour: 22, minute: 15, longitude: 121.47 } },
    { name: "2003-03-08 14:00 male, Guangzhou", input: { gender: "男" as const, calendar: "solar" as const, year: 2003, month: 3, day: 8, hour: 14, minute: 0, longitude: 113.27 } },
  ];

  for (const c of cases) {
    it(`${c.name} produces a valid chart`, ({ expect }) => {
      const chart = computeChart(c.input);
      const p = chart.pillars;

      console.log(`\n[VALIDATION] ${c.name}`);
      console.log(`  四柱：年 ${p.year.stem}${p.year.branch}  月 ${p.month.stem}${p.month.branch}  日 ${p.day.stem}${p.day.branch}  时 ${p.hour.stem}${p.hour.branch}`);
      console.log(`  日主：${chart.dayMaster.stem}${chart.dayMaster.element}（${chart.dayMaster.polarity}） 生肖：${chart.zodiac}`);
      console.log(`  五行：木${chart.wuxing.木} 火${chart.wuxing.火} 土${chart.wuxing.土} 金${chart.wuxing.金} 水${chart.wuxing.水}`);
      console.log(`  强弱：${chart.dayMasterStrength}  喜：${chart.favorableElements.join("、")}  忌：${chart.unfavorableElements.join("、")}`);
      const cur = chart.dayun.find((d) => d.isCurrent);
      if (cur) console.log(`  现行大运：${cur.pillar.stem}${cur.pillar.branch} (${cur.startYear}-${cur.startYear + 9})`);

      // structural invariants
      expect(chart.dayun).toHaveLength(10);
      const total = chart.wuxing.木 + chart.wuxing.火 + chart.wuxing.土 + chart.wuxing.金 + chart.wuxing.水;
      expect(total).toBeGreaterThan(0);
      for (let i = 1; i < chart.dayun.length; i++) {
        expect(chart.dayun[i].startYear).toBeGreaterThan(chart.dayun[i - 1].startYear);
      }
      // day-master element matches day stem element
      expect(chart.dayMaster.stem).toBe(p.day.stem);
      // zodiac matches year branch
      const zodiacMap: Record<string, string> = { 子:"鼠",丑:"牛",寅:"虎",卯:"兔",辰:"龙",巳:"蛇",午:"马",未:"羊",申:"猴",酉:"鸡",戌:"狗",亥:"猪" };
      expect(chart.zodiac).toBe(zodiacMap[p.year.branch]);
    });
  }
});
