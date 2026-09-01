import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeftIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  ReceiptIcon,
} from "@/components/icons";
import JobDetailSections from "@/components/job-detail-sections";
import JobDataError from "@/components/jobs/job-data-error";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { getCurrentAccount } from "@/lib/auth/account";
import { formatCurrency, formatDate } from "@/lib/format";
import { getJobById } from "@/lib/jobs/data";

export async function generateMetadata({ params }: PageProps<"/isler/[id]">): Promise<Metadata> {
  const { id } = await params;

  try {
    const job = await getJobById(id);
    return {
      title: job ? `${job.code} | İşTakip` : "İş bulunamadı | İşTakip",
      description: job ? `${job.customer.name} için ${job.title} işi.` : undefined,
    };
  } catch {
    return { title: "İş | İşTakip" };
  }
}
export default async function JobDetailPage({ params }: PageProps<"/isler/[id]">) {
  const [account, { id }] = await Promise.all([getCurrentAccount(), params]);
  const isDemo = account.status === "ready" && account.isDemo;
  let job;

  try {
    job = await getJobById(id);
  } catch {
    return (
      <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
        <Link href="/isler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
          İşler
        </Link>
        <JobDataError message="İş bilgileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  if (!job) notFound();

  const customerContact = [job.customer.contactName, job.customer.phone]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <Link href="/isler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
        <ArrowLeftIcon className="h-4 w-4" />
        İşler
      </Link>

      <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{job.code}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{job.title}</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isDemo ? (
              <>
                <Link
                  href={`/giderler/yeni?job=${job.id}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ui-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <PlusIcon className="h-4 w-4" />
                  Gider Ekle
                </Link>
                <Link
                  href={`/tahsilatlar/yeni?job=${job.id}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ui-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <PlusIcon className="h-4 w-4" />
                  Tahsilat Ekle
                </Link>
              </>
            ) : null}
            <StatusBadge status={job.statusLabel} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 border-t border-ui-border-subtle pt-5 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <div>
            <h2 className="text-sm font-semibold text-foreground">İş Bilgileri</h2>
            <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div><dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">İş Bedeli</dt><dd className="mt-1 text-sm font-semibold text-foreground tabular-nums">{formatCurrency(job.contractAmount)}</dd></div>
              <div><dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">Başlangıç</dt><dd className="mt-1 text-sm font-medium text-foreground tabular-nums">{formatDate(job.startDate)}</dd></div>
              <div><dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">Hedef Tarihi</dt><dd className="mt-1 text-sm font-medium text-foreground tabular-nums">{formatDate(job.targetDate)}</dd></div>
            </dl>
          </div>

          <div className="border-t border-ui-border-subtle pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <h2 className="text-sm font-semibold text-foreground">Müşteri Bilgileri</h2>
            <Link href={`/musteriler/${job.customer.id}`} className="mt-3 inline-flex rounded-sm text-sm font-semibold text-brand-700 hover:text-brand-800">{job.customer.name}</Link>
            <p className="mt-1 text-sm text-foreground-secondary">{customerContact || "İletişim bilgisi bulunmuyor."}</p>
            <p className="mt-1 text-sm break-words text-foreground-muted">{job.customer.email || "—"}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="sr-only">İş finansal özeti</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="İş Bedeli" value={formatCurrency(job.contractAmount)} icon={BanknotesIcon} hint="KDV hariç sözleşme snapshot'ı" />
          <StatCard label="Toplam Gider" value={formatCurrency(job.financials.totalExpenses)} icon={ReceiptIcon} hint={`${job.expenses.length} gerçek gider kaydı`} />
          <StatCard label="Tahsil Edilen" value={formatCurrency(job.financials.collected)} icon={BanknotesIcon} hint="Paid durumundaki tahsilatlar" />
          <StatCard label="Açık Bakiye" value={formatCurrency(job.financials.openBalance)} icon={ClockIcon} hint="İş bedeli − tahsil edilen" />
          <StatCard label="Tahmini Kâr" value={formatCurrency(job.financials.estimatedProfit)} icon={ChartBarIcon} hint="İş bedeli − giderler" />
        </div>
      </section>

      <JobDetailSections
        expenses={job.expenses}
        collections={job.collections}
        quote={job.sourceQuote}
      />
    </div>
  );
}
