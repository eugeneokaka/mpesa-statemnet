"use client";

import { useState, useSyncExternalStore } from "react";

import { Dashboard } from "@/components/Dashboard";
import { UploadPanel } from "@/components/UploadPanel";
import {
  clearAnalyses,
  getServerSnapshot,
  getSnapshot,
  removeAnalysis,
  saveAnalysis,
  subscribe,
} from "@/lib/statementCache";
import type { Analysis } from "@/lib/types";

export default function Home() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const recent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleAnalyzed(next: Analysis) {
    saveAnalysis(next);
    setAnalysis(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRemoveRecent(documentId: string) {
    removeAnalysis(documentId);
  }

  function handleClearRecent() {
    clearAnalyses();
  }

  function reset() {
    setAnalysis(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f6]">
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white shadow-sm">
              M
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-zinc-900">
                Pesa Insights
              </p>
              <p className="text-[11px] leading-tight text-zinc-500">
                M-PESA statement analyzer
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            No DB · No logs
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-7xl">
          {analysis ? (
            <Dashboard analysis={analysis} onReset={reset} />
          ) : (
            <UploadPanel
              onAnalyzed={handleAnalyzed}
              recent={recent}
              onRemoveRecent={handleRemoveRecent}
              onClearRecent={handleClearRecent}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200/70 bg-white/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>We never ask for your M-PESA PIN or OTP. Your PDF is never stored.</p>
          <p>Not affiliated with Safaricom PLC.</p>
        </div>
      </footer>
    </div>
  );
}
