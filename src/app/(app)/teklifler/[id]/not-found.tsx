import Link from "next/link";

export default function QuoteNotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-ui-border bg-surface px-6 py-14 text-center shadow-xs">
      <h1 className="text-lg font-semibold text-foreground">Teklif bulunamadı</h1>
      <p className="mt-2 text-sm leading-6 text-foreground-muted">
        Bu teklif silinmiş, başka bir işletmeye ait veya bağlantı geçersiz olabilir.
      </p>
      <Link href="/teklifler" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-brand-action px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover">
        Tekliflere Dön
      </Link>
    </div>
  );
}
