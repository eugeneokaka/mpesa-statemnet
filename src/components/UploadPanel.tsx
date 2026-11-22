"use client";

import { useEffect, useRef, useState } from "react";

import {
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  ShieldIcon,
  UploadIcon,
  XIcon,
} from "@/components/icons";
import {
  PageHeader,
  Panel,
  StatusPill,
  btnGhost,
  btnPrimary,
  btnSecondary,
} from "@/components/ui";
import { analyzeStatement } from "@/lib/api";
import { formatDate, kes } from "@/lib/format";
import { hashFile } from "@/lib/hash";
import { getAnalysis, type RecentEntry } from "@/lib/statementCache";
import type { Analysis } from "@/lib/types";

type Props = {
  onAnalyzed: (analysis: Analysis) => void;
  recent: RecentEntry[];
  onRemoveRecent: (documentId: string) => void;
  onClearRecent: () => void;
};

const privacyPoints = [
  ["In-memory only", "Your PDF and password are used once to build the analysis."],
  ["No database", "We never store your PDF, password, or transactions on our servers."],
  ["No content logs", "Request bodies and file contents are not logged."],
  ["This tab only", "Recent analyses stay in this browser tab and clear when you close it."],
];

type UploadError = {
  title: string;
  message: string;
  hint?: string;
};

function describeError(error: unknown): UploadError {
  const message =
    error instanceof Error ? error.message : "Something went wrong. Please try again.";
  const lower = message.toLowerCase();

  if (lower.includes("max 4 mb")) {
    return {
      title: "File is too large",
      message,
      hint: "Upload a statement PDF under 4 MB. If yours is bigger, request a shorter period from M-PESA.",
    };
  }

  if (
    lower.includes("too long") ||
    lower.includes("too large") ||
    lower.includes("shorter period") ||
    lower.includes("page limit")
  ) {
    return {
      title: "This statement is too large to analyze",
      message,
      hint: "Request a shorter period from M-PESA, for example the last 3–6 months, then upload that PDF.",
    };
  }

  if (lower.includes("password") || lower.includes("pin")) {
    return {
      title: "Could not open the PDF",
      message,
      hint: "Use the password that opens the PDF file, not your M-PESA PIN or OTP.",
    };
  }

  return { title: "Analysis failed", message };
}

