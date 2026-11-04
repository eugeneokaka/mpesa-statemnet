"use client";

import { useState } from "react";

import { StatCard } from "@/components/StatCard";
import { TransactionsTable } from "@/components/TransactionsTable";
import {
  CategoryBreakdown,
  SpendingTrend,
  TopExpensesList,
  TopRecipients,
} from "@/components/charts";
import { formatDate, kes, shortId } from "@/lib/format";
import type { Analysis } from "@/lib/types";

function DocumentIdChip({ documentId }: { documentId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(documentId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be blocked; the ID is still visible.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy the full document ID"
      className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-emerald-50 ring-1 ring-inset ring-white/20 transition hover:bg-white/25"
    >
      <span>Document ID: {shortId(documentId)}</span>
      <span className="font-semibold">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

type PanelProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

function Panel({ title, subtitle, children, className = "" }: PanelProps) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function Dashboard({
  analysis,
  onReset,
}: {
  analysis: Analysis;
  onReset: () => void;
}) {
  const { statement, totals, activity, period } = analysis;
  const metadata = statement.metadata;
  const largest = activity.largest_single_expense;

  function downloadJson() {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mpesa-analysis-${period.start}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="flex min-w-0 flex-col gap-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">
            Statement analysis
          </p>
          <h2 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {metadata.name || "M-PESA statement"}
          </h2>
          <p className="mt-1.5 text-sm text-emerald-50/90">
            {formatDate(period.start)} – {formatDate(period.end)} · {period.days} days
            {metadata.mobile ? ` · ${metadata.mobile}` : ""}
          </p>
          {statement.verification_code && (
            <p className="mt-1 text-xs text-emerald-100/80">
              Verification code: {statement.verification_code}
            </p>
          )}
          {statement.document_id && (
            <DocumentIdChip documentId={statement.document_id} />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadJson}
            className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/25"
          >
            Export JSON
          </button>
          <button
            onClick={onReset}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            New statement
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total spent"
          value={kes(totals.consumption_spend, 0)}
          hint={`${activity.spending_transactions} transactions`}
        />
        <StatCard label="Money in" value={kes(totals.money_in, 0)} tone="positive" hint="Incoming funds" />
        <StatCard
          label="Net position"
          value={`${totals.net >= 0 ? "+" : "−"}${kes(Math.abs(totals.net), 0)}`}
          tone={totals.net >= 0 ? "positive" : "negative"}
          hint="Money in minus money out"
        />
        <StatCard label="Avg per day" value={kes(activity.avg_daily_spend, 0)} hint={`${period.days} days`} />
        <StatCard label="Fees paid" value={kes(totals.fees, 0)} hint="Transaction charges" />
        <StatCard
          label="Moved to savings"
          value={kes(totals.savings_moved, 0)}
          hint="M-Shwari deposits"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7v5h-5" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Largest single expense
            </p>
            <p className="mt-1 truncate text-lg font-semibold text-zinc-900">
              {largest ? kes(largest.amount, 0) : "—"}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-400">
              {largest ? `${largest.details} · ${formatDate(largest.time)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path strokeLinecap="round" d="M3 11h18" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Highest spending day
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">
              {kes(activity.highest_day.amount, 0)}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {formatDate(activity.highest_day.date)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Daily spending"
          subtitle="How much you spent on each day of the statement"
          className="lg:col-span-2"
        >
          <SpendingTrend data={analysis.daily} />
        </Panel>

        <Panel title="Spending by category" subtitle="Where your money went">
          <CategoryBreakdown data={analysis.by_category} />
        </Panel>

        <Panel
          title="Top recipients"
          subtitle="People and businesses you paid the most"
          className="lg:col-span-2"
        >
          <TopRecipients data={analysis.by_counterparty} />
        </Panel>

        <Panel title="Top expenses" subtitle="Your largest individual payments">
          <TopExpensesList data={analysis.top_expenses} />
        </Panel>
      </div>

      <Panel
        title="All transactions"
        subtitle={`${activity.transactions} transactions · search and filter by category`}
        className="overflow-hidden !p-0"
      >
        <TransactionsTable transactions={analysis.transactions} />
      </Panel>
    </div>
  );
}
