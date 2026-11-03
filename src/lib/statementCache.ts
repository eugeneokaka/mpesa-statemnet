import type { Analysis } from "./types";

const STORAGE_KEY = "pesa-insights:recent:v1";
const MAX_ENTRIES = 3;
const MAX_BYTES = 3_500_000;

export type RecentEntry = {
  documentId: string;
  analysis: Analysis;
  savedAt: number;
};

const EMPTY: RecentEntry[] = [];
const listeners = new Set<() => void>();
let snapshot: RecentEntry[] = EMPTY;
let initialized = false;

function refresh(): void {
  snapshot = read();
  initialized = true;
  for (const listener of listeners) listener();
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function isRecentEntry(value: unknown): value is RecentEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<RecentEntry>;
  const documentId = (entry.analysis as Analysis | undefined)?.statement?.document_id;
  return typeof documentId === "string" && documentId.length > 0;
}

function read(): RecentEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentEntry);
  } catch {
    return [];
  }
}

function write(entries: RecentEntry[]): void {
  if (!hasStorage()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 1)));
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function saveAnalysis(analysis: Analysis): void {
  const documentId = analysis.statement.document_id;
  if (!documentId) return;

  const entry: RecentEntry = { documentId, analysis, savedAt: Date.now() };
  const others = read().filter((item) => item.documentId !== documentId);
  let entries = [entry, ...others].slice(0, MAX_ENTRIES);

  while (entries.length > 1 && new Blob([JSON.stringify(entries)]).size > MAX_BYTES) {
    entries = entries.slice(0, -1);
  }

  write(entries);
  refresh();
}

export function getAnalysis(documentId: string): Analysis | null {
  return read().find((item) => item.documentId === documentId)?.analysis ?? null;
}

export function listAnalyses(): RecentEntry[] {
  return read().sort((a, b) => b.savedAt - a.savedAt);
}

export function removeAnalysis(documentId: string): void {
  write(read().filter((item) => item.documentId !== documentId));
  refresh();
}

export function clearAnalyses(): void {
  if (hasStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
  refresh();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): RecentEntry[] {
  if (!initialized) {
    snapshot = read();
    initialized = true;
  }
  return snapshot;
}

export function getServerSnapshot(): RecentEntry[] {
  return EMPTY;
}
