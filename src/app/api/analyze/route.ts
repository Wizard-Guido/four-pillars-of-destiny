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

  const authHeader = req.headers.get("authorization");
  const userKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;

  const messages = buildAnalysisMessages(body.chart, body.topic);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamQwen(messages, { signal: req.signal, apiKey: userKey })) {
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
