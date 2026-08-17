import { useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export default function Input({ id, label, hint, className = "", ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? (label ? autoId : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-subtle ${className}`}
        {...props}
      />
      {hint && <p className="mt-1.5 text-xs text-muted-subtle">{hint}</p>}
    </div>
  );
}
