type ModulePlaceholderProps = {
  title: string;
  description: string;
};

export default function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div
        role="status"
        className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-sm font-medium text-slate-700">Bu modül henüz geliştirilmedi.</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          Geliştirme sırası PROJECT.md dosyasında tanımlıdır.
        </p>
      </div>
    </div>
  );
}
