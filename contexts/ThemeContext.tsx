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
  buttonText: string;
  paginationActive: string;
  paginationInactive: string;
  clayShadow: string;
  clayButtonShadow: string;
  clayButtonPressedShadow: string;
  hoverBg: string;
  selectionBg: string;
}

const defaultTheme: Theme = {
  name: 'Default',
  bg: 'bg-orange-200',
  cardBg: 'bg-orange-100',
  cardOpacity: '',
  textPrimary: 'text-stone-800',
  textSecondary: 'text-orange-900',
  textMuted: 'text-stone-500',
  accentText: 'text-orange-600',
  accentBg: 'bg-orange-500',
  headerText: 'text-stone-900',
  headerSubtext: 'text-orange-900',
  button: 'bg-orange-100',
  buttonText: 'text-orange-800',
  paginationActive: 'bg-orange-500',
  paginationInactive: 'bg-orange-300',
  clayShadow: '10px 10px 20px rgba(194, 126, 50, 0.25), inset 4px 4px 8px rgba(0,0,0,0.02), inset -4px -4px 8px rgba(255,255,255,0.8)',
  clayButtonShadow: '5px 5px 10px rgba(194, 126, 50, 0.25)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(194, 126, 50, 0.25)',
  hoverBg: 'hover:bg-black/10',
  selectionBg: 'bg-black/10',
};

const springTheme: Theme = {
  name: 'Spring',
  bg: 'bg-pink-100',
  cardBg: 'bg-pink-50',
  cardOpacity: '',
  textPrimary: 'text-green-800',
  textSecondary: 'text-green-600',
  textMuted: 'text-green-500',
  accentText: 'text-pink-500',
  accentBg: 'bg-pink-400',
  headerText: 'text-green-900',
  headerSubtext: 'text-pink-700',
  button: 'bg-pink-50',
  buttonText: 'text-pink-600',
  paginationActive: 'bg-pink-400',
  paginationInactive: 'bg-green-200',
  clayShadow: '10px 10px 20px rgba(212, 122, 147, 0.25), inset 4px 4px 8px rgba(0,0,0,0.02), inset -4px -4px 8px rgba(255,255,255,0.8)',
  clayButtonShadow: '5px 5px 10px rgba(212, 122, 147, 0.25)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(212, 122, 147, 0.25)',
  hoverBg: 'hover:bg-black/10',
  selectionBg: 'bg-black/10',
};

const summerTheme: Theme = {
  name: 'Summer',
  bg: 'bg-sky-200',
  cardBg: 'bg-sky-100',
  cardOpacity: '',
  textPrimary: 'text-blue-900',
  textSecondary: 'text-blue-700',
  textMuted: 'text-blue-500',
  accentText: 'text-yellow-500',
  accentBg: 'bg-yellow-400',
  headerText: 'text-blue-900',
  headerSubtext: 'text-sky-800',
  button: 'bg-sky-100',
  buttonText: 'text-sky-700',
  paginationActive: 'bg-yellow-400',
  paginationInactive: 'bg-sky-300',
  clayShadow: '10px 10px 20px rgba(50, 138, 194, 0.25), inset 4px 4px 8px rgba(0,0,0,0.02), inset -4px -4px 8px rgba(255,255,255,0.8)',
  clayButtonShadow: '5px 5px 10px rgba(50, 138, 194, 0.25)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(50, 138, 194, 0.25)',
  hoverBg: 'hover:bg-black/10',
  selectionBg: 'bg-black/10',
};

const autumnTheme: Theme = {
  name: 'Autumn',
  bg: 'bg-amber-200',
  cardBg: 'bg-amber-100',
  cardOpacity: '',
  textPrimary: 'text-stone-800',
  textSecondary: 'text-stone-600',
  textMuted: 'text-stone-500',
  accentText: 'text-red-600',
  accentBg: 'bg-red-500',
  headerText: 'text-stone-900',
  headerSubtext: 'text-amber-800',
  button: 'bg-amber-100',
  buttonText: 'text-red-700',
  paginationActive: 'bg-red-500',
  paginationInactive: 'bg-amber-300',
  clayShadow: '10px 10px 20px rgba(194, 142, 50, 0.25), inset 4px 4px 8px rgba(0,0,0,0.02), inset -4px -4px 8px rgba(255,255,255,0.8)',
  clayButtonShadow: '5px 5px 10px rgba(194, 142, 50, 0.25)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(194, 142, 50, 0.25)',
  hoverBg: 'hover:bg-black/10',
  selectionBg: 'bg-black/10',
};

const winterTheme: Theme = {
  name: 'Winter',
  bg: 'bg-slate-200',
  cardBg: 'bg-slate-50',
  cardOpacity: '',
  textPrimary: 'text-slate-800',
  textSecondary: 'text-slate-600',
  textMuted: 'text-slate-500',
  accentText: 'text-sky-600',
  accentBg: 'bg-sky-500',
  headerText: 'text-slate-900',
  headerSubtext: 'text-slate-700',
  button: 'bg-slate-50',
  buttonText: 'text-sky-700',
  paginationActive: 'bg-sky-500',
  paginationInactive: 'bg-slate-400',
  clayShadow: '10px 10px 20px rgba(136, 150, 164, 0.25), inset 4px 4px 8px rgba(0,0,0,0.02), inset -4px -4px 8px rgba(255,255,255,0.8)',
  clayButtonShadow: '5px 5px 10px rgba(136, 150, 164, 0.25)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(136, 150, 164, 0.25)',
  hoverBg: 'hover:bg-black/10',
  selectionBg: 'bg-black/10',
};

