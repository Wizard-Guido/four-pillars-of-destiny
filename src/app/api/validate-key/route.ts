import { NextRequest } from "next/server";

export const runtime = "nodejs";

const ENDPOINT =
  process.env.QWEN_ENDPOINT ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export async function POST(req: NextRequest) {
  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const key = body.key?.trim();
  if (!key) {
    return new Response("Missing key", { status: 400 });
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.QWEN_MODEL ?? "qwen-max",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
        stream: false,
      }),
    });
    if (res.status === 401 || res.status === 403) {
      return new Response("无效的 API Key，请检查后重试。", { status: 401 });
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return new Response(`Qwen 校验失败 (${res.status}): ${txt.slice(0, 200)}`, {
        status: 502,
      });
    }
    return new Response("ok", { status: 200 });
  } catch (e) {
    return new Response(`网络错误：${e instanceof Error ? e.message : String(e)}`, {
      status: 500,
    });
  }
}