export function UploadPanel({
  onAnalyzed,
  recent,
  onRemoveRecent,
  onClearRecent,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [cached, setCached] = useState<Analysis | null>(null);
  const [error, setError] = useState<UploadError | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [error]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function pickFile(files: FileList | null) {
    setError(null);
    const next = files?.[0];
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".pdf")) {
      setError({
        title: "Unsupported file",
        message: "Please choose an M-PESA statement PDF.",
      });
      return;
    }

    setFile(next);
    setCached(null);
    setHashing(true);
    try {
      const hash = await hashFile(next);
      setCached(getAnalysis(hash));
    } catch {
      // Hashing is best-effort; the server still returns a document ID.
    } finally {
      setHashing(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError({
        title: "No file selected",
        message: "Upload your M-PESA statement PDF first.",
      });
      return;
    }

    if (cached) {
      onAnalyzed(cached);
      return;
    }

    if (!pin.trim()) {
      setError({
        title: "Password required",
        message: "Enter the password used to open the PDF.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeStatement(file, pin.trim());
      onAnalyzed(analysis);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Get started"
        title="Dashboard"
        subtitle="Upload your Safaricom M-PESA statement PDF and instantly see where your money went — categories, recipients, fees, and daily habits."
        actions={
          <>
            <button type="button" onClick={() => scrollTo("upload-form")} className={btnPrimary}>
              <UploadIcon className="h-4 w-4" />
              Upload PDF
            </button>
            <button type="button" onClick={() => scrollTo("privacy")} className={btnSecondary}>
              <ShieldIcon className="h-4 w-4" />
              Privacy
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <form
          id="upload-form"
          onSubmit={handleSubmit}
          className="min-w-0 rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,20,0.04)] sm:p-5 lg:col-span-2"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Analyze a statement</h2>
              <p className="mt-0.5 text-[11px] text-muted">
                PDF only · 4 MB max · processed in memory
              </p>
            </div>
            <StatusPill tone="green">Secure</StatusPill>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              pickFile(event.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-9 text-center transition sm:px-6 sm:py-12 ${
              dragging
                ? "border-brand bg-brand-soft"
                : "pattern-mint border-mint bg-mint-soft/60 hover:border-brand/50 hover:bg-brand-soft/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => pickFile(event.target.files)}
            />
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-sm">
              <UploadIcon className="h-5 w-5" />
            </div>
            {file ? (
              <>
                <p className="mt-4 max-w-full truncate text-sm font-semibold text-ink">
                  {file.name}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {(file.size / 1024).toFixed(0)} KB · click to change
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm font-semibold text-ink">
                  Drop your M-PESA statement here
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  or click to browse · PDF only
                </p>
              </>
            )}
            {hashing && (
              <p className="mt-2 text-[11px] text-muted">
                Checking this file for a saved copy…
              </p>
            )}
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#f2e0bb] bg-[#fdf6e7] p-3.5">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f6e7c4] text-[#9a6f1a]">
              <ShieldIcon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-[#7a5a15]">
                Do not enter your M-PESA PIN or OTP.
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-[#8a6a1f]">
                Use only the password that opens the PDF file — usually the
                password sent to your phone by SMS.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="pin" className="text-[13px] font-semibold text-ink">
                PDF password
              </label>
              <span className="rounded-full bg-[#fbeae4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#bb5238]">
                Not your M-PESA PIN
              </span>
            </div>
            <div className="relative mt-2">
              <input
                id="pin"
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="PDF password only (e.g. the SMS password)"
                autoComplete="off"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 pr-16 text-sm text-ink outline-none transition placeholder:text-muted/80 focus:border-mint focus:ring-2 focus:ring-brand-soft"
              />
              <button
                type="button"
                onClick={() => setShowPin((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-semibold text-muted transition hover:bg-warm hover:text-ink"
              >
                {showPin ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Usually the password sent to your phone by SMS. It is used once and
              never stored.
            </p>
          </div>

          {cached && (
            <div className="mt-3 rounded-xl border border-mint bg-mint-soft px-3 py-2 text-[11px] text-brand-dark">
              Already analyzed in this tab. View it instantly — no re-upload and no
              PDF password needed.
            </div>
          )}

          {error && (
            <div
              ref={errorRef}
              role="alert"
              aria-live="polite"
              className="mt-4 flex items-start gap-3 rounded-xl border border-[#f3d3ca] bg-[#fdf0ec] px-3.5 py-3"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f8dfd7] text-[#a9472f]">
                <XIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#8f3a25]">
                  {error.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-5 text-[#a9472f]">
                  {error.message}
                </p>
                {error.hint && (
                  <p className="mt-2 rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] leading-5 text-[#8f3a25]">
                    {error.hint}
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} mt-5 w-full py-3`}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z"
                  />
                </svg>
                Analyzing your statement…
              </>
            ) : cached ? (
              "View previous analysis"
            ) : (
              "Analyze statement"
            )}
          </button>

          {loading && (
            <p className="mt-2 text-center text-[11px] leading-5 text-muted">
              Large statements can take up to a minute. Keep this tab open.
            </p>
          )}
        </form>

        <div className="flex flex-col gap-4">
          <Panel
            id="privacy"
            title="How we handle your data"
            subtitle="Private by default, no account needed"
            action={<ShieldIcon className="h-4 w-4 text-brand" />}
          >
            <ul className="space-y-3">
              {privacyPoints.map(([title, body]) => (
                <li key={title} className="flex gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-ink">{title}</p>
                    <p className="text-[11px] leading-5 text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          {recent.length > 0 && (
            <Panel
              title="Recent in this tab"
              subtitle="Not saved to any server"
              action={
                <button type="button" onClick={onClearRecent} className={btnGhost}>
                  Clear all
                </button>
              }
            >
              <ul className="divide-y divide-line">
                {recent.map((entry) => (
                  <li key={entry.documentId} className="flex items-center gap-2.5 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                      <FileTextIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-ink">
                        {entry.analysis.statement.filename || "M-PESA statement"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted">
                        <ClockIcon className="h-3 w-3" />
                        {formatDate(entry.analysis.period.start)} ·{" "}
                        {kes(entry.analysis.totals.consumption_spend, 0)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAnalyzed(entry.analysis)}
                      className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[10px] font-semibold text-ink transition hover:border-mint hover:bg-warm"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveRecent(entry.documentId)}
                      aria-label="Remove from history"
                      className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-warm hover:text-ink"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <div className="relative overflow-hidden rounded-2xl bg-brand-dark p-4 text-white">
            <div className="pattern-dark pointer-events-none absolute inset-0 opacity-80" />
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <ShieldIcon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-[13px] font-semibold leading-snug">
                Your PDF is never stored
              </p>
              <p className="mt-1 text-[11px] leading-4 text-white/60">
                We never ask for your M-PESA PIN or OTP. Only the PDF password is
                used, once, to read your statement.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-white/70">
                <span className="rounded-full bg-white/10 px-2 py-1">No DB</span>
                <span className="rounded-full bg-white/10 px-2 py-1">No logs</span>
                <span className="rounded-full bg-white/10 px-2 py-1">Tab-only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
