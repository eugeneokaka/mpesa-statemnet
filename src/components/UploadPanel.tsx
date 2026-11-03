"use client";

import { useRef, useState } from "react";

import { analyzeStatement } from "@/lib/api";
import { formatDate, kes, shortId } from "@/lib/format";
import { hashFile } from "@/lib/hash";
import { getAnalysis, type RecentEntry } from "@/lib/statementCache";
import type { Analysis } from "@/lib/types";

type Props = {
  onAnalyzed: (analysis: Analysis) => void;
  recent: RecentEntry[];
  onRemoveRecent: (documentId: string) => void;
  onClearRecent: () => void;
};

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
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function pickFile(files: FileList | null) {
    setError("");
    const next = files?.[0];
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
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
      setError("Upload your M-PESA statement PDF first.");
      return;
    }

    if (cached) {
      onAnalyzed(cached);
      return;
    }

    if (!pin.trim()) {
      setError("Enter the password used to open the PDF.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const analysis = await analyzeStatement(file, pin.trim());
      onAnalyzed(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Private, in-memory analysis
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Understand your M-PESA spending
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-500">
          Upload your Safaricom M-PESA statement and its PDF password. We will
          break down where your money went, your biggest expenses, and your
          daily habits.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      >
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
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-emerald-500 bg-emerald-50"
              : "border-zinc-200 bg-zinc-50/60 hover:border-emerald-400 hover:bg-emerald-50/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => pickFile(event.target.files)}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4 4 4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          {file ? (
            <>
              <p className="mt-4 text-sm font-medium text-zinc-900">{file.name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {(file.size / 1024).toFixed(0)} KB · click to change
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm font-medium text-zinc-900">
                Drop your M-PESA statement here
              </p>
              <p className="mt-1 text-xs text-zinc-500">or click to browse · PDF only</p>
            </>
          )}
          {hashing && (
            <p className="mt-2 text-xs text-zinc-400">Checking this file for a saved copy…</p>
          )}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Do not enter your M-PESA PIN or OTP.
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Use only the password that opens the PDF file — usually your ID
              number or phone number. This tool will never ask for your M-PESA
              PIN.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label htmlFor="pin" className="text-sm font-medium text-zinc-800">
              PDF password
            </label>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 ring-1 ring-inset ring-red-200">
              Not your M-PESA PIN
            </span>
          </div>
          <div className="relative mt-2">
            <input
              id="pin"
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="PDF password only (e.g. ID or phone number)"
              autoComplete="off"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-16 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={() => setShowPin((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            >
              {showPin ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Usually your ID number or phone number. It is used once and never stored.
          </p>
        </div>

        {cached && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Already analyzed in this tab. Click below to view it instantly — no
            re-upload and no PDF password needed.
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
              </svg>
              Analyzing your statement…
            </>
          ) : cached ? (
            "View previous analysis"
          ) : (
            "Analyze statement"
          )}
        </button>
      </form>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 6v6c0 4.5 3.4 7.9 8 9 4.6-1.1 8-4.5 8-9V6l-8-3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
          </svg>
          How we handle your data
        </h2>
        <ul className="mt-3 space-y-2.5 text-xs leading-5 text-zinc-600">
          <li>
            <span className="font-medium text-zinc-800">In-memory only.</span>{" "}
            Your PDF and password are used once to generate the analysis.
          </li>
          <li>
            <span className="font-medium text-zinc-800">No database.</span> We
            never store your PDF, password, or transactions on our servers.
          </li>
          <li>
            <span className="font-medium text-zinc-800">No content logs.</span>{" "}
            Request bodies and file contents are not logged.
          </li>
          <li>
            <span className="font-medium text-zinc-800">This tab only.</span>{" "}
            Recent analyses stay in this browser tab and clear when you close it.
          </li>
          <li>
            <span className="font-medium text-zinc-800">HTTPS.</span> Always use
            the deployed site over a secure connection.
          </li>
        </ul>
        <p className="mt-3 text-[11px] leading-5 text-zinc-400">
          Pesa Insights is not affiliated with Safaricom PLC. We will never ask
          for your M-PESA PIN or OTP.
        </p>
      </section>

      {recent.length > 0 && (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Recent in this tab</h2>
            <button
              type="button"
              onClick={onClearRecent}
              className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            >
              Clear all
            </button>
          </div>
          <ul className="mt-2 divide-y divide-zinc-100">
            {recent.map((entry) => (
              <li key={entry.documentId} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {entry.analysis.statement.filename || "M-PESA statement"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {formatDate(entry.analysis.period.start)} ·{" "}
                    {kes(entry.analysis.totals.consumption_spend, 0)} · ID{" "}
                    {shortId(entry.documentId)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAnalyzed(entry.analysis)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-emerald-400 hover:text-emerald-700"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveRecent(entry.documentId)}
                  aria-label="Remove from history"
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
