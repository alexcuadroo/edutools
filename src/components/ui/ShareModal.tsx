import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Share2, Hash } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";

interface ShareModalProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export default function ShareModal({ url, title, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copiedCodeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (copiedCodeTimerRef.current) clearTimeout(copiedCodeTimerRef.current);
    };
  }, []);

  const puzzleCode = useMemo(() => {
    const parts = url.split("/");
    return parts[parts.length - 1] || "";
  }, [url]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el link");
    }
  }, [url]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(puzzleCode.toUpperCase());
      setCopiedCode(true);
      toast.success("Código copiado al portapapeles");
      if (copiedCodeTimerRef.current) clearTimeout(copiedCodeTimerRef.current);
      copiedCodeTimerRef.current = setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("No se pudo copiar el código");
    }
  }, [puzzleCode]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement as HTMLElement;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    const firstFocusable = focusable[0] ?? null;
    const lastFocusable = focusable.length > 0 ? focusable[focusable.length - 1] as HTMLElement : null;

    firstFocusable?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      previouslyFocused?.focus();
    };
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartir puzzle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-zoom-in animate-duration-200"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 mb-3">
            <Share2 className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Compartir puzzle</h3>
          {title && <p className="text-sm text-gray-500 mt-1">{title}</p>}
        </div>

        <div className="flex justify-center mb-5">
          <div className="bg-white rounded-xl border-2 border-gray-100 w-62.5 h-62.5 flex items-center justify-center overflow-hidden">
            <QRCodeSVG
              id="share-qr-code"
              value={url}
              size={250}
              level="M"
              className="p-2"
            />
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs text-gray-400 text-center mb-2">
              Código del puzzle
            </p>
            <div className="flex items-center gap-2 bg-indigo-50 rounded-xl p-3 border-2 border-indigo-200">
              <Hash className="w-5 h-5 text-indigo-600 shrink-0" />
              <span className="flex-1 font-mono text-lg font-bold text-indigo-700 tracking-wider">
                {puzzleCode.toUpperCase()}
              </span>
              <button
                onClick={handleCopyCode}
                aria-label="Copiar código del puzzle"
                className="shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 text-center mb-2">
              Link completo
            </p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
              <input
                readOnly
                value={url}
                aria-label="Link completo del puzzle"
                className="flex-1 bg-transparent text-xs text-gray-600 outline-none px-2 truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                aria-label="Copiar link"
                className="shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Compartí el código o el link para jugar
        </p>
      </div>
    </div>,
    document.body
  );
}
