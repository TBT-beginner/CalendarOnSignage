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
  iconButton: string;
  hoverBg: string;
  selectionBg: string;
  border: string;
  headerBorder: string;
  cardBorder: string;
  buttonBorder: string;
  checkboxShape: string;
  fontDisplay: string;
  headerText: string;
  headerSubtext: string;
  accentShadow: string;
}

// "目に優しい" ライトテーマ
const lightTheme: Theme = {
  name: 'Light',
  bg: 'bg-gray-50', // 白からオフホワイトへ
  cardBg: 'bg-gray-50', // カードも背景と統一
  textPrimary: 'text-gray-800', // 黒からダークグレーへ
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-400',
  accentText: 'text-indigo-600', // 落ち着いたインディゴへ
  accentBg: 'bg-indigo-600',
  button: 'bg-gray-900', // 真っ黒から少し柔らかく
  buttonText: 'text-white',
  buttonHover: 'hover:bg-gray-700',
  iconButton: 'bg-white border-gray-300 border hover:bg-gray-100',
  hoverBg: 'hover:bg-gray-100',
  selectionBg: 'bg-indigo-100',
  border: 'border-gray-300', // ボーダーの色を柔らかく
  headerBorder: 'border-b-2 border-gray-300', // ヘッダーボーダーも同様
  cardBorder: '', // 枠線を削除
  buttonBorder: 'border-2 border-gray-900',
  checkboxShape: 'rounded-sm',
  fontDisplay: 'font-display',
  headerText: 'text-gray-900', // テキストも真っ黒を避ける
  headerSubtext: 'text-gray-600',
  accentShadow: 'rgba(79, 70, 229, 0.2)', // インディゴに合わせた影
};

// "目に優しい" ダークテーマ
const darkTheme: Theme = {
  name: 'Dark',
  bg: 'bg-gray-900', // 黒からダークグレーへ
  cardBg: 'bg-gray-900', // カードも背景と統一
  textPrimary: 'text-gray-100', // 白からオフホワイトへ
  textSecondary: 'text-gray-400',
  textMuted: 'text-gray-500',
  accentText: 'text-indigo-400', // 落ち着いたインディゴへ
  accentBg: 'bg-indigo-500',
  button: 'bg-white',
  buttonText: 'text-black',
  buttonHover: 'hover:bg-gray-200',
  iconButton: 'bg-gray-800 border-gray-700 border hover:bg-gray-700',
  hoverBg: 'hover:bg-gray-800',
  selectionBg: 'bg-indigo-500/20',
  border: 'border-gray-700', // ボーダーの色を柔らかく
  headerBorder: 'border-b-2 border-gray-700',
  cardBorder: '', // 枠線を削除
  buttonBorder: 'border-2 border-white',
  checkboxShape: 'rounded-sm',
  fontDisplay: 'font-display',
  headerText: 'text-white',
  headerSubtext: 'text-gray-400',
  accentShadow: 'rgba(129, 140, 248, 0.2)', // インディゴに合わせた影
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