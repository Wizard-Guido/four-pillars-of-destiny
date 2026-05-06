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
  const flush = { resolve: null as (() => void) | null };

  const parser = createParser({
    onEvent(evt: EventSourceMessage) {
      if (evt.data === "[DONE]") return;
      try {
        const json = JSON.parse(evt.data);
        const delta = json.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          queue.push(delta);
          flush.resolve?.();
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
      flush.resolve?.();
    }
  })();

  while (true) {
    if (queue.length > 0) {
      yield queue.shift()!;
      continue;
    }
    if (done) return;
    await new Promise<void>((r) => { flush.resolve = r; });
    flush.resolve = null;
  }
}
