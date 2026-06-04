import { useState, useRef, useEffect, useCallback } from "react";
import { X, Copy, Check, Share2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

interface ShareModalProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export default function ShareModal({ url, title, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function generateQr() {
      try {
        const res = await fetch("https://proxy-edutools.edualex.uy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: url, size: 250 }),
        });
        if (!res.ok) throw new Error("QR generation failed");
        const data = await res.json();
        if (data.qrCode) {
          setQrDataUrl(data.qrCode);
        } else {
          setQrError(true);
        }
      } catch {
        setQrError(true);
      }
    }
    generateQr();
  }, [url]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el link");
    }
  }, [url]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
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
          <div className="bg-white rounded-xl border-2 border-gray-100 w-[250px] h-[250px] flex items-center justify-center overflow-hidden">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-full h-full" />
            ) : qrError ? (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <AlertCircle className="w-8 h-8" />
                <span className="text-xs">No se pudo generar el QR</span>
              </div>
            ) : (
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mb-4">
          Escanea el QR o copia el link para jugar
        </p>

        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 mb-4">
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs text-gray-600 outline-none px-2 truncate"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
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
  );
}
