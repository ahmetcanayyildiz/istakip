import type { Metadata } from "next";

import QuoteList from "@/components/quote-list";
import { QUOTES } from "@/lib/mock-quotes";

export const metadata: Metadata = {
  title: "Teklifler | İşTakip",
  description: "Müşterilere hazırlanan teklifler, tutarlar ve teklif durumları.",
};

export default function TekliflerPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Teklifler</h1>
        <p className="mt-1 text-sm text-slate-500">
          Müşterilere hazırlanan teklifleri, tutarlarını ve güncel durumlarını takip edin.
          Toplam <span className="font-medium text-slate-700 tabular-nums">{QUOTES.length}</span>{" "}
          teklif kayıtlı.
        </p>
      </div>

      <QuoteList quotes={QUOTES} />
    </div>
  );
}
