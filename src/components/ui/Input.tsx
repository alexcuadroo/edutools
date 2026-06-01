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
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}
