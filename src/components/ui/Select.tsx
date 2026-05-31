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
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
