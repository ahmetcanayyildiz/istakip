import { CalendarIcon } from "@/components/icons";
import SectionPanel from "@/components/section-panel";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import {
  PERIOD_LABEL,
  RECENT_JOBS,
  RECENT_QUOTES,
  SUMMARY_CARDS,
} from "@/lib/mock-dashboard";

const thClass =
  "px-5 py-2.5 text-left text-xs font-medium tracking-wide text-slate-500 uppercase";
const tdClass = "px-5 py-3.5 text-sm text-slate-600 align-middle";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {PERIOD_LABEL} dönemine ait ciro, gider ve tahsilat özeti.
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          Bu Ay
          <span className="sr-only">(dönem filtresi, henüz aktif değil)</span>
        </span>
      </div>

      <section>
        <h2 className="sr-only">Özet göstergeler</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUMMARY_CARDS.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionPanel title="Son İşler" description="Son 5 kayıt" href="/isler">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th scope="col" className={thClass}>
                    İş
                  </th>
                  <th scope="col" className={thClass}>
                    Müşteri
                  </th>
                  <th scope="col" className={thClass}>
                    Durum
                  </th>
                  <th scope="col" className={`${thClass} text-right`}>
                    Tutar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT_JOBS.map((job) => (
                  <tr key={job.code} className="transition-colors hover:bg-slate-50">
                    <td className={tdClass}>
                      <span className="block font-medium text-slate-900">{job.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {job.code} · {job.date}
                      </span>
                    </td>
                    <td className={tdClass}>{job.customer}</td>
                    <td className={tdClass}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td
                      className={`${tdClass} text-right font-medium text-slate-900 tabular-nums`}
                    >
                      {formatCurrency(job.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>

        <SectionPanel title="Son Teklifler" description="Son 5 kayıt" href="/teklifler">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th scope="col" className={thClass}>
                    Teklif
                  </th>
                  <th scope="col" className={thClass}>
                    Müşteri
                  </th>
                  <th scope="col" className={thClass}>
                    Durum
                  </th>
                  <th scope="col" className={`${thClass} text-right`}>
                    Tutar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT_QUOTES.map((quote) => (
                  <tr key={quote.code} className="transition-colors hover:bg-slate-50">
                    <td className={tdClass}>
                      <span className="block font-medium text-slate-900">{quote.code}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{quote.date}</span>
                    </td>
                    <td className={tdClass}>{quote.customer}</td>
                    <td className={tdClass}>
                      <StatusBadge status={quote.status} />
                    </td>
                    <td
                      className={`${tdClass} text-right font-medium text-slate-900 tabular-nums`}
                    >
                      {formatCurrency(quote.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
