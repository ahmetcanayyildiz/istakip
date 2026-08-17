import { SearchIcon } from "@/components/icons";

type SelectOption = {
  value: string;
  label: string;
};

export function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full lg:max-w-sm">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-ui-border bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-foreground-subtle"
      />
    </div>
  );
}

export function SelectFilter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="min-w-0 sm:min-w-40">
      <span className="sr-only">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="w-full rounded-md border border-ui-border bg-surface px-3 py-2 text-sm font-medium text-foreground-secondary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterEmptyState({
  title,
  description,
  onReset,
}: {
  title: string;
  description: string;
  onReset: () => void;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <span
        aria-hidden
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-strong text-foreground-subtle"
      >
        <SearchIcon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-foreground-muted">{description}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center rounded-md border border-ui-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover"
      >
        Filtreleri temizle
      </button>
    </div>
  );
}
