"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { createJobFromQuoteAction } from "@/lib/jobs/actions";
import { INITIAL_JOB_ACTION_STATE } from "@/lib/jobs/types";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-action px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "İş oluşturuluyor..." : "İşi Oluştur"}
    </button>
  );
}

export default function ConvertQuoteToJob({ quoteId }: { quoteId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [startDate, setStartDate] = useState("");
  const boundAction = createJobFromQuoteAction.bind(null, quoteId);
  const [state, formAction] = useActionState(boundAction, INITIAL_JOB_ACTION_STATE);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-action px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover"
      >
        İşe Dönüştür
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="job-conversion-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-ui-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-page/75"
      >
        <form action={formAction} className="p-5 sm:p-6">
          <div>
            <h2 id="job-conversion-title" className="text-lg font-semibold tracking-tight text-foreground">
              Teklifi işe dönüştür
            </h2>
            <p className="mt-1 text-sm leading-6 text-foreground-muted">
              İş numarası, müşteri ve sözleşme bedeli onaylı tekliften güvenli şekilde oluşturulur.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-foreground-secondary">
              Başlangıç Tarihi
              <input
                name="startDate"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-1.5 w-full rounded-md border border-ui-border bg-surface px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="block text-sm font-medium text-foreground-secondary">
              Hedef Tarihi
              <input
                name="targetDate"
                type="date"
                required
                min={startDate || undefined}
                className="mt-1.5 w-full rounded-md border border-ui-border bg-surface px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          {state.status === "error" ? (
            <p role="alert" className="mt-4 rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-sm text-danger">
              {state.message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              Vazgeç
            </button>
            <SubmitButton />
          </div>
        </form>
      </dialog>
    </>
  );
}

