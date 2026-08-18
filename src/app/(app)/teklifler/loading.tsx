export default function QuotesLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Teklifler yükleniyor">
      <div className="h-14 max-w-md animate-pulse rounded-md bg-surface-strong" />
      <div className="h-96 animate-pulse rounded-lg border border-ui-border bg-surface" />
    </div>
  );
}
