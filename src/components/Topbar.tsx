"use client";

import { useState } from "react";

import { ShieldIcon } from "@/components/icons";

const privacyPoints = [
  [
    "Processed on our server",
    "PDFs are uploaded over HTTPS, analyzed in memory, then discarded.",
  ],
  ["No database", "Statements, passwords, and transactions are never stored."],
  ["No content logs", "Request bodies and file contents are not logged."],
  ["This tab only", "Recent analyses clear when you close the tab."],
];

export function Topbar() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between gap-3 border-b border-line px-4 py-4 print:hidden sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-white shadow-sm">
          <span className="text-[15px] font-bold leading-none">M</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight text-ink">
            Pesa Insights
          </p>
          <p className="hidden text-[10px] leading-tight text-muted sm:block">
            M-PESA statement analyzer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPrivacyOpen((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-[11px] font-semibold text-muted transition hover:border-mint hover:text-ink"
          >
            <ShieldIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Privacy</span>
          </button>

          {privacyOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border border-line bg-white p-3.5 text-xs shadow-[0_18px_40px_-24px_rgba(16,40,28,0.5)]">
              <p className="font-semibold text-ink">How we handle your data</p>
              <ul className="mt-2 space-y-2">
                {privacyPoints.map(([title, body]) => (
                  <li key={title}>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="leading-5 text-muted">{body}</p>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setPrivacyOpen(false)}
                className="mt-2.5 font-semibold text-brand hover:text-brand-dark"
              >
                Got it
              </button>
            </div>
          )}
        </div>

        <span className="hidden h-7 w-px bg-line sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
            PI
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-[13px] font-semibold text-ink">Private session</p>
            <p className="text-[11px] text-muted">Statements not stored</p>
          </div>
        </div>
      </div>
    </header>
  );
}
