export default function ExpensesLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Giderler yükleniyor">
      <div className="h-14 max-w-md animate-pulse rounded-md bg-surface-strong" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-lg border border-ui-border bg-surface" />
        <div className="h-28 animate-pulse rounded-lg border border-ui-border bg-surface" />
        <div className="h-28 animate-pulse rounded-lg border border-ui-border bg-surface" />
      </div>
      <div className="h-96 animate-pulse rounded-lg border border-ui-border bg-surface" />
    </div>
  );
}
