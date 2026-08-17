import { ArrowDownRightIcon, ArrowUpRightIcon } from "@/components/icons";
import type { SummaryCard } from "@/lib/mock-dashboard";

export default function StatCard({ label, value, icon: Icon, trend, hint }: SummaryCard) {
  const TrendIcon = trend?.direction === "up" ? ArrowUpRightIcon : ArrowDownRightIcon;
  const trendColor = trend?.tone === "positive" ? "text-emerald-700" : "text-rose-700";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-500">{label}</h3>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700"
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs">
        {trend ? (
          <>
            <span className={`inline-flex items-center gap-1 font-semibold ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trend.value}
            </span>
            <span className="text-slate-500">geçen aya göre</span>
          </>
        ) : (
          <span className="text-slate-500">{hint}</span>
        )}
      </p>
    </article>
  );
}