const matchaTheme: Theme = {
  name: 'Matcha',
  bg: 'bg-emerald-100',
  cardBg: 'bg-emerald-50',
  cardOpacity: '',
  textPrimary: 'text-emerald-900',
  textSecondary: 'text-amber-800',
  textMuted: 'text-emerald-700',
  accentText: 'text-amber-600',
  accentBg: 'bg-amber-500',
  headerText: 'text-emerald-900',
  headerSubtext: 'text-amber-900',
  button: 'bg-emerald-50',
  buttonText: 'text-emerald-800',
  paginationActive: 'bg-amber-500',
  paginationInactive: 'bg-emerald-300',
  clayShadow: '10px 10px 20px rgba(67, 138, 114, 0.25), inset 4px 4px 8px rgba(0,0,0,0.02), inset -4px -4px 8px rgba(255,255,255,0.8)',
  clayButtonShadow: '5px 5px 10px rgba(67, 138, 114, 0.25)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(67, 138, 114, 0.25)',
  hoverBg: 'hover:bg-black/10',
  selectionBg: 'bg-black/10',
};

const zenTheme: Theme = {
  name: 'Zen',
  bg: 'bg-slate-200',
  cardBg: 'bg-white',
  cardOpacity: '',
  textPrimary: 'text-slate-800',
  textSecondary: 'text-slate-600',
  textMuted: 'text-slate-500',
  accentText: 'text-sky-800',
  accentBg: 'bg-sky-700',
  headerText: 'text-slate-900',
  headerSubtext: 'text-slate-700',
  button: 'bg-white',
  buttonText: 'text-sky-800',
  paginationActive: 'bg-sky-700',
  paginationInactive: 'bg-slate-400',
  clayShadow: '10px 10px 20px rgba(136, 150, 164, 0.25), inset 4px 4px 8px rgba(0,0,0,0.02), inset -4px -4px 8px rgba(255,255,255,0.8)',
  clayButtonShadow: '5px 5px 10px rgba(136, 150, 164, 0.25)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(136, 150, 164, 0.25)',
  hoverBg: 'hover:bg-black/10',
  selectionBg: 'bg-black/10',
};

const halloweenTheme: Theme = {
  name: 'Halloween',
  bg: 'bg-slate-800',
  cardBg: 'bg-slate-700',
  cardOpacity: '',
  textPrimary: 'text-orange-400',
  textSecondary: 'text-purple-400',
  textMuted: 'text-gray-400',
  accentText: 'text-lime-400',
  accentBg: 'bg-purple-600',
  headerText: 'text-orange-500',
  headerSubtext: 'text-purple-300',
  button: 'bg-slate-700',
  buttonText: 'text-orange-400',
  paginationActive: 'bg-orange-500',
  paginationInactive: 'bg-purple-800',
  clayShadow: '10px 10px 20px rgba(25, 33, 46, 0.5), inset 4px 4px 8px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(90, 103, 125, 0.3)',
  clayButtonShadow: '5px 5px 10px rgba(25, 33, 46, 0.5)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(25, 33, 46, 0.5)',
  hoverBg: 'hover:bg-white/10',
  selectionBg: 'bg-white/10',
};


const christmasTheme: Theme = {
  name: 'Christmas',
  bg: 'bg-red-700',
  cardBg: 'bg-red-600',
  cardOpacity: '',
  textPrimary: 'text-green-50',
  textSecondary: 'text-yellow-300',
  textMuted: 'text-green-100',
  accentText: 'text-yellow-300',
  accentBg: 'bg-green-600',
  headerText: 'text-white',
  headerSubtext: 'text-red-200',
  button: 'bg-red-600',
  buttonText: 'text-yellow-300',
  paginationActive: 'bg-yellow-400',
  paginationInactive: 'bg-red-400',
  clayShadow: '10px 10px 20px rgba(142, 36, 36, 0.5), inset 4px 4px 8px rgba(0,0,0,0.2), inset -4px -4px 8px rgba(224, 78, 78, 0.4)',
  clayButtonShadow: '5px 5px 10px rgba(142, 36, 36, 0.5)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(142, 36, 36, 0.5)',
  hoverBg: 'hover:bg-white/10',
  selectionBg: 'bg-white/10',
};


const newYearTheme: Theme = {
  name: 'New Year',
  bg: 'bg-red-100',
  cardBg: 'bg-white',
  cardOpacity: '',
  textPrimary: 'text-black',
  textSecondary: 'text-gray-800',
  textMuted: 'text-gray-600',
  accentText: 'text-yellow-500',
  accentBg: 'bg-yellow-400',
  headerText: 'text-red-700',
  headerSubtext: 'text-red-500',
  button: 'bg-white',
  buttonText: 'text-yellow-600',
  paginationActive: 'bg-yellow-500',
  paginationInactive: 'bg-red-300',
  clayShadow: '10px 10px 20px rgba(204, 151, 151, 0.5), inset 4px 4px 8px rgba(0,0,0,0.02), inset -4px -4px 8px rgba(255,255,255,0.8)',
  clayButtonShadow: '5px 5px 10px rgba(204, 151, 151, 0.5)',
  clayButtonPressedShadow: 'inset 5px 5px 10px rgba(204, 151, 151, 0.5)',
  hoverBg: 'hover:bg-black/10',
  selectionBg: 'bg-black/10',
};

export const allThemes: Record<string, Theme> = {
  'Spring': springTheme,
  'Summer': summerTheme,
  'Autumn': autumnTheme,
  'Winter': winterTheme,
  'Matcha': matchaTheme,
  'Zen': zenTheme,
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