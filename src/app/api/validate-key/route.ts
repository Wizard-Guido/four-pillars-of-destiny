import { NextRequest } from "next/server";
import { endpointFor, parseRegionHeader } from "@/lib/qwen/endpoints";

export const runtime = "nodejs";

const VALIDATION_MODEL = "qwen-turbo";

interface QwenErrorBody {
  error?: { code?: string; message?: string; type?: string };
  message?: string;
  code?: string;
}

function extractQwenError(raw: string): string {
  try {
    const j: QwenErrorBody = JSON.parse(raw);
    return j.error?.message ?? j.message ?? raw.slice(0, 200);
  } catch {
    return raw.slice(0, 200);
  }
}

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

  const region = parseRegionHeader(req.headers.get("x-qwen-region"));
  const endpoint = endpointFor(region);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: VALIDATION_MODEL,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
        stream: false,
      }),
    });

    if (res.ok) {
      return new Response("ok", { status: 200 });
    }

    const raw = await res.text().catch(() => "");
    const detail = extractQwenError(raw);
    const regionLabel = region === "intl" ? "海外" : "国内";

    if (res.status === 401) {
      return new Response(
        `Key 鉴权失败（${regionLabel}站点）：${detail}`,
        { status: 401 },
      );
    }
    if (res.status === 403) {
      return new Response(
        `Key 无访问权限（${regionLabel}站点）：${detail}`,
        { status: 403 },
      );
    }
    if (res.status === 429) {
      return new Response(`请求过于频繁，请稍后再试：${detail}`, { status: 429 });
    }
    return new Response(
      `Qwen 校验失败 (${res.status})：${detail}`,
      { status: 502 },
    );
  } catch (e) {
    return new Response(
      `网络错误：${e instanceof Error ? e.message : String(e)}`,
      { status: 500 },
    );
  }
}
