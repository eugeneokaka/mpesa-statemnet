export const CATEGORY_COLORS: Record<string, string> = {
  "Merchants / Retail": "#059669",
  "Send Money": "#0ea5e9",
  Paybill: "#8b5cf6",
  "Small Business": "#f59e0b",
  "Card / Subscriptions": "#ec4899",
  "Airtime & Bundles": "#14b8a6",
  Fees: "#94a3b8",
  "Savings (M-Shwari)": "#6366f1",
  Income: "#22c55e",
  Other: "#a3a3a3",
};

export const CHART_PALETTE = [
  "#059669",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
  "#ef4444",
];

export function categoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? CHART_PALETTE[0];
}
