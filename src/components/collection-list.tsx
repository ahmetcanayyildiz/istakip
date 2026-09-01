"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import MarkCollectionPaid from "@/components/collections/mark-collection-paid";
import { FilterEmptyState, SearchField, SelectFilter } from "@/components/list-filters";
import StatusBadge from "@/components/status-badge";
import {
  PAYMENT_METHOD_OPTIONS,
  type CollectionListItem,
  type PaymentMethod,
} from "@/lib/collections/types";
import type { CollectionDisplayStatus } from "@/lib/finance/calculations";
import { formatCurrency, formatDate, normalizeText } from "@/lib/format";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type StatusFilter = "all" | CollectionDisplayStatus;
type MethodFilter = "all" | "unassigned" | PaymentMethod;

export default function CollectionList({
  collections,
  today,
  isDemo,
}: {
  collections: CollectionListItem[];
  today: string;
  isDemo: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [method, setMethod] = useState<MethodFilter>("all");

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return collections.filter((collection) => {
      if (status !== "all" && collection.displayStatus !== status) return false;
      if (method === "unassigned" && collection.paymentMethod !== null) return false;
      if (method !== "all" && method !== "unassigned" && collection.paymentMethod !== method) return false;
      if (!term) return true;

      return [
        collection.job.customer.name,
        collection.job.title,
        collection.job.code,
        collection.paymentMethodLabel ?? "",
      ].some((value) => normalizeText(value).includes(term));
    });
  }, [collections, method, query, status]);

  const isFiltered = query.trim() !== "" || status !== "all" || method !== "all";
  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setMethod("all");
  };

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-ui-border px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <SearchField id="tahsilat-arama" label="Tahsilat ara" placeholder="Müşteri, iş adı veya iş no ara" value={query} onChange={setQuery} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectFilter
            id="tahsilat-durum"
            label="Tahsilat durumu"
            value={status}
            options={[
              { value: "all", label: "Tüm durumlar" },
              { value: "paid", label: "Tahsil Edildi" },
              { value: "pending", label: "Vadesi Beklenen" },
              { value: "overdue", label: "Gecikmiş" },
            ]}
            onChange={(value) => setStatus(value as StatusFilter)}
          />
          <SelectFilter
            id="tahsilat-yontem"
            label="Ödeme yöntemi"
            value={method}
            options={[
              { value: "all", label: "Tüm yöntemler" },
              ...PAYMENT_METHOD_OPTIONS.map((item) => ({ value: item.value, label: item.label })),
              { value: "unassigned", label: "Belirtilmedi" },
            ]}
            onChange={(value) => setMethod(value as MethodFilter)}
          />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{filtered.length} tahsilat listeleniyor.</p>

      {collections.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <h2 className="text-sm font-semibold text-foreground">Henüz tahsilat kaydı yok</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-foreground-muted">
            İşlere ait ödeme planlarını ekleyerek tahsilat takibine başlayın.
          </p>
          {!isDemo ? (
            <Link href="/tahsilatlar/yeni" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-brand-action px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover">
              İlk Tahsilatı Ekle
            </Link>
          ) : null}
        </div>
      ) : filtered.length === 0 ? (
        <FilterEmptyState title="Tahsilat bulunamadı" description="Arama ve filtrelere uyan tahsilat kaydı yok. Filtreleri temizleyip yeniden deneyin." onReset={resetFilters} />
      ) : (
        <>
          <div className="divide-y divide-ui-border-subtle md:hidden">
            {filtered.map((collection) => (
              <article key={collection.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/musteriler/${collection.job.customer.id}`} className="rounded-sm text-sm font-semibold text-foreground hover:text-brand-700">{collection.job.customer.name}</Link>
                    <p className="mt-0.5 text-xs text-foreground-muted tabular-nums">
                      Vade {formatDate(collection.dueDate)} · {collection.paymentMethodLabel ?? "Yöntem belirtilmedi"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">{formatCurrency(collection.amount)}</span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <Link href={`/isler/${collection.job.id}`} className="min-w-0 rounded-sm text-sm font-medium text-brand-700 hover:text-brand-800">{collection.job.code} · {collection.job.title}</Link>
                  <StatusBadge status={collection.statusLabel} />
                </div>
                {collection.paidDate ? <p className="mt-2 text-xs text-foreground-muted tabular-nums">Ödeme {formatDate(collection.paidDate)}</p> : null}
                {collection.status === "pending" && !isDemo ? (
                  <div className="mt-3"><MarkCollectionPaid collectionId={collection.id} defaultPaidDate={today} /></div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[78rem] border-collapse text-left">
              <thead className="border-b border-ui-border bg-surface-muted">
                <tr>
                  <th scope="col" className={TH_CLASS}>İş</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                  <th scope="col" className={TH_CLASS}>Vade Tarihi</th>
                  <th scope="col" className={TH_CLASS}>Ödeme Tarihi</th>
                  <th scope="col" className={TH_CLASS}>Ödeme Yöntemi</th>
                  <th scope="col" className={TH_CLASS}>Durum</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-subtle">
                {filtered.map((collection) => (
                  <tr key={collection.id} className={TR_CLASS}>
                    <td className={TD_CLASS}><Link href={`/isler/${collection.job.id}`} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">{collection.job.code} · {collection.job.title}</Link></td>
                    <td className={TD_CLASS}><Link href={`/musteriler/${collection.job.customer.id}`} className="rounded-sm font-medium text-foreground hover:text-brand-700">{collection.job.customer.name}</Link></td>
                    <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-foreground tabular-nums`}>{formatCurrency(collection.amount)}</td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(collection.dueDate)}</td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{collection.paidDate ? formatDate(collection.paidDate) : "—"}</td>
                    <td className={TD_CLASS}>{collection.paymentMethodLabel ?? "—"}</td>
                    <td className={TD_CLASS}><StatusBadge status={collection.statusLabel} /></td>
                    <td className={`${TD_CLASS} text-right`}>
                      {collection.status === "pending" && !isDemo ? <MarkCollectionPaid collectionId={collection.id} defaultPaidDate={today} /> : <span className="text-foreground-subtle">—</span>}
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
          <span className="tabular-nums">{filtered.length} / {collections.length} tahsilat gösteriliyor</span>
          {isFiltered ? <button type="button" onClick={resetFilters} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">Filtreleri temizle</button> : null}
        </div>
      ) : null}
    </section>
  );
}
