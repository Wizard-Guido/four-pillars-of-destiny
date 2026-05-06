export type Stem = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";
export type Branch = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";
export type Element = "木" | "火" | "土" | "金" | "水";
export type Polarity = "阳" | "阴";
export type ShiShen =
  | "比肩" | "劫财" | "食神" | "伤官"
  | "偏财" | "正财" | "七杀" | "正官"
  | "偏印" | "正印";

export type Gender = "男" | "女";
export type CalendarType = "solar" | "lunar";

export interface BirthInput {
  name?: string;
  gender: Gender;
  calendar: CalendarType;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isLeapMonth?: boolean;
  longitude: number;
  city?: string;
}

export interface Pillar {
  stem: Stem;
  branch: Branch;
  hiddenStems: Stem[];
  stemElement: Element;
  branchElement: Element;
  stemShiShen?: ShiShen;
  branchShiShen?: ShiShen;
  naYin?: string;
}

export interface DayunStep {
  index: number;
  startAge: number;
  startYear: number;
  pillar: Pillar;
  /** @deprecated Computed at render time in DayunTimeline; not stored. */
  isCurrent?: boolean;
}

export interface WuxingScore {
  木: number; 火: number; 土: number; 金: number; 水: number;
}

export interface BaziChart {
  input: BirthInput;
  solarDate: { year: number; month: number; day: number; hour: number; minute: number };
  lunarDate: { year: number; month: number; day: number; isLeap: boolean };
  zodiac: string;
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar };
  dayMaster: { stem: Stem; element: Element; polarity: Polarity };
  wuxing: WuxingScore;
  dayMasterStrength: "极弱" | "弱" | "中和" | "强" | "极强";
  favorableElements: Element[];
  unfavorableElements: Element[];
  dayun: DayunStep[];
}
