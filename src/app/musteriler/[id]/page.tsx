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
import { formatCurrency } from "@/lib/format";
import { CUSTOMERS, getCustomerById } from "@/lib/mock-customers";
import type { CustomerJob, CustomerQuote } from "@/lib/mock-customers";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

export function generateStaticParams() {
  return CUSTOMERS.map((customer) => ({ id: customer.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/musteriler/[id]">): Promise<Metadata> {
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
  rows: (CustomerJob | CustomerQuote)[];
  firstColumnLabel: string;
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={TH_CLASS}>
              {firstColumnLabel}
            </th>
            <th scope="col" className={TH_CLASS}>
              Durum
            </th>
            <th scope="col" className={`${TH_CLASS} text-right`}>
              Tutar
            </th>
            <th scope="col" className={`${TH_CLASS} hidden text-right sm:table-cell`}>
              Tarih
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.code} className={TR_CLASS}>
              <td className={TD_CLASS}>
                <span className="block font-medium text-slate-900">{row.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {row.code}
                  <span className="sm:hidden"> · {row.date}</span>
                </span>
              </td>
              <td className={TD_CLASS}>
                <StatusBadge status={row.status} />
              </td>
              <td className={`${TD_CLASS} text-right font-medium text-slate-900 tabular-nums`}>
                {formatCurrency(row.amount)}
              </td>
              <td className={`${TD_CLASS} hidden text-right tabular-nums sm:table-cell`}>
                {row.date}
              </td>
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

  if (!customer) {
    notFound();
  }

  const contactRows = [
    { label: "Yetkili", value: customer.contact, icon: UsersIcon },
    {
      label: "Telefon",
      value: customer.phone,
      icon: PhoneIcon,
      href: `tel:${customer.phone.replace(/\s/g, "")}`,
    },
    {
      label: "E-posta",
      value: customer.email,
      icon: MailIcon,
      href: `mailto:${customer.email}`,
    },
    {
      label: "Adres",
      value: `${customer.address}, ${customer.city}`,
      icon: MapPinIcon,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/musteriler"
        className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Müşteriler
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {customer.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Son işlem: <span className="tabular-nums">{customer.lastActivity}</span>
            </p>
          </div>
          <StatusBadge status={customer.status} />
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {contactRows.map((row) => {
            const Icon = row.icon;

            return (
              <div key={row.label} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5 text-slate-400">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 text-sm break-words text-slate-900">
                    {row.href ? (
                      <a
                        href={row.href}
                        className="rounded-sm transition-colors hover:text-brand-700"
                      >
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
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
          <StatCard
            label="Toplam İş"
            value={String(customer.totalJobs)}
            icon={BriefcaseIcon}
            hint="Tüm dönemler"
          />
          <StatCard
            label="Aktif İş"
            value={String(customer.activeJobs)}
            icon={ChartBarIcon}
            hint="Devam eden işler"
          />
          <StatCard
            label="Toplam Ciro"
            value={formatCurrency(customer.totalRevenue)}
            icon={BanknotesIcon}
            hint="Tüm dönemler"
          />
          <StatCard
            label="Bekleyen Tahsilat"
            value={formatCurrency(customer.pendingPayment)}
            icon={ClockIcon}
            hint={customer.pendingPayment > 0 ? "Tahsil edilmedi" : "Açık kayıt yok"}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionPanel title="Son İşler" description="Bu müşteriye ait işler" href="/isler">
          <RecordTable
            rows={customer.jobs}
            firstColumnLabel="İş"
            emptyMessage="Bu müşteri için kayıtlı iş bulunmuyor."
          />
        </SectionPanel>

        <SectionPanel
          title="Son Teklifler"
          description="Bu müşteriye ait teklifler"
          href="/teklifler"
        >
          <RecordTable
            rows={customer.quotes}
            firstColumnLabel="Teklif"
            emptyMessage="Bu müşteri için kayıtlı teklif bulunmuyor."
          />
        </SectionPanel>
      </div>
    </div>
  );
}
