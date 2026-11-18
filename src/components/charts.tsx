"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatusPill, type PillTone } from "@/components/ui";
import { compactKes, formatDate, kes } from "@/lib/format";
import { categoryColor } from "@/lib/theme";
import type {
  CategoryInsight,
  CounterpartyInsight,
  DailyPoint,
  TopExpense,
} from "@/lib/types";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #ecece7",
  boxShadow: "0 18px 40px -24px rgba(16,40,28,0.5)",
  fontSize: 12,
};

function dayLabel(iso: string, compact: boolean): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  if (compact) return String(date.getDate()).padStart(2, "0");
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function SpendingTrend({ data }: { data: DailyPoint[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const compact = data.length > 45;
  const slot = data.length > 120 ? 28 : compact ? 34 : 46;
  const points = data.map((point) => ({
    ...point,
    label: dayLabel(point.date, compact),
  }));

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const target = element;

    function check() {
      setOverflowing(target.scrollWidth > target.clientWidth + 1);
    }

    check();
    const observer = new ResizeObserver(check);
    observer.observe(target);
    return () => observer.disconnect();
  }, [data]);

  return (
    <div className="min-w-0">
      <div
        ref={scrollRef}
        className="overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]"
      >
        <div style={{ minWidth: data.length * slot }} className="w-full">
          <div className="h-[260px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={points}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1ec" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#a4a49d", fontSize: compact ? 9 : 10 }}
                  interval={0}
                />
                <YAxis
                  tickFormatter={compactKes}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  tick={{ fill: "#a4a49d", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: "#cfe9d9", strokeDasharray: "3 3" }}
                  formatter={(value) => [kes(Number(value)), "Spent"]}
                  labelFormatter={(label, payload) => {
                    const fullDate = payload?.[0]?.payload?.date;
                    return fullDate ? formatDate(String(fullDate)) : String(label);
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#0f6b45"
                  strokeWidth={2.2}
                  dot={
                    compact
                      ? false
                      : { r: 2.5, fill: "#0f6b45", strokeWidth: 0 }
                  }
                  activeDot={{ r: 4, fill: "#0f6b45", stroke: "#ffffff", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {overflowing && (
        <p className="mt-2 text-[10px] text-muted">
          Scroll sideways to see all {data.length} days.
        </p>
      )}
    </div>
  );
}

function pctTone(pct: number): PillTone {
  if (pct >= 25) return "green";
  if (pct >= 10) return "amber";
  return "neutral";
}

export function CategoryBreakdown({ data }: { data: CategoryInsight[] }) {
  const max = data.reduce((value, item) => Math.max(value, item.amount), 0) || 1;

  return (
    <ul className="space-y-0.5">
      {data.slice(0, 7).map((item) => (
        <li
          key={item.name}
          className="flex items-center gap-3 rounded-xl px-1.5 py-2.5 transition hover:bg-warm"
        >
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white"
            style={{ backgroundColor: categoryColor(item.name) }}
          >
            {item.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{item.name}</p>
            <p className="text-[11px] text-muted">
              {item.count} transaction{item.count === 1 ? "" : "s"}
            </p>
          </div>
          <div className="hidden w-24 sm:block">
            <div className="h-1.5 overflow-hidden rounded-full bg-warm">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.max(6, (item.amount / max) * 100)}%` }}
              />
            </div>
          </div>
          <p className="w-20 shrink-0 text-right text-[13px] font-semibold tabular-nums text-ink">
            {compactKes(item.amount)}
          </p>
          <StatusPill tone={pctTone(item.pct)}>{item.pct}%</StatusPill>
        </li>
      ))}
    </ul>
  );
}

export function TopRecipients({ data }: { data: CounterpartyInsight[] }) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.name.length > 16 ? `${item.name.slice(0, 16)}…` : item.name,
  }));

  return (
    <div className="h-[260px] w-full min-w-0 sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1ec" />
          <XAxis
            type="number"
            tickFormatter={compactKes}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#a4a49d", fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6b6b65", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [kes(Number(value)), "Spent"]}
            cursor={{ fill: "#f6f6f2" }}
          />
          <Bar
            dataKey="amount"
            fill="#0f6b45"
            radius={[0, 8, 8, 0]}
            barSize={12}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopExpensesList({ data }: { data: TopExpense[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-0.5 sm:grid-cols-2">
      {data.slice(0, 6).map((item, index) => (
        <li
          key={`${item.time}-${index}`}
          className="flex items-center gap-3 rounded-xl px-1.5 py-2.5 transition hover:bg-warm"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warm text-[11px] font-bold text-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">
              {item.counterparty}
            </p>
            <p className="truncate text-[11px] text-muted">
              {formatDate(item.time)} · {item.category}
            </p>
          </div>
          <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink">
            {kes(item.amount, 0)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function OutflowDonut({
  totals,
}: {
  totals: { consumption_spend: number; savings_moved: number; fees: number };
}) {
  const segments = [
    { name: "Spent", value: totals.consumption_spend, color: "#0f6b45" },
    { name: "Savings", value: totals.savings_moved, color: "#9ed3b3" },
    { name: "Fees", value: totals.fees, color: "#dfe9e2" },
  ];
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  const active = segments.filter((item) => item.value > 0);
  const pct = total > 0 ? Math.round((totals.consumption_spend / total) * 100) : 0;

  if (total <= 0) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        No outflow recorded for this statement.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-[190px] w-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={active}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={4}
              cornerRadius={8}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
              stroke="none"
            >
              {active.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => kes(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] font-semibold tracking-tight text-ink">{pct}%</span>
          <span className="text-[10px] uppercase tracking-wide text-muted">spent</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {segments.map((item) => (
          <li key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-muted">{item.name}</span>
            <span className="font-semibold tabular-nums text-ink">
              {compactKes(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  "Merchants / Retail": "Buy Goods",
  "Airtime & Bundles": "Airtime",
  "Card / Subscriptions": "Card",
  "Small Business": "Small Biz",
  "Savings (M-Shwari)": "Savings",
};

export function CategoryPie({
  data,
  income,
  spent,
}: {
  data: CategoryInsight[];
  income: number;
  spent: number;
}) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const top = data.slice(0, 5);
  const rest = data.slice(5);
  const slices: Array<{ name: string; amount: number; pct: number; color: string }> =
    top.map((item) => ({
      name: CATEGORY_LABELS[item.name] ?? item.name,
      amount: item.amount,
      pct: total > 0 ? Math.round((item.amount / total) * 100) : 0,
      color: categoryColor(item.name),
    }));

  if (rest.length > 0) {
    const amount = rest.reduce((sum, item) => sum + item.amount, 0);
    slices.push({
      name: "Other",
      amount,
      pct: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: "#c9c9c2",
    });
  }

  if (slices.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        No spending categories found for this statement.
      </p>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative h-[165px] w-[165px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="amount"
                nameKey="name"
                innerRadius={0}
                outerRadius={80}
                paddingAngle={1.5}
                stroke="#ffffff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {slices.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [kes(Number(value)), String(name)]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="w-full min-w-0 space-y-1.5">
          {slices.map((slice) => (
            <li key={slice.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="min-w-0 flex-1 truncate text-muted">{slice.name}</span>
              <span className="shrink-0 font-semibold tabular-nums text-ink">
                {compactKes(slice.amount)}
              </span>
              <span className="w-8 shrink-0 text-right text-[10px] text-muted">
                {slice.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-xl bg-mint-soft p-2.5">
          <p className="text-muted">Income</p>
          <p className="mt-0.5 text-[13px] font-semibold text-ink">{kes(income, 0)}</p>
        </div>
        <div className="rounded-xl bg-warm p-2.5">
          <p className="text-muted">Expenses</p>
          <p className="mt-0.5 text-[13px] font-semibold text-ink">{kes(spent, 0)}</p>
        </div>
      </div>
    </div>
  );
}
