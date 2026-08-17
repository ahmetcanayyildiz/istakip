"use client";

import { useActionState } from "react";

import AuthFormField from "@/components/auth/auth-form-field";
import AuthMessage from "@/components/auth/auth-message";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/auth/action-state";
import { onboardingAction } from "@/lib/auth/actions";

export default function OnboardingForm({ disabled = false }: { disabled?: boolean }) {
  const [state, formAction, isPending] = useActionState(
    onboardingAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-4">
      <AuthFormField
        id="companyName"
        name="companyName"
        type="text"
        label="İşletme Adı"
        placeholder="Örn. Yıldız Teknik"
        autoComplete="organization"
        maxLength={160}
        required
        disabled={disabled || isPending}
      />
      <AuthFormField
        id="fullName"
        name="fullName"
        type="text"
        label="Ad Soyad"
        hint="İsteğe bağlı"
        autoComplete="name"
        maxLength={160}
        disabled={disabled || isPending}
      />

      {state.message ? <AuthMessage tone="error">{state.message}</AuthMessage> : null}

      <button
        type="submit"
        disabled={disabled || isPending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-action px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover disabled:cursor-not-allowed disabled:bg-control-disabled"
      >
        {isPending ? "İşletme oluşturuluyor" : "Kurulumu Tamamla"}
      </button>
    </form>
  );
}
