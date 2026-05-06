import { describe, it, expect } from "vitest";
import { applyTrueSolarTime } from "./solar-time";

describe("applyTrueSolarTime", () => {
  it("returns same time when longitude = 120 (Beijing)", () => {
    const result = applyTrueSolarTime({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 }, 120);
    expect(result).toEqual({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 });
  });
  it("subtracts 4 minutes per degree west of 120", () => {
    const result = applyTrueSolarTime({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 }, 116);
    expect(result.minute).toBe(44);
    expect(result.hour).toBe(11);
  });
  it("adds 4 minutes per degree east of 120", () => {
    const result = applyTrueSolarTime({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 }, 121);
    expect(result.minute).toBe(4);
    expect(result.hour).toBe(12);
  });
  it("rolls over to previous day if minute underflows", () => {
    const result = applyTrueSolarTime({ year: 2000, month: 1, day: 2, hour: 0, minute: 10 }, 116);
    expect(result.day).toBe(1);
    expect(result.hour).toBe(23);
    expect(result.minute).toBe(54);
  });
});
