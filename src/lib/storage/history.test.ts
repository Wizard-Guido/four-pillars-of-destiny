import { describe, it, expect, beforeEach } from "vitest";
import { listHistory, saveHistory, removeHistory, clearHistory } from "./history";

describe("history storage", () => {
  beforeEach(() => localStorage.clear());

  it("saves and lists entries newest first", () => {
    saveHistory({ id: "1", label: "甲", chartJson: "{}", savedAt: 1 });
    saveHistory({ id: "2", label: "乙", chartJson: "{}", savedAt: 2 });
    expect(listHistory().map((h) => h.id)).toEqual(["2", "1"]);
  });

  it("caps at 10 entries", () => {
    for (let i = 0; i < 15; i++) {
      saveHistory({ id: String(i), label: `x${i}`, chartJson: "{}", savedAt: i });
    }
    expect(listHistory()).toHaveLength(10);
    expect(listHistory()[0].id).toBe("14");
  });

  it("removes by id", () => {
    saveHistory({ id: "1", label: "a", chartJson: "{}", savedAt: 1 });
    saveHistory({ id: "2", label: "b", chartJson: "{}", savedAt: 2 });
    removeHistory("1");
    expect(listHistory().map((h) => h.id)).toEqual(["2"]);
  });

  it("clears all", () => {
    saveHistory({ id: "1", label: "a", chartJson: "{}", savedAt: 1 });
    clearHistory();
    expect(listHistory()).toEqual([]);
  });
});
