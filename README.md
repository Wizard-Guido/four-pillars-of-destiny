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

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · framer-motion · zustand · lunar-typescript · recharts

## 测试

```bash
npm test
```

## 声明

本应用为文化娱乐用途，不构成任何决策建议。
