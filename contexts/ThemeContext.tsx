import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Theme {
  name: 'Light' | 'Dark';
  bg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentText: string;
  accentBg: string;
  button: string;
  buttonText: string;
  buttonHover: string;
  hoverBg: string;
  selectionBg: string;
  border: string;
  headerBorder: string;
  cardBorder: string;
  buttonBorder: string;
  checkboxShape: string;
  fontDisplay: string;
  // Fix: Add missing theme properties to resolve type errors in multiple components.
  headerText: string;
  headerSubtext: string;
  accentShadow: string;
}

const lightTheme: Theme = {
  name: 'Light',
  bg: 'bg-white',
  cardBg: 'bg-white',
  textPrimary: 'text-black',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-400',
  accentText: 'text-blue-600',
  accentBg: 'bg-blue-600',
  button: 'bg-black',
  buttonText: 'text-white',
  buttonHover: 'hover:bg-gray-800',
  hoverBg: 'hover:bg-gray-100',
  selectionBg: 'bg-blue-100',
  border: 'border-gray-200',
  headerBorder: 'border-b-2 border-black',
  cardBorder: 'border-2 border-black',
  buttonBorder: 'border-2 border-black',
  checkboxShape: 'rounded-sm',
  fontDisplay: 'font-display',
  // Fix: Define values for the new theme properties.
  headerText: 'text-black',
  headerSubtext: 'text-gray-600',
  accentShadow: 'rgba(0, 0, 0, 0.2)',
};

const darkTheme: Theme = {
  name: 'Dark',
  bg: 'bg-black',
  cardBg: 'bg-black',
  textPrimary: 'text-white',
  textSecondary: 'text-gray-400',
  textMuted: 'text-gray-600',
  accentText: 'text-blue-400',
  accentBg: 'bg-blue-400',
  button: 'bg-white',
  buttonText: 'text-black',
  buttonHover: 'hover:bg-gray-200',
  hoverBg: 'hover:bg-gray-900',
  selectionBg: 'bg-blue-500/20',
  border: 'border-gray-800',
  headerBorder: 'border-b-2 border-white',
  cardBorder: 'border-2 border-white',
  buttonBorder: 'border-2 border-white',
  checkboxShape: 'rounded-sm',
  fontDisplay: 'font-display',
  // Fix: Define values for the new theme properties.
  headerText: 'text-white',
  headerSubtext: 'text-gray-400',
  accentShadow: 'rgba(0, 0, 0, 0.3)',
};


interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      return darkTheme;
    }
    if (storedTheme === 'light') {
      return lightTheme;
    }
    // If no theme is stored, use the system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return darkTheme;
    }
    return lightTheme;
  });

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme.name === 'Light' ? darkTheme : lightTheme;
      localStorage.setItem('theme', newTheme.name.toLowerCase());
      return newTheme;
    });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
        // Only change if no theme is explicitly set by the user
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? darkTheme : lightTheme);
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.body.className = '';
    const themeClassName = `theme-${theme.name.toLowerCase()}`;
    document.body.classList.add(theme.bg, themeClassName);
  }, [theme]);

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
