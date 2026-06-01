import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export default function Textarea({ id, label, hint, className = "", ...props }: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? (label ? autoId : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`input-field w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-y ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}
