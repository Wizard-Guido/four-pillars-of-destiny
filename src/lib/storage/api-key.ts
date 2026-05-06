const KEY_NAME = "bazi.qwen-key.v1";
const REMEMBER_NAME = "bazi.qwen-remember.v1";

function getStorage(remember: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  return remember ? window.localStorage : window.sessionStorage;
}

export function loadApiKey(): { key: string; remember: boolean } | null {
  if (typeof window === "undefined") return null;
  const localKey = window.localStorage.getItem(KEY_NAME);
  if (localKey) return { key: localKey, remember: true };
  const sessionKey = window.sessionStorage.getItem(KEY_NAME);
  if (sessionKey) return { key: sessionKey, remember: false };
  return null;
}

export function saveApiKey(key: string, remember: boolean) {
  if (typeof window === "undefined") return;
  // Clear from the other storage to avoid duplicates
  window.localStorage.removeItem(KEY_NAME);
  window.sessionStorage.removeItem(KEY_NAME);
  const storage = getStorage(remember);
  storage?.setItem(KEY_NAME, key);
  window.localStorage.setItem(REMEMBER_NAME, remember ? "1" : "0");
  window.dispatchEvent(new CustomEvent("bazi:apikey-changed"));
}

export function clearApiKey() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_NAME);
  window.sessionStorage.removeItem(KEY_NAME);
  window.localStorage.removeItem(REMEMBER_NAME);
  window.dispatchEvent(new CustomEvent("bazi:apikey-changed"));
}

export function maskKey(key: string): string {
  if (key.length < 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}
