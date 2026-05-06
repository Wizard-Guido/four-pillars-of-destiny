export type QwenRegion = "cn" | "intl";

const ENDPOINTS: Record<QwenRegion, string> = {
  cn: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  intl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
};

export function endpointFor(region: QwenRegion | undefined): string {
  if (process.env.QWEN_ENDPOINT) return process.env.QWEN_ENDPOINT;
  return ENDPOINTS[region ?? "cn"];
}

export function parseRegionHeader(value: string | null): QwenRegion {
  return value === "intl" ? "intl" : "cn";
}
