import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon, MailIcon, PhoneIcon, UsersIcon } from "@/components/icons";
import ConvertQuoteToJob from "@/components/jobs/convert-quote-to-job";
import QuoteDataError from "@/components/quotes/quote-data-error";
import StatusBadge from "@/components/status-badge";
import { getCurrentAccount } from "@/lib/auth/account";
import { formatCurrency, formatDate } from "@/lib/format";
import { calculateLineTotalCents, centsToAmount } from "@/lib/quotes/calculations";
import { getQuoteById } from "@/lib/quotes/data";
import { TD_CLASS, TH_CLASS } from "@/lib/table-styles";

const formatOptionalDateTime = (value: string) => value ? formatDate(value.slice(0, 10)) : "—";
const displayValue = (value: string | null) => value || "—";
const quantityFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 3 });

export async function generateMetadata({ params }: PageProps<"/teklifler/[id]">): Promise<Metadata> {
  const { id } = await params;

  try {
    const quote = await getQuoteById(id);
    return {
      title: quote ? `${quote.code} | İşTakip` : "Teklif bulunamadı | İşTakip",
      description: quote ? `${quote.customer.name} için ${quote.title} teklifi.` : undefined,
    };
  } catch {
    return { title: "Teklif | İşTakip" };
  }
}

export default async function QuoteDetailPage({ params }: PageProps<"/teklifler/[id]">) {
  const [account, { id }] = await Promise.all([getCurrentAccount(), params]);
  const isDemo = account.status === "ready" && account.isDemo;
  let quote;

  try {
    quote = await getQuoteById(id);
  } catch {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/teklifler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
          Teklifler
        </Link>
        <QuoteDataError message="Teklif bilgileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  if (!quote) notFound();

  const customerRows = [
    { label: "Yetkili", value: quote.customer.contactName, icon: UsersIcon },
    {
      label: "Telefon",
      value: quote.customer.phone,
      icon: PhoneIcon,
      href: quote.customer.phone ? `tel:${quote.customer.phone.replace(/\s/g, "")}` : undefined,
    },
    {
      label: "E-posta",
      value: quote.customer.email,
      icon: MailIcon,
      href: quote.customer.email ? `mailto:${quote.customer.email}` : undefined,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/teklifler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
          Teklifler
        </Link>
        {quote.status === "approved" && quote.sourceJob ? (
          <Link
            href={`/isler/${quote.sourceJob.id}`}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-3.5 py-2 text-sm font-semibold text-brand-700 shadow-xs transition-colors hover:bg-surface-hover hover:text-brand-800"
          >
            İş: {quote.sourceJob.code} · İşi Gör
          </Link>
        ) : quote.status === "approved" && !isDemo ? (
          <ConvertQuoteToJob quoteId={quote.id} />
        ) : quote.status !== "approved" && !isDemo ? (
          <Link href={`/teklifler/${quote.id}/duzenle`} className="inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover hover:text-foreground">
            Teklifi Düzenle
          </Link>
        ) : null}
      </div>

      <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{quote.code}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{quote.title}</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              <Link href={`/musteriler/${quote.customer.id}`} className="rounded-sm font-medium text-foreground-secondary transition-colors hover:text-brand-700">
                {quote.customer.name}
              </Link>{" için hazırlandı."}
            </p>
          </div>
          <StatusBadge status={quote.statusLabel} />
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-ui-border-subtle pt-5 sm:grid-cols-3">
          <div><dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">Teklif tarihi</dt><dd className="mt-1 text-sm font-medium text-foreground tabular-nums">{formatDate(quote.issueDate)}</dd></div>
          <div><dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">Geçerlilik tarihi</dt><dd className="mt-1 text-sm font-medium text-foreground tabular-nums">{formatDate(quote.validUntil)}</dd></div>
          <div><dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">Son güncelleme</dt><dd className="mt-1 text-sm font-medium text-foreground tabular-nums">{formatOptionalDateTime(quote.updatedAt)}</dd></div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
        <div className="border-b border-ui-border px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Teklif Kalemleri</h2>
          <p className="mt-0.5 text-xs text-foreground-muted">Fiyatlandırmaya dahil olan ürün ve hizmetler</p>
        </div>

        {quote.items.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-foreground-muted">Bu teklife ait kalem bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <thead className="border-b border-ui-border bg-surface-muted">
                <tr>
                  <th scope="col" className={TH_CLASS}>Açıklama</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Miktar</th>
                  <th scope="col" className={TH_CLASS}>Birim</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Birim Fiyat</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-subtle">
                {quote.items.map((item) => (
                  <tr key={item.id || `${item.position}-${item.description}`}>
                    <td className={`${TD_CLASS} font-medium text-foreground`}>{item.description}</td>
                    <td className={`${TD_CLASS} text-right tabular-nums`}>{quantityFormatter.format(Number(item.quantity))}</td>
                    <td className={TD_CLASS}>{item.unit}</td>
                    <td className={`${TD_CLASS} text-right whitespace-nowrap tabular-nums`}>{formatCurrency(Number(item.unitPrice))}</td>
                    <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-foreground tabular-nums`}>{formatCurrency(centsToAmount(calculateLineTotalCents(item.quantity, item.unitPrice)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end border-t border-ui-border bg-surface-muted/60 px-4 py-5 sm:px-5">
          <dl className="w-full max-w-sm space-y-3 text-sm">
            <div className="flex items-center justify-between gap-6"><dt className="text-foreground-muted">Ara toplam</dt><dd className="font-medium text-foreground tabular-nums">{formatCurrency(centsToAmount(quote.subtotalCents))}</dd></div>
            <div className="flex items-center justify-between gap-6"><dt className="text-foreground-muted">İndirim</dt><dd className="font-medium text-success tabular-nums">−{formatCurrency(centsToAmount(quote.discountCents))}</dd></div>
            <div className="flex items-center justify-between gap-6"><dt className="text-foreground-muted">KDV (%{quote.vatRate})</dt><dd className="font-medium text-foreground tabular-nums">{formatCurrency(centsToAmount(quote.vatCents))}</dd></div>
            <div className="flex items-center justify-between gap-6 border-t border-ui-border pt-3"><dt className="font-semibold text-foreground">Genel toplam</dt><dd className="text-lg font-semibold tracking-tight text-foreground tabular-nums">{formatCurrency(centsToAmount(quote.grandTotalCents))}</dd></div>
          </dl>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Müşteri Bilgisi</h2>
          <Link href={`/musteriler/${quote.customer.id}`} className="mt-3 inline-flex rounded-sm text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800">{quote.customer.name}</Link>
          <dl className="mt-4 space-y-3 border-t border-ui-border-subtle pt-4">
            {customerRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-start gap-2.5">
                  <span aria-hidden className="mt-0.5 text-foreground-subtle"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-foreground-muted">{row.label}</dt>
                    <dd className="mt-0.5 text-sm break-words text-foreground">{row.href ? <a href={row.href} className="rounded-sm transition-colors hover:text-brand-700">{displayValue(row.value)}</a> : displayValue(row.value)}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </section>

        <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Not</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground-secondary">{quote.notes || "Bu teklif için not eklenmemiş."}</p>
        </section>
      </div>
    </div>
  );
}
