"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ChevronRightIcon, PlusIcon, SearchIcon } from "@/components/icons";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, formatDate, normalizeText } from "@/lib/format";
import { centsToAmount } from "@/lib/quotes/calculations";
import {
  QUOTE_STATUS_OPTIONS,
  type QuoteListItem,
  type QuoteStatus,
} from "@/lib/quotes/types";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type StatusFilter = "all" | QuoteStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tümü" },
  ...QUOTE_STATUS_OPTIONS,
];

function QuoteEmptyState({ isDemo }: { isDemo: boolean }) {
  return (
    <section className="rounded-lg border border-ui-border bg-surface px-6 py-16 text-center shadow-xs">
      <span
        aria-hidden
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700"
      >
        <PlusIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-3 text-sm font-semibold text-foreground">Henüz teklif kaydı yok</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-foreground-muted">
        Teklif oluşturma ekranını açabilir, müşteri ve kalem bilgilerini hazırlayabilirsiniz.
      </p>
      {!isDemo ? (
        <Link
          href="/teklifler/yeni"
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-brand-action px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover"
        >
          <PlusIcon className="h-4 w-4" />
          Yeni Teklif
        </Link>
      ) : null}
    </section>
  );
}

export default function QuoteList({ quotes, isDemo }: { quotes: QuoteListItem[]; isDemo: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const counts = useMemo(
    () =>
      Object.fromEntries(
        STATUS_FILTERS.map((option) => [
          option.value,
          option.value === "all"
            ? quotes.length
            : quotes.filter((quote) => quote.status === option.value).length,
        ]),
      ) as Record<StatusFilter, number>,
    [quotes],
  );

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return quotes.filter((quote) => {
      if (status !== "all" && quote.status !== status) return false;
      if (!term) return true;

      return [quote.code, quote.customer.name, quote.title].some((field) =>
        normalizeText(field).includes(term),
      );
    });
  }, [query, quotes, status]);

  const isFiltered = query.trim() !== "" || status !== "all";
  const resetFilters = () => {
    setQuery("");
    setStatus("all");
  };

  if (quotes.length === 0) return <QuoteEmptyState isDemo={isDemo} />;

  return (
    <section className="overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-ui-border px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <label htmlFor="teklif-arama" className="sr-only">Teklif ara</label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          <input
            id="teklif-arama"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Teklif no veya müşteri ara"
            className="w-full rounded-md border border-ui-border bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-foreground-subtle"
          />
        </div>

        <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
          <div
            role="group"
            aria-label="Teklif durum filtresi"
            className="flex w-max items-center gap-1 rounded-md border border-ui-border p-0.5"
          >
            {STATUS_FILTERS.map((option) => {
              const isSelected = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setStatus(option.value)}
                  className={`rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-brand-50 text-brand-800"
                      : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {option.label}
                  <span className="ml-1.5 text-xs text-foreground-muted tabular-nums">
                    {counts[option.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{filtered.length} teklif listeleniyor.</p>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <span aria-hidden className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-strong text-foreground-subtle">
            <SearchIcon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-foreground">Teklif bulunamadı</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-foreground-muted">
            Arama veya durum filtresine uyan teklif yok. Farklı bir arama deneyin ya da filtreleri temizleyin.
          </p>
          <button type="button" onClick={resetFilters} className="mt-4 inline-flex items-center rounded-md border border-ui-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover">
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-ui-border-subtle md:hidden">
            {filtered.map((quote) => (
              <Link key={quote.id} href={`/teklifler/${quote.id}`} className="block px-4 py-4 transition-colors hover:bg-surface-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold tracking-wide text-brand-700">{quote.code}</span>
                    <h3 className="mt-1 truncate text-sm font-semibold text-foreground">{quote.customer.name}</h3>
                    <p className="mt-0.5 truncate text-sm text-foreground-muted">{quote.title}</p>
                  </div>
                  <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-foreground-faint" />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><dt className="text-xs text-foreground-muted">Teklif tarihi</dt><dd className="mt-0.5 text-foreground-secondary tabular-nums">{formatDate(quote.issueDate)}</dd></div>
                  <div><dt className="text-xs text-foreground-muted">Geçerlilik</dt><dd className="mt-0.5 text-foreground-secondary tabular-nums">{formatDate(quote.validUntil)}</dd></div>
                  <div><dt className="text-xs text-foreground-muted">Durum</dt><dd className="mt-1"><StatusBadge status={quote.statusLabel} /></dd></div>
                  <div><dt className="text-xs text-foreground-muted">Genel toplam</dt><dd className="mt-0.5 font-semibold text-foreground tabular-nums">{formatCurrency(centsToAmount(quote.grandTotalCents))}</dd></div>
                </dl>
              </Link>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[92rem] border-collapse text-left">
              <thead className="border-b border-ui-border bg-surface-muted">
                <tr>
                  <th scope="col" className={TH_CLASS}>Teklif No</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={TH_CLASS}>Tarih</th>
                  <th scope="col" className={TH_CLASS}>Geçerlilik</th>
                  <th scope="col" className={TH_CLASS}>Durum</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Ara toplam</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>İndirim</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>KDV</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Genel toplam</th>
                  <th scope="col" className="w-10"><span className="sr-only">Detay</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-subtle">
                {filtered.map((quote) => (
                  <tr key={quote.id} className={TR_CLASS}>
                    <td className={`${TD_CLASS} font-semibold whitespace-nowrap text-brand-700`}>
                      <Link href={`/teklifler/${quote.id}`} className="rounded-sm hover:text-brand-800">{quote.code}</Link>
                    </td>
                    <td className={TD_CLASS}>
                      <Link href={`/musteriler/${quote.customer.id}`} className="rounded-sm font-medium text-foreground hover:text-brand-700">{quote.customer.name}</Link>
                    </td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(quote.issueDate)}</td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(quote.validUntil)}</td>
                    <td className={TD_CLASS}><StatusBadge status={quote.statusLabel} /></td>
                    <td className={`${TD_CLASS} text-right whitespace-nowrap tabular-nums`}>{formatCurrency(centsToAmount(quote.subtotalCents))}</td>
                    <td className={`${TD_CLASS} text-right whitespace-nowrap tabular-nums`}>{formatCurrency(centsToAmount(quote.discountCents))}</td>
                    <td className={`${TD_CLASS} text-right whitespace-nowrap tabular-nums`}>{formatCurrency(centsToAmount(quote.vatCents))}</td>
                    <td className={`${TD_CLASS} text-right font-semibold whitespace-nowrap text-foreground tabular-nums`}>{formatCurrency(centsToAmount(quote.grandTotalCents))}</td>
                    <td className={`${TD_CLASS} text-right`}>
                      <Link href={`/teklifler/${quote.id}`} aria-label={`${quote.code} teklif detayını aç`} className="inline-flex rounded-sm p-1 text-foreground-faint hover:text-brand-700"><ChevronRightIcon className="h-4 w-4" /></Link>
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
          <span className="tabular-nums">{filtered.length} / {quotes.length} teklif gösteriliyor</span>
          {isFiltered ? <button type="button" onClick={resetFilters} className="rounded-sm font-medium text-brand-700 transition-colors hover:text-brand-800">Filtreleri temizle</button> : null}
        </div>
      ) : null}
    </section>
  );
}
