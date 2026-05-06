# 四柱八字 Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-friendly Chinese-aesthetic 八字 (Bazi / Four Pillars) web app: 4-step wizard for input, local rule-based chart calculation, Qwen API streaming for deep readings, localStorage history.

**Architecture:** Next.js 14 App Router with TypeScript. Bazi calculation runs entirely client-side using `lunar-typescript`. Qwen calls go through a server-side API route to keep the API key safe. State via zustand for the wizard, localStorage for history. UI built on Tailwind + shadcn/ui, customized to a "新中式现代" (modern Chinese) aesthetic.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, framer-motion, zustand, lunar-typescript, recharts, eventsource-parser, vitest, @testing-library/react.

**Reference spec:** [docs/superpowers/specs/2026-05-06-bazi-web-app-design.md](../specs/2026-05-06-bazi-web-app-design.md)

**Two skills invoked during implementation:**
- `bazi` skill — when authoring `lib/qwen/prompts.ts` and `lib/bazi/local-analysis.ts`, invoke for typology references (穷通宝典 / 滴天髓 / 子平真诠) and for cross-checking calculator output on canonical cases.
- `ui-ux-pro-max` skill — invoke at the start of Phase 4 for new-Chinese palette/typography validation and component pattern references.

---

## Phase 1 — Foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `.gitignore`, `.eslintrc.json`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js with TypeScript + Tailwind**

Run:
```bash
cd /Users/arieskoo/Projects/FourPillarsOfDestiny
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir=false --import-alias "@/*" --eslint --use-npm --yes
```

When prompted to use existing files (the docs dir), confirm yes. After install, verify `src/app/page.tsx` exists.

- [ ] **Step 2: Add core runtime deps**

Run:
```bash
npm install lunar-typescript zustand framer-motion recharts eventsource-parser clsx tailwind-merge class-variance-authority lucide-react
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
```

- [ ] **Step 3: Configure path aliases and strict TS**

Replace `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Smoke test build**

Run: `npm run build`
Expected: build succeeds, no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with core deps"
```

---

### Task 2: Configure design tokens and fonts

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write design tokens CSS**

Create `src/styles/tokens.css`:

```css
:root {
  --ink-900: #1c1d1f;
  --ink-600: #5a5e63;
  --paper: #faf6ef;
  --paper-2: #f2ebde;
  --cinnabar: #b14a3a;
  --cinnabar-deep: #934034;
  --celadon: #87a08c;
  --gold: #c9a96a;
  --gold-soft: #d8c39a;
  --indigo: #3b4a5a;
  --moon: #e8e2d4;

  --shadow-paper: 0 1px 24px rgba(28, 29, 31, 0.06);
  --ring-focus: 0 0 0 2px var(--paper), 0 0 0 4px var(--gold);
  --transition-base: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

- [ ] **Step 2: Update globals.css**

Replace `src/app/globals.css` with:

```css
@import "../styles/tokens.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: var(--font-noto-serif), "Noto Serif SC", serif;
    background: var(--paper);
    color: var(--ink-900);
    -webkit-font-smoothing: antialiased;
  }

  body {
    min-height: 100dvh;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  ::selection {
    background: var(--cinnabar);
    color: var(--paper);
  }

  *:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
    border-radius: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

- [ ] **Step 3: Extend Tailwind theme**

Replace `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "var(--ink-900)", 600: "var(--ink-600)" },
        paper: { DEFAULT: "var(--paper)", 2: "var(--paper-2)" },
        cinnabar: { DEFAULT: "var(--cinnabar)", deep: "var(--cinnabar-deep)" },
        celadon: "var(--celadon)",
        gold: { DEFAULT: "var(--gold)", soft: "var(--gold-soft)" },
        indigo: "var(--indigo)",
        moon: "var(--moon)",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif)", "Noto Serif SC", "serif"],
        sans: ["var(--font-noto-sans)", "Noto Sans SC", "sans-serif"],
      },
      borderRadius: { sm: "2px", md: "4px" },
      boxShadow: { paper: "var(--shadow-paper)" },
      maxWidth: { content: "720px" },
      transitionTimingFunction: { ink: "cubic-bezier(0.4, 0, 0.2, 1)" },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Wire fonts in layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "四柱 — 知命，知未来",
  description: "古风四柱八字排盘与命理解读",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable} ${notoSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Verify and commit**

Run: `npm run build`
Expected: succeeds.

```bash
git add -A
git commit -m "feat: add design tokens, Noto SC fonts, Tailwind theme"
```

---

### Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`
- Modify: `package.json` (test scripts)

- [ ] **Step 1: Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    css: true,
  },
});
```

- [ ] **Step 2: Test setup**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Add scripts**

In `package.json`, add to `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Sanity test**

Create `src/test/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm test`
Expected: 1 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: configure vitest with jsdom"
```

---

## Phase 2 — Bazi Calculation Engine

### Task 4: Define Bazi types and constants

**Files:**
- Create: `src/lib/bazi/types.ts`
- Create: `src/lib/bazi/constants.ts`

- [ ] **Step 1: Write types**

Create `src/lib/bazi/types.ts`:

```ts
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
  hour: number;       // 0-23
  minute: number;     // 0-59
  isLeapMonth?: boolean;
  longitude: number;  // for true solar time, default 120 (Beijing)
  city?: string;
}

export interface Pillar {
  stem: Stem;
  branch: Branch;
  hiddenStems: Stem[];        // 藏干 (本气 first)
  stemElement: Element;
  branchElement: Element;
  stemShiShen?: ShiShen;      // 日柱天干无十神 (是日主本身)
  branchShiShen?: ShiShen;    // 取地支本气
  naYin?: string;             // 纳音 (e.g., "海中金")
}

export interface DayunStep {
  index: number;        // 0..9
  startAge: number;     // 起运虚岁
  startYear: number;    // 起运公元年
  pillar: Pillar;
  isCurrent: boolean;
}

export interface WuxingScore {
  木: number; 火: number; 土: number; 金: number; 水: number;
}

export interface BaziChart {
  input: BirthInput;
  solarDate: { year: number; month: number; day: number; hour: number; minute: number };
  lunarDate: { year: number; month: number; day: number; isLeap: boolean };
  zodiac: string;                 // 生肖
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar };
  dayMaster: { stem: Stem; element: Element; polarity: Polarity };
  wuxing: WuxingScore;            // 加权得分
  dayMasterStrength: "极弱" | "弱" | "中和" | "强" | "极强";
  favorableElements: Element[];   // 喜用神
  unfavorableElements: Element[]; // 忌神
  dayun: DayunStep[];
}
```

- [ ] **Step 2: Write constants**

Create `src/lib/bazi/constants.ts`:

```ts
import type { Stem, Branch, Element, Polarity } from "./types";

