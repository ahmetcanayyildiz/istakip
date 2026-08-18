import type { ComponentType } from "react";

import { ArrowDownRightIcon, ArrowUpRightIcon } from "@/components/icons";

export type Trend = {
  direction: "up" | "down";
  value: string;
  tone: "positive" | "negative";
};

export type StatCardProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "indigo" | "cyan" | "emerald" | "amber" | "rose" | "slate";
  trend?: Trend;
  hint?: string;
};

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  indigo: "bg-metric-indigo-soft text-metric-indigo",
  cyan: "bg-metric-cyan-soft text-metric-cyan",
  emerald: "bg-metric-emerald-soft text-metric-emerald",
  amber: "bg-metric-amber-soft text-metric-amber",
  rose: "bg-metric-rose-soft text-metric-rose",
  slate: "bg-metric-slate-soft text-metric-slate",
};

const ACCENT_BY_LABEL: Partial<
  Record<string, NonNullable<StatCardProps["accent"]>>
> = {
  "Toplam Ciro": "indigo",
  "Toplam Gider": "rose",
  "Tahmini Kâr": "emerald",
  "Toplam Açık Bakiye": "amber",
  "Aktif İşler": "cyan",
  "Bekleyen Teklifler": "slate",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  trend,
  hint,
}: StatCardProps) {
  const TrendIcon = trend?.direction === "up" ? ArrowUpRightIcon : ArrowDownRightIcon;
  const trendColor = trend?.tone === "positive" ? "text-success" : "text-danger";
  const resolvedAccent = accent ?? ACCENT_BY_LABEL[label] ?? "indigo";

  return (
    <article className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs dark:transition-colors dark:hover:bg-surface-hover">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground-muted">{label}</h3>
        <span
          aria-hidden
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${ACCENT_STYLES[resolvedAccent]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs">
        {trend ? (
          <>
            <span className={`inline-flex items-center gap-1 font-semibold ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trend.value}
            </span>
            <span className="text-foreground-muted">geçen aya göre</span>
          </>
        ) : (
          <span className="text-foreground-muted">{hint}</span>
        )}
      </p>
    </article>
  );
}
