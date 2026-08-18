"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterEmptyState, SearchField, SelectFilter } from "@/components/list-filters";
import {
  EXPENSE_CATEGORY_OPTIONS,
  type ExpenseCategory,
  type ExpenseListItem,
} from "@/lib/expenses/types";
import { formatCurrency, formatDate, normalizeText } from "@/lib/format";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type CategoryFilter = "all" | ExpenseCategory;

export default function ExpenseList({ expenses }: { expenses: ExpenseListItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [jobId, setJobId] = useState("all");

  const jobOptions = useMemo(
    () => Array.from(new Map(expenses.map((expense) => [expense.job.id, expense.job])).values()),
    [expenses],
  );

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return expenses.filter((expense) => {
      if (category !== "all" && expense.category !== category) return false;
      if (jobId !== "all" && expense.job.id !== jobId) return false;
      if (!term) return true;

      return [
        expense.description,
        expense.categoryLabel,
        expense.job.code,
        expense.job.title,
        expense.job.customer.name,
      ].some((value) => normalizeText(value).includes(term));
    });
  }, [category, expenses, jobId, query]);

  const isFiltered = query.trim() !== "" || category !== "all" || jobId !== "all";
  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setJobId("all");
  };

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-ui-border px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <SearchField id="gider-arama" label="Gider ara" placeholder="Açıklama, iş veya müşteri ara" value={query} onChange={setQuery} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectFilter
            id="gider-kategori"
            label="Gider kategorisi"
            value={category}
            options={[
              { value: "all", label: "Tüm kategoriler" },
              ...EXPENSE_CATEGORY_OPTIONS.map((item) => ({ value: item.value, label: item.label })),
            ]}
            onChange={(value) => setCategory(value as CategoryFilter)}
          />
          <SelectFilter
            id="gider-is"
            label="İlgili iş"
            value={jobId}
            options={[
              { value: "all", label: "Tüm işler" },
              ...jobOptions.map((job) => ({ value: job.id, label: `${job.code} · ${job.title}` })),
            ]}
            onChange={setJobId}
          />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{filtered.length} gider listeleniyor.</p>

      {expenses.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <h2 className="text-sm font-semibold text-foreground">Henüz gider kaydı yok</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-foreground-muted">
            İşlere ait malzeme, işçilik ve diğer giderleri ekleyerek finansal takibe başlayın.
          </p>
          <Link href="/giderler/yeni" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-brand-action px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover">
            İlk Gideri Ekle
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <FilterEmptyState title="Gider bulunamadı" description="Arama ve filtrelere uyan gider kaydı yok. Filtreleri temizleyip yeniden deneyin." onReset={resetFilters} />
      ) : (
        <>
          <div className="divide-y divide-ui-border-subtle md:hidden">
            {filtered.map((expense) => (
              <article key={expense.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{expense.description}</h3>
                    <p className="mt-0.5 text-xs text-foreground-muted tabular-nums">{formatDate(expense.date)} · {expense.categoryLabel}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">{formatCurrency(expense.amount)}</span>
                </div>
                <div className="mt-3 flex flex-col gap-1 text-sm">
                  <Link href={`/isler/${expense.job.id}`} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">{expense.job.code} · {expense.job.title}</Link>
                  <Link href={`/musteriler/${expense.job.customer.id}`} className="w-fit rounded-sm text-foreground-muted hover:text-brand-700">{expense.job.customer.name}</Link>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[64rem] border-collapse text-left">
              <thead className="border-b border-ui-border bg-surface-muted">
                <tr>
                  <th scope="col" className={TH_CLASS}>Tarih</th>
                  <th scope="col" className={TH_CLASS}>Açıklama</th>
                  <th scope="col" className={TH_CLASS}>Kategori</th>
                  <th scope="col" className={TH_CLASS}>İlgili İş</th>
                  <th scope="col" className={TH_CLASS}>Müşteri</th>
                  <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-subtle">
                {filtered.map((expense) => (
                  <tr key={expense.id} className={TR_CLASS}>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(expense.date)}</td>
                    <td className={`${TD_CLASS} font-medium text-foreground`}>{expense.description}</td>
                    <td className={TD_CLASS}>{expense.categoryLabel}</td>
                    <td className={TD_CLASS}><Link href={`/isler/${expense.job.id}`} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">{expense.job.code} · {expense.job.title}</Link></td>
                    <td className={TD_CLASS}><Link href={`/musteriler/${expense.job.customer.id}`} className="rounded-sm hover:text-brand-700">{expense.job.customer.name}</Link></td>
                    <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-foreground tabular-nums`}>{formatCurrency(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-ui-border px-4 py-3 text-xs text-foreground-muted sm:px-5">
          <span className="tabular-nums">{filtered.length} / {expenses.length} gider gösteriliyor</span>
          {isFiltered ? <button type="button" onClick={resetFilters} className="rounded-sm font-medium text-brand-700 hover:text-brand-800">Filtreleri temizle</button> : null}
        </div>
      ) : null}
    </section>
  );
}
