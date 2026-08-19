"use client";

import Link from "next/link";
import { useActionState } from "react";

import AuthMessage from "@/components/auth/auth-message";
import { createCollectionAction } from "@/lib/collections/actions";
import {
  INITIAL_COLLECTION_ACTION_STATE,
  type CollectionJobOption,
} from "@/lib/collections/types";
import { formatCurrency } from "@/lib/format";

const INPUT_CLASS =
  "mt-1.5 block min-h-11 w-full rounded-md border border-ui-border-strong bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-foreground-subtle hover:border-ui-border-emphasis disabled:cursor-not-allowed disabled:bg-surface-muted";

export default function CollectionForm({
  jobs,
  defaultJobId,
  defaultDueDate,
}: {
  jobs: CollectionJobOption[];
  defaultJobId?: string;
  defaultDueDate: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createCollectionAction,
    INITIAL_COLLECTION_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-6">
      <fieldset disabled={isPending} className="space-y-5 disabled:opacity-75">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label htmlFor="collection-job" className="block text-sm font-medium text-foreground-secondary sm:col-span-2">
            İş <span className="ml-1 text-danger" aria-hidden>*</span>
            <select id="collection-job" name="jobId" defaultValue={defaultJobId ?? ""} required className={INPUT_CLASS}>
              <option value="" disabled>İş seçin</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.code} · {job.title} · {job.customer.name} · Kullanılabilir {formatCurrency(job.availableAmount)}
                </option>
              ))}
            </select>
            <span className="mt-1.5 block text-xs text-foreground-muted">Planlanan toplam tahsilat iş bedelini aşamaz; son kontrol veritabanında yapılır.</span>
          </label>

          <label htmlFor="collection-amount" className="block text-sm font-medium text-foreground-secondary">
            Tutar <span className="ml-1 text-danger" aria-hidden>*</span>
            <div className="relative">
              <input id="collection-amount" name="amount" type="text" inputMode="decimal" pattern="[0-9]+([.,][0-9]{1,2})?" maxLength={15} required placeholder="0,00" className={`${INPUT_CLASS} pr-12 tabular-nums`} />
              <span className="pointer-events-none absolute right-3 bottom-2.5 text-sm text-foreground-muted">TL</span>
            </div>
          </label>

          <label htmlFor="collection-due-date" className="block text-sm font-medium text-foreground-secondary">
            Vade Tarihi <span className="ml-1 text-danger" aria-hidden>*</span>
            <input id="collection-due-date" name="dueDate" type="date" defaultValue={defaultDueDate} required className={INPUT_CLASS} />
          </label>
        </div>
      </fieldset>

      {state.message ? <AuthMessage tone="error">{state.message}</AuthMessage> : null}

      <div className="flex flex-col-reverse gap-3 border-t border-ui-border-subtle pt-5 sm:flex-row sm:justify-end">
        <Link href="/tahsilatlar" className="inline-flex min-h-11 items-center justify-center rounded-md border border-ui-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:border-ui-border-strong hover:bg-surface-hover hover:text-foreground">
          Vazgeç
        </Link>
        <button type="submit" disabled={isPending} className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-action px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Tahsilat ekleniyor..." : "Tahsilat Ekle"}
        </button>
      </div>
    </form>
  );
}
