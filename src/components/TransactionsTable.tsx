"use client";

import { Fragment, useMemo, useState } from "react";

import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons";
import { formatDateTime, kes } from "@/lib/format";
import { categoryColor } from "@/lib/theme";
import type { Transaction } from "@/lib/types";

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyId(id: string, key: string) {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      const area = document.createElement("textarea");
      area.value = id;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(key);
    window.setTimeout(() => {
      setCopied((value) => (value === key ? null : value));
    }, 1600);
  }

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((item) => item.category))).sort(),
    [transactions],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery =
        !needle ||
        item.details.toLowerCase().includes(needle) ||
        item.counterparty.toLowerCase().includes(needle) ||
        item.receipt.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [transactions, query, category]);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions…"
            aria-label="Search transactions"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-9 text-sm text-ink outline-none transition placeholder:text-muted/80 focus:border-mint focus:ring-2 focus:ring-brand-soft"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:bg-warm hover:text-ink"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="max-w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink outline-none transition focus:border-mint focus:ring-2 focus:ring-brand-soft"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="whitespace-nowrap text-xs tabular-nums text-muted">
            {rows.length} of {transactions.length}
          </span>
        </div>
      </div>

      <div className="max-h-[560px] overflow-auto overscroll-x-contain">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-warm/95 backdrop-blur">
            <tr className="text-[10px] uppercase tracking-[0.14em] text-muted">
              <th className="px-4 py-3 font-semibold sm:px-5">Date</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 text-right font-semibold">Balance</th>
              <th className="w-10 px-2 py-3" aria-label="Expand transaction" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((item) => {
              const isIncome = item.direction === "in";
              const rowKey = `${item.receipt}-${item.time}-${item.amount}`;
              const isOpen = expanded === rowKey;
              const copyKey = `id-${rowKey}`;
              return (
                <Fragment key={rowKey}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : rowKey)}
                    className={`cursor-pointer transition ${
                      isOpen ? "bg-warm/60" : "hover:bg-warm/60"
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-muted sm:px-5">
                      {formatDateTime(item.time)}
                    </td>
                    <td className="max-w-[320px] px-4 py-3">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {item.details}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">{item.receipt}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-warm px-2.5 py-1 text-[11px] font-medium text-ink">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: categoryColor(item.category) }}
                        />
                        {item.category}
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right text-[13px] font-semibold tabular-nums ${
                        isIncome ? "text-brand" : "text-ink"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {kes(item.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-[11px] tabular-nums text-muted">
                      {kes(item.balance)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setExpanded(isOpen ? null : rowKey);
                        }}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Hide transaction details" : "Show transaction details"}
                        className="rounded-md p-1.5 text-muted transition hover:bg-warm hover:text-ink"
                      >
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-warm/40">
                      <td colSpan={6} className="px-4 pb-4 pt-1 sm:px-5">
                        <div className="rounded-xl border border-line bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                                Details
                              </p>
                              <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-6 text-ink">
                                {item.details}
                              </p>
                            </div>
                            <span className="whitespace-nowrap rounded-full bg-warm px-2.5 py-1 text-[11px] font-medium text-ink">
                              {item.status || "—"}
                            </span>
                          </div>

                          <dl className="mt-4 grid gap-3 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
                            <div className="min-w-0">
                              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                                Message ID
                              </dt>
                              <dd className="mt-1 flex min-w-0 items-center gap-2">
                                <span className="min-w-0 break-all font-mono text-[12px] text-ink">
                                  {item.receipt}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyId(item.receipt, copyKey)}
                                  aria-label="Copy message ID"
                                  className="shrink-0 rounded-md p-1 text-muted transition hover:bg-warm hover:text-ink"
                                >
                                  {copied === copyKey ? (
                                    <CheckIcon className="h-3.5 w-3.5 text-brand" />
                                  ) : (
                                    <CopyIcon className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                                Date &amp; time
                              </dt>
                              <dd className="mt-1 text-ink">{formatDateTime(item.time)}</dd>
                            </div>
                            <div>
                              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                                Category
                              </dt>
                              <dd className="mt-1 flex items-center gap-1.5 text-ink">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: categoryColor(item.category) }}
                                />
                                {item.category}
                              </dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                                Counterparty
                              </dt>
                              <dd className="mt-1 break-words text-ink">
                                {item.counterparty || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                                Paid in
                              </dt>
                              <dd className="mt-1 tabular-nums text-ink">
                                {item.paid_in ? kes(item.paid_in) : "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                                Withdrawn
                              </dt>
                              <dd className="mt-1 tabular-nums text-ink">
                                {item.withdrawn ? kes(item.withdrawn) : "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                                Amount
                              </dt>
                              <dd
                                className={`mt-1 font-semibold tabular-nums ${
                                  isIncome ? "text-brand" : "text-ink"
                                }`}
                              >
                                {isIncome ? "+" : "−"}
                                {kes(item.amount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                                Balance after
                              </dt>
                              <dd className="mt-1 tabular-nums text-ink">
                                {kes(item.balance)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-sm text-muted">
                  No transactions match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
