import { useEffect, useState } from "react";
import { applyTheme, readStoredTheme, resolveTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function getSystemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
  const [preference, setPreference] = useState<Theme | null>(() => readStoredTheme(window.localStorage));
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(readStoredTheme(window.localStorage), getSystemDark()));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const syncTheme = () => {
      const storedTheme = readStoredTheme(window.localStorage);
      setPreference(storedTheme);
      setTheme(resolveTheme(storedTheme, getSystemDark()));
    };
    window.addEventListener("storage", syncTheme);
    window.addEventListener("edutools-theme-change", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("edutools-theme-change", syncTheme);
    };
  }, []);

  useEffect(() => {
    if (preference) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setTheme(resolveTheme(null, media.matches));
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [preference]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event("edutools-theme-change"));
    setPreference(nextTheme);
    setTheme(nextTheme);
  };

  return { theme, toggleTheme };
}
