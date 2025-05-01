import React, { createContext, useState, useContext } from "react";

export type Theme = "dark" | "clear" | "sky" | "rose" | "amber";

export const themeColours: Record<Theme, string> = {
  dark: "#0c0e27",   // same as --background in .theme-dark
  clear: "#cfe0f1",  // same as --background in .theme-clear
  sky: "#e0f7fa",
  rose: "#fce4ec",
  amber: "#fff8e1",
};



interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      <div className={`theme-${theme}`}>
        {children}
      </div>
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