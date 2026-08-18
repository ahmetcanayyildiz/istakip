"use client";

import Link from "next/link";
import { useActionState } from "react";

import AuthMessage from "@/components/auth/auth-message";
import {
  EXPENSE_CATEGORY_OPTIONS,
  INITIAL_EXPENSE_ACTION_STATE,
  type ExpenseJob,
} from "@/lib/expenses/types";
import { EXPENSE_DESCRIPTION_MAX_LENGTH } from "@/lib/expenses/validation";

import { createExpenseAction } from "@/lib/expenses/actions";

const INPUT_CLASS =
  "mt-1.5 block min-h-11 w-full rounded-md border border-ui-border-strong bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-foreground-subtle hover:border-ui-border-emphasis disabled:cursor-not-allowed disabled:bg-surface-muted";

export default function ExpenseForm({
  jobs,
  defaultJobId,
  defaultDate,
}: {
  jobs: ExpenseJob[];
  defaultJobId?: string;
  defaultDate: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createExpenseAction,
    INITIAL_EXPENSE_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-6">
      <fieldset disabled={isPending} className="space-y-5 disabled:opacity-75">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label htmlFor="expense-job" className="block text-sm font-medium text-foreground-secondary sm:col-span-2">
            İş <span className="ml-1 text-danger" aria-hidden>*</span>
            <select
              id="expense-job"
              name="jobId"
              defaultValue={defaultJobId ?? ""}
              required
              className={INPUT_CLASS}
            >
              <option value="" disabled>İş seçin</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.code} · {job.title} · {job.customer.name}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="expense-date" className="block text-sm font-medium text-foreground-secondary">
            Tarih <span className="ml-1 text-danger" aria-hidden>*</span>
            <input
              id="expense-date"
              name="expenseDate"
              type="date"
              defaultValue={defaultDate}
              required
              className={INPUT_CLASS}
            />
          </label>

          <label htmlFor="expense-category" className="block text-sm font-medium text-foreground-secondary">
            Kategori <span className="ml-1 text-danger" aria-hidden>*</span>
            <select id="expense-category" name="category" defaultValue="" required className={INPUT_CLASS}>
              <option value="" disabled>Kategori seçin</option>
              {EXPENSE_CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </label>

          <label htmlFor="expense-description" className="block text-sm font-medium text-foreground-secondary sm:col-span-2">
            Açıklama <span className="ml-1 text-danger" aria-hidden>*</span>
            <textarea
              id="expense-description"
              name="description"
              rows={4}
              maxLength={EXPENSE_DESCRIPTION_MAX_LENGTH}
              required
              placeholder="Giderin kapsamını kısa ve anlaşılır şekilde yazın"
              className={`${INPUT_CLASS} resize-y`}
            />
            <span className="mt-1.5 block text-xs text-foreground-muted">En fazla 500 karakter</span>
          </label>

          <label htmlFor="expense-amount" className="block text-sm font-medium text-foreground-secondary">
            Tutar <span className="ml-1 text-danger" aria-hidden>*</span>
            <div className="relative">
              <input
                id="expense-amount"
                name="amount"
                type="text"
                inputMode="decimal"
                pattern="[0-9]+([.,][0-9]{1,2})?"
                maxLength={15}
                required
                placeholder="0,00"
                className={`${INPUT_CLASS} pr-12 tabular-nums`}
              />
              <span className="pointer-events-none absolute right-3 bottom-2.5 text-sm text-foreground-muted">TL</span>
            </div>
          </label>
        </div>
      </fieldset>

      {state.message ? <AuthMessage tone="error">{state.message}</AuthMessage> : null}

      <div className="flex flex-col-reverse gap-3 border-t border-ui-border-subtle pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/giderler"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-ui-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:border-ui-border-strong hover:bg-surface-hover hover:text-foreground"
        >
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-action px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Gider ekleniyor..." : "Gider Ekle"}
        </button>
      </div>
    </form>
  );
}
