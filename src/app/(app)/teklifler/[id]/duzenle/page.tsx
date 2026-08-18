import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon } from "@/components/icons";
import QuoteDataError from "@/components/quotes/quote-data-error";
import QuoteForm from "@/components/quotes/quote-form";
import { updateQuoteAction } from "@/lib/quotes/actions";
import { getActiveQuoteCustomers, getQuoteById } from "@/lib/quotes/data";
import type { QuoteCustomerOption, QuoteFormInitialValues } from "@/lib/quotes/types";

export const metadata: Metadata = {
  title: "Teklif Düzenle | İşTakip",
  description: "Teklif bilgilerini ve kalemlerini inceleyin.",
};

export default async function EditQuotePage({ params }: PageProps<"/teklifler/[id]/duzenle">) {
  const { id } = await params;
  let quote;

  try {
    quote = await getQuoteById(id);
  } catch {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/teklifler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"><ArrowLeftIcon className="h-4 w-4" />Teklifler</Link>
        <QuoteDataError message="Teklif düzenleme bilgileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  if (!quote) notFound();

  if (quote.status === "approved") {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href={`/teklifler/${quote.id}`} className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"><ArrowLeftIcon className="h-4 w-4" />Teklif detayına dön</Link>
        <section className="rounded-lg border border-warning-border bg-warning-soft p-5 text-warning shadow-xs sm:p-6">
          <h1 className="text-lg font-semibold tracking-tight">Onaylanmış teklifler düzenlenemez.</h1>
          <p className="mt-1 text-sm leading-6">{quote.code} numaralı teklif onaylandığı için bilgiler ve teklif kalemleri salt okunur durumdadır.</p>
        </section>
      </div>
    );
  }

  let activeCustomers;
  try {
    activeCustomers = await getActiveQuoteCustomers();
  } catch {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href={`/teklifler/${quote.id}`} className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"><ArrowLeftIcon className="h-4 w-4" />Teklif detayına dön</Link>
        <QuoteDataError message="Müşteri seçenekleri şu anda yüklenemiyor. Teklif düzenleme formu açılamadı." />
      </div>
    );
  }

  const customers: QuoteCustomerOption[] = activeCustomers.some((customer) => customer.id === quote.customer.id)
    ? activeCustomers
    : [{ id: quote.customer.id, name: quote.customer.name, isActive: quote.customer.isActive }, ...activeCustomers];
  const initialValues: QuoteFormInitialValues = {
    customerId: quote.customer.id,
    title: quote.title,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil,
    status: quote.status,
    notes: quote.notes ?? "",
    discountAmount: quote.discountAmount,
    vatRate: quote.vatRate,
    items: quote.items.length > 0
      ? quote.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        }))
      : [{ description: "", quantity: "1", unit: "adet", unitPrice: "0" }],
  };
  const action = updateQuoteAction.bind(null, quote.id, quote.customer.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href={`/teklifler/${quote.id}`} className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"><ArrowLeftIcon className="h-4 w-4" />Teklif detayına dön</Link>
      <div><h1 className="text-xl font-semibold tracking-tight text-foreground">Teklifi Düzenle</h1><p className="mt-1 text-sm text-foreground-muted">{quote.code} numaralı teklifin bilgilerini ve kalemlerini inceleyin.</p></div>
      <QuoteForm action={action} cancelHref={`/teklifler/${quote.id}`} customers={customers} initialValues={initialValues} mode="edit" quoteCode={quote.code} />
    </div>
  );
}
