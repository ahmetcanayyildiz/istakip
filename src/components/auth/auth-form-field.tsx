import type { InputHTMLAttributes } from "react";

type AuthFormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export default function AuthFormField({
  label,
  hint,
  id,
  className = "",
  ...inputProps
}: AuthFormFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground-secondary">
          {label}
        </label>
        {hint ? <span className="text-xs text-foreground-muted">{hint}</span> : null}
      </div>
      <input
        id={id}
        className={`mt-1.5 block min-h-11 w-full rounded-md border border-ui-border-strong bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-foreground-subtle hover:border-ui-border-emphasis disabled:cursor-not-allowed disabled:bg-surface-muted ${className}`}
        {...inputProps}
      />
    </div>
  );
}
