import { useState, useRef, useEffect, useCallback } from "react";
import { Download, ChevronDown, FileText, Image } from "lucide-react";
import type { DownloadGroup } from "./DownloadDropdown.types";

interface DownloadDropdownProps {
  groups: DownloadGroup[];
}

const FORMAT_ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  png: Image,
};

export default function DownloadDropdown({ groups }: DownloadDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors border border-indigo-600"
      >
        <Download className="w-4 h-4" />
        Descargar
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-100 z-20 py-1"
        >
          {groups.map((group, gi) => (
            <div key={group.label} role="group" aria-label={group.label}>
              {gi > 0 && <div className="border-t border-gray-100 my-1" />}
              <div className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wide">
                {group.label}
              </div>
              {group.options.map((opt) => {
                const format = opt.label.toLowerCase();
                const Icon =
                  FORMAT_ICONS[format] ?? FileText;
                return (
                  <button
                    key={opt.label}
                    role="menuitem"
                    onClick={() => {
                      opt.onClick();
                      close();
                    }}
                    className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
