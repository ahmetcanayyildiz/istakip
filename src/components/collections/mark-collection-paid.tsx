"use client";

import { useActionState, useState } from "react";

import AuthMessage from "@/components/auth/auth-message";
import { markCollectionPaidAction } from "@/lib/collections/actions";
import {
  INITIAL_COLLECTION_ACTION_STATE,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/collections/types";

const INPUT_CLASS =
  "mt-1.5 block min-h-11 w-full rounded-md border border-ui-border-strong bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors hover:border-ui-border-emphasis disabled:cursor-not-allowed disabled:bg-surface-muted";

export default function MarkCollectionPaid({
  collectionId,
  defaultPaidDate,
}: {
  collectionId: string;
  defaultPaidDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    markCollectionPaidAction,
    INITIAL_COLLECTION_ACTION_STATE,
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-9 items-center justify-center rounded-md border border-ui-border bg-surface px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground">
        Tahsil Edildi Olarak İşaretle
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby={`mark-paid-title-${collectionId}`}>
          <div className="w-full max-w-md rounded-lg border border-ui-border bg-surface p-5 text-left shadow-xl sm:p-6">
            <h2 id={`mark-paid-title-${collectionId}`} className="text-base font-semibold text-foreground">Tahsilatı Onayla</h2>
            <p className="mt-1 text-sm text-foreground-muted">Bu işlem finansal geçmişe işlenir ve geri alınamaz.</p>

            <form action={formAction} className="mt-5 space-y-5">
              <input type="hidden" name="collectionId" value={collectionId} />
              <fieldset disabled={isPending} className="grid grid-cols-1 gap-4 disabled:opacity-75 sm:grid-cols-2">
                <label htmlFor={`paid-date-${collectionId}`} className="block text-sm font-medium text-foreground-secondary">
                  Ödeme Tarihi <span className="ml-1 text-danger" aria-hidden>*</span>
                  <input id={`paid-date-${collectionId}`} name="paidDate" type="date" defaultValue={defaultPaidDate} required className={INPUT_CLASS} />
                </label>
                <label htmlFor={`payment-method-${collectionId}`} className="block text-sm font-medium text-foreground-secondary">
                  Ödeme Yöntemi <span className="ml-1 text-danger" aria-hidden>*</span>
                  <select id={`payment-method-${collectionId}`} name="paymentMethod" defaultValue="" required className={INPUT_CLASS}>
                    <option value="" disabled>Yöntem seçin</option>
                    {PAYMENT_METHOD_OPTIONS.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
                  </select>
                </label>
              </fieldset>

              {state.message ? <AuthMessage tone="error">{state.message}</AuthMessage> : null}

              <div className="flex flex-col-reverse gap-3 border-t border-ui-border-subtle pt-4 sm:flex-row sm:justify-end">
                <button type="button" disabled={isPending} onClick={() => setOpen(false)} className="inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-hover disabled:opacity-60">
                  Vazgeç
                </button>
                <button type="submit" disabled={isPending} className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-action px-4 py-2 text-sm font-semibold text-white hover:bg-brand-action-hover disabled:opacity-60">
                  {isPending ? "Kaydediliyor..." : "Ödemeyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
