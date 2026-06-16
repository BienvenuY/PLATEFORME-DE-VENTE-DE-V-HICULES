import { createContext, useContext, useLayoutEffect, useState } from "react";

const ThemeContext = createContext(null);
const KEY = "carsbusiness_theme";

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "dark") return true;
      if (v === "light") return false;
    } catch {
      /* ignore */
    }
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggle, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
