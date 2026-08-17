"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error("Logout failed.", { code: error.code });
          setErrorMessage("Çıkış yapılamadı. Lütfen tekrar deneyin.");
          return;
        }

        router.replace("/login");
        router.refresh();
      } catch {
        setErrorMessage("Çıkış yapılamadı. Bağlantı ayarlarını kontrol edin.");
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-ui-border bg-surface px-3 text-sm font-medium text-foreground-secondary transition-colors hover:border-ui-border-strong hover:text-foreground disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "Çıkılıyor" : "Çıkış"}
      </button>
      {errorMessage ? (
        <p
          role="alert"
          className="absolute top-11 right-0 z-20 w-60 rounded-md border border-danger-border bg-surface p-2 text-xs text-danger shadow-sm"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
