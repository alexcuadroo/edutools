import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(
  open: boolean,
  onClose: () => void
) {
  const ref = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return ref;
}
