import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "white" | "grey" | "dark";

const THEME_STORAGE_KEY = "promptwise:theme";
const THEME_ORDER: Theme[] = ["white", "grey", "dark"];

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  setTheme?: (theme: Theme) => void;
  themes: Theme[];
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "white",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "white" || stored === "grey" || stored === "dark") {
        return stored;
      }
      return defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-gray");

    if (theme === "dark") {
      root.classList.add("dark");
    }

    if (theme === "grey") {
      root.classList.add("theme-gray");
    }

    if (switchable) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        setTheme((previousTheme) => {
          const currentIndex = THEME_ORDER.indexOf(previousTheme);
          return THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
        });
      }
    : undefined;

  const selectTheme = switchable
    ? (nextTheme: Theme) => {
        setTheme(nextTheme);
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: selectTheme, themes: THEME_ORDER, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
