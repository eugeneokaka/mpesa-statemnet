"use client";

import { useState, useSyncExternalStore } from "react";

import { AppShell } from "@/components/AppShell";
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

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Home() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [view, setView] = useState<"upload" | "results">("upload");
  const recent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleAnalyzed(next: Analysis) {
    saveAnalysis(next);
    setAnalysis(next);
    setView("results");
    scrollTop();
  }

  function reset() {
    setView("upload");
    scrollTop();
  }

  function handleRemoveRecent(documentId: string) {
    removeAnalysis(documentId);
  }

  function handleClearRecent() {
    clearAnalyses();
  }

  const showResults = view === "results" && analysis !== null;

  return (
    <AppShell>
      {showResults && analysis ? (
        <Dashboard analysis={analysis} onReset={reset} />
      ) : (
        <UploadPanel
          onAnalyzed={handleAnalyzed}
          recent={recent}
          onRemoveRecent={handleRemoveRecent}
          onClearRecent={handleClearRecent}
        />
      )}
    </AppShell>
  );
}
