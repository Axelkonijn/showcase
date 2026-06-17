"use client";

import { createContext, useContext, useState, useEffect } from "react";


interface ThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage if available, otherwise use defaults
  const [accentColor, setAccentColor] = useState("#2563eb");

  // Load settings on mount
  useEffect(() => {
    const savedColor = localStorage.getItem("accent-color");
    
    if (savedColor) setAccentColor(savedColor);
  }, []);

  useEffect(() => {
  const root = window.document.documentElement;

  root.style.setProperty("--accent", accentColor);
}, [accentColor]);

  // Save and Apply settings
  useEffect(() => {
    const root = window.document.documentElement;

    root.style.setProperty("--accent", accentColor);
    
    // Save to storage
    localStorage.setItem("accent-color", accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor}}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};