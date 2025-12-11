"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
} //interface for the theme context provider we are making

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider ({ children }: { children: ReactNode }) {

     const [mode, setMode] = useState<ThemeMode>("system");
     const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

     // Resolve theme based on mode
  useEffect(() => {
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");

      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handler); //system theme change hogi to handler function run hoga
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      setResolvedTheme(mode);
    }
  }, [mode]);

    // Load saved preference
  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setThemeMode }}>
      <div className={resolvedTheme}>{children}</div>
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

