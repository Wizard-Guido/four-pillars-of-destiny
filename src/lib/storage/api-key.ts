const KEY_NAME = "bazi.qwen-key.v1";
const REGION_NAME = "bazi.qwen-region.v1";
const REMEMBER_NAME = "bazi.qwen-remember.v1";

export type QwenRegion = "cn" | "intl";

function getStorage(remember: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  return remember ? window.localStorage : window.sessionStorage;
}

export function loadApiKey():
  | { key: string; region: QwenRegion; remember: boolean }
  | null {
  if (typeof window === "undefined") return null;
  let key = window.localStorage.getItem(KEY_NAME);
  let remember = true;
  if (!key) {
    key = window.sessionStorage.getItem(KEY_NAME);
    remember = false;
  }
  if (!key) return null;
  const storage = remember ? window.localStorage : window.sessionStorage;
  const region = (storage.getItem(REGION_NAME) ?? "cn") as QwenRegion;
  return { key, region, remember };
}

export function saveApiKey(key: string, region: QwenRegion, remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_NAME);
  window.localStorage.removeItem(REGION_NAME);
  window.sessionStorage.removeItem(KEY_NAME);
  window.sessionStorage.removeItem(REGION_NAME);
  const storage = getStorage(remember);
  storage?.setItem(KEY_NAME, key);
  storage?.setItem(REGION_NAME, region);
  window.localStorage.setItem(REMEMBER_NAME, remember ? "1" : "0");
  window.dispatchEvent(new CustomEvent("bazi:apikey-changed"));
}

export function clearApiKey() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_NAME);
  window.localStorage.removeItem(REGION_NAME);
  window.sessionStorage.removeItem(KEY_NAME);
  window.sessionStorage.removeItem(REGION_NAME);
  window.localStorage.removeItem(REMEMBER_NAME);
  window.dispatchEvent(new CustomEvent("bazi:apikey-changed"));
}

export function maskKey(key: string): string {
  if (key.length < 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}
