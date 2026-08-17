import Link from "next/link";

import { ArrowLeftIcon, UsersIcon } from "@/components/icons";

export default function CustomerNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center rounded-lg border border-ui-border bg-surface px-6 py-16 text-center shadow-xs">
      <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-strong text-foreground-subtle">
        <UsersIcon className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-lg font-semibold tracking-tight text-foreground">Müşteri bulunamadı</h1>
      <p className="mt-1 max-w-md text-sm leading-6 text-foreground-muted">
        Bu müşteri kaydı mevcut değil veya işletmeniz tarafından görüntülenemiyor.
      </p>
      <Link href="/musteriler" className="mt-5 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-brand-action px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover">
        <ArrowLeftIcon className="h-4 w-4" />
        Müşterilere Dön
      </Link>
    </div>
  );
}
