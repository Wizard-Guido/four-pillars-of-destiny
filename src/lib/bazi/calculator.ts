import { Solar, Lunar } from "lunar-typescript";
import type {
  BirthInput, BaziChart, Pillar, DayunStep, Stem, Branch, Element, WuxingScore,
} from "./types";
import {
  STEM_ELEMENT, STEM_POLARITY, BRANCH_ELEMENT, HIDDEN_STEMS, ZODIAC,
  MONTH_BRANCH_SEASON,
} from "./constants";
import { computeShiShen } from "./shishen";
import { applyTrueSolarTime } from "./solar-time";

const STEM_RE = /[甲乙丙丁戊己庚辛壬癸]/;
const BRANCH_RE = /[子丑寅卯辰巳午未申酉戌亥]/;

function parseGZ(gz: string): { stem: Stem; branch: Branch } {
  const stem = gz.match(STEM_RE)?.[0] as Stem;
  const branch = gz.match(BRANCH_RE)?.[0] as Branch;
  if (!stem || !branch) throw new Error(`Invalid GZ: ${gz}`);
  return { stem, branch };
}

function buildPillar(gz: string, dayMaster: Stem | null, naYin?: string): Pillar {
  const { stem, branch } = parseGZ(gz);
  const hidden = HIDDEN_STEMS[branch];
  const pillar: Pillar = {
    stem,
    branch,
    hiddenStems: hidden,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
    naYin,
  };
  if (dayMaster) {
    pillar.stemShiShen = computeShiShen(dayMaster, stem);
    pillar.branchShiShen = computeShiShen(dayMaster, hidden[0]);
  }
  return pillar;
}

function computeWuxing(pillars: Pillar[]): WuxingScore {
  const score: WuxingScore = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach((p) => {
    score[p.stemElement] += 2;
    p.hiddenStems.forEach((s, idx) => {
      const weight = idx === 0 ? 3 : idx === 1 ? 1.5 : 0.5;
      score[STEM_ELEMENT[s]] += weight;
    });
  });
  return score;
}

function classifyStrength(
  dmElement: Element,
  monthBranch: Branch,
  wuxing: WuxingScore,
): BaziChart["dayMasterStrength"] {
  const seasonEl = MONTH_BRANCH_SEASON[monthBranch];
  const seasonBoost = seasonEl === dmElement ? 4 : 0;
  const supportMap: Record<Element, Element> = { 木: "水", 火: "木", 土: "火", 金: "土", 水: "金" };
  const support = wuxing[supportMap[dmElement]];
  const same = wuxing[dmElement];
  const total = same + support + seasonBoost;
  const grand = wuxing.木 + wuxing.火 + wuxing.土 + wuxing.金 + wuxing.水;
  const ratio = total / Math.max(grand, 1);
  if (ratio < 0.18) return "极弱";
  if (ratio < 0.30) return "弱";
  if (ratio < 0.45) return "中和";
  if (ratio < 0.60) return "强";
  return "极强";
}

function favorableElements(
  dmElement: Element,
  strength: BaziChart["dayMasterStrength"],
): { favorable: Element[]; unfavorable: Element[] } {
  const generates: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const overcomes: Record<Element, Element> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
  const supportedBy: Record<Element, Element> = { 木: "水", 火: "木", 土: "火", 金: "土", 水: "金" };
  const overcomeBy: Record<Element, Element> = { 木: "金", 火: "水", 土: "木", 金: "火", 水: "土" };

  if (strength === "弱" || strength === "极弱") {
    return {
      favorable: [supportedBy[dmElement], dmElement],
      unfavorable: [overcomes[dmElement], overcomeBy[dmElement], generates[dmElement]],
    };
  }
  if (strength === "强" || strength === "极强") {
    return {
      favorable: [overcomes[dmElement], overcomeBy[dmElement], generates[dmElement]],
      unfavorable: [supportedBy[dmElement], dmElement],
    };
  }
  return {
    favorable: [overcomes[dmElement], generates[dmElement]],
    unfavorable: [overcomeBy[dmElement]],
  };
}

export function computeChart(input: BirthInput): BaziChart {
  const corrected = applyTrueSolarTime(
    { year: input.year, month: input.month, day: input.day, hour: input.hour, minute: input.minute },
    input.longitude,
  );

  // For lunar calendar, a leap month is encoded as a negative month number in
  // lunar-typescript (e.g. leap 4th month = -4). Pass the negative value when
  // isLeapMonth is true so the library selects the correct intercalary month.
  const lunarMonth =
    input.calendar === "lunar" && input.isLeapMonth
      ? -corrected.month
      : corrected.month;

  const solar =
    input.calendar === "solar"
      ? Solar.fromYmdHms(corrected.year, corrected.month, corrected.day, corrected.hour, corrected.minute, 0)
      : Lunar.fromYmdHms(corrected.year, lunarMonth, corrected.day, corrected.hour, corrected.minute, 0).getSolar();

  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const dayGZ = ec.getDay();
  const dayMaster = parseGZ(dayGZ).stem;

  const yearPillar = buildPillar(ec.getYear(), dayMaster, ec.getYearNaYin());
  const monthPillar = buildPillar(ec.getMonth(), dayMaster, ec.getMonthNaYin());
  const dayPillar = buildPillar(ec.getDay(), dayMaster, ec.getDayNaYin());
  // Day stem is the day-master itself; clear stemShiShen.
  dayPillar.stemShiShen = undefined;
  const hourPillar = buildPillar(ec.getTime(), dayMaster, ec.getTimeNaYin());

  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const wuxing = computeWuxing(allPillars);
  const dmElement = STEM_ELEMENT[dayMaster];
  const strength = classifyStrength(dmElement, monthPillar.branch, wuxing);
  const fav = favorableElements(dmElement, strength);

  // gender: 1 = male, 0 = female (per lunar-typescript Yun constructor)
  const yun = ec.getYun(input.gender === "男" ? 1 : 0);
  // Request 11 entries: index 0 has empty GZ (pre-yun period), indices 1–10 are the 10 actual steps.
  const dayunArr = yun.getDaYun(11);
  // Skip index 0 (pre-yun "起运前" period with empty GanZhi).
  // isCurrent is intentionally omitted here — DayunTimeline derives it at
  // render time from startYear so it stays accurate after localStorage round-trips.
  const dayun: DayunStep[] = dayunArr.slice(1, 11).map((d, i) => {
    const stepPillar = buildPillar(d.getGanZhi(), dayMaster);
    const startYear = d.getStartYear();
    return {
      index: i,
      startAge: d.getStartAge(),
      startYear,
      pillar: stepPillar,
    };
  });

  return {
    input,
    solarDate: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      hour: corrected.hour,
      minute: corrected.minute,
    },
    lunarDate: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeap: false,
    },
    zodiac: ZODIAC[yearPillar.branch],
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    dayMaster: {
      stem: dayMaster,
      element: dmElement,
      polarity: STEM_POLARITY[dayMaster],
    },
    wuxing,
    dayMasterStrength: strength,
    favorableElements: fav.favorable,
    unfavorableElements: fav.unfavorable,
    dayun,
  };
}
