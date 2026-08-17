export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "edutools-theme";

export function resolveTheme(preference: Theme | null, systemDark: boolean): Theme {
  return preference ?? (systemDark ? "dark" : "light");
}

export function readStoredTheme(storage: Pick<Storage, "getItem"> | null): Theme | null {
  const value = storage?.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#111827" : "#4f46e5");
}
