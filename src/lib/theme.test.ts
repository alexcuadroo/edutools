import { describe, expect, it } from "vitest";
import { readStoredTheme, resolveTheme, THEME_STORAGE_KEY } from "@/lib/theme";

describe("theme", () => {
  it("uses the system setting when there is no saved preference", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("prioritizes an explicit saved preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("only accepts supported saved values", () => {
    expect(readStoredTheme({ getItem: (key) => key === THEME_STORAGE_KEY ? "dark" : null })).toBe("dark");
    expect(readStoredTheme({ getItem: () => "sepia" })).toBeNull();
  });
});
