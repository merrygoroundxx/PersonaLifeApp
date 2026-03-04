import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { PersonaTheme, THEME_CONFIGS, ThemeConfig } from "../types/theme";

const THEME_STORAGE_KEY = "@persona_current_theme";

interface ThemeContextType {
  currentTheme: PersonaTheme;
  themeConfig: ThemeConfig;
  setTheme: (theme: PersonaTheme) => Promise<void>;
  isDemoMode: boolean;
  toggleDemoMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState<PersonaTheme>("P5");
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (theme && (theme === "P3" || theme === "P4" || theme === "P5")) {
        setCurrentTheme(theme as PersonaTheme);
      }
    } catch (e) {
      console.error("Failed to load theme", e);
    }
  };

  const setTheme = async (theme: PersonaTheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setCurrentTheme(theme);
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  const toggleDemoMode = (value: boolean) => {
    setIsDemoMode(value);
  };

  const themeConfig = THEME_CONFIGS[currentTheme];

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeConfig,
        setTheme,
        isDemoMode,
        toggleDemoMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
