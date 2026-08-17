"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ChevronRightIcon } from "@/components/icons";
import { FilterEmptyState, SearchField, SelectFilter } from "@/components/list-filters";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, formatDate, normalizeText } from "@/lib/format";
import type { JobFinancials } from "@/lib/mock-finance";
import type { Job, JobStatus } from "@/lib/mock-jobs";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

export type JobListItem = Job & JobFinancials;
type StatusFilter = "Tümü" | JobStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "Tümü", label: "Tüm durumlar" },
  { value: "Planlandı", label: "Planlandı" },
  { value: "Devam Ediyor", label: "Devam Ediyor" },
  { value: "Beklemede", label: "Beklemede" },
  { value: "Tamamlandı", label: "Tamamlandı" },
  { value: "İptal Edildi", label: "İptal Edildi" },
];

export default function JobList({ jobs }: { jobs: JobListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Tümü");

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return jobs.filter((job) => {
      if (status !== "Tümü" && job.status !== status) {
        return false;
      }

      return !term || [job.code, job.title, job.customer.name].some((value) =>
        normalizeText(value).includes(term),
      );
    });
  }, [jobs, query, status]);

  const isFiltered = query.trim() !== "" || status !== "Tümü";
  const openJob = (id: string) => router.push(`/isler/${id}`);
  const resetFilters = () => {
    setQuery("");
    setStatus("Tümü");
  };

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-ui-border px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <SearchField
          id="is-arama"
          label="İş ara"
          placeholder="İş no, iş adı veya müşteri ara"
          value={query}
          onChange={setQuery}
        />
        <SelectFilter
          id="is-durum"
          label="İş durumu"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => setStatus(value as StatusFilter)}
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {filtered.length} iş listeleniyor.
      </p>

      {filtered.length === 0 ? (
        <FilterEmptyState
          title="İş bulunamadı"
          description="Arama veya durum filtresine uyan iş yok. Farklı bir arama deneyin ya da filtreleri temizleyin."
          onReset={resetFilters}
        />
      ) : (
        <>
          <div className="divide-y divide-ui-border-subtle lg:hidden">
            {filtered.map((job) => (
              <div
                key={job.id}
                role="link"
                tabIndex={0}
                onClick={() => openJob(job.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openJob(job.id);
                  }
                }}
                className="cursor-pointer px-4 py-4 transition-colors hover:bg-surface-hover focus-visible:bg-brand-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold tracking-wide text-brand-700">{job.code}</span>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">{job.title}</h3>
                    <Link
                      href={`/musteriler/${job.customer.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="mt-0.5 inline-flex rounded-sm text-sm text-foreground-muted hover:text-brand-700"
                    >
                      {job.customer.name}
                    </Link>
                  </div>
                  <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-foreground-faint" />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><dt className="text-xs text-foreground-muted">Durum</dt><dd className="mt-1"><StatusBadge status={job.status} /></dd></div>
                  <div><dt className="text-xs text-foreground-muted">İş Tutarı</dt><dd className="mt-1 font-medium text-foreground tabular-nums">{formatCurrency(job.amount)}</dd></div>
                  <div><dt className="text-xs text-foreground-muted">Başlangıç</dt><dd className="mt-0.5 text-foreground-secondary tabular-nums">{formatDate(job.startDate)}</dd></div>
                  <div><dt className="text-xs text-foreground-muted">Hedef</dt><dd className="mt-0.5 text-foreground-secondary tabular-nums">{formatDate(job.targetDate)}</dd></div>
                  <div><dt className="text-xs text-foreground-muted">Toplam Gider</dt><dd className="mt-0.5 text-foreground-secondary tabular-nums">{formatCurrency(job.totalExpenses)}</dd></div>
                  <div><dt className="text-xs text-foreground-muted">Tahmini Kâr</dt><dd className="mt-0.5 font-medium text-foreground tabular-nums">{formatCurrency(job.estimatedProfit)}</dd></div>
                </dl>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[78rem] border-collapse text-left">
              <thead className="border-b border-ui-border bg-surface-muted">
                <tr>
                  <th scope="col" className={TH_CLASS}>İş No</th>
                  <th scope="col" className={TH_CLASS}>İş Adı</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={TH_CLASS}>Başlangıç</th>
                  <th scope="col" className={TH_CLASS}>Bitiş / Hedef</th>
                  <th scope="col" className={TH_CLASS}>Durum</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>İş Tutarı</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Toplam Gider</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Tahmini Kâr</th>
                  <th scope="col" className="w-10"><span className="sr-only">Detay</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-subtle">
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openJob(job.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openJob(job.id);
                      }
                    }}
                    aria-label={`${job.code} iş detayını aç`}
                    className={`${TR_CLASS} cursor-pointer focus-visible:bg-brand-50`}
                  >
                    <td className={`${TD_CLASS} font-semibold whitespace-nowrap text-brand-700`}>{job.code}</td>
                    <td className={`${TD_CLASS} max-w-64`}><span className="block truncate font-medium text-foreground">{job.title}</span></td>
                    <td className={TD_CLASS}>
                      <Link href={`/musteriler/${job.customer.id}`} onClick={(event) => event.stopPropagation()} className="rounded-sm hover:text-brand-700">{job.customer.name}</Link>
                    </td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(job.startDate)}</td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(job.targetDate)}</td>
                    <td className={TD_CLASS}><StatusBadge status={job.status} /></td>
                    <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-foreground tabular-nums`}>{formatCurrency(job.amount)}</td>
                    <td className={`${TD_CLASS} text-right whitespace-nowrap tabular-nums`}>{formatCurrency(job.totalExpenses)}</td>
                    <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-foreground tabular-nums`}>{formatCurrency(job.estimatedProfit)}</td>
                    <td className={`${TD_CLASS} text-right`}><ChevronRightIcon className="ml-auto h-4 w-4 text-foreground-faint" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-ui-border px-4 py-3 text-xs text-foreground-muted sm:px-5">
          <span className="tabular-nums">{filtered.length} / {jobs.length} iş gösteriliyor</span>
          {isFiltered ? <button type="button" onClick={resetFilters} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">Filtreleri temizle</button> : null}
        </div>
      ) : null}
    </section>
  );
}
