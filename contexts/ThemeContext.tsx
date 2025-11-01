import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface Theme {
  name: string;
  bg: string;
  cardBg: string;
  cardOpacity: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentText: string;
  accentBg: string;
  headerText: string;
  headerSubtext: string;
  button: string;
  buttonHover: string;
  buttonText: string;
  paginationActive: string;
  paginationInactive: string;
}

const defaultTheme: Theme = {
  name: 'Default',
  bg: 'bg-orange-500',
  cardBg: 'bg-white',
  cardOpacity: 'bg-opacity-50',
  textPrimary: 'text-black',
  textSecondary: 'text-gray-700',
  textMuted: 'text-gray-500',
  accentText: 'text-orange-600',
  accentBg: 'bg-orange-500',
  headerText: 'text-black',
  headerSubtext: 'text-orange-900',
  button: 'bg-orange-500',
  buttonHover: 'hover:bg-orange-600',
  buttonText: 'text-white',
  paginationActive: 'bg-orange-500',
  paginationInactive: 'bg-gray-300',
};

const springTheme: Theme = {
  name: 'Spring',
  bg: 'bg-pink-200',
  cardBg: 'bg-white',
  cardOpacity: 'bg-opacity-80',
  textPrimary: 'text-green-800',
  textSecondary: 'text-green-600',
  textMuted: 'text-green-500',
  accentText: 'text-pink-500',
  accentBg: 'bg-pink-500',
  headerText: 'text-green-900',
  headerSubtext: 'text-pink-700',
  button: 'bg-pink-500',
  buttonHover: 'hover:bg-pink-600',
  buttonText: 'text-white',
  paginationActive: 'bg-pink-500',
  paginationInactive: 'bg-green-200',
};

const summerTheme: Theme = {
  name: 'Summer',
  bg: 'bg-sky-400',
  cardBg: 'bg-white',
  cardOpacity: 'bg-opacity-80',
  textPrimary: 'text-blue-900',
  textSecondary: 'text-blue-700',
  textMuted: 'text-blue-500',
  accentText: 'text-yellow-400',
  accentBg: 'bg-yellow-400',
  headerText: 'text-white',
  headerSubtext: 'text-sky-100',
  button: 'bg-yellow-400',
  buttonHover: 'hover:bg-yellow-500',
  buttonText: 'text-blue-900',
  paginationActive: 'bg-yellow-400',
  paginationInactive: 'bg-sky-200',
};

const autumnTheme: Theme = {
  name: 'Autumn',
  bg: 'bg-amber-700',
  cardBg: 'bg-orange-50',
  cardOpacity: 'bg-opacity-90',
  textPrimary: 'text-stone-800',
  textSecondary: 'text-stone-600',
  textMuted: 'text-stone-500',
  accentText: 'text-red-600',
  accentBg: 'bg-red-600',
  headerText: 'text-white',
  headerSubtext: 'text-amber-200',
  button: 'bg-red-600',
  buttonHover: 'hover:bg-red-700',
  buttonText: 'text-white',
  paginationActive: 'bg-red-600',
  paginationInactive: 'bg-amber-300',
};

const winterTheme: Theme = {
  name: 'Winter',
  bg: 'bg-slate-300',
  cardBg: 'bg-white',
  cardOpacity: 'bg-opacity-90',
  textPrimary: 'text-slate-800',
  textSecondary: 'text-slate-600',
  textMuted: 'text-slate-500',
  accentText: 'text-sky-600',
  accentBg: 'bg-sky-600',
  headerText: 'text-slate-900',
  headerSubtext: 'text-slate-700',
  button: 'bg-sky-600',
  buttonHover: 'hover:bg-sky-700',
  buttonText: 'text-white',
  paginationActive: 'bg-sky-600',
  paginationInactive: 'bg-slate-400',
};


const halloweenTheme: Theme = {
  name: 'Halloween',
  bg: 'bg-slate-900',
  cardBg: 'bg-gray-800',
  cardOpacity: 'bg-opacity-90',
  textPrimary: 'text-orange-400',
  textSecondary: 'text-purple-400',
  textMuted: 'text-gray-400',
  accentText: 'text-lime-400',
  accentBg: 'bg-purple-600',
  headerText: 'text-orange-500',
  headerSubtext: 'text-purple-300',
  button: 'bg-orange-600',
  buttonHover: 'hover:bg-orange-700',
  buttonText: 'text-white',
  paginationActive: 'bg-orange-500',
  paginationInactive: 'bg-purple-800',
};


const christmasTheme: Theme = {
  name: 'Christmas',
  bg: 'bg-red-800',
  cardBg: 'bg-green-50',
  cardOpacity: 'bg-opacity-90',
  textPrimary: 'text-green-900',
  textSecondary: 'text-red-900',
  textMuted: 'text-green-700',
  accentText: 'text-yellow-400',
  accentBg: 'bg-green-700',
  headerText: 'text-white',
  headerSubtext: 'text-red-200',
  button: 'bg-green-700',
  buttonHover: 'hover:bg-green-800',
  buttonText: 'text-yellow-300',
  paginationActive: 'bg-yellow-400',
  paginationInactive: 'bg-red-400',
};


const newYearTheme: Theme = {
  name: 'New Year',
  bg: 'bg-red-700',
  cardBg: 'bg-white',
  cardOpacity: '',
  textPrimary: 'text-black',
  textSecondary: 'text-gray-800',
  textMuted: 'text-gray-600',
  accentText: 'text-yellow-500',
  accentBg: 'bg-yellow-500',
  headerText: 'text-white',
  headerSubtext: 'text-red-200',
  button: 'bg-black',
  buttonHover: 'hover:bg-gray-800',
  buttonText: 'text-yellow-400',
  paginationActive: 'bg-yellow-500',
  paginationInactive: 'bg-red-300',
};

export const allThemes: Record<string, Theme> = {
  'Spring': springTheme,
  'Summer': summerTheme,
  'Autumn': autumnTheme,
  'Winter': winterTheme,
  'Halloween': halloweenTheme,
  'Christmas': christmasTheme,
  'New Year': newYearTheme,
  'Default': defaultTheme,
};

const AUTO_THEME_KEY = 'auto';

const getCurrentTheme = (): Theme => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Holidays (priority)
  if (month === 10 && day >= 24) return halloweenTheme;
  if (month === 12 && day >= 18 && day <= 25) return christmasTheme;
  if ((month === 12 && day >= 28) || (month === 1 && day <= 7)) return newYearTheme;

  // Seasons
  if (month >= 3 && month <= 5) return springTheme;
  if (month >= 6 && month <= 8) return summerTheme; // Including rainy season in summer colors
  if (month >= 9 && month <= 11) return autumnTheme;
  if (month === 12 || month <= 2) return winterTheme;

  return defaultTheme;
};

interface ThemeContextType {
  theme: Theme;
  changeTheme: (themeName: string) => void;
  currentThemeName: string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>(() => {
    return localStorage.getItem('selectedTheme') || AUTO_THEME_KEY;
  });

  const changeTheme = (newThemeName: string) => {
    setThemeName(newThemeName);
    localStorage.setItem('selectedTheme', newThemeName);
  };

  const theme: Theme = useMemo(() => {
    if (themeName === AUTO_THEME_KEY) {
      return getCurrentTheme();
    }
    return allThemes[themeName] || getCurrentTheme();
  }, [themeName]);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme.bg);
  }, [theme]);

  const value = { theme, changeTheme, currentThemeName: themeName };

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
