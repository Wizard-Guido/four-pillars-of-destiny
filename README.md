# 四柱 — 八字 Web App

古风新中式的四柱八字排盘 Web 应用。本地完成排盘与基础解读，可选调用阿里云 Qwen（通义千问）生成深度命理分析。

## 功能

- 5 步引导式输入（姓名性别、阳/农历日期、十二时辰、出生地、确认）
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

## 申请并配置 Qwen API Key

应用支持两种配置方式：

**方式一（推荐）：在应用内配置**

1. 启动应用后，点击右上角齿轮图标
2. 申请 Key：<https://bailian.console.aliyun.com/> → API-KEY 管理
3. 粘贴 Key，点击「验证并保存」

Key 仅保存在你的浏览器本地存储（可选「仅本次会话」模式）。

**方式二：服务器环境变量**（多人共用部署时）

在 `.env.local` 或部署平台环境变量设置 `DASHSCOPE_API_KEY=...`。
此模式下所有用户共享同一 Key，无需在 UI 中配置。

## 部署到 Vercel

1. Fork 本仓库，导入 Vercel
2. 在 Project Settings → Environment Variables 添加 `DASHSCOPE_API_KEY`
3. Deploy

## 技术栈

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · framer-motion · zustand · lunar-typescript · recharts

## 测试

```bash
npm test
```

## 声明

本应用为文化娱乐用途，不构成任何决策建议。
