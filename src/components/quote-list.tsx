"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ChevronRightIcon, SearchIcon } from "@/components/icons";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, normalizeText } from "@/lib/format";
import {
  calculateQuoteTotals,
  type Quote,
  type QuoteStatus,
} from "@/lib/mock-quotes";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type StatusFilter = "Tümü" | QuoteStatus;

const STATUS_FILTERS: StatusFilter[] = [
  "Tümü",
  "Taslak",
  "Gönderildi",
  "Beklemede",
  "Onaylandı",
  "Reddedildi",
];

export default function QuoteList({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Tümü");

  const counts = useMemo(
    () =>
      STATUS_FILTERS.reduce<Record<StatusFilter, number>>(
        (result, item) => {
          result[item] =
            item === "Tümü"
              ? quotes.length
              : quotes.filter((quote) => quote.status === item).length;
          return result;
        },
        {
          Tümü: 0,
          Taslak: 0,
          Gönderildi: 0,
          Beklemede: 0,
          Onaylandı: 0,
          Reddedildi: 0,
        },
      ),
    [quotes],
  );

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return quotes.filter((quote) => {
      if (status !== "Tümü" && quote.status !== status) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [quote.code, quote.customer.name, quote.title].some((field) =>
        normalizeText(field).includes(term),
      );
    });
  }, [query, quotes, status]);

  const isFiltered = query.trim() !== "" || status !== "Tümü";

  const resetFilters = () => {
    setQuery("");
    setStatus("Tümü");
  };

  const openQuote = (id: string) => router.push(`/teklifler/${id}`);

  return (
    <section className="overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-ui-border px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <label htmlFor="teklif-arama" className="sr-only">
            Teklif ara
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          <input
            id="teklif-arama"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Teklif no, müşteri veya başlık ara"
            className="w-full rounded-md border border-ui-border bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-foreground-subtle"
          />
        </div>

        <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
          <div
            role="group"
            aria-label="Teklif durum filtresi"
            className="flex w-max items-center gap-1 rounded-md border border-ui-border p-0.5"
          >
            {STATUS_FILTERS.map((item) => {
              const isSelected = status === item;

              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setStatus(item)}
                  className={`rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-brand-50 text-brand-800"
                      : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {item}
                  <span className="ml-1.5 text-xs text-foreground-muted tabular-nums">
                    {counts[item]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtered.length} teklif listeleniyor.
      </p>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <span
            aria-hidden
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-strong text-foreground-subtle"
          >
            <SearchIcon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-foreground">Teklif bulunamadı</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-foreground-muted">
            Arama veya durum filtresine uyan teklif yok. Farklı bir arama deneyin ya da
            filtreleri temizleyin.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center rounded-md border border-ui-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-ui-border-subtle md:hidden">
            {filtered.map((quote) => {
              const total = calculateQuoteTotals(quote).grandTotal;

              return (
                <button
                  key={quote.id}
                  type="button"
                  onClick={() => openQuote(quote.id)}
                  className="block w-full px-4 py-4 text-left transition-colors hover:bg-surface-hover"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold tracking-wide text-brand-700">
                        {quote.code}
                      </span>
                      <span className="mt-1 block truncate text-sm font-semibold text-foreground">
                        {quote.title}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-foreground-muted">
                        {quote.customer.name}
                      </span>
                    </span>
                    <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-foreground-faint" />
                  </span>

                  <span className="mt-3 flex items-end justify-between gap-3">
                    <span>
                      <span className="block text-xs text-foreground-muted">Geçerlilik</span>
                      <span className="mt-0.5 block text-sm text-foreground-secondary tabular-nums">
                        {quote.validUntil}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-2">
                      <StatusBadge status={quote.status} />
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatCurrency(total)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[74rem] border-collapse text-left">
              <thead className="border-b border-ui-border bg-surface-muted">
                <tr>
                  <th scope="col" className={TH_CLASS}>Teklif No</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={TH_CLASS}>Teklif Başlığı</th>
                  <th scope="col" className={TH_CLASS}>Tarih</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                  <th scope="col" className={TH_CLASS}>Durum</th>
                  <th scope="col" className={TH_CLASS}>Geçerlilik Tarihi</th>
                  <th scope="col" className={TH_CLASS}>Son Güncelleme</th>
                  <th scope="col" className="w-10">
                    <span className="sr-only">Detay</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-subtle">
                {filtered.map((quote) => (
                  <tr
                    key={quote.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openQuote(quote.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openQuote(quote.id);
                      }
                    }}
                    aria-label={`${quote.code} teklif detayını aç`}
                    className={`${TR_CLASS} cursor-pointer focus-visible:bg-brand-50`}
                  >
                    <td className={`${TD_CLASS} font-semibold whitespace-nowrap text-brand-700`}>
                      {quote.code}
                    </td>
                    <td className={TD_CLASS}>{quote.customer.name}</td>
                    <td className={`${TD_CLASS} max-w-72`}>
                      <span className="block truncate font-medium text-foreground">{quote.title}</span>
                    </td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{quote.createdAt}</td>
                    <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-foreground tabular-nums`}>
                      {formatCurrency(calculateQuoteTotals(quote).grandTotal)}
                    </td>
                    <td className={TD_CLASS}><StatusBadge status={quote.status} /></td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{quote.validUntil}</td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{quote.updatedAt}</td>
                    <td className={`${TD_CLASS} text-right`}>
                      <ChevronRightIcon className="ml-auto h-4 w-4 text-foreground-faint" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-ui-border px-4 py-3 text-xs text-foreground-muted sm:px-5">
          <span className="tabular-nums">
            {filtered.length} / {quotes.length} teklif gösteriliyor
          </span>
          {isFiltered ? (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
            >
              Filtreleri temizle
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
