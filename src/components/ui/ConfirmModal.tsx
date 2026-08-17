import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  ariaLabel?: string;
}

export default function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "danger",
  onConfirm,
  loading = false,
  disabled = false,
  children,
  ariaLabel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={ariaLabel ? undefined : titleId}
      aria-label={ariaLabel}
      aria-describedby={description ? descriptionId : undefined}
      closedby="any"
      className="m-auto w-full max-w-md rounded-2xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-slate-950/45"
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
    >
      <div className="relative rounded-2xl bg-white p-6">
        <button type="button" onClick={onClose} aria-label="Cerrar" disabled={loading} className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-5 pr-10">
          <h2 id={titleId} className="text-lg font-semibold text-gray-950">{title}</h2>
          {description && <div id={descriptionId} className="mt-1 text-sm text-gray-600">{description}</div>}
        </div>

        {children && <div className="mb-5">{children}</div>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading || disabled} className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
