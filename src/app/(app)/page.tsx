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
import { getCollections } from "@/lib/collections/data";
import { getExpenses } from "@/lib/expenses/data";
import {
  calculateDashboardFinancials,
  getIstanbulToday,
} from "@/lib/finance/calculations";
import { formatCurrency, formatDate } from "@/lib/format";
import { getJobs } from "@/lib/jobs/data";
import { centsToAmount } from "@/lib/quotes/calculations";
import { getQuotes } from "@/lib/quotes/data";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

export default async function DashboardPage() {
  let jobs;
  let expenses;
  let collections;
  let quotes;

  try {
    [jobs, expenses, collections, quotes] = await Promise.all([
      getJobs(),
      getExpenses(),
      getCollections(),
      getQuotes(),
    ]);
  } catch {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-foreground-muted">Gerçek iş, gider ve tahsilat verilerinden hesaplanan genel özet.</p>
        </div>
        <div role="alert" className="rounded-lg border border-danger-border bg-danger-soft px-5 py-4 text-sm text-danger shadow-xs">
          Dashboard verileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  const financials = calculateDashboardFinancials({
    jobs,
    expenses,
    collections,
    quotes,
    today: getIstanbulToday(),
  });
  const recentJobs = jobs.slice(0, 5);
  const recentQuotes = quotes.slice(0, 5);
  const summaryCards: StatCardProps[] = [
    {
      label: "Toplam İş Bedeli",
      value: formatCurrency(financials.totalJobAmount),
      icon: BanknotesIcon,
      hint: "İptal edilmemiş işler · KDV hariç",
    },
    {
      label: "Toplam Gider",
      value: formatCurrency(financials.totalExpenses),
      icon: ReceiptIcon,
      hint: "Tüm gerçek gider kayıtları",
    },
    {
      label: "Tahmini Kâr",
      value: formatCurrency(financials.estimatedProfit),
      icon: ChartBarIcon,
      hint: "İş bedeli − giderler",
    },
    {
      label: "Tahsil Edilen",
      value: formatCurrency(financials.collected),
      icon: BanknotesIcon,
      hint: "Paid durumundaki tahsilatlar",
    },
    {
      label: "Vadesi Beklenen",
      value: formatCurrency(financials.duePending),
      icon: ClockIcon,
      hint: "Bugün veya ileri vadeli pending kayıtlar",
    },
    {
      label: "Gecikmiş",
      value: formatCurrency(financials.overdue),
      icon: ReceiptIcon,
      hint: "Vadesi geçmiş pending kayıtlar",
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
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Gerçek iş, gider, tahsilat, teklif ve müşteri verilerinden hesaplanan genel özet.
        </p>
      </div>

      <section>
        <h2 className="sr-only">Genel finansal özet</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionPanel title="Son İşler" description="En yeni 5 gerçek iş kaydı" href="/isler">
          {recentJobs.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-foreground-muted">Henüz iş kaydı bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <thead className="border-b border-ui-border bg-surface-muted">
                  <tr>
                    <th scope="col" className={TH_CLASS}>İş</th>
                    <th scope="col" className={TH_CLASS}>Müşteri</th>
                    <th scope="col" className={TH_CLASS}>Durum</th>
                    <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border-subtle">
                  {recentJobs.map((job) => (
                    <tr key={job.id} className={TR_CLASS}>
                      <td className={TD_CLASS}>
                        <span className="block font-medium text-foreground">{job.title}</span>
                        <span className="mt-0.5 block text-xs text-foreground-muted">{job.code} · {formatDate(job.startDate)}</span>
                      </td>
                      <td className={TD_CLASS}>{job.customer.name}</td>
                      <td className={TD_CLASS}><StatusBadge status={job.statusLabel} /></td>
                      <td className={`${TD_CLASS} text-right font-medium text-foreground tabular-nums`}>{formatCurrency(job.contractAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionPanel>

        <SectionPanel title="Son Teklifler" description="En yeni 5 gerçek teklif kaydı" href="/teklifler">
          {recentQuotes.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-foreground-muted">Henüz teklif kaydı bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <thead className="border-b border-ui-border bg-surface-muted">
                  <tr>
                    <th scope="col" className={TH_CLASS}>Teklif</th>
                    <th scope="col" className={TH_CLASS}>Müşteri</th>
                    <th scope="col" className={TH_CLASS}>Durum</th>
                    <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border-subtle">
                  {recentQuotes.map((quote) => (
                    <tr key={quote.id} className={TR_CLASS}>
                      <td className={TD_CLASS}>
                        <span className="block font-medium text-foreground">{quote.code}</span>
                        <span className="mt-0.5 block text-xs text-foreground-muted">{formatDate(quote.issueDate)}</span>
                      </td>
                      <td className={TD_CLASS}>{quote.customer.name}</td>
                      <td className={TD_CLASS}><StatusBadge status={quote.statusLabel} /></td>
                      <td className={`${TD_CLASS} text-right font-medium text-foreground tabular-nums`}>{formatCurrency(centsToAmount(quote.grandTotalCents))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionPanel>
      </div>
    </div>
  );
}
