export default function QuoteDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Teklif yükleniyor">
      <div className="h-10 w-32 animate-pulse rounded-md bg-surface-strong" />
      <div className="h-48 animate-pulse rounded-lg border border-ui-border bg-surface" />
      <div className="h-96 animate-pulse rounded-lg border border-ui-border bg-surface" />
    </div>
  );
}
