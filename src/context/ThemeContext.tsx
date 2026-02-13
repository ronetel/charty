import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    const newTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('appTheme', newTheme);
    try {
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    } catch (e) {}
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
