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
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      <input
        id={id}
        className={`mt-1.5 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 hover:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
        {...inputProps}
      />
    </div>
  );
}
