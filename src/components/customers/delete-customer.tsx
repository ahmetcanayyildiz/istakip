"use client";

import { useActionState, useState } from "react";

import AuthMessage from "@/components/auth/auth-message";
import { deleteCustomerAction } from "@/lib/customers/actions";
import { INITIAL_CUSTOMER_ACTION_STATE } from "@/lib/customers/types";

export default function DeleteCustomer({ customerId }: { customerId: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const deleteAction = deleteCustomerAction.bind(null, customerId);
  const [state, formAction, isPending] = useActionState(
    deleteAction,
    INITIAL_CUSTOMER_ACTION_STATE,
  );

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-danger-border bg-surface px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
      >
        Müşteriyi Sil
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-danger-border bg-danger-soft p-4">
      <div>
        <p className="text-sm font-semibold text-danger">Müşteri kaydı silinsin mi?</p>
        <p className="mt-1 text-sm leading-6 text-foreground-secondary">
          Bu işlem geri alınamaz. Bağlı teklif veya işler varsa veritabanı kaydın silinmesini
          engeller.
        </p>
      </div>

      {state.message ? <AuthMessage tone="error">{state.message}</AuthMessage> : null}

      <form action={formAction} className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-hover disabled:opacity-60"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-danger-action px-3 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Siliniyor" : "Silmeyi Onayla"}
        </button>
      </form>
    </div>
  );
}
