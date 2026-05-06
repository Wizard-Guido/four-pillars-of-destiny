import { describe, it, expect } from "vitest";
import { computeChart } from "./calculator";

describe("computeChart", () => {
  // Reference: 1990-01-01 12:00 Beijing, male, solar
  it("computes year/month/day/hour pillars correctly for 1990-01-01 12:00 male", () => {
    const chart = computeChart({
      gender: "男",
      calendar: "solar",
      year: 1990, month: 1, day: 1, hour: 12, minute: 0,
      longitude: 120,
    });
    // NOTE: Expected values verified against lunar-typescript output for 1990-01-01 12:00:00 CST.
    // Plan originally guessed day="辛巳" but library returns "丙寅".
    // Year/month/hour values match the plan. Day master is 丙 (Fire), not 辛.
    expect(chart.pillars.year.stem + chart.pillars.year.branch).toBe("己巳");
    expect(chart.pillars.month.stem + chart.pillars.month.branch).toBe("丙子");
    expect(chart.pillars.day.stem + chart.pillars.day.branch).toBe("丙寅");
    expect(chart.pillars.hour.stem + chart.pillars.hour.branch).toBe("甲午");
    expect(chart.dayMaster.stem).toBe("丙");
    expect(chart.dayMaster.element).toBe("火");
    expect(chart.zodiac).toBe("蛇");
  });

  it("returns 10 dayun steps with monotonically increasing startYear", () => {
    const chart = computeChart({
      gender: "男",
      calendar: "solar",
      year: 1990, month: 1, day: 1, hour: 12, minute: 0,
      longitude: 120,
    });
    expect(chart.dayun).toHaveLength(10);
    for (let i = 1; i < chart.dayun.length; i++) {
      expect(chart.dayun[i].startYear).toBeGreaterThan(chart.dayun[i - 1].startYear);
    }
  });

  it("attaches ten-gods to non-day pillars but not day pillar stem", () => {
    const chart = computeChart({
      gender: "男",
      calendar: "solar",
      year: 1990, month: 1, day: 1, hour: 12, minute: 0,
      longitude: 120,
    });
    expect(chart.pillars.year.stemShiShen).toBeDefined();
    expect(chart.pillars.day.stemShiShen).toBeUndefined();
  });

  it("wuxing scores include all five elements with non-negative values", () => {
    const chart = computeChart({
      gender: "男",
      calendar: "solar",
      year: 1990, month: 1, day: 1, hour: 12, minute: 0,
      longitude: 120,
    });
    const total = chart.wuxing.木 + chart.wuxing.火 + chart.wuxing.土 + chart.wuxing.金 + chart.wuxing.水;
    expect(total).toBeGreaterThan(0);
    (["木","火","土","金","水"] as const).forEach((el) => {
      expect(chart.wuxing[el]).toBeGreaterThanOrEqual(0);
    });
  });
});
