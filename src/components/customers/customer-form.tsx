"use client";

import Link from "next/link";
import { useActionState } from "react";

import AuthMessage from "@/components/auth/auth-message";
import type {
  CustomerActionState,
  CustomerFormValues,
} from "@/lib/customers/types";
import { INITIAL_CUSTOMER_ACTION_STATE } from "@/lib/customers/types";
import { CUSTOMER_FIELD_LIMITS } from "@/lib/customers/validation";

type CustomerFormAction = (
  state: CustomerActionState,
  formData: FormData,
) => Promise<CustomerActionState>;

type CustomerFormProps = {
  action: CustomerFormAction;
  cancelHref: string;
  initialValues?: CustomerFormValues;
  submitLabel: string;
  pendingLabel: string;
};

const INPUT_CLASS =
  "mt-1.5 block min-h-11 w-full rounded-md border border-ui-border-strong bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-foreground-subtle hover:border-ui-border-emphasis disabled:cursor-not-allowed disabled:bg-surface-muted";

function FormField({
  id,
  name,
  label,
  defaultValue,
  type = "text",
  autoComplete,
  maxLength,
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  maxLength: number;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-foreground-secondary">
      {label}
      {required ? <span className="ml-1 text-danger" aria-hidden>*</span> : null}
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        className={INPUT_CLASS}
      />
    </label>
  );
}

export default function CustomerForm({
  action,
  cancelHref,
  initialValues,
  submitLabel,
  pendingLabel,
}: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_CUSTOMER_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-6">
      <fieldset disabled={isPending} className="space-y-5 disabled:opacity-75">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              id="customer-name"
              name="name"
              label="Müşteri / Firma Adı"
              defaultValue={initialValues?.name}
              autoComplete="organization"
              maxLength={CUSTOMER_FIELD_LIMITS.name}
              required
            />
          </div>
          <FormField
            id="customer-contact-name"
            name="contactName"
            label="Yetkili Kişi"
            defaultValue={initialValues?.contactName}
            autoComplete="name"
            maxLength={CUSTOMER_FIELD_LIMITS.contactName}
          />
          <FormField
            id="customer-phone"
            name="phone"
            label="Telefon"
            defaultValue={initialValues?.phone}
            type="tel"
            autoComplete="tel"
            maxLength={CUSTOMER_FIELD_LIMITS.phone}
          />
          <FormField
            id="customer-email"
            name="email"
            label="E-posta"
            defaultValue={initialValues?.email}
            type="email"
            autoComplete="email"
            maxLength={CUSTOMER_FIELD_LIMITS.email}
          />
          <FormField
            id="customer-city"
            name="city"
            label="Şehir"
            defaultValue={initialValues?.city}
            autoComplete="address-level2"
            maxLength={CUSTOMER_FIELD_LIMITS.city}
          />
          <label
            htmlFor="customer-address"
            className="block text-sm font-medium text-foreground-secondary sm:col-span-2"
          >
            Adres
            <textarea
              id="customer-address"
              name="address"
              defaultValue={initialValues?.address ?? ""}
              autoComplete="street-address"
              maxLength={CUSTOMER_FIELD_LIMITS.address}
              rows={4}
              className={`${INPUT_CLASS} resize-y`}
            />
          </label>
          <label
            htmlFor="customer-status"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Durum
            <select
              id="customer-status"
              name="status"
              defaultValue={initialValues?.isActive === false ? "inactive" : "active"}
              className={INPUT_CLASS}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </label>
        </div>
      </fieldset>

      {state.message ? <AuthMessage tone="error">{state.message}</AuthMessage> : null}

      <div className="flex flex-col-reverse gap-3 border-t border-ui-border-subtle pt-5 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-ui-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:border-ui-border-strong hover:bg-surface-hover hover:text-foreground"
        >
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-action px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover disabled:cursor-wait disabled:bg-control-disabled"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
