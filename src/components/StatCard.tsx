type Props = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative";
};

export function StatCard({ label, value, hint, tone = "default" }: Props) {
  const valueTone =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-red-600"
        : "text-zinc-900";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className={`mt-2 text-xl font-semibold tracking-tight ${valueTone} sm:text-2xl`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}
