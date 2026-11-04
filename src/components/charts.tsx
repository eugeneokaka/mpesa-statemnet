"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { categoryColor } from "@/lib/theme";
import { compactKes, formatDate, formatDayShort, kes } from "@/lib/format";
import type { CategoryInsight, CounterpartyInsight, DailyPoint, TopExpense } from "@/lib/types";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e4e4e7",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  fontSize: 12,
};

export function SpendingTrend({ data }: { data: DailyPoint[] }) {
  return (
    <div className="h-[220px] w-full min-w-0 sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f2" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDayShort}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tickFormatter={compactKes}
            tickLine={false}
            axisLine={false}
            width={42}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [kes(Number(value)), "Spent"]}
            labelFormatter={(label) => formatDate(String(label))}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#spendFill)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBreakdown({ data }: { data: CategoryInsight[] }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-start lg:flex-col lg:items-center">
      <div className="relative h-[200px] w-[200px] shrink-0 sm:h-[220px] sm:w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              innerRadius={56}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.name} fill={categoryColor(item.name)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => kes(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wide text-zinc-400">Total</span>
          <span className="text-lg font-semibold text-zinc-900">{compactKes(total)}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5">
        {data.map((item) => (
          <li key={item.name} className="flex min-w-0 items-center gap-3 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColor(item.name) }}
            />
            <span className="min-w-0 flex-1 truncate text-zinc-600">{item.name}</span>
            <span className="shrink-0 font-medium text-zinc-900">{compactKes(item.amount)}</span>
            <span className="w-10 shrink-0 text-right text-xs text-zinc-400">{item.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopRecipients({ data }: { data: CounterpartyInsight[] }) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.name.length > 18 ? `${item.name.slice(0, 18)}…` : item.name,
  }));

  return (
    <div className="h-[260px] w-full min-w-0 sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f2" />
          <XAxis
            type="number"
            tickFormatter={compactKes}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={116}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#52525b", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [kes(Number(value)), "Spent"]}
            cursor={{ fill: "#f4f4f5" }}
          />
          <Bar dataKey="amount" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopExpensesList({ data }: { data: TopExpense[] }) {
  const max = data.reduce((value, item) => Math.max(value, item.amount), 0) || 1;

  return (
    <ul className="space-y-4">
      {data.slice(0, 6).map((item, index) => (
        <li key={`${item.time}-${index}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-zinc-700">
              <span className="mr-2 text-xs font-semibold text-zinc-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.counterparty}
            </span>
            <span className="shrink-0 text-sm font-semibold text-zinc-900">
              {kes(item.amount, 0)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${(item.amount / max) * 100}%` }}
            />
          </div>
          <p className="mt-1 truncate text-xs text-zinc-400">
            {formatDate(item.time)} · {item.category}
          </p>
        </li>
      ))}
    </ul>
  );
}
