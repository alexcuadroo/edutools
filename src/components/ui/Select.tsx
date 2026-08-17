import { useId } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export default function Select({ id, label, className = "", children, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? (label ? autoId : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`select-field appearance-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
