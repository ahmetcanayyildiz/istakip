"use client";

import Link from "next/link";
import { type FormEvent, useActionState, useState } from "react";

import AuthFormField from "@/components/auth/auth-form-field";
import AuthMessage from "@/components/auth/auth-message";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/auth/action-state";
import { registerAction } from "@/lib/auth/actions";

export default function RegisterForm({ disabled = false }: { disabled?: boolean }) {
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    registerAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  function validatePasswords(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");

    if (password !== confirmation) {
      event.preventDefault();
      setClientError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setClientError(null);
  }

  const message = clientError || state.message;
  const messageTone = clientError || state.status === "error" ? "error" : "success";

  return (
    <form action={formAction} onSubmit={validatePasswords} className="space-y-4">
      <AuthFormField
        id="fullName"
        name="fullName"
        type="text"
        label="Ad Soyad"
        autoComplete="name"
        maxLength={160}
        required
        disabled={disabled || isPending}
      />
      <AuthFormField
        id="email"
        name="email"
        type="email"
        label="E-posta"
        placeholder="ornek@isletme.com"
        autoComplete="email"
        required
        disabled={disabled || isPending}
      />
      <AuthFormField
        id="password"
        name="password"
        type="password"
        label="Şifre"
        hint="En az 8 karakter"
        autoComplete="new-password"
        minLength={8}
        required
        disabled={disabled || isPending}
      />
      <AuthFormField
        id="passwordConfirmation"
        name="passwordConfirmation"
        type="password"
        label="Şifre tekrar"
        autoComplete="new-password"
        minLength={8}
        required
        disabled={disabled || isPending}
      />

      {message ? <AuthMessage tone={messageTone}>{message}</AuthMessage> : null}

      <button
        type="submit"
        disabled={disabled || isPending || state.status === "success"}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-action px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover disabled:cursor-not-allowed disabled:bg-control-disabled"
      >
        {isPending ? "Hesap oluşturuluyor" : "Hesap Oluştur"}
      </button>

      <p className="text-center text-sm text-foreground-muted">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="rounded-sm font-medium text-brand-700 hover:text-brand-800">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