export const STEMS: Stem[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES: Branch[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export const STEM_ELEMENT: Record<Stem, Element> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

export const STEM_POLARITY: Record<Stem, Polarity> = {
  甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳", 己: "阴",
  庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴",
};

export const BRANCH_ELEMENT: Record<Branch, Element> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

export const BRANCH_POLARITY: Record<Branch, Polarity> = {
  子: "阳", 丑: "阴", 寅: "阳", 卯: "阴", 辰: "阳", 巳: "阴",
  午: "阳", 未: "阴", 申: "阳", 酉: "阴", 戌: "阳", 亥: "阴",
};

// 地支藏干 (本气 / 中气 / 余气)，按力量从强到弱
export const HIDDEN_STEMS: Record<Branch, Stem[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

export const ZODIAC: Record<Branch, string> = {
  子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇",
  午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪",
};

// 五行生克：生我 / 我生 / 克我 / 我克 / 同我
export const ELEMENT_GENERATES: Record<Element, Element> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};
export const ELEMENT_OVERCOMES: Record<Element, Element> = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};

// 月令五行旺度 (简化：当令=5、相=3、休=1、囚=-1、死=-3)
export const MONTH_BRANCH_SEASON: Record<Branch, Element> = {
  寅: "木", 卯: "木",
  巳: "火", 午: "火",
  申: "金", 酉: "金",
  亥: "水", 子: "水",
  辰: "土", 戌: "土", 丑: "土", 未: "土",
};
```

- [ ] **Step 3: Quick type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(bazi): add types and constants for stems/branches/elements"
```

---

### Task 5: Implement ten-gods (十神) helper

**Files:**
- Create: `src/lib/bazi/shishen.ts`
- Create: `src/lib/bazi/shishen.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/bazi/shishen.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- shishen`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/bazi/shishen.ts`:

```ts
import type { Stem, ShiShen } from "./types";
import { STEM_ELEMENT, STEM_POLARITY, ELEMENT_GENERATES, ELEMENT_OVERCOMES } from "./constants";

export function computeShiShen(dayMaster: Stem, target: Stem): ShiShen {
  const dmEl = STEM_ELEMENT[dayMaster];
  const tEl = STEM_ELEMENT[target];
  const samePolarity = STEM_POLARITY[dayMaster] === STEM_POLARITY[target];

  if (dmEl === tEl) return samePolarity ? "比肩" : "劫财";
  if (ELEMENT_GENERATES[dmEl] === tEl) return samePolarity ? "食神" : "伤官";
  if (ELEMENT_OVERCOMES[dmEl] === tEl) return samePolarity ? "偏财" : "正财";
  if (ELEMENT_OVERCOMES[tEl] === dmEl) return samePolarity ? "七杀" : "正官";
  if (ELEMENT_GENERATES[tEl] === dmEl) return samePolarity ? "偏印" : "正印";
  throw new Error(`Unreachable shishen: ${dayMaster} -> ${target}`);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- shishen`
Expected: 10 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(bazi): compute ten gods (十神)"
```

---

### Task 6: Implement true-solar-time correction

**Files:**
- Create: `src/lib/bazi/solar-time.ts`
- Create: `src/lib/bazi/solar-time.test.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/bazi/solar-time.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { applyTrueSolarTime } from "./solar-time";

describe("applyTrueSolarTime", () => {
  it("returns same time when longitude = 120 (Beijing)", () => {
    const result = applyTrueSolarTime({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 }, 120);
    expect(result).toEqual({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 });
  });
  it("subtracts 4 minutes per degree west of 120", () => {
    // longitude 116 (Beijing actual) -> -16 minutes
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
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- solar-time`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/bazi/solar-time.ts`:

```ts
export interface DateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export function applyTrueSolarTime(dt: DateTime, longitude: number): DateTime {
  const offsetMinutes = Math.round((longitude - 120) * 4);
  const date = new Date(Date.UTC(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute));
  date.setUTCMinutes(date.getUTCMinutes() + offsetMinutes);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- solar-time`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(bazi): true solar time correction by longitude"
```

---

### Task 7: Implement core calculator using lunar-typescript

**Files:**
- Create: `src/lib/bazi/calculator.ts`
- Create: `src/lib/bazi/calculator.test.ts`

This task is the engine. It wraps `lunar-typescript`, computes all derived fields, and produces a `BaziChart`.

- [ ] **Step 1: Write tests with canonical fixtures**

Create `src/lib/bazi/calculator.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeChart } from "./calculator";

describe("computeChart", () => {
  // Reference: 1990-01-01 12:00 Beijing, male, solar
  // Validated against bazi skill / lunar-typescript directly.
  it("computes year/month/day/hour pillars correctly for 1990-01-01 12:00 male", () => {
    const chart = computeChart({
      gender: "男",
      calendar: "solar",
      year: 1990, month: 1, day: 1, hour: 12, minute: 0,
      longitude: 120,
    });
    expect(chart.pillars.year.stem + chart.pillars.year.branch).toBe("己巳");
    expect(chart.pillars.month.stem + chart.pillars.month.branch).toBe("丙子");
    expect(chart.pillars.day.stem + chart.pillars.day.branch).toBe("辛巳");
    expect(chart.pillars.hour.stem + chart.pillars.hour.branch).toBe("甲午");
    expect(chart.dayMaster.stem).toBe("辛");
    expect(chart.dayMaster.element).toBe("金");
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

  it("attaches ten-gods to non-day pillars", () => {
    const chart = computeChart({
      gender: "男",
      calendar: "solar",
      year: 1990, month: 1, day: 1, hour: 12, minute: 0,
      longitude: 120,
    });
    expect(chart.pillars.year.stemShiShen).toBeDefined();
    expect(chart.pillars.day.stemShiShen).toBeUndefined();
  });

  it("wuxing scores sum positively and include all five elements", () => {
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
```

> Note: Before committing, verify these expected pillar values against the `bazi` skill (which uses authoritative tables). If `lunar-typescript` returns different values for `1990-01-01 12:00`, update the expected strings — but never lower test rigor.

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- calculator`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement calculator**

Create `src/lib/bazi/calculator.ts`:

```ts
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
  if (dayMaster && dayMaster !== stem /* stem on day pillar OR same accidentally */) {
    pillar.stemShiShen = computeShiShen(dayMaster, stem);
  }
  if (dayMaster) {
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
  const supportEl = (Object.entries({
    木: "水", 火: "木", 土: "火", 金: "土", 水: "金",
  } as Record<Element, Element>) as [Element, Element][])
    .find(([k]) => k === dmElement)?.[1];
  const support = supportEl ? wuxing[supportEl] : 0;
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

  // 弱 → 喜印比 (生我、同我); 忌财官伤 (我克、克我、我生)
  // 强 → 喜财官食 (我克、克我、我生); 忌印比 (生我、同我)
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

  const solar =
    input.calendar === "solar"
      ? Solar.fromYmdHms(corrected.year, corrected.month, corrected.day, corrected.hour, corrected.minute, 0)
      : Lunar.fromYmd(corrected.year, corrected.month, corrected.day)
          .getSolar();
  // For lunar input we ignore time correction sub-day offset (negligible vs. day boundary).
  // Hour is read from corrected directly:
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const dayGZ = ec.getDay();
  const dayMaster = parseGZ(dayGZ).stem;

  const yearPillar = buildPillar(ec.getYear(), dayMaster, ec.getYearNaYin());
  const monthPillar = buildPillar(ec.getMonth(), dayMaster, ec.getMonthNaYin());
  const dayPillar = buildPillar(ec.getDay(), dayMaster, ec.getDayNaYin());
  // dayPillar.stemShiShen left undefined intentionally.
  dayPillar.stemShiShen = undefined;
  const hourPillar = buildPillar(ec.getTime(), dayMaster, ec.getTimeNaYin());

  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const wuxing = computeWuxing(allPillars);
  const dmElement = STEM_ELEMENT[dayMaster];
  const strength = classifyStrength(dmElement, monthPillar.branch, wuxing);
  const fav = favorableElements(dmElement, strength);

  // Dayun
  const yun = ec.getYun(input.gender === "男" ? 1 : 0);
  const dayunArr = yun.getDaYun();
  const currentSolarYear = new Date().getFullYear();
  const dayun: DayunStep[] = dayunArr.slice(1, 11).map((d, i) => {
    const stepPillar = buildPillar(d.getGanZhi(), dayMaster);
    const startYear = d.getStartYear();
    return {
      index: i,
      startAge: d.getStartAge(),
      startYear,
      pillar: stepPillar,
      isCurrent:
        currentSolarYear >= startYear &&
        currentSolarYear < startYear + 10,
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
```

- [ ] **Step 4: Run, verify, fix expected values if `lunar-typescript` differs**

Run: `npm test -- calculator`

If a pillar mismatch occurs (e.g., the library returns "庚午" instead of "己巳" for the year pillar), invoke the `bazi` skill with the same date and gender to determine the canonical answer, then update either the test expectation (if test was wrong) or the calculator (if logic was wrong).

Expected after iteration: 4 passing.

- [ ] **Step 5: Cross-validate with bazi skill on 3 more cases**

Pick 3 birth dates spanning different decades. For each, call `bazi` skill and compare year/month/day/hour pillars to `computeChart` output. If any mismatch, document and resolve before continuing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(bazi): core calculator producing four pillars + dayun + wuxing"
```

---

## Phase 3 — Wizard Input Flow

### Task 8: Wizard zustand store

**Files:**
- Create: `src/lib/state/wizard-store.ts`

- [ ] **Step 1: Implement store**

Create `src/lib/state/wizard-store.ts`:

```ts
"use client";
import { create } from "zustand";
import type { BirthInput, Gender, CalendarType } from "@/lib/bazi/types";

interface WizardState {
  step: 0 | 1 | 2 | 3 | 4;
  draft: Partial<BirthInput>;
  setName: (v: string) => void;
  setGender: (v: Gender) => void;
  setCalendar: (v: CalendarType) => void;
  setDate: (year: number, month: number, day: number, isLeap?: boolean) => void;
  setTime: (hour: number, minute: number) => void;
  setLocation: (city: string, longitude: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  isComplete: () => boolean;
  toBirthInput: () => BirthInput | null;
}

const initial: Partial<BirthInput> = {
  gender: "男",
  calendar: "solar",
  longitude: 120,
};

export const useWizard = create<WizardState>((set, get) => ({
  step: 0,
  draft: { ...initial },
  setName: (name) => set((s) => ({ draft: { ...s.draft, name } })),
  setGender: (gender) => set((s) => ({ draft: { ...s.draft, gender } })),
  setCalendar: (calendar) => set((s) => ({ draft: { ...s.draft, calendar } })),
  setDate: (year, month, day, isLeapMonth) =>
    set((s) => ({ draft: { ...s.draft, year, month, day, isLeapMonth } })),
  setTime: (hour, minute) => set((s) => ({ draft: { ...s.draft, hour, minute } })),
  setLocation: (city, longitude) =>
    set((s) => ({ draft: { ...s.draft, city, longitude } })),
  next: () => set((s) => ({ step: Math.min(4, s.step + 1) as WizardState["step"] })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) as WizardState["step"] })),
  reset: () => set({ step: 0, draft: { ...initial } }),
  isComplete: () => {
    const d = get().draft;
    return (
      d.gender !== undefined &&
      d.calendar !== undefined &&
      typeof d.year === "number" &&
      typeof d.month === "number" &&
      typeof d.day === "number" &&
      typeof d.hour === "number" &&
      typeof d.minute === "number" &&
      typeof d.longitude === "number"
    );
  },
  toBirthInput: () => {
    if (!get().isComplete()) return null;
    return get().draft as BirthInput;
  },
}));
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(wizard): zustand store for input draft"
```

---

### Task 9: Common UI primitives — InkButton, PaperCard, OrnamentDivider

**Files:**
- Create: `src/components/common/InkButton.tsx`
- Create: `src/components/common/PaperCard.tsx`
- Create: `src/components/common/OrnamentDivider.tsx`
- Create: `src/lib/cn.ts`

- [ ] **Step 1: cn helper**

Create `src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: InkButton**

Create `src/components/common/InkButton.tsx`:

```tsx
"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "outline";

interface InkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center min-h-[44px] px-6 py-2 font-serif text-base " +
  "transition-all duration-300 ease-ink select-none active:scale-[0.97] " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-cinnabar text-paper hover:bg-cinnabar-deep " +
    "shadow-paper rounded-sm",
  ghost: "text-ink hover:bg-paper-2 rounded-sm",
  outline:
    "border border-gold text-ink hover:bg-paper-2 rounded-sm",
};

export const InkButton = forwardRef<HTMLButtonElement, InkButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
  ),
);
InkButton.displayName = "InkButton";
```

- [ ] **Step 3: PaperCard**

Create `src/components/common/PaperCard.tsx`:

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function PaperCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative bg-paper-2 shadow-paper rounded-sm px-6 py-6 sm:px-8 sm:py-8",
        "before:absolute before:inset-0 before:rounded-sm before:pointer-events-none",
        "before:bg-[url('/ornaments/paper-grain.svg')] before:opacity-[0.04] before:mix-blend-multiply",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: OrnamentDivider + paper-grain SVG placeholder**

Create `src/components/common/OrnamentDivider.tsx`:

```tsx
export function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 my-6 ${className}`} aria-hidden>
      <span className="flex-1 h-px bg-gold/60" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 7h2v-2h2v2h2v-2h2v2h2M7 2v2h-2v2h2v2h-2v2h2"
          stroke="var(--gold)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex-1 h-px bg-gold/60" />
    </div>
  );
}
```

Create `public/ornaments/paper-grain.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/>
    <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.5 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): InkButton, PaperCard, OrnamentDivider primitives"
```

---

### Task 10: Wizard shell with step indicator

**Files:**
- Create: `src/components/wizard/WizardShell.tsx`
- Create: `src/components/wizard/StepIndicator.tsx`

- [ ] **Step 1: StepIndicator**

Create `src/components/wizard/StepIndicator.tsx`:

```tsx
"use client";
import { cn } from "@/lib/cn";

const labels = ["缘起", "时辰", "方位", "确认"];

export function StepIndicator({ current }: { current: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex items-center justify-center gap-3 sm:gap-5 my-8">
      {labels.map((label, idx) => {
        const done = current > idx;
        const active = current === idx;
        return (
          <li key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "w-3 h-3 rounded-full border border-gold transition-all duration-300",
                  done && "bg-gold",
                  active && "bg-cinnabar border-cinnabar shadow-[0_0_12px_rgba(177,74,58,0.5)] scale-125",
                )}
                aria-current={active ? "step" : undefined}
              />
              <span className={cn("text-xs font-sans", active ? "text-ink" : "text-ink-600")}>
                {label}
              </span>
            </div>
            {idx < labels.length - 1 && <span className="w-8 sm:w-12 h-px bg-gold/50" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: WizardShell**

Create `src/components/wizard/WizardShell.tsx`:

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useWizard } from "@/lib/state/wizard-store";
import { StepIndicator } from "./StepIndicator";

interface WizardShellProps {
  steps: ReactNode[];
}

export function WizardShell({ steps }: WizardShellProps) {
  const step = useWizard((s) => s.step);
  return (
    <section className="w-full max-w-content mx-auto px-4 sm:px-6 pb-16">
      <StepIndicator current={step} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(wizard): shell with animated step transitions and indicator"
```

---

### Task 11: Step 1 — Basic Info (name + gender)

**Files:**
- Create: `src/components/wizard/StepBasicInfo.tsx`

- [ ] **Step 1: Implement**

Create `src/components/wizard/StepBasicInfo.tsx`:

```tsx
"use client";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

export function StepBasicInfo() {
  const { draft, setName, setGender, next } = useWizard();
  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">缘起</h2>
      <p className="text-ink-600 text-sm mb-6">命主姓名可不填，仅作记录之用。</p>

      <label className="block mb-5">
        <span className="block text-sm text-ink-600 mb-2">姓名</span>
        <input
          type="text"
          maxLength={20}
          value={draft.name ?? ""}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-gold py-2 px-1 font-serif text-lg focus:outline-none focus:border-cinnabar transition-colors"
          placeholder="（可选）"
        />
      </label>

      <fieldset className="mb-8">
        <legend className="text-sm text-ink-600 mb-3">性别</legend>
        <div className="flex gap-3">
          {(["男", "女"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={cn(
                "flex-1 min-h-[44px] border rounded-sm font-serif text-lg transition-all duration-300",
                draft.gender === g
                  ? "bg-cinnabar text-paper border-cinnabar"
                  : "border-gold text-ink hover:bg-paper",
              )}
              aria-pressed={draft.gender === g}
            >
              {g}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <InkButton onClick={next} disabled={!draft.gender}>
          下一步
        </InkButton>
      </div>
    </PaperCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(wizard): step 1 basic info"
```

---

### Task 12: Step 2 — Birth Date with solar/lunar toggle

**Files:**
- Create: `src/components/wizard/StepBirthDate.tsx`

- [ ] **Step 1: Implement**

Create `src/components/wizard/StepBirthDate.tsx`:

```tsx
"use client";
import { useState } from "react";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => currentYear - i);

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function StepBirthDate() {
  const { draft, setCalendar, setDate, next, prev } = useWizard();
  const [year, setY] = useState<number>(draft.year ?? currentYear - 25);
  const [month, setM] = useState<number>(draft.month ?? 1);
  const [day, setD] = useState<number>(draft.day ?? 1);
  const [isLeap, setLeap] = useState<boolean>(draft.isLeapMonth ?? false);

  const days = Array.from(
    { length: draft.calendar === "lunar" ? 30 : daysInMonth(year, month) },
    (_, i) => i + 1,
  );

  const submit = () => {
    setDate(year, month, day, isLeap);
    next();
  };

  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-6">出生日期</h2>

      <div role="tablist" className="inline-flex border border-gold rounded-sm mb-6 overflow-hidden">
        {([
          { v: "solar", label: "阳历" },
          { v: "lunar", label: "农历" },
        ] as const).map((t) => (
          <button
            key={t.v}
            role="tab"
            aria-selected={draft.calendar === t.v}
            onClick={() => setCalendar(t.v)}
            className={cn(
              "px-5 py-2 font-serif transition-colors min-h-[44px]",
              draft.calendar === t.v ? "bg-cinnabar text-paper" : "text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <SelectField label="年" value={year} options={YEARS} onChange={setY} />
        <SelectField label="月" value={month} options={MONTHS} onChange={setM} />
        <SelectField label="日" value={day} options={days} onChange={setD} />
      </div>

      {draft.calendar === "lunar" && (
        <label className="flex items-center gap-2 mb-6 text-sm">
          <input
            type="checkbox"
            checked={isLeap}
            onChange={(e) => setLeap(e.target.checked)}
            className="w-4 h-4 accent-cinnabar"
          />
          <span>闰月</span>
        </label>
      )}

      <div className="flex justify-between">
        <InkButton variant="ghost" onClick={prev}>上一步</InkButton>
        <InkButton onClick={submit}>下一步</InkButton>
      </div>
    </PaperCard>
  );
}

function SelectField<T extends number>({
  label, value, options, onChange,
}: {
  label: string; value: T; options: T[]; onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-ink-600 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as T)}
        className="w-full min-h-[44px] bg-paper border border-gold/60 rounded-sm px-2 font-serif text-base focus:border-cinnabar outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(wizard): step 2 birth date with solar/lunar toggle"
```

---

### Task 13: Step 3 — Birth Time (12 时辰 dial)

**Files:**
- Create: `src/components/wizard/StepBirthTime.tsx`

- [ ] **Step 1: Implement**

Create `src/components/wizard/StepBirthTime.tsx`:

```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

const SHICHEN: { branch: string; range: string; hour: number }[] = [
  { branch: "子", range: "23-01", hour: 23 },
  { branch: "丑", range: "01-03", hour: 1 },
  { branch: "寅", range: "03-05", hour: 3 },
  { branch: "卯", range: "05-07", hour: 5 },
  { branch: "辰", range: "07-09", hour: 7 },
  { branch: "巳", range: "09-11", hour: 9 },
  { branch: "午", range: "11-13", hour: 11 },
  { branch: "未", range: "13-15", hour: 13 },
  { branch: "申", range: "15-17", hour: 15 },
  { branch: "酉", range: "17-19", hour: 17 },
  { branch: "戌", range: "19-21", hour: 19 },
  { branch: "亥", range: "21-23", hour: 21 },
];

export function StepBirthTime() {
  const { setTime, next, prev, draft } = useWizard();
  const [selected, setSelected] = useState<number>(draft.hour ?? 12);

  const submit = () => {
    setTime(selected, 0);
    next();
  };

  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">出生时辰</h2>
      <p className="text-ink-600 text-sm mb-6">十二时辰，选其一即可。</p>

      <div className="relative mx-auto w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] my-4">
        <div className="absolute inset-0 rounded-full border border-gold/60" />
        <div className="absolute inset-6 rounded-full border border-gold/30" />
        {SHICHEN.map((sc, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
          const r = 110;
          const x = Math.cos(angle) * r + 140;
          const y = Math.sin(angle) * r + 140;
          const isSel = sc.hour === selected;
          return (
            <button
              key={sc.branch}
              onClick={() => setSelected(sc.hour)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full transition-all duration-300",
                "flex flex-col items-center justify-center font-serif",
                isSel
                  ? "bg-cinnabar text-paper scale-125 shadow-[0_0_20px_rgba(177,74,58,0.4)]"
                  : "bg-paper-2 text-ink hover:bg-paper",
              )}
              style={{ left: `${x}px`, top: `${y}px` }}
              aria-pressed={isSel}
              aria-label={`${sc.branch}时 ${sc.range}`}
            >
              <span className="text-lg leading-none">{sc.branch}</span>
              <span className="text-[10px] opacity-70">{sc.range}</span>
            </button>
          );
        })}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold"
          aria-hidden
        />
      </div>

      <div className="flex justify-between mt-4">
        <InkButton variant="ghost" onClick={prev}>上一步</InkButton>
        <InkButton onClick={submit}>下一步</InkButton>
      </div>
    </PaperCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(wizard): step 3 birth time dial (12 shichen)"
```

---

### Task 14: Step 4 — Location (city → longitude)

**Files:**
- Create: `src/components/wizard/StepLocation.tsx`
- Create: `src/lib/data/cn-cities.ts`

- [ ] **Step 1: City data**

Create `src/lib/data/cn-cities.ts` with a static list of major Chinese cities + their longitudes (kept short — 30 entries — sufficient for this build):

```ts
export interface City {
  name: string;
  province: string;
  longitude: number;
}

export const CITIES: City[] = [
  { name: "北京", province: "北京", longitude: 116.41 },
  { name: "上海", province: "上海", longitude: 121.47 },
  { name: "广州", province: "广东", longitude: 113.27 },
  { name: "深圳", province: "广东", longitude: 114.06 },
  { name: "成都", province: "四川", longitude: 104.07 },
  { name: "重庆", province: "重庆", longitude: 106.55 },
  { name: "杭州", province: "浙江", longitude: 120.16 },
  { name: "武汉", province: "湖北", longitude: 114.30 },
  { name: "西安", province: "陕西", longitude: 108.94 },
  { name: "南京", province: "江苏", longitude: 118.78 },
  { name: "天津", province: "天津", longitude: 117.20 },
  { name: "苏州", province: "江苏", longitude: 120.59 },
  { name: "郑州", province: "河南", longitude: 113.62 },
  { name: "长沙", province: "湖南", longitude: 112.94 },
  { name: "青岛", province: "山东", longitude: 120.38 },
  { name: "沈阳", province: "辽宁", longitude: 123.43 },
  { name: "大连", province: "辽宁", longitude: 121.61 },
  { name: "宁波", province: "浙江", longitude: 121.55 },
  { name: "厦门", province: "福建", longitude: 118.08 },
  { name: "福州", province: "福建", longitude: 119.30 },
  { name: "济南", province: "山东", longitude: 117.00 },
  { name: "哈尔滨", province: "黑龙江", longitude: 126.53 },
  { name: "长春", province: "吉林", longitude: 125.32 },
  { name: "石家庄", province: "河北", longitude: 114.51 },
  { name: "太原", province: "山西", longitude: 112.55 },
  { name: "合肥", province: "安徽", longitude: 117.27 },
  { name: "南昌", province: "江西", longitude: 115.89 },
  { name: "昆明", province: "云南", longitude: 102.83 },
  { name: "贵阳", province: "贵州", longitude: 106.71 },
  { name: "兰州", province: "甘肃", longitude: 103.84 },
  { name: "乌鲁木齐", province: "新疆", longitude: 87.62 },
  { name: "拉萨", province: "西藏", longitude: 91.13 },
  { name: "海口", province: "海南", longitude: 110.32 },
  { name: "香港", province: "香港", longitude: 114.17 },
  { name: "台北", province: "台湾", longitude: 121.56 },
];
```

- [ ] **Step 2: Implement step**

Create `src/components/wizard/StepLocation.tsx`:

```tsx
"use client";
import { useMemo, useState } from "react";
import { useWizard } from "@/lib/state/wizard-store";
import { InkButton } from "@/components/common/InkButton";
import { PaperCard } from "@/components/common/PaperCard";
import { CITIES } from "@/lib/data/cn-cities";
import { cn } from "@/lib/cn";

export function StepLocation() {
  const { setLocation, next, prev, draft } = useWizard();
  const [query, setQuery] = useState(draft.city ?? "");
  const [picked, setPicked] = useState<{ name: string; longitude: number } | null>(
    draft.city && draft.longitude ? { name: draft.city, longitude: draft.longitude } : null,
  );

  const matches = useMemo(() => {
    if (!query) return CITIES.slice(0, 8);
    return CITIES.filter((c) => c.name.includes(query) || c.province.includes(query)).slice(0, 8);
  }, [query]);

  const submit = () => {
    if (!picked) return;
    setLocation(picked.name, picked.longitude);
    next();
  };

  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">出生方位</h2>
      <p className="text-ink-600 text-sm mb-6">用于真太阳时校正。可跳过，将以北京时间计算。</p>

      <input
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPicked(null); }}
        placeholder="搜索城市…"
        className="w-full min-h-[44px] bg-transparent border-b border-gold py-2 px-1 font-serif text-lg focus:outline-none focus:border-cinnabar mb-3"
      />

      <ul className="space-y-1 mb-6 max-h-56 overflow-y-auto">
        {matches.map((c) => (
          <li key={c.name}>
            <button
              type="button"
              onClick={() => { setPicked({ name: c.name, longitude: c.longitude }); setQuery(c.name); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-sm font-serif transition-colors",
                picked?.name === c.name ? "bg-cinnabar text-paper" : "hover:bg-paper",
              )}
            >
              <span>{c.name}</span>
              <span className="text-xs ml-2 opacity-60">{c.province} · {c.longitude.toFixed(2)}°E</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between">
        <InkButton variant="ghost" onClick={prev}>上一步</InkButton>
        <div className="flex gap-2">
          <InkButton variant="outline" onClick={() => { setLocation("北京", 120); next(); }}>
            跳过
          </InkButton>
          <InkButton onClick={submit} disabled={!picked}>下一步</InkButton>
        </div>
      </div>
    </PaperCard>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(wizard): step 4 location with city search"
```

---

### Task 15: Step 5 — Confirmation

**Files:**
- Create: `src/components/wizard/StepConfirm.tsx`

- [ ] **Step 1: Implement**

Create `src/components/wizard/StepConfirm.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(wizard): step 5 confirmation summary"
```

---

## Phase 4 — Result Display

> Before starting Phase 4, invoke the `ui-ux-pro-max` skill briefly: ask it to validate the new-Chinese palette and propose any chart-display patterns we may have missed. Note any worthwhile suggestions back into this plan as inline TODOs (no scope creep — only adopt what is unambiguously better).

### Task 16: FourPillarsCard

**Files:**
- Create: `src/components/chart/FourPillarsCard.tsx`

- [ ] **Step 1: Implement**

Create `src/components/chart/FourPillarsCard.tsx`:

```tsx
"use client";
import type { BaziChart, Pillar } from "@/lib/bazi/types";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

const ELEMENT_TONE: Record<string, string> = {
  木: "text-celadon",
  火: "text-cinnabar",
  土: "text-gold",
  金: "text-ink",
  水: "text-indigo",
};

export function FourPillarsCard({ chart }: { chart: BaziChart }) {
  const labels: { key: keyof BaziChart["pillars"]; label: string }[] = [
    { key: "year", label: "年柱" },
    { key: "month", label: "月柱" },
    { key: "day", label: "日柱" },
    { key: "hour", label: "时柱" },
  ];
  return (
    <PaperCard>
      <header className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-2xl">四柱</h2>
        <span className="text-sm text-ink-600">{chart.zodiac}年生 · 日主{chart.dayMaster.stem}{chart.dayMaster.element}</span>
      </header>
      <div className="grid grid-cols-4 gap-0 divide-x divide-gold/40">
        {labels.map(({ key, label }) => (
          <PillarColumn key={key} label={label} pillar={chart.pillars[key]} isDay={key === "day"} />
        ))}
      </div>
    </PaperCard>
  );
}

function PillarColumn({ label, pillar, isDay }: { label: string; pillar: Pillar; isDay: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-2 sm:px-4 py-2", isDay && "bg-paper/60")}>
      <span className="text-xs font-sans text-ink-600">{label}</span>
      <span className={cn("font-serif text-4xl sm:text-5xl leading-none", ELEMENT_TONE[pillar.stemElement])}>
        {pillar.stem}
      </span>
      <span className={cn("font-serif text-4xl sm:text-5xl leading-none", ELEMENT_TONE[pillar.branchElement])}>
        {pillar.branch}
      </span>
      <div className="text-[11px] text-ink-600 text-center min-h-[1rem]">
        {pillar.hiddenStems.join(" ")}
      </div>
      {pillar.stemShiShen && (
        <span className="text-[10px] text-ink-600 font-sans">{pillar.stemShiShen}</span>
      )}
      {pillar.naYin && <span className="text-[10px] text-gold font-sans">{pillar.naYin}</span>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(chart): four pillars card"
```

---

### Task 17: WuxingChart (radar)

**Files:**
- Create: `src/components/chart/WuxingChart.tsx`

- [ ] **Step 1: Implement**

Create `src/components/chart/WuxingChart.tsx`:

```tsx
"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { BaziChart } from "@/lib/bazi/types";
import { PaperCard } from "@/components/common/PaperCard";

export function WuxingChart({ chart }: { chart: BaziChart }) {
  const data = (["木", "火", "土", "金", "水"] as const).map((el) => ({
    element: el,
    score: Math.round(chart.wuxing[el] * 10) / 10,
  }));

  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-2">五行旺衰</h2>
      <p className="text-sm text-ink-600 mb-4">
        日主<span className="text-cinnabar">{chart.dayMasterStrength}</span>
        ，喜<span className="text-celadon">{chart.favorableElements.join("、")}</span>
        ，忌<span className="text-indigo">{chart.unfavorableElements.join("、")}</span>。
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="var(--gold-soft)" />
            <PolarAngleAxis dataKey="element" tick={{ fill: "var(--ink-900)", fontFamily: "var(--font-noto-serif)" }} />
            <Radar
              dataKey="score"
              stroke="var(--cinnabar)"
              fill="var(--cinnabar)"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </PaperCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(chart): wuxing radar chart"
```

---

### Task 18: ShiShenTable

**Files:**
- Create: `src/components/chart/ShiShenTable.tsx`

- [ ] **Step 1: Implement**

Create `src/components/chart/ShiShenTable.tsx`:

```tsx
"use client";
import type { BaziChart } from "@/lib/bazi/types";
import { PaperCard } from "@/components/common/PaperCard";

export function ShiShenTable({ chart }: { chart: BaziChart }) {
  const rows = [
    { label: "年", p: chart.pillars.year },
    { label: "月", p: chart.pillars.month },
    { label: "日", p: chart.pillars.day },
    { label: "时", p: chart.pillars.hour },
  ];
  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-4">十神</h2>
      <table className="w-full font-serif">
        <thead>
          <tr className="text-xs text-ink-600 border-b border-gold/40">
            <th className="text-left py-2">柱</th>
            <th className="py-2">天干十神</th>
            <th className="py-2">地支本气十神</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, p }) => (
            <tr key={label} className="border-b border-gold/20 last:border-b-0">
              <td className="py-3 text-ink-600">{label}柱</td>
              <td className="py-3 text-center">
                {p.stemShiShen ?? <span className="text-cinnabar">日主</span>}
              </td>
              <td className="py-3 text-center">{p.branchShiShen ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PaperCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(chart): shishen table"
```

---

### Task 19: DayunTimeline

**Files:**
- Create: `src/components/chart/DayunTimeline.tsx`

- [ ] **Step 1: Implement**

Create `src/components/chart/DayunTimeline.tsx`:

```tsx
"use client";
import type { BaziChart } from "@/lib/bazi/types";
import { PaperCard } from "@/components/common/PaperCard";
import { cn } from "@/lib/cn";

export function DayunTimeline({ chart }: { chart: BaziChart }) {
  return (
    <PaperCard>
      <h2 className="font-serif text-2xl mb-4">大运</h2>
      <ol className="flex sm:flex-row flex-col gap-3 overflow-x-auto sm:pb-2">
        {chart.dayun.map((d) => (
          <li
            key={d.index}
            className={cn(
              "flex-shrink-0 w-full sm:w-32 border rounded-sm p-3 transition-all duration-300",
              d.isCurrent ? "border-cinnabar bg-paper" : "border-gold/40",
            )}
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-ink-600">{d.startAge}虚岁</span>
              {d.isCurrent && <span className="text-[10px] bg-cinnabar text-paper px-1 rounded-sm">现行</span>}
            </div>
            <div className="font-serif text-2xl text-center mb-1">
              {d.pillar.stem}{d.pillar.branch}
            </div>
            <div className="text-xs text-ink-600 text-center">
              {d.startYear}—{d.startYear + 9}
            </div>
            {d.pillar.stemShiShen && (
              <div className="text-[10px] text-ink-600 text-center mt-1">{d.pillar.stemShiShen}</div>
            )}
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(chart): dayun timeline"
```

---

## Phase 5 — Qwen AI Integration

### Task 20: Local rule-based analysis fallback

**Files:**
- Create: `src/lib/bazi/local-analysis.ts`

- [ ] **Step 1: Implement**

Create `src/lib/bazi/local-analysis.ts`:

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(bazi): local rule-based reading fallback"
```

---

### Task 21: Qwen prompts authored with bazi skill

**Files:**
- Create: `src/lib/qwen/prompts.ts`

> **Before this task: invoke the `bazi` skill** with prompts like "give me the canonical analytical framework from 滴天髓 / 子平真诠 / 穷通宝典 for assessing day-master strength and selecting 用神, summarized in ~400 words". Use that output as the basis for the system prompt below. Cite the canon names in the prompt itself so the model anchors on traditional sources.

- [ ] **Step 1: Implement prompts**

Create `src/lib/qwen/prompts.ts`:

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(qwen): system prompt + chart sketch builder"
```

---

### Task 22: Qwen client (streaming)

**Files:**
- Create: `src/lib/qwen/client.ts`

- [ ] **Step 1: Implement**

Create `src/lib/qwen/client.ts`:

```ts
import { createParser, type EventSourceMessage } from "eventsource-parser";

const ENDPOINT =
  process.env.QWEN_ENDPOINT ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

interface QwenMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function* streamQwen(
  messages: QwenMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    yield "（管理员尚未配置 Qwen API Key，无法生成 AI 解读。请联系开发者在 .env.local 中填入 DASHSCOPE_API_KEY 后重启服务。）";
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.QWEN_MODEL ?? "qwen-max",
      messages,
      stream: true,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Qwen API error: ${res.status} ${txt}`);
  }

  const decoder = new TextDecoder();
  const reader = res.body.getReader();
  const queue: string[] = [];
  let done = false;
  let flushResolve: (() => void) | null = null;

  const parser = createParser({
    onEvent(evt: EventSourceMessage) {
      if (evt.data === "[DONE]") return;
      try {
        const json = JSON.parse(evt.data);
        const delta = json.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          queue.push(delta);
          flushResolve?.();
        }
      } catch {
        // ignore non-json keepalives
      }
    },
  });

  (async () => {
    try {
      while (true) {
        const { value, done: rDone } = await reader.read();
        if (rDone) break;
        parser.feed(decoder.decode(value, { stream: true }));
      }
    } finally {
      done = true;
      flushResolve?.();
    }
  })();

  while (true) {
    if (queue.length > 0) {
      yield queue.shift()!;
      continue;
    }
    if (done) return;
    await new Promise<void>((r) => { flushResolve = r; });
    flushResolve = null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(qwen): streaming SSE client wrapper"
```

---

### Task 23: API route /api/analyze with simple rate limit

**Files:**
- Create: `src/app/api/analyze/route.ts`
- Create: `.env.local.example`

- [ ] **Step 1: env example**

Create `.env.local.example`:

```
DASHSCOPE_API_KEY=
QWEN_MODEL=qwen-max
QWEN_ENDPOINT=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

- [ ] **Step 2: API route**

Create `src/app/api/analyze/route.ts`:

```ts
import { NextRequest } from "next/server";
import { streamQwen } from "@/lib/qwen/client";
import { buildAnalysisMessages, type ReadingTopic } from "@/lib/qwen/prompts";
import type { BaziChart } from "@/lib/bazi/types";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const buckets = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (b.count >= RATE_LIMIT_MAX) return false;
  b.count += 1;
  return true;
}

interface AnalyzeBody {
  chart: BaziChart;
  topic: ReadingTopic;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(ip)) {
    return new Response("请求过于频繁，请稍候再试。", { status: 429 });
  }

  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!body?.chart || !body?.topic) {
    return new Response("Missing chart or topic", { status: 400 });
  }

  const messages = buildAnalysisMessages(body.chart, body.topic);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamQwen(messages, req.signal)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `\n\n[出错] ${err instanceof Error ? err.message : String(err)}`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: succeeds (route compiles).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(api): /api/analyze streaming Qwen route with rate limit"
```

---

### Task 24: DeepAnalysisPanel with tabs and streaming UI

**Files:**
- Create: `src/components/chart/DeepAnalysisPanel.tsx`

- [ ] **Step 1: Implement**

Create `src/components/chart/DeepAnalysisPanel.tsx`:

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import type { BaziChart } from "@/lib/bazi/types";
import type { ReadingTopic } from "@/lib/qwen/prompts";
import { PaperCard } from "@/components/common/PaperCard";
import { OrnamentDivider } from "@/components/common/OrnamentDivider";
import { generateLocalReading } from "@/lib/bazi/local-analysis";
import { cn } from "@/lib/cn";

const TOPICS: { id: ReadingTopic; label: string }[] = [
  { id: "personality", label: "性格" },
  { id: "career", label: "事业" },
  { id: "relationship", label: "感情" },
  { id: "health", label: "健康" },
];

export function DeepAnalysisPanel({ chart }: { chart: BaziChart }) {
  const [active, setActive] = useState<ReadingTopic>("personality");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const local = generateLocalReading(chart);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = async (topic: ReadingTopic) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setActive(topic);
    setText("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart, topic }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        setError(await res.text().catch(() => "请求失败"));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setText((t) => t + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperCard>
      <header className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-2xl">深度解读</h2>
        <span className="text-xs text-ink-600">由 Qwen 参照命理典籍生成</span>
      </header>

      <div role="tablist" className="flex gap-1 mb-4 border-b border-gold/40">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => run(t.id)}
            className={cn(
              "px-4 py-2 font-serif text-base min-h-[44px] transition-colors",
              active === t.id
                ? "text-cinnabar border-b-2 border-cinnabar -mb-px"
                : "text-ink-600 hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!text && !loading && !error && (
        <div className="text-ink-600 text-sm space-y-3">
          <p className="font-serif text-base text-ink">{local.summary}</p>
          <ul className="list-disc pl-5 space-y-1">
            {local.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <p className="text-xs italic mt-4">点击上方任一类目，调用 AI 生成深度解读。</p>
        </div>
      )}

      {(text || loading) && (
        <article className="font-serif text-base leading-[1.85] whitespace-pre-wrap">
          {text || (
            <span className="text-ink-600 inline-flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cinnabar animate-pulse" />
              墨迹晕开中…
            </span>
          )}
          {loading && text && <span className="inline-block w-2 h-4 ml-1 bg-cinnabar/60 animate-pulse align-middle" />}
        </article>
      )}

      {error && (
        <div className="bg-cinnabar text-paper px-4 py-2 mt-4 text-sm rounded-sm">
          解读出错：{error}
        </div>
      )}

      <OrnamentDivider />
      <p className="text-xs text-ink-600 italic">本解读仅供文化娱乐参考，不构成任何决策建议。</p>
    </PaperCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(chart): deep analysis panel with topic tabs and streaming"
```

---

## Phase 6 — History, Home, and Wiring

### Task 25: History storage

**Files:**
- Create: `src/lib/storage/history.ts`
- Create: `src/lib/storage/history.test.ts`

- [ ] **Step 1: Test**

Create `src/lib/storage/history.test.ts`:

```ts
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
```

- [ ] **Step 2: Run, fail**

Run: `npm test -- history`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/storage/history.ts`:

```ts
const KEY = "bazi.history.v1";
const MAX = 10;

export interface HistoryEntry {
  id: string;
  label: string;       // e.g., 姓名 or 出生日期
  chartJson: string;   // serialized BaziChart for round-trip
  savedAt: number;
}

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(list: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listHistory(): HistoryEntry[] {
  return read().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveHistory(entry: HistoryEntry) {
  const list = read().filter((e) => e.id !== entry.id);
  list.push(entry);
  list.sort((a, b) => b.savedAt - a.savedAt);
  write(list.slice(0, MAX));
}

export function removeHistory(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function clearHistory() {
  write([]);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- history`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(storage): localStorage history with max 10 entries"
```

---

### Task 26: HistorySidebar (desktop) / Sheet (mobile)

**Files:**
- Create: `src/components/common/HistorySidebar.tsx`

- [ ] **Step 1: Implement**

Create `src/components/common/HistorySidebar.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { listHistory, removeHistory, clearHistory, type HistoryEntry } from "@/lib/storage/history";
import { cn } from "@/lib/cn";
import { InkButton } from "./InkButton";

interface Props {
  onPick: (entry: HistoryEntry) => void;
  open: boolean;
  onClose: () => void;
}

export function HistorySidebar({ onPick, open, onClose }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setEntries(listHistory());
  }, [open]);

  const refresh = () => setEntries(listHistory());

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-ink/20 z-40 transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed z-50 top-0 right-0 h-full w-[min(320px,86vw)] bg-paper shadow-paper",
          "transition-transform duration-300 ease-ink",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="历史记录"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-gold/40">
          <h3 className="font-serif text-xl">历史</h3>
          <button onClick={onClose} aria-label="关闭" className="text-ink-600 px-2">×</button>
        </header>
        <div className="overflow-y-auto h-[calc(100%-130px)]">
          {entries.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-600">暂无记录</p>
          ) : (
            <ul>
              {entries.map((e) => (
                <li key={e.id} className="border-b border-gold/20 last:border-b-0">
                  <button
                    onClick={() => { onPick(e); onClose(); }}
                    className="w-full text-left px-5 py-3 hover:bg-paper-2 transition-colors"
                  >
                    <div className="font-serif">{e.label}</div>
                    <div className="text-xs text-ink-600 mt-1">
                      {new Date(e.savedAt).toLocaleString("zh-CN")}
                    </div>
                  </button>
                  <button
                    onClick={() => { removeHistory(e.id); refresh(); }}
                    className="px-5 py-1 text-xs text-ink-600 hover:text-cinnabar"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {entries.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-gold/40">
            <InkButton variant="ghost" onClick={() => { clearHistory(); refresh(); }} className="w-full">
              清空全部
            </InkButton>
          </div>
        )}
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(common): history sidebar / mobile sheet"
```

---

### Task 27: SealLogo component

**Files:**
- Create: `src/components/common/SealLogo.tsx`

- [ ] **Step 1: Implement**

Create `src/components/common/SealLogo.tsx`:

```tsx
export function SealLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-label="四柱">
      <rect x="2" y="2" width="32" height="32" fill="var(--cinnabar)" rx="2" />
      <text
        x="50%" y="54%"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="var(--font-noto-serif), serif"
        fontSize="20" fontWeight="700"
        fill="var(--paper)"
      >四柱</text>
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(common): seal logo"
```

---

### Task 28: Result page composition

**Files:**
- Create: `src/components/chart/ChartView.tsx`

- [ ] **Step 1: Implement**

Create `src/components/chart/ChartView.tsx`:

```tsx
"use client";
import type { BaziChart } from "@/lib/bazi/types";
import { FourPillarsCard } from "./FourPillarsCard";
import { WuxingChart } from "./WuxingChart";
import { ShiShenTable } from "./ShiShenTable";
import { DayunTimeline } from "./DayunTimeline";
import { DeepAnalysisPanel } from "./DeepAnalysisPanel";
import { OrnamentDivider } from "@/components/common/OrnamentDivider";
import { InkButton } from "@/components/common/InkButton";

export function ChartView({ chart, onReset }: { chart: BaziChart; onReset: () => void }) {
  return (
    <main className="w-full max-w-content mx-auto px-4 sm:px-6 pb-20 space-y-6">
      <div className="flex justify-between items-baseline pt-4">
        <h1 className="font-serif text-3xl">{chart.input.name || "命主"}的命盘</h1>
        <InkButton variant="ghost" onClick={onReset}>重新排盘</InkButton>
      </div>
      <FourPillarsCard chart={chart} />
      <WuxingChart chart={chart} />
      <ShiShenTable chart={chart} />
      <DayunTimeline chart={chart} />
      <OrnamentDivider />
      <DeepAnalysisPanel chart={chart} />
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(chart): chart view composition"
```

---

### Task 29: Home page wiring everything together

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/Hero.tsx`

- [ ] **Step 1: Hero**

Create `src/components/Hero.tsx`:

```tsx
"use client";
import { motion } from "framer-motion";
import { InkButton } from "@/components/common/InkButton";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M0 480 Q 200 360 400 420 T 800 380 T 1200 440 L 1200 600 L 0 600 Z"
          fill="var(--ink-900)"
        />
        <path
          d="M0 520 Q 250 440 500 480 T 1000 460 T 1200 500 L 1200 600 L 0 600 Z"
          fill="var(--ink-900)" opacity="0.5"
        />
      </svg>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="font-serif text-6xl sm:text-7xl tracking-[0.2em] mb-3"
      >
        四 柱
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-ink-600 font-serif text-lg mb-12"
      >
        知命，知未来
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <InkButton onClick={onStart} className="px-10 py-3 text-lg">开始排盘</InkButton>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Replace page.tsx**

Replace `src/app/page.tsx`:

```tsx
"use client";
import { useState } from "react";
import { Hero } from "@/components/Hero";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StepBasicInfo } from "@/components/wizard/StepBasicInfo";
import { StepBirthDate } from "@/components/wizard/StepBirthDate";
import { StepBirthTime } from "@/components/wizard/StepBirthTime";
import { StepLocation } from "@/components/wizard/StepLocation";
import { StepConfirm } from "@/components/wizard/StepConfirm";
import { ChartView } from "@/components/chart/ChartView";
import { HistorySidebar } from "@/components/common/HistorySidebar";
import { SealLogo } from "@/components/common/SealLogo";
import { useWizard } from "@/lib/state/wizard-store";
import { computeChart } from "@/lib/bazi/calculator";
import type { BaziChart } from "@/lib/bazi/types";
import { saveHistory, type HistoryEntry } from "@/lib/storage/history";

type View = "hero" | "wizard" | "result";

export default function HomePage() {
  const [view, setView] = useState<View>("hero");
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const wizard = useWizard();

  const submit = () => {
    const input = wizard.toBirthInput();
    if (!input) return;
    const c = computeChart(input);
    setChart(c);
    setView("result");
    saveHistory({
      id: `${Date.now()}`,
      label:
        (input.name || "无名命主") +
        ` · ${input.year}.${input.month}.${input.day}`,
      chartJson: JSON.stringify(c),
      savedAt: Date.now(),
    });
  };

  const reset = () => {
    wizard.reset();
    setChart(null);
    setView("hero");
  };

  const start = () => {
    wizard.reset();
    setView("wizard");
  };

  const pickHistory = (e: HistoryEntry) => {
    try {
      setChart(JSON.parse(e.chartJson) as BaziChart);
      setView("result");
    } catch {
      // ignore corrupt entry
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gold/30">
        <button onClick={reset} aria-label="返回首页" className="flex items-center gap-2">
          <SealLogo size={28} />
          <span className="font-serif text-lg">四柱</span>
        </button>
        <button
          onClick={() => setHistoryOpen(true)}
          className="text-ink-600 font-sans text-sm min-h-[44px] px-3"
        >
          历史
        </button>
      </header>

      {view === "hero" && <Hero onStart={start} />}
      {view === "wizard" && (
        <WizardShell
          steps={[
            <StepBasicInfo key="0" />,
            <StepBirthDate key="1" />,
            <StepBirthTime key="2" />,
            <StepLocation key="3" />,
            <StepConfirm key="4" onSubmit={submit} />,
          ]}
        />
      )}
      {view === "result" && chart && <ChartView chart={chart} onReset={reset} />}

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onPick={pickHistory}
      />
    </>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`
Visit http://localhost:3000:
- Click "开始排盘"
- Walk through 4 wizard steps with valid input
- Confirm result page renders all four cards plus deep-analysis panel
- Click a topic tab → without DASHSCOPE_API_KEY, you should see the friendly "未配置" message
- Open history → entry should be present
- Refresh page → history persists
- Resize browser to 375px → wizard, dial, and chart cards remain readable

If anything is broken or visually wrong, fix it before committing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire hero + wizard + result + history into home page"
```

---

## Phase 7 — Polish

### Task 30: Mobile/a11y polish pass

**Files:** various across `src/components/`

- [ ] **Step 1: Run on iPhone-SE viewport**

Use Chrome devtools at 375×667. Walk the entire flow and note any:
- Text overflow / horizontal scroll
- Tap targets < 44px
- Labels missing on inputs
- Focus order surprises

- [ ] **Step 2: Fix issues**

Common fixes:
- Add `aria-label` where icon-only buttons exist
- Ensure all form inputs have `<label>` association (already done in our steps; spot-check)
- For the time dial on small screens, ensure the 12 buttons still don't overflow — adjust radius if needed
- For the dayun timeline, verify horizontal scroll on desktop and vertical stack on mobile

Make changes inline. No new files.

- [ ] **Step 3: Lighthouse**

Run: `npm run build && npm run start` (separate terminal)

In Chrome devtools Lighthouse, run on the `/` mobile preset. Target ≥ 90 performance, ≥ 95 a11y.

If performance is below 90:
- Verify fonts use `display: swap` (already configured)
- Verify no console errors

If a11y below 95:
- Address each item Lighthouse reports

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "polish: mobile and a11y fixes for Lighthouse targets"
```

---

### Task 31: README with setup + Qwen key instructions

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

Create `README.md`:

```markdown
# 四柱 — 八字 Web App

古风新中式的四柱八字排盘 Web 应用。本地完成排盘与基础解读，可选调用阿里云 Qwen（通义千问）生成深度命理分析。

## 功能

- 4 步引导式输入（性别、阳/农历日期、十二时辰、出生地）
- 即时本地排盘：四柱、十神、五行旺衰、大运十步
- 可选 AI 深度解读：性格 / 事业 / 感情 / 健康
- 历史记录（浏览器本地，最多 10 条）
- 移动端友好

## 本地运行

```bash
npm install
cp .env.local.example .env.local
# 在 .env.local 中填入你的 DASHSCOPE_API_KEY（见下方）
npm run dev
```

打开 http://localhost:3000

## 申请 Qwen API Key

1. 访问阿里云百炼控制台：<https://bailian.console.aliyun.com/>
2. 开通服务，进入「API-KEY 管理」创建 key
3. 将 key 粘贴到 `.env.local` 的 `DASHSCOPE_API_KEY=` 后
4. 重启 `npm run dev`

未配置 key 时，深度解读 tab 会显示友好提示，基础排盘不受影响。

## 部署到 Vercel

1. Fork 本仓库，导入 Vercel
2. 在 Project Settings → Environment Variables 添加 `DASHSCOPE_API_KEY`
3. Deploy

## 技术栈

Next.js 14 (App Router) · TypeScript · Tailwind CSS · framer-motion · zustand · lunar-typescript · recharts

## 测试

```bash
npm test
```

## 声明

本应用为文化娱乐用途，不构成任何决策建议。
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "docs: README with setup and Qwen key instructions"
```

---

### Task 32: Final cross-validation with bazi skill

- [ ] **Step 1: Pick 3 birth dates**

E.g., 1980-08-15 06:30 male / 1995-12-22 22:15 female / 2003-03-08 14:00 male, all Beijing.

- [ ] **Step 2: Run each through `npm run dev`** and capture the four pillars + dayun first 3 steps shown.

- [ ] **Step 3: Invoke `bazi` skill** for each, comparing pillar-by-pillar.

- [ ] **Step 4: If all match, commit a final note**

```bash
git commit --allow-empty -m "chore: cross-validated pillars/dayun against bazi skill on 3 cases"
```

If any mismatch, return to Task 7 and fix.

---

## Self-Review Checklist (run before considering plan finalized)

Spec coverage check:
- 4-step wizard → Tasks 10-15 ✓
- Bazi calculator (pillars, hidden stems, ten gods, wuxing, dayun, day-master strength) → Tasks 4-7 ✓
- Qwen API + streaming + key in env → Tasks 21-23 ✓
- Local fallback → Task 20 ✓
- New-Chinese visual system (tokens, fonts) → Task 2 ✓
- Four chart components (4 pillars, wuxing radar, shishen, dayun) → Tasks 16-19 ✓
- Deep analysis panel with topic tabs → Task 24 ✓
- localStorage history (max 10) → Task 25-26 ✓
- Hero / home → Task 29 ✓
- Mobile + a11y → Task 30 ✓
- README with key instructions → Task 31 ✓
- Cross-validation against bazi skill → Tasks 7 + 32 ✓

Type consistency: `BaziChart`, `Pillar`, `DayunStep`, `BirthInput`, `ReadingTopic`, `HistoryEntry` are all defined once and referenced consistently across tasks.

Placeholder scan: No TBDs. Two skill-invocation steps (before Task 21 and Phase 4) are explicit calls-to-action with concrete prompts, not vague placeholders.

Out-of-scope items from spec correctly omitted: dark mode, accounts, PWA, neibu other systems, multi-language.
