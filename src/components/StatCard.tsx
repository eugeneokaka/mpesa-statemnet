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
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
        {label}
      </p>
      <p
        className={`mt-2 break-words text-lg leading-tight font-semibold tracking-tight tabular-nums sm:text-2xl ${valueTone}`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-zinc-400 sm:text-xs">{hint}</p>}
    </div>
  );
}
