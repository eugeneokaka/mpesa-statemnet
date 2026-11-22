"use client";

import { StatCard } from "@/components/StatCard";
import { TransactionsTable } from "@/components/TransactionsTable";
import {
  CategoryBreakdown,
  CategoryPie,
  OutflowDonut,
  SpendingTrend,
  TopExpensesList,
  TopRecipients,
} from "@/components/charts";
import {
  DownloadIcon,
  ListIcon,
  PlusIcon,
  PrinterIcon,
  ReceiptIcon,
} from "@/components/icons";
import {
  PageHeader,
  Panel,
  StatusPill,
  btnPrimary,
  btnSecondary,
} from "@/components/ui";
import { formatDate, kes } from "@/lib/format";
import type { Analysis } from "@/lib/types";

function scrollToTransactions() {
  document.getElementById("transactions")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function LargestExpenseCard({ analysis }: { analysis: Analysis }) {
  const largest = analysis.activity.largest_single_expense;
  const share =
    largest && analysis.totals.consumption_spend > 0
      ? Math.round((largest.amount / analysis.totals.consumption_spend) * 100)
      : 0;

  return (
    <Panel
      title="Largest expense"
      subtitle="Your biggest single payment"
      action={<StatusPill tone="green">Top</StatusPill>}
    >
      {largest ? (
        <div className="flex h-full flex-col">
          <div className="rounded-2xl bg-mint-soft p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Amount
            </p>
            <p className="mt-1 text-[24px] font-semibold tracking-tight text-ink">
              {kes(largest.amount, 0)}
            </p>
            <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-zinc-600">
              {largest.details}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl bg-white/70 p-2.5">
                <p className="text-muted">Share of spend</p>
                <p className="mt-0.5 text-[13px] font-semibold text-ink">{share}%</p>
              </div>
              <div className="rounded-xl bg-white/70 p-2.5">
                <p className="text-muted">Date</p>
                <p className="mt-0.5 text-[13px] font-semibold text-ink">
                  {formatDate(largest.time)}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToTransactions}
            className={`${btnPrimary} mt-3 w-full py-2.5 text-xs print:hidden`}
          >
            <ListIcon className="h-3.5 w-3.5" />
            View transactions
          </button>
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted">
          No spending transactions in this statement.
        </p>
      )}
    </Panel>
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

  function downloadPdf() {
    const previousTitle = document.title;
    document.title = `mpesa-dashboard-${period.start}`;
    const restore = () => {
      document.title = previousTitle;
    };
    window.addEventListener("afterprint", restore, { once: true });
    window.addEventListener("focus", restore, { once: true });
    window.print();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle={
          <>
            {metadata.name || "Your M-PESA statement"} · {formatDate(period.start)} –{" "}
            {formatDate(period.end)} · {period.days} days
            {metadata.mobile ? ` · ${metadata.mobile}` : ""}
          </>
        }
        actions={
          <>
            <button type="button" onClick={onReset} className={btnPrimary}>
              <PlusIcon className="h-4 w-4" />
              New statement
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className={btnSecondary}
              title="Open the print dialog and choose Save as PDF"
            >
              <PrinterIcon className="h-4 w-4" />
              Download PDF
            </button>
            <button type="button" onClick={downloadJson} className={btnSecondary}>
              <DownloadIcon className="h-4 w-4" />
              Export JSON
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total spent"
          value={kes(totals.consumption_spend, 0)}
          hint={`${activity.spending_transactions} transactions`}
          variant="dark"
        />
        <StatCard
          label="Money in"
          value={kes(totals.money_in, 0)}
          hint="Incoming funds"
        />
        <StatCard
          label="Net position"
          value={`${totals.net >= 0 ? "+" : "−"}${kes(Math.abs(totals.net), 0)}`}
          hint="Money in minus money out"
        />
        <StatCard
          label="Fees paid"
          value={kes(totals.fees, 0)}
          hint="Transaction charges"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          id="insights"
          title="Spending trend"
          subtitle="Daily spending across the whole statement"
          className="lg:col-span-2"
          action={
            <span className="rounded-full bg-warm px-2.5 py-1 text-[10px] font-semibold text-muted">
              {analysis.daily.length} days
            </span>
          }
        >
          <SpendingTrend data={analysis.daily} />
        </Panel>
        <LargestExpenseCard analysis={analysis} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Top categories"
          subtitle="Where most of your money went"
          className="lg:col-span-2"
          action={
            <span className="rounded-full bg-warm px-2.5 py-1 text-[10px] font-semibold text-muted">
              {analysis.by_category.length} categories
            </span>
          }
        >
          <CategoryBreakdown data={analysis.by_category} />
        </Panel>
        <Panel title="Outflow split" subtitle="Spent vs. saved vs. fees">
          <OutflowDonut totals={totals} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Top recipients"
          subtitle="People and businesses you paid the most"
          className="lg:col-span-2"
        >
          <TopRecipients data={analysis.by_counterparty} />
        </Panel>
        <Panel
          title="Income & expenses"
          subtitle="Paybill, Send Money, Buy Goods and more"
        >
          <CategoryPie
            data={analysis.by_category}
            income={totals.money_in}
            spent={totals.consumption_spend}
          />
        </Panel>
      </div>

      <Panel title="Top expenses" subtitle="Your largest individual payments">
        <TopExpensesList data={analysis.top_expenses} />
      </Panel>

      <section
        id="transactions"
        className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(16,24,20,0.04)] print:break-before-page print:overflow-visible print:rounded-none print:border-0 print:shadow-none"
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ReceiptIcon className="h-4 w-4 text-brand" />
              All transactions
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              {activity.transactions} transactions · search or filter by category
            </p>
          </div>
        </div>
        <div className="mt-3">
          <TransactionsTable transactions={analysis.transactions} />
        </div>
      </section>
    </div>
  );
}
