# 四柱八字 Web App — 设计文档

**日期**：2026-05-06
**状态**：已确认设计，待写实现计划

## 一、目标

一个面向中文用户的八字排盘 Web 应用。本地完成排盘与基础解读，可选调用 Qwen API 生成深度个性化命理分析。要求：古风（新中式现代）、高级感、移动端友好。

## 二、核心决策

| 维度 | 决策 |
|---|---|
| 解读模式 | 混合：本地规则排盘即时显示 + 可选 Qwen 深度解读 |
| AI 后端 | Qwen（DashScope / 通义千问），key 由用户自行填入 `.env.local` |
| 技术栈 | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui |
| 功能范围 | 标准版：四柱、干支、五行、生肖、十神、五行旺衰、大运 10 步、深度解读 |
| 美学方向 | 新中式现代（莫兰迪化中国色，Noto Serif SC，大量留白） |
| 输入流程 | 4 步向导：基本信息 → 出生时间 → 出生地 → 确认 |
| 历史记录 | localStorage，最近 10 条 |
| 部署 | Vercel |

## 三、架构

### 3.1 目录结构

```
src/
  app/
    page.tsx                    # 首页（向导入口）
    api/analyze/route.ts        # Qwen API 代理（保护 key）
    layout.tsx
    globals.css
  components/
    wizard/
      WizardShell.tsx           # 步骤容器、进度指示、动画
      StepBasicInfo.tsx         # 姓名（可选）+ 性别
      StepBirthDate.tsx         # 阳/农历切换 + 年月日
      StepBirthTime.tsx         # 时辰圆盘（12 时辰）
      StepLocation.tsx          # 出生地城市搜索，输出经度，供真太阳时校正
      StepConfirm.tsx           # 信息确认 + 提交
    chart/
      FourPillarsCard.tsx       # 四柱主卡（年月日时柱）
      WuxingChart.tsx           # 五行旺衰（五边形雷达图）
      ShiShenTable.tsx          # 十神表
      DayunTimeline.tsx         # 大运时间轴（10 步）
      DeepAnalysisPanel.tsx     # 深度解读（流式渲染 + tab 切换）
    common/
      OrnamentDivider.tsx       # 古风分隔纹样（金线 + 回纹 SVG）
      InkButton.tsx             # 朱砂主按钮
      PaperCard.tsx             # 宣纸纹理卡片基类
      HistorySidebar.tsx        # 历史记录（桌面右侧栏 / 移动端抽屉）
      SealLogo.tsx              # 小篆「四柱」印章 logo
  lib/
    bazi/
      calculator.ts             # 排盘核心：四柱、藏干、五行、十神、大运
      lunar.ts                  # 阳历↔农历换算（lunar-typescript）
      constants.ts              # 天干地支、五行生克、神煞、十神规则
      types.ts                  # BaziChart、Pillar、Dayun 等类型
    qwen/
      client.ts                 # DashScope SDK 封装（流式调用）
      prompts.ts                # 命理解读 prompt（参照 bazi skill 的典籍框架）
    storage/
      history.ts                # localStorage CRUD（最多 10 条，按时间倒序）
    state/
      wizard-store.ts           # zustand：向导跨步骤状态
  styles/
    tokens.css                  # 设计 token（CSS 变量）
docs/
  superpowers/specs/            # 本文档所在
public/
  ornaments/                    # SVG 纹样素材（回纹、印章、山影等）
  fonts/                        # 字体文件（如自托管）
.env.local.example              # 包含 DASHSCOPE_API_KEY=
README.md                       # 含 Qwen key 申请与填入说明
```

### 3.2 数据流

```
用户填表（4 步） → zustand 收集
    ↓
提交 → calculator.ts 本地排盘（同步，<10ms）
    ↓
立即渲染：FourPillarsCard、WuxingChart、ShiShenTable、DayunTimeline
    ↓
同时：history.ts 写 localStorage
    ↓
用户点「深度解读」按钮
    ↓
POST /api/analyze（body：BaziChart + 解读类型 tab）
    ↓
服务端从环境变量读 DASHSCOPE_API_KEY → 调 Qwen 流式接口
    ↓
SSE 推回前端 → DeepAnalysisPanel 逐字浮现
```

### 3.3 Qwen API 接入

