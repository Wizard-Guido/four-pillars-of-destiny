import { describe, it, expect } from "vitest";
import { computeShiShen } from "./shishen";

describe("computeShiShen", () => {
  it("same stem with same polarity = 比肩", () => {
    expect(computeShiShen("甲", "甲")).toBe("比肩");
  });
  it("same element with opposite polarity = 劫财", () => {
    expect(computeShiShen("甲", "乙")).toBe("劫财");
  });
  it("day-master generates with same polarity = 食神", () => {
    expect(computeShiShen("甲", "丙")).toBe("食神");
  });
  it("day-master generates with opposite polarity = 伤官", () => {
    expect(computeShiShen("甲", "丁")).toBe("伤官");
  });
  it("day-master overcomes with same polarity = 偏财", () => {
    expect(computeShiShen("甲", "戊")).toBe("偏财");
  });
  it("day-master overcomes with opposite polarity = 正财", () => {
    expect(computeShiShen("甲", "己")).toBe("正财");
  });
  it("overcomes day-master with same polarity = 七杀", () => {
    expect(computeShiShen("甲", "庚")).toBe("七杀");
  });
  it("overcomes day-master with opposite polarity = 正官", () => {
    expect(computeShiShen("甲", "辛")).toBe("正官");
  });
  it("generates day-master with same polarity = 偏印", () => {
    expect(computeShiShen("甲", "壬")).toBe("偏印");
  });
  it("generates day-master with opposite polarity = 正印", () => {
    expect(computeShiShen("甲", "癸")).toBe("正印");
  });
});
