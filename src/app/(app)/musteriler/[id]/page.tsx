import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeftIcon,
  BanknotesIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
} from "@/components/icons";
import SectionPanel from "@/components/section-panel";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { CUSTOMERS, getCustomerById } from "@/lib/mock-customers";
import { getCustomerFinancials } from "@/lib/mock-finance";
import { JOBS } from "@/lib/mock-jobs";
import { calculateQuoteTotals, QUOTES } from "@/lib/mock-quotes";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type CustomerRecord = {
  code: string;
  title: string;
  status: string;
  amount: number;
  date: string;
  href: string;
};

export function generateStaticParams() {
  return CUSTOMERS.map((customer) => ({ id: customer.id }));
}

export async function generateMetadata({ params }: PageProps<"/musteriler/[id]">): Promise<Metadata> {
  const { id } = await params;
  const customer = getCustomerById(id);

  return {
    title: customer ? `${customer.name} | İşTakip` : "Müşteri bulunamadı | İşTakip",
  };
}

function RecordTable({
  rows,
  firstColumnLabel,
  emptyMessage,
}: {
  rows: CustomerRecord[];
  firstColumnLabel: string;
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <div className="px-5 py-10 text-center text-sm text-foreground-muted">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-ui-border bg-surface-muted">
          <tr>
            <th scope="col" className={TH_CLASS}>{firstColumnLabel}</th>
            <th scope="col" className={TH_CLASS}>Durum</th>
            <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
            <th scope="col" className={`${TH_CLASS} hidden text-right sm:table-cell`}>Tarih</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ui-border-subtle">
          {rows.map((row) => (
            <tr key={row.code} className={TR_CLASS}>
              <td className={TD_CLASS}>
                <Link href={row.href} className="block rounded-sm font-medium text-foreground hover:text-brand-700">{row.title}</Link>
                <span className="mt-0.5 block text-xs text-foreground-muted">
                  {row.code}<span className="sm:hidden"> · {row.date}</span>
                </span>
              </td>
              <td className={TD_CLASS}><StatusBadge status={row.status} /></td>
              <td className={`${TD_CLASS} text-right font-medium text-foreground tabular-nums`}>{formatCurrency(row.amount)}</td>
              <td className={`${TD_CLASS} hidden text-right tabular-nums sm:table-cell`}>{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CustomerDetailPage({ params }: PageProps<"/musteriler/[id]">) {
  const { id } = await params;
  const customer = getCustomerById(id);

  if (!customer) notFound();

  const financials = getCustomerFinancials(customer.id);
  const customerJobs: CustomerRecord[] = JOBS.filter((job) => job.customer.id === customer.id).map(
    (job) => ({
      code: job.code,
      title: job.title,
      status: job.status,
      amount: job.amount,
      date: formatDate(job.startDate),
      href: `/isler/${job.id}`,
    }),
  );
  const customerQuotes: CustomerRecord[] = QUOTES.filter(
    (quote) => quote.customer.id === customer.id,
  ).map((quote) => ({
    code: quote.code,
    title: quote.title,
    status: quote.status,
    amount: calculateQuoteTotals(quote).grandTotal,
    date: quote.createdAt,
    href: `/teklifler/${quote.id}`,
  }));
  const contactRows = [
    { label: "Yetkili", value: customer.contact, icon: UsersIcon },
    { label: "Telefon", value: customer.phone, icon: PhoneIcon, href: `tel:${customer.phone.replace(/\s/g, "")}` },
    { label: "E-posta", value: customer.email, icon: MailIcon, href: `mailto:${customer.email}` },
    { label: "Adres", value: `${customer.address}, ${customer.city}`, icon: MapPinIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link href="/musteriler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
        <ArrowLeftIcon className="h-4 w-4" />
        Müşteriler
      </Link>

      <div className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{customer.name}</h1>
            <p className="mt-1 text-sm text-foreground-muted">Son işlem: <span className="tabular-nums">{customer.lastActivity}</span></p>
          </div>
          <StatusBadge status={customer.status} />
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-ui-border-subtle pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {contactRows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5 text-foreground-subtle"><Icon className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">{row.label}</dt>
                  <dd className="mt-0.5 text-sm break-words text-foreground">
                    {row.href ? <a href={row.href} className="rounded-sm transition-colors hover:text-brand-700">{row.value}</a> : row.value}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      <section>
        <h2 className="sr-only">Müşteri özeti</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Toplam İş" value={String(financials.totalJobs)} icon={BriefcaseIcon} hint="Mevcut veri seti" />
          <StatCard label="Aktif İş" value={String(financials.activeJobs)} icon={ChartBarIcon} hint="Planlanan, devam eden ve bekleyen" />
          <StatCard label="Toplam Ciro" value={formatCurrency(financials.totalRevenue)} icon={BanknotesIcon} hint="İptal edilmemiş işler" />
          <StatCard label="Toplam Açık Bakiye" value={formatCurrency(financials.openBalance)} icon={ClockIcon} hint={financials.openBalance > 0 ? "İş bedeli − tahsil edilen" : "Açık bakiye yok"} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionPanel title="İşler" description="Mevcut veri setindeki müşteri işleri" href="/isler">
          <RecordTable rows={customerJobs} firstColumnLabel="İş" emptyMessage="Bu müşteri için kayıtlı iş bulunmuyor." />
        </SectionPanel>
        <SectionPanel title="Teklifler" description="Mevcut veri setindeki müşteri teklifleri" href="/teklifler">
          <RecordTable rows={customerQuotes} firstColumnLabel="Teklif" emptyMessage="Bu müşteri için kayıtlı teklif bulunmuyor." />
        </SectionPanel>
      </div>
    </div>
  );
}