- **环境变量**：`.env.local` 的 `DASHSCOPE_API_KEY`，仓库内提供 `.env.local.example`，README 写明申请链接（[阿里云百炼](https://bailian.console.aliyun.com/)）
- **模型**：默认 `qwen-max`（最强，命理推理需要），允许通过 `QWEN_MODEL` 环境变量覆盖为 `qwen-plus`
- **路由**：`src/app/api/analyze/route.ts`，POST，流式响应（SSE）
- **错误回退**：key 未配置时返回友好提示（"管理员尚未配置 AI key，仅展示基础排盘"），前端在 panel 中显示静态规则解读
- **限流**：API route 内简单内存限流（同 IP 每分钟 10 次），避免滥用
- **Prompt 模板**：参考 `bazi` skill 中穷通宝典、滴天髓、子平真诠的分析框架，按解读类型（性格 / 事业 / 感情 / 健康）分别构造 system prompt

### 3.4 第三方依赖

| 包 | 用途 |
|---|---|
| `lunar-typescript` | 阳历/农历/八字基础换算 |
| `framer-motion` | 步骤切换、流式文字浮现动画 |
| `zustand` | 向导状态 |
| `recharts` 或自绘 SVG | 五行雷达图 |
| `tailwindcss` + `tailwindcss-animate` | 样式 |
| shadcn/ui 选用：Button、Dialog、Tabs、Sheet、Progress、Toast | UI 基础 |
| 内置 fetch + `eventsource-parser` | SSE 流式解析（Qwen 响应） |

## 四、视觉规范

### 4.1 色板

```css
--ink-900:   #1c1d1f;   /* 墨玉，主文字 */
--ink-600:   #5a5e63;   /* 次要文字 */
--paper:     #faf6ef;   /* 宣纸底，主背景 */
--paper-2:   #f2ebde;   /* 次背景/卡片 */
--cinnabar:  #b14a3a;   /* 朱砂，强调/主按钮 */
--celadon:   #87a08c;   /* 青瓷，五行木 */
--gold:      #c9a96a;   /* 赭金，分隔/纹样 */
--indigo:    #3b4a5a;   /* 黛青，五行水 */
--moon:      #e8e2d4;   /* 月白，五行金 */
```

**五行配色**：木=青瓷 / 火=朱砂 / 土=赭金 / 金=月白 / 水=黛青。
**对比度**：ink-900 on paper ≥ 12:1；cinnabar on paper ≥ 7:1。
**色彩冗余**：五行同时用形状/纹样区分（不依赖纯色辨识，可达性）。

### 4.2 排版

| 用途 | 字体 | 字重 | 字号 |
|---|---|---|---|
| 主标题 | Noto Serif SC | 700 | `clamp(28px, 5vw, 42px)` |
| 副标题 | Noto Serif SC | 600 | `clamp(20px, 3vw, 28px)` |
| 正文 | Noto Serif SC | 400 | 16px / 行高 1.8 |
| 干支大字 | Noto Serif SC | 600 | `clamp(36px, 8vw, 64px)` |
| UI/数字 | Noto Sans SC | 500 | 14-16px |

字距：标题 +0.05em（古意），正文默认。

### 4.3 布局节奏

- 8px 栅格（spacing-1 = 4px, spacing-2 = 8px ...）
- 主区域 max-width 720px 居中
- 卡片圆角 2px（克制）
- 阴影：单层柔光 `0 1px 24px rgba(28,29,31,0.06)`，避免现代质感过重
- 分隔统一用 `OrnamentDivider`：1px 金线 + 中央 12×12 回纹 SVG

### 4.4 关键组件视觉

1. **首页**：上半屏全幅水墨渐隐山影 SVG（透明度 ≤ 8%），中央竖排标题「四柱」+ 副标「知命，知未来」，下方一颗朱砂印章按钮「开始排盘」
2. **向导步骤指示器**：4 个赭金描边小圆 + 金线连接，已完成填实，当前步骤略放大并发淡光（CSS `box-shadow` glow）
3. **时辰选择**：12 时辰圆盘（子丑寅卯…），SVG 实现，点选时辰名 + 干支同时高亮，盘面平滑旋转将所选时辰对齐到顶部 12 点位置
4. **四柱主卡**：四列竖排（年月日时），每列结构上→下：天干（大字）/ 地支（大字）/ 藏干（小字）/ 十神标签（更小字），列间金线分隔，PaperCard 容器
5. **五行旺衰**：五边形雷达图，顶点对应五行配色，背景半透明 paper-2，旁附文字总结（如「日主偏弱，喜印比」）
6. **大运时间轴**：横向滚动卡片（移动端竖向堆叠），每段 10 年一卡片含起运虚岁、干支、十神，当前大运用 cinnabar 边框 + 「现行」角标
7. **深度解读面板**：默认折叠，展开后内顶部 4 个 tab（性格 / 事业 / 感情 / 健康），点击对应 tab 触发该类型流式解读，文字逐字浮现（每段首加 ❖ 形回纹符号），底部小字标注「本解读由 Qwen AI 参照命理典籍生成，仅供参考」

### 4.5 交互

- 过渡：300-400ms `cubic-bezier(0.4, 0, 0.2, 1)`，无弹跳
- 步骤切换：横向 24px 滑出 + opacity 0→1 淡入
- 按钮按下：cinnabar 加深 8% + scale 0.97
- Loading：水墨毛笔点在纸上慢慢晕开（CSS keyframes 控制 SVG 圆形 scale + opacity）
- 错误提示：cinnabar 底白字横幅，无图标，4s 自动消失
- 触觉：移动端关键操作（提交、tab 切换）触发 `navigator.vibrate?.(10)`

### 4.6 移动端

- 断点 `< 640px`：单列竖排
- 时辰圆盘改为转盘 + 底部 shadcn `Sheet` 确认抽屉
- 所有点击区域 ≥ 44×44px
- 安全区适配 `env(safe-area-inset-*)`
- 历史记录：桌面右侧栏（240px 宽），移动端通过 header 汉堡按钮唤出顶部 Sheet

### 4.7 可达性

- 全键盘可达（Tab 顺序与视觉一致）
- 焦点环：赭金 2px outline + 2px offset
- 五行色块辅以图形/纹样标识
- `prefers-reduced-motion` 时关闭旋转、毛笔晕染等强动效，仅保留淡入淡出
- 表单字段全部带 `<label>`，错误提示 `aria-live="polite"`

### 4.8 暗色模式

第一期不做。预留 token 命名空间（`@media (prefers-color-scheme: dark)`），第二期补完。

## 五、Bazi 计算逻辑要点

由 `lib/bazi/calculator.ts` 实现，参考 `bazi` skill 的典籍标准：

1. **四柱**：基于 `lunar-typescript` 的 `EightChar`，注意子时分晚子（23:00-23:59 归次日）/ 早子（00:00-00:59 归当日），统一采用「晚子时算次日日柱」的传统派
2. **真太阳时校正**：根据出生地经度对北京时间做修正（默认开启简单经度修正：每偏离 120°E 经度 1° 调 ±4 分钟；不做均时差等高精度方程，第二期可加）
3. **藏干**：地支藏干表（`constants.ts`），按本气、中气、余气顺序
4. **十神**：以日干为主，对其他七干计算十神关系
5. **五行旺衰**：综合月令、地支藏干、天干透出、生克制化，给出旺/相/休/囚/死及日主强弱判断
6. **大运**：根据年柱阴阳与性别决定顺逆排，10 步（覆盖 100 年），每步起运虚岁精确到月

实现完成后，用 `bazi` skill 的标准案例做交叉校验。

## 六、本地解读（无 AI 时的兜底）

`DeepAnalysisPanel` 在 Qwen key 缺失或调用失败时，仍能展示规则化解读：
- 五行旺衰文字总结
- 日主强弱与喜用神判断
- 当前大运简评
- 主要十神格局识别（如正官格、伤官格）

文案模板放在 `lib/bazi/local-analysis.ts`，简短克制（避免假装 AI）。

## 七、隐私与安全

- 所有出生信息仅存于浏览器 localStorage，不上传
- `/api/analyze` 仅传输八字结构（已脱敏的天干地支组合）和解读类型，不传姓名/出生地原文
- Qwen key 永不暴露到前端（仅服务端读 env）
- README 说明：本应用为娱乐用途，不构成任何决策建议

## 八、非目标（Out of Scope）

- 用户账号系统、云同步
- 暗色模式（第二期）
- 紫微斗数、奇门遁甲等其他命理体系
- 神煞详细列表（标准版不含）
- 多语言（仅简体中文）
- PWA / 离线安装（第二期可加）
- SSR SEO 优化（首页是静态的，足够；结果页不索引）

## 九、成功标准

1. 移动端 Lighthouse 性能 ≥ 90，无障碍 ≥ 95
2. 输入到排盘渲染 ≤ 200ms（含动画起始）
3. Qwen 流式响应首字 ≤ 3s
4. 与 `bazi` skill 在 5 个典型案例上排盘结果完全一致
5. iPhone SE 与 iPad 上视觉无明显错位
6. 用户填完 4 步向导无需任何说明文档

## 十、实施阶段（粗略）

阶段一：脚手架 + 排盘核心 + 4 步向导 + 基础结果展示
阶段二：视觉打磨（古风组件、动效、字体）
阶段三：Qwen API route + 流式深度解读 + 本地兜底
阶段四：历史记录 + 移动端适配 + 可达性 + Lighthouse 调优

详细任务拆分见后续 implementation plan。
