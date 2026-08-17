import {
  BanknotesIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentIcon,
  ReceiptIcon,
} from "@/components/icons";
import SectionPanel from "@/components/section-panel";
import StatCard, { type StatCardProps } from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { getDashboardFinancials } from "@/lib/mock-finance";
import { JOBS } from "@/lib/mock-jobs";
import { calculateQuoteTotals, QUOTES } from "@/lib/mock-quotes";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

export default function DashboardPage() {
  const financials = getDashboardFinancials();
  const recentJobs = JOBS.slice(0, 5);
  const recentQuotes = QUOTES.slice(0, 5);
  const summaryCards: StatCardProps[] = [
    {
      label: "Toplam Ciro",
      value: formatCurrency(financials.totalRevenue),
      icon: BanknotesIcon,
      hint: "İptal edilmemiş işler",
    },
    {
      label: "Toplam Gider",
      value: formatCurrency(financials.totalExpenses),
      icon: ReceiptIcon,
      hint: "Tüm gider kayıtları",
    },
    {
      label: "Tahmini Kâr",
      value: formatCurrency(financials.estimatedProfit),
      icon: ChartBarIcon,
      hint: "Toplam ciro − toplam gider",
    },
    {
      label: "Toplam Açık Bakiye",
      value: formatCurrency(financials.totalOpenBalance),
      icon: ClockIcon,
      hint: "İş bedeli − tahsil edilen",
    },
    {
      label: "Aktif İşler",
      value: String(financials.activeJobs),
      icon: BriefcaseIcon,
      hint: "Planlanan, devam eden ve bekleyen",
    },
    {
      label: "Bekleyen Teklifler",
      value: String(financials.pendingQuotes),
      icon: DocumentIcon,
      hint: `Toplam ${formatCurrency(financials.pendingQuoteAmount)} değerinde`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mevcut iş, gider ve tahsilat kayıtlarından hesaplanan genel finansal özet.
        </p>
      </div>

      <section>
        <h2 className="sr-only">Genel finansal özet</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionPanel title="Son İşler" description="Ana iş verisindeki son 5 kayıt" href="/isler">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th scope="col" className={TH_CLASS}>İş</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={TH_CLASS}>Durum</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentJobs.map((job) => (
                  <tr key={job.code} className={TR_CLASS}>
                    <td className={TD_CLASS}>
                      <span className="block font-medium text-slate-900">{job.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{job.code} · {formatDate(job.startDate)}</span>
                    </td>
                    <td className={TD_CLASS}>{job.customer.name}</td>
                    <td className={TD_CLASS}><StatusBadge status={job.status} /></td>
                    <td className={`${TD_CLASS} text-right font-medium text-slate-900 tabular-nums`}>{formatCurrency(job.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>

        <SectionPanel title="Son Teklifler" description="Ana teklif verisindeki son 5 kayıt" href="/teklifler">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th scope="col" className={TH_CLASS}>Teklif</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={TH_CLASS}>Durum</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQuotes.map((quote) => (
                  <tr key={quote.code} className={TR_CLASS}>
                    <td className={TD_CLASS}>
                      <span className="block font-medium text-slate-900">{quote.code}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{quote.createdAt}</span>
                    </td>
                    <td className={TD_CLASS}>{quote.customer.name}</td>
                    <td className={TD_CLASS}><StatusBadge status={quote.status} /></td>
                    <td className={`${TD_CLASS} text-right font-medium text-slate-900 tabular-nums`}>{formatCurrency(calculateQuoteTotals(quote).grandTotal)}</td>
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
