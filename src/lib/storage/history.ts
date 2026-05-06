const KEY = "bazi.history.v1";
const MAX = 10;

export interface HistoryEntry {
  id: string;
  label: string;
  chartJson: string;
  savedAt: number;
}

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(list: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listHistory(): HistoryEntry[] {
  return read().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveHistory(entry: HistoryEntry) {
  const list = read().filter((e) => e.id !== entry.id);
  list.push(entry);
  list.sort((a, b) => b.savedAt - a.savedAt);
  write(list.slice(0, MAX));
}

export function removeHistory(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function clearHistory() {
  write([]);
}
