import { useEffect } from "react";

const INDEXABLE_CONTENT = "index, follow, max-image-preview:large";

export function useNoIndexMeta(title: string): void {
  useEffect(() => {
    document.title = `${title} - EduTools`;

    const existing = document.querySelector('meta[name="robots"]');
    if (existing) {
      const prev = existing.getAttribute("content");
      existing.setAttribute("content", "noindex, nofollow");
      return () => {
        existing.setAttribute("content", prev ?? INDEXABLE_CONTENT);
      };
    }

    const created = document.createElement("meta");
    created.setAttribute("name", "robots");
    created.setAttribute("content", "noindex, nofollow");
    document.head.appendChild(created);
    return () => {
      created.remove();
    };
  }, [title]);
}