import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeftIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  ReceiptIcon,
} from "@/components/icons";
import JobDetailSections from "@/components/job-detail-sections";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { COLLECTIONS } from "@/lib/mock-collections";
import { EXPENSES } from "@/lib/mock-expenses";
import { calculateJobFinancials } from "@/lib/mock-finance";
import { getJobById, JOBS } from "@/lib/mock-jobs";
import { getQuoteById } from "@/lib/mock-quotes";

export function generateStaticParams() {
  return JOBS.map((job) => ({ id: job.id }));
}

export async function generateMetadata({ params }: PageProps<"/isler/[id]">): Promise<Metadata> {
  const { id } = await params;
  const job = getJobById(id);

  return {
    title: job ? `${job.code} | İşTakip` : "İş bulunamadı | İşTakip",
    description: job ? `${job.customer.name} için ${job.title} işi.` : undefined,
  };
}

export default async function JobDetailPage({ params }: PageProps<"/isler/[id]">) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) notFound();

  const financials = calculateJobFinancials(job);
  const expenses = EXPENSES.filter((expense) => expense.jobId === job.id);
  const collections = COLLECTIONS.filter((collection) => collection.jobId === job.id);
  const quote = job.relatedQuoteId ? getQuoteById(job.relatedQuoteId) : undefined;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <Link href="/isler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        İşler
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{job.code}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{job.title}</h1>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">İş Bilgileri</h2>
            <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div><dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">İş Tutarı</dt><dd className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">{formatCurrency(job.amount)}</dd></div>
              <div><dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Başlangıç</dt><dd className="mt-1 text-sm font-medium text-slate-900 tabular-nums">{formatDate(job.startDate)}</dd></div>
              <div><dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Hedef Tarih</dt><dd className="mt-1 text-sm font-medium text-slate-900 tabular-nums">{formatDate(job.targetDate)}</dd></div>
            </dl>
          </div>

          <div className="border-t border-slate-100 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <h2 className="text-sm font-semibold text-slate-900">Müşteri Bilgileri</h2>
            <Link href={`/musteriler/${job.customer.id}`} className="mt-3 inline-flex rounded-sm text-sm font-semibold text-brand-700 hover:text-brand-800">{job.customer.name}</Link>
            <p className="mt-1 text-sm text-slate-600">{job.customer.contact} · {job.customer.phone}</p>
            <p className="mt-1 text-sm break-words text-slate-500">{job.customer.email}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="sr-only">İş finansal özeti</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="İş Tutarı" value={formatCurrency(job.amount)} icon={BanknotesIcon} hint="Sözleşme bedeli" />
          <StatCard label="Toplam Gider" value={formatCurrency(financials.totalExpenses)} icon={ReceiptIcon} hint={`${expenses.length} gider kaydı`} />
          <StatCard label="Tahsil Edilen" value={formatCurrency(financials.collected)} icon={BanknotesIcon} hint="Onaylı ödemeler" />
          <StatCard label="Açık Bakiye" value={formatCurrency(financials.openBalance)} icon={ClockIcon} hint="İş bedeli − tahsil edilen" />
          <StatCard label="Tahmini Kâr" value={formatCurrency(financials.estimatedProfit)} icon={ChartBarIcon} hint="İş tutarı − giderler" />
        </div>
      </section>

      <JobDetailSections expenses={expenses} collections={collections} quote={quote} />
    </div>
  );
}
