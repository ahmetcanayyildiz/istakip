"use client";

import Link from "next/link";
import { useActionState } from "react";

import AuthFormField from "@/components/auth/auth-form-field";
import AuthMessage from "@/components/auth/auth-message";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/auth/action-state";
import { loginAction } from "@/lib/auth/actions";

export default function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-4">
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
        autoComplete="current-password"
        minLength={8}
        required
        disabled={disabled || isPending}
      />

      {state.message ? (
        <AuthMessage tone={state.status === "success" ? "success" : "error"}>
          {state.message}
        </AuthMessage>
      ) : null}

      <button
        type="submit"
        disabled={disabled || isPending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isPending ? "Giriş yapılıyor" : "Giriş Yap"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Hesabın yok mu?{" "}
        <Link href="/register" className="rounded-sm font-medium text-brand-700 hover:text-brand-800">
          Kayıt ol
        </Link>
      </p>
    </form>
  );
}
