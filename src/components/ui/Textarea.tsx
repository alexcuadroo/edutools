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
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`input-field w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-subtle ${className}`}
        {...props}
      />
      {hint && <p className="mt-1.5 text-xs text-muted-subtle">{hint}</p>}
    </div>
  );
}
