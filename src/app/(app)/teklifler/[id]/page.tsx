import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  UsersIcon,
} from "@/components/icons";
import StatusBadge from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import { calculateQuoteTotals, getQuoteById, QUOTES } from "@/lib/mock-quotes";
import { TD_CLASS, TH_CLASS } from "@/lib/table-styles";

export function generateStaticParams() {
  return QUOTES.map((quote) => ({ id: quote.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/teklifler/[id]">): Promise<Metadata> {
  const { id } = await params;
  const quote = getQuoteById(id);

  return {
    title: quote ? `${quote.code} | İşTakip` : "Teklif bulunamadı | İşTakip",
    description: quote ? `${quote.customer.name} için ${quote.title} teklifi.` : undefined,
  };
}

export default async function QuoteDetailPage({ params }: PageProps<"/teklifler/[id]">) {
  const { id } = await params;
  const quote = getQuoteById(id);

  if (!quote) {
    notFound();
  }

  const totals = calculateQuoteTotals(quote);
  const customerRows = [
    { label: "Yetkili", value: quote.customer.contact, icon: UsersIcon },
    {
      label: "Telefon",
      value: quote.customer.phone,
      icon: PhoneIcon,
      href: `tel:${quote.customer.phone.replace(/\s/g, "")}`,
    },
    {
      label: "E-posta",
      value: quote.customer.email,
      icon: MailIcon,
      href: `mailto:${quote.customer.email}`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/teklifler"
        className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Teklifler
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
              {quote.code}
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              {quote.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              <Link
                href={`/musteriler/${quote.customer.id}`}
                className="rounded-sm font-medium text-slate-700 transition-colors hover:text-brand-700"
              >
                {quote.customer.name}
              </Link>
              {" için hazırlandı."}
            </p>
          </div>
          <StatusBadge status={quote.status} />
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Oluşturulma tarihi
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 tabular-nums">
              {quote.createdAt}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Geçerlilik tarihi
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 tabular-nums">
              {quote.validUntil}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Son güncelleme
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 tabular-nums">
              {quote.updatedAt}
            </dd>
          </div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            Teklif Kalemleri
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Fiyatlandırmaya dahil olan ürün ve hizmetler
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className={TH_CLASS}>Açıklama</th>
                <th scope="col" className={`${TH_CLASS} text-right`}>Miktar</th>
                <th scope="col" className={TH_CLASS}>Birim</th>
                <th scope="col" className={`${TH_CLASS} text-right`}>Birim Fiyat</th>
                <th scope="col" className={`${TH_CLASS} text-right`}>Toplam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.items.map((item) => (
                <tr key={item.description}>
                  <td className={`${TD_CLASS} font-medium text-slate-900`}>{item.description}</td>
                  <td className={`${TD_CLASS} text-right tabular-nums`}>
                    {item.quantity.toLocaleString("tr-TR")}
                  </td>
                  <td className={TD_CLASS}>{item.unit}</td>
                  <td className={`${TD_CLASS} text-right whitespace-nowrap tabular-nums`}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-slate-900 tabular-nums`}>
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50/60 px-4 py-5 sm:px-5">
          <dl className="w-full max-w-sm space-y-3 text-sm">
            <div className="flex items-center justify-between gap-6">
              <dt className="text-slate-500">Ara toplam</dt>
              <dd className="font-medium text-slate-900 tabular-nums">
                {formatCurrency(totals.subtotal)}
              </dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex items-center justify-between gap-6">
                <dt className="text-slate-500">İndirim</dt>
                <dd className="font-medium text-emerald-700 tabular-nums">
                  −{formatCurrency(totals.discount)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-6">
              <dt className="text-slate-500">KDV (%{quote.vatRate})</dt>
              <dd className="font-medium text-slate-900 tabular-nums">
                {formatCurrency(totals.vat)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-6 border-t border-slate-200 pt-3">
              <dt className="font-semibold text-slate-900">Genel toplam</dt>
              <dd className="text-lg font-semibold tracking-tight text-slate-900 tabular-nums">
                {formatCurrency(totals.grandTotal)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            Müşteri Bilgisi
          </h2>
          <Link
            href={`/musteriler/${quote.customer.id}`}
            className="mt-3 inline-flex rounded-sm text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            {quote.customer.name}
          </Link>

          <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            {customerRows.map((row) => {
              const Icon = row.icon;

              return (
                <div key={row.label} className="flex items-start gap-2.5">
                  <span aria-hidden className="mt-0.5 text-slate-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
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
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">Notlar</h2>
          <ul className="mt-4 space-y-3">
            {quote.notes.map((note) => (
              <li key={note} className="flex gap-3 text-sm leading-6 text-slate-600">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
