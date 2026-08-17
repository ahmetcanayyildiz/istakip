type ModulePlaceholderProps = {
  title: string;
  description: string;
};

export default function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>

      <div
        role="status"
        className="rounded-lg border border-dashed border-ui-border-strong bg-surface px-6 py-12 text-center"
      >
        <p className="text-sm font-medium text-foreground-secondary">Bu modül henüz geliştirilmedi.</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-foreground-muted">
          Geliştirme sırası PROJECT.md dosyasında tanımlıdır.
        </p>
      </div>
    </div>
  );
}
