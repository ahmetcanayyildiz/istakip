"use client";

import { useActionState } from "react";

import AuthMessage from "@/components/auth/auth-message";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/auth/action-state";
import { demoLoginAction } from "@/lib/auth/actions";

export default function DemoLoginButton({ disabled = false }: { disabled?: boolean }) {
  const [state, formAction, isPending] = useActionState(
    demoLoginAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-ui-border" />
        <span className="text-xs font-medium text-foreground-muted">veya</span>
        <span className="h-px flex-1 bg-ui-border" />
      </div>

      <form action={formAction} className="space-y-3">
        <button
          type="submit"
          disabled={disabled || isPending}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-ui-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:bg-control-disabled disabled:text-foreground-faint"
        >
          {isPending ? "Demo açılıyor" : "Demo’yu Gör"}
        </button>
        <p className="text-center text-xs leading-5 text-foreground-muted">
          Örnek verileri salt okunur olarak inceleyin.
        </p>
      </form>

      {state.message ? <AuthMessage tone="error">{state.message}</AuthMessage> : null}
    </div>
  );
}
