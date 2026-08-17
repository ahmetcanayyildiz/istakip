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
  trend?: Trend;
  hint?: string;
};

export default function StatCard({ label, value, icon: Icon, trend, hint }: StatCardProps) {
  const TrendIcon = trend?.direction === "up" ? ArrowUpRightIcon : ArrowDownRightIcon;
  const trendColor = trend?.tone === "positive" ? "text-success" : "text-danger";

  return (
    <article className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground-muted">{label}</h3>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700"
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
