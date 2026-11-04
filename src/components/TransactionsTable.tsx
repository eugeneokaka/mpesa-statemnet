"use client";

import { useMemo, useState } from "react";

import { formatDateTime, kes } from "@/lib/format";
import { categoryColor } from "@/lib/theme";
import type { Transaction } from "@/lib/types";

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

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
      <div className="flex min-w-0 flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3-3" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions…"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="max-w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="whitespace-nowrap text-xs text-zinc-400">
            {rows.length} of {transactions.length}
          </span>
        </div>
      </div>

      <div className="max-h-[540px] overflow-auto overscroll-x-contain">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur">
            <tr className="text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((item) => {
              const isIncome = item.direction === "in";
              return (
                <tr key={`${item.receipt}-${item.time}-${item.amount}`} className="hover:bg-zinc-50/70">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                    {formatDateTime(item.time)}
                  </td>
                  <td className="max-w-[320px] px-4 py-3">
                    <p className="truncate text-zinc-800">{item.details}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">{item.receipt}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: categoryColor(item.category) }}
                      />
                      {item.category}
                    </span>
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                      isIncome ? "text-emerald-600" : "text-zinc-900"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {kes(item.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-zinc-500">
                    {kes(item.balance)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
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
