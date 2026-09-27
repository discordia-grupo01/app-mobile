import {
  DEFAULT_THEME,
  THEMES,
  themeVars,
  type ThemeColors,
  type ThemeName,
} from "@discordia/client-shared";

import { VariableContextProvider } from "nativewind";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getThemePreference, setThemePreference } from "../lib/storage";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Inyecta las variables CSS del tema activo (`--accent`, `--bg-chat`, ...)
 * para que las clases de NativeWind (`bg-surface`, `text-content`) las
 * resuelvan en runtime. La preferencia se persiste en AsyncStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    let cancelled = false;
    getThemePreference()
      .then((stored) => {
        if (!cancelled) setThemeState(stored);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    setThemePreference(next).catch(() => {});
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  const cssVars = useMemo(
    () => themeVars(theme) as Record<`--${string}`, string>,
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <VariableContextProvider value={cssVars}>
        {children}
      </VariableContextProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return context;
}

/**
 * Colores del tema activo como valores JS, para las props que no aceptan
 * `className`: `<Feather color>`, `<ActivityIndicator color>`, gradientes SVG.
 */
export function useThemeColors(): ThemeColors {
  return THEMES[useTheme().theme];
}

/** Estilo de `<StatusBar>` (expo-status-bar) que contrasta con el fondo del tema activo. */
export function useStatusBarStyle(): "light" | "dark" {
  return useTheme().theme === "light" ? "dark" : "light";
}
