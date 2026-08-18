import type { Metadata } from "next";
import Link from "next/link";

import QuoteList from "@/components/quote-list";
import { PlusIcon } from "@/components/icons";
import QuoteDataError from "@/components/quotes/quote-data-error";
import { getQuotes } from "@/lib/quotes/data";

export const metadata: Metadata = {
  title: "Teklifler | İşTakip",
  description: "Müşterilere hazırlanan teklifler, tutarlar ve teklif durumları.",
};

export default async function TekliflerPage() {
  let quotes;

  try {
    quotes = await getQuotes();
  } catch {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Teklifler</h1>
          <p className="mt-1 text-sm text-foreground-muted">İşletmenize ait teklif kayıtları.</p>
        </div>
        <QuoteDataError message="Teklif kayıtları şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Teklifler</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Müşterilere hazırlanan teklifleri ve finansal toplamlarını takip edin. Toplam{" "}
            <span className="font-medium text-foreground-secondary tabular-nums">{quotes.length}</span>{" "}
            teklif kayıtlı.
          </p>
        </div>

        <Link
          href="/teklifler/yeni"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-md bg-brand-action px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover"
        >
          <PlusIcon className="h-4 w-4" />
          Yeni Teklif
        </Link>
      </div>

      <QuoteList quotes={quotes} />
    </div>
  );
}
