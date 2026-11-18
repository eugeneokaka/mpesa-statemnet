import { ArrowUpRightIcon, TrendUpIcon } from "@/components/icons";

type Props = {
  label: string;
  value: string;
  hint?: string;
  variant?: "dark" | "light";
};

export function StatCard({ label, value, hint, variant = "light" }: Props) {
  const dark = variant === "dark";

  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5 ${
        dark
          ? "bg-brand-dark text-white"
          : "border border-line bg-white text-ink shadow-[0_1px_2px_rgba(16,24,20,0.04)]"
      }`}
    >
      {dark && <div className="pattern-dark pointer-events-none absolute inset-0 opacity-80" />}
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-xs font-medium ${dark ? "text-white/70" : "text-muted"}`}>
            {label}
          </p>
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
              dark ? "bg-white/10 text-white ring-1 ring-inset ring-white/15" : "bg-brand-soft text-brand"
            }`}
          >
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </span>
        </div>
        <p
          className={`mt-4 break-words text-[22px] font-semibold leading-tight tracking-tight tabular-nums sm:text-[26px] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {value}
        </p>
        {hint && (
          <p
            className={`mt-2 flex items-center gap-1.5 text-[11px] ${
              dark ? "text-white/60" : "text-muted"
            }`}
          >
            <TrendUpIcon className="h-3.5 w-3.5" />
            <span className="truncate">{hint}</span>
          </p>
        )}
      </div>
    </div>
  );
}
