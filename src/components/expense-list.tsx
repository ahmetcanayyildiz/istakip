"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterEmptyState, SearchField, SelectFilter } from "@/components/list-filters";
import { formatCurrency, formatDate, normalizeText } from "@/lib/format";
import type { Expense, ExpenseCategory } from "@/lib/mock-expenses";
import { EXPENSE_CATEGORIES } from "@/lib/mock-expenses";
import type { Job } from "@/lib/mock-jobs";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type CategoryFilter = "Tümü" | ExpenseCategory;

export default function ExpenseList({ expenses, jobs }: { expenses: Expense[]; jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Tümü");
  const [jobId, setJobId] = useState("Tümü");

  const jobMap = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const expenseJobIds = useMemo(() => new Set(expenses.map((expense) => expense.jobId)), [expenses]);
  const jobOptions = useMemo(
    () => jobs.filter((job) => expenseJobIds.has(job.id)),
    [expenseJobIds, jobs],
  );

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return expenses.filter((expense) => {
      const job = jobMap.get(expense.jobId);

      if (category !== "Tümü" && expense.category !== category) return false;
      if (jobId !== "Tümü" && expense.jobId !== jobId) return false;
      if (!term) return true;

      return [expense.description, expense.category, job?.title ?? "", job?.customer.name ?? ""].some(
        (value) => normalizeText(value).includes(term),
      );
    });
  }, [category, expenses, jobId, jobMap, query]);

  const isFiltered = query.trim() !== "" || category !== "Tümü" || jobId !== "Tümü";
  const resetFilters = () => {
    setQuery("");
    setCategory("Tümü");
    setJobId("Tümü");
  };

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <SearchField id="gider-arama" label="Gider ara" placeholder="Açıklama, iş veya müşteri ara" value={query} onChange={setQuery} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectFilter
            id="gider-kategori"
            label="Gider kategorisi"
            value={category}
            options={[{ value: "Tümü", label: "Tüm kategoriler" }, ...EXPENSE_CATEGORIES.map((item) => ({ value: item, label: item }))]}
            onChange={(value) => setCategory(value as CategoryFilter)}
          />
          <SelectFilter
            id="gider-is"
            label="İlgili iş"
            value={jobId}
            options={[{ value: "Tümü", label: "Tüm işler" }, ...jobOptions.map((job) => ({ value: job.id, label: job.code }))]}
            onChange={setJobId}
          />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{filtered.length} gider listeleniyor.</p>

      {filtered.length === 0 ? (
        <FilterEmptyState title="Gider bulunamadı" description="Arama ve filtrelere uyan gider kaydı yok. Filtreleri temizleyip yeniden deneyin." onReset={resetFilters} />
      ) : (
        <>
          <div className="divide-y divide-slate-100 md:hidden">
            {filtered.map((expense) => {
              const job = jobMap.get(expense.jobId);
              if (!job) return null;

              return (
                <article key={expense.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">{expense.description}</h3>
                      <p className="mt-0.5 text-xs text-slate-500 tabular-nums">{formatDate(expense.date)} · {expense.category}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums">{formatCurrency(expense.amount)}</span>
                  </div>
                  <div className="mt-3 flex flex-col gap-1 text-sm">
                    <Link href={`/isler/${job.id}`} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">{job.code} · {job.title}</Link>
                    <Link href={`/musteriler/${job.customer.id}`} className="w-fit rounded-sm text-slate-500 hover:text-brand-700">{job.customer.name}</Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[64rem] border-collapse text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th scope="col" className={TH_CLASS}>Tarih</th>
                  <th scope="col" className={TH_CLASS}>Açıklama</th>
                  <th scope="col" className={TH_CLASS}>Kategori</th>
                  <th scope="col" className={TH_CLASS}>İlgili İş</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((expense) => {
                  const job = jobMap.get(expense.jobId);
                  if (!job) return null;

                  return (
                    <tr key={expense.id} className={TR_CLASS}>
                      <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(expense.date)}</td>
                      <td className={`${TD_CLASS} font-medium text-slate-900`}>{expense.description}</td>
                      <td className={TD_CLASS}>{expense.category}</td>
                      <td className={TD_CLASS}><Link href={`/isler/${job.id}`} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">{job.code} · {job.title}</Link></td>
                      <td className={TD_CLASS}><Link href={`/musteriler/${job.customer.id}`} className="rounded-sm hover:text-brand-700">{job.customer.name}</Link></td>
                      <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-slate-900 tabular-nums`}>{formatCurrency(expense.amount)}</td>
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
          <span className="tabular-nums">{filtered.length} / {expenses.length} gider gösteriliyor</span>
          {isFiltered ? <button type="button" onClick={resetFilters} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">Filtreleri temizle</button> : null}
        </div>
      ) : null}
    </section>
  );
}
