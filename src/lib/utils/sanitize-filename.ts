export function sanitizeFilename(title: string, fallback: string): string {
  const cleaned = title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 60);

  return cleaned || fallback;
}
