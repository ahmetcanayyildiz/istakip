import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CustomerDataError from "@/components/customers/customer-data-error";
import DeleteCustomer from "@/components/customers/delete-customer";
import {
  ArrowLeftIcon,
  BanknotesIcon,
  BriefcaseIcon,
  CalendarIcon,
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
import { getCustomerById, getCustomerRelatedData } from "@/lib/customers/data";
import type { CustomerRelatedRecord } from "@/lib/customers/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

export async function generateMetadata({ params }: PageProps<"/musteriler/[id]">): Promise<Metadata> {
  const { id } = await params;

  try {
    const customer = await getCustomerById(id);
    return { title: customer ? `${customer.name} | İşTakip` : "Müşteri bulunamadı | İşTakip" };
  } catch {
    return { title: "Müşteri | İşTakip" };
  }
}

function RecordTable({
  rows,
  firstColumnLabel,
  emptyMessage,
}: {
  rows: CustomerRelatedRecord[];
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
            <tr key={row.id} className={TR_CLASS}>
              <td className={TD_CLASS}>
                <span className="block font-medium text-foreground">{row.title}</span>
                <span className="mt-0.5 block text-xs text-foreground-muted">
                  {row.code}<span className="sm:hidden"> · {formatDate(row.date)}</span>
                </span>
              </td>
              <td className={TD_CLASS}><StatusBadge status={row.status} /></td>
              <td className={`${TD_CLASS} text-right font-medium text-foreground tabular-nums`}>{formatCurrency(row.amount)}</td>
              <td className={`${TD_CLASS} hidden text-right tabular-nums sm:table-cell`}>{formatDate(row.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CustomerDetailPage({ params }: PageProps<"/musteriler/[id]">) {
  const { id } = await params;
  let customer;

  try {
    customer = await getCustomerById(id);
  } catch {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/musteriler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
          Müşteriler
        </Link>
        <CustomerDataError message="Müşteri bilgileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  if (!customer) notFound();

  let relatedData = null;
  try {
    relatedData = await getCustomerRelatedData(customer.id);
  } catch {
    // Müşterinin temel bilgileri kullanılabilir kalır; finansal bölüm kendi hatasını gösterir.
  }

  const contactRows = [
    { label: "Yetkili", value: customer.contactName, icon: UsersIcon },
    { label: "Telefon", value: customer.phone, icon: PhoneIcon, href: customer.phone ? `tel:${customer.phone.replace(/\s/g, "")}` : undefined },
    { label: "E-posta", value: customer.email, icon: MailIcon, href: customer.email ? `mailto:${customer.email}` : undefined },
    { label: "Şehir", value: customer.city, icon: MapPinIcon },
    { label: "Adres", value: customer.address, icon: MapPinIcon },
    { label: "Oluşturulma", value: formatDate(customer.createdAt.slice(0, 10)), icon: CalendarIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link href="/musteriler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
        <ArrowLeftIcon className="h-4 w-4" />
        Müşteriler
      </Link>

      <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{customer.name}</h1>
            <p className="mt-1 text-sm text-foreground-muted">Gerçek müşteri kaydı</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={customer.status} />
            <Link href={`/musteriler/${customer.id}/duzenle`} className="inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-ui-border-strong hover:bg-surface-hover hover:text-foreground">
              Düzenle
            </Link>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-ui-border-subtle pt-5 sm:grid-cols-2 lg:grid-cols-3">
          {contactRows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5 text-foreground-subtle"><Icon className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">{row.label}</dt>
                  <dd className="mt-0.5 text-sm break-words text-foreground">
                    {row.href && row.value ? <a href={row.href} className="rounded-sm transition-colors hover:text-brand-700">{row.value}</a> : row.value || "—"}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </section>

      {relatedData ? (
        <>
          <section>
            <h2 className="sr-only">Müşteri özeti</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Toplam İş" value={String(relatedData.financials.totalJobs)} icon={BriefcaseIcon} hint="Gerçek iş kayıtları" />
              <StatCard label="Aktif İş" value={String(relatedData.financials.activeJobs)} icon={ChartBarIcon} hint="Planlanan, devam eden ve bekleyen" />
              <StatCard label="Toplam İş Bedeli" value={formatCurrency(relatedData.financials.totalRevenue)} icon={BanknotesIcon} hint="İptal edilmemiş gerçek işler" />
              <StatCard label="Toplam Açık Bakiye" value={formatCurrency(relatedData.financials.openBalance)} icon={ClockIcon} hint="İş bedeli − tahsil edilen" />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SectionPanel title="Son İşler" description="Veritabanındaki son beş iş kaydı">
              <RecordTable rows={relatedData.jobs} firstColumnLabel="İş" emptyMessage="Bu müşteri için gerçek iş kaydı bulunmuyor." />
            </SectionPanel>
            <SectionPanel title="Son Teklifler" description="Veritabanındaki son beş teklif kaydı">
              <RecordTable rows={relatedData.quotes} firstColumnLabel="Teklif" emptyMessage="Bu müşteri için gerçek teklif kaydı bulunmuyor." />
            </SectionPanel>
          </div>
        </>
      ) : (
        <CustomerDataError message="Müşterinin iş, teklif ve finansal özeti şu anda yüklenemiyor." />
      )}

      <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Müşteri kaydını sil</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground-muted">
          Bağlı teklif veya iş bulunmayan müşteri kayıtlarını kalıcı olarak silebilirsiniz.
        </p>
        <div className="mt-4"><DeleteCustomer customerId={customer.id} /></div>
      </section>
    </div>
  );
}
