export default function CustomersLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Müşteri bilgileri yükleniyor">
      <div className="space-y-2">
        <div className="h-6 w-36 rounded bg-surface-strong" />
        <div className="h-4 w-64 max-w-full rounded bg-surface-strong" />
      </div>
      <div className="overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
        <div className="flex flex-col gap-3 border-b border-ui-border p-5 sm:flex-row sm:justify-between">
          <div className="h-10 w-full rounded bg-surface-strong sm:max-w-sm" />
          <div className="h-10 w-56 max-w-full rounded bg-surface-strong" />
        </div>
        <div className="space-y-px bg-ui-border-subtle">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="grid grid-cols-1 gap-3 bg-surface px-5 py-4 sm:grid-cols-3">
              <div className="h-4 w-40 max-w-full rounded bg-surface-strong" />
              <div className="h-4 w-32 max-w-full rounded bg-surface-strong" />
              <div className="h-4 w-24 max-w-full rounded bg-surface-strong" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
