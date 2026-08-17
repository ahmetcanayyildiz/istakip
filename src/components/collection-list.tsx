"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterEmptyState, SearchField, SelectFilter } from "@/components/list-filters";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, formatDate, normalizeText } from "@/lib/format";
import type { CollectionRecord, CollectionStatus, PaymentMethod } from "@/lib/mock-collections";
import { PAYMENT_METHODS } from "@/lib/mock-collections";
import type { Job } from "@/lib/mock-jobs";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type StatusFilter = "Tümü" | CollectionStatus;
type MethodFilter = "Tümü" | PaymentMethod;

const collectionStatusLabel = (status: CollectionStatus) =>
  status === "Bekliyor" ? "Vadesi Beklenen" : status;

export default function CollectionList({ collections, jobs }: { collections: CollectionRecord[]; jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Tümü");
  const [method, setMethod] = useState<MethodFilter>("Tümü");
  const jobMap = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return collections.filter((collection) => {
      const job = jobMap.get(collection.jobId);

      if (status !== "Tümü" && collection.status !== status) return false;
      if (method !== "Tümü" && collection.method !== method) return false;
      if (!term) return true;

      return [job?.customer.name ?? "", job?.title ?? "", job?.code ?? "", collection.method].some(
        (value) => normalizeText(value).includes(term),
      );
    });
  }, [collections, jobMap, method, query, status]);

  const isFiltered = query.trim() !== "" || status !== "Tümü" || method !== "Tümü";
  const resetFilters = () => {
    setQuery("");
    setStatus("Tümü");
    setMethod("Tümü");
  };

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <SearchField id="tahsilat-arama" label="Tahsilat ara" placeholder="Müşteri, iş adı veya iş no ara" value={query} onChange={setQuery} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectFilter
            id="tahsilat-durum"
            label="Tahsilat durumu"
            value={status}
            options={[
              { value: "Tümü", label: "Tüm durumlar" },
              { value: "Tahsil Edildi", label: "Tahsil Edildi" },
              { value: "Bekliyor", label: "Vadesi Beklenen" },
              { value: "Gecikmiş", label: "Gecikmiş" },
            ]}
            onChange={(value) => setStatus(value as StatusFilter)}
          />
          <SelectFilter
            id="tahsilat-yontem"
            label="Ödeme yöntemi"
            value={method}
            options={[{ value: "Tümü", label: "Tüm yöntemler" }, ...PAYMENT_METHODS.map((item) => ({ value: item, label: item }))]}
            onChange={(value) => setMethod(value as MethodFilter)}
          />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{filtered.length} tahsilat listeleniyor.</p>

      {filtered.length === 0 ? (
        <FilterEmptyState title="Tahsilat bulunamadı" description="Arama ve filtrelere uyan tahsilat kaydı yok. Filtreleri temizleyip yeniden deneyin." onReset={resetFilters} />
      ) : (
        <>
          <div className="divide-y divide-slate-100 md:hidden">
            {filtered.map((collection) => {
              const job = jobMap.get(collection.jobId);
              if (!job) return null;

              return (
                <article key={collection.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/musteriler/${job.customer.id}`} className="rounded-sm text-sm font-semibold text-slate-900 hover:text-brand-700">{job.customer.name}</Link>
                      <p className="mt-0.5 text-xs text-slate-500 tabular-nums">{formatDate(collection.date)} · {collection.method}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums">{formatCurrency(collection.amount)}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <Link href={`/isler/${job.id}`} className="min-w-0 rounded-sm text-sm font-medium text-brand-700 hover:text-brand-800">{job.code} · {job.title}</Link>
                    <StatusBadge status={collectionStatusLabel(collection.status)} />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[66rem] border-collapse text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th scope="col" className={TH_CLASS}>Tarih</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={TH_CLASS}>İlgili İş</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                  <th scope="col" className={TH_CLASS}>Ödeme Yöntemi</th>
                  <th scope="col" className={TH_CLASS}>Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((collection) => {
                  const job = jobMap.get(collection.jobId);
                  if (!job) return null;

                  return (
                    <tr key={collection.id} className={TR_CLASS}>
                      <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(collection.date)}</td>
                      <td className={TD_CLASS}><Link href={`/musteriler/${job.customer.id}`} className="rounded-sm font-medium text-slate-900 hover:text-brand-700">{job.customer.name}</Link></td>
                      <td className={TD_CLASS}><Link href={`/isler/${job.id}`} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">{job.code} · {job.title}</Link></td>
                      <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-slate-900 tabular-nums`}>{formatCurrency(collection.amount)}</td>
                      <td className={TD_CLASS}>{collection.method}</td>
                      <td className={TD_CLASS}><StatusBadge status={collectionStatusLabel(collection.status)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:px-5">
          <span className="tabular-nums">{filtered.length} / {collections.length} tahsilat gösteriliyor</span>
          {isFiltered ? <button type="button" onClick={resetFilters} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">Filtreleri temizle</button> : null}
        </div>
      ) : null}
    </section>
  );
}
