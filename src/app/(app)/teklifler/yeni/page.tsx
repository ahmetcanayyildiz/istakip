import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import QuoteDataError from "@/components/quotes/quote-data-error";
import QuoteForm from "@/components/quotes/quote-form";
import { createQuoteAction } from "@/lib/quotes/actions";
import { getActiveQuoteCustomers } from "@/lib/quotes/data";
import type { QuoteFormInitialValues } from "@/lib/quotes/types";

export const metadata: Metadata = {
  title: "Yeni Teklif | İşTakip",
  description: "Müşteri ve teklif kalemlerini hazırlayın.",
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function NewQuotePage() {
  let customers;

  try {
    customers = await getActiveQuoteCustomers();
  } catch {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/teklifler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"><ArrowLeftIcon className="h-4 w-4" />Teklifler</Link>
        <QuoteDataError message="Müşteri seçenekleri şu anda yüklenemiyor. Teklif formu açılamadı." />
      </div>
    );
  }

  const today = new Date();
  const validityDate = new Date(today);
  validityDate.setDate(validityDate.getDate() + 15);
  const initialValues: QuoteFormInitialValues = {
    customerId: "",
    title: "",
    issueDate: toDateInputValue(today),
    validUntil: toDateInputValue(validityDate),
    status: "draft",
    notes: "",
    discountAmount: "0",
    vatRate: "20",
    items: [{ description: "", quantity: "1", unit: "adet", unitPrice: "0" }],
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/teklifler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"><ArrowLeftIcon className="h-4 w-4" />Teklifler</Link>
      <div><h1 className="text-xl font-semibold tracking-tight text-foreground">Yeni Teklif</h1><p className="mt-1 text-sm text-foreground-muted">Teklif bilgilerini ve fiyatlandırma kalemlerini hazırlayın.</p></div>
      {customers.length === 0 ? <QuoteDataError message="Aktif müşteri bulunmadığı için teklif hazırlanamaz. Önce aktif bir müşteri kaydı oluşturun." /> : <QuoteForm action={createQuoteAction} cancelHref="/teklifler" customers={customers} initialValues={initialValues} mode="create" />}
    </div>
  );
}
