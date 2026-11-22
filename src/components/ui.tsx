import type { ReactNode } from "react";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_-12px_rgba(12,59,42,0.9)] transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-mint hover:bg-warm disabled:cursor-not-allowed disabled:opacity-60";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted transition hover:bg-warm hover:text-ink";

export function Panel({
  id,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`min-w-0 rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,20,0.04)] print:break-inside-avoid print:shadow-none sm:p-5 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 print:hidden">{actions}</div>
      )}
    </div>
  );
}

export type PillTone = "green" | "amber" | "red" | "neutral";

const pillTones: Record<PillTone, string> = {
  green: "bg-[#e6f5ec] text-[#2f7d54]",
  amber: "bg-[#fdf1dd] text-[#a9761c]",
  red: "bg-[#fbeae4] text-[#bb5238]",
  neutral: "bg-warm text-muted",
};

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${pillTones[tone]}`}
    >
      {children}
    </span>
  );
}
