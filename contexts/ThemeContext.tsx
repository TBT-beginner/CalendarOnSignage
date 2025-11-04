import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Theme {
  name: string;
  bg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentText: string;
  accentBg: string;
  accentShadow: string;
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
  bannerBg: string;
  bannerText: string;
  border: string;
  cardBorder: string;
  buttonBorder: string;
  paginationShape: string;
  checkboxShape: string;
  fontDisplay: string;
}

const createNeumorphicTheme = (name: string, colors: {
  bg: string; // e.g., 'bg-slate-100'
  primary: string; // e.g., 'stone-800'
  secondary: string; // e.g., 'stone-600'
  accent: string; // e.g., 'orange-500'
  shadowDark: string; // e.g., 'rgba(209, 213, 219, 0.8)'
  shadowLight: string; // e.g., 'rgba(255, 255, 255, 0.8)'
  buttonShadowDark?: string;
  buttonShadowLight?: string;
}): Theme => {
  const buttonShadowDark = colors.buttonShadowDark || colors.shadowDark;
  const buttonShadowLight = colors.buttonShadowLight || colors.shadowLight;
  return {
    name,
    bg: colors.bg,
    cardBg: colors.bg,
    textPrimary: `text-${colors.primary}`,
    textSecondary: `text-${colors.secondary}`,
    textMuted: `text-${colors.secondary}/70`,
    accentText: `text-${colors.accent}`,
    accentBg: `bg-${colors.accent}`,
    accentShadow: `rgba(0,0,0,0.1)`,
    headerText: `text-${colors.primary}`,
    headerSubtext: `text-${colors.secondary}`,
    button: colors.bg,
    buttonText: `text-${colors.accent}`,
    paginationActive: `bg-${colors.accent}`,
    paginationInactive: `${colors.bg} shadow-inner`,
    clayShadow: `10px 10px 20px ${colors.shadowDark}, -10px -10px 20px ${colors.shadowLight}`,
    clayButtonShadow: `5px 5px 10px ${buttonShadowDark}, -5px -5px 10px ${buttonShadowLight}`,
    clayButtonPressedShadow: `inset 5px 5px 10px ${buttonShadowDark}, inset -5px -5px 10px ${buttonShadowLight}`,
    hoverBg: 'opacity-80',
    selectionBg: `bg-${colors.accent}/10`,
    bannerBg: colors.bg,
    bannerText: `text-${colors.accent}`,
    border: `border-${colors.secondary}/10`,
    cardBorder: '',
    buttonBorder: '',
    paginationShape: 'rounded-full',
    checkboxShape: 'rounded-md',
    fontDisplay: 'font-display',
  };
};

const signageTheme: Theme = {
  name: 'Signage',
  bg: 'bg-[#FBF9F1]',
  cardBg: 'bg-[#FEFBF3]',
  textPrimary: 'text-[#403D39]',
  textSecondary: 'text-[#6D6A60]',
  textMuted: 'text-[#A9A499]',
  accentText: 'text-[#D9534F]',
  accentBg: 'bg-[#D9534F]',
  accentShadow: 'none',
  headerText: 'text-[#403D39]',
  headerSubtext: 'text-[#6D6A60]',
  button: 'bg-transparent',
  buttonText: 'text-[#403D39]',
  paginationActive: 'bg-[#403D39]',
  paginationInactive: 'bg-[#EAE7DC]',
  clayShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  clayButtonShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
  clayButtonPressedShadow: 'inset 0 1px 2px 0 rgba(0,0,0,0.05)',
  hoverBg: 'hover:bg-[#F5F2E9]',
  selectionBg: 'bg-[#F5F2E9]',
  bannerBg: 'bg-[#FEFBF3]',
  bannerText: 'text-[#403D39]',
  border: 'border-[#EAE7DC]',
  cardBorder: 'border border-[#EAE7DC]',
  buttonBorder: 'border border-[#EAE7DC]',
  paginationShape: 'rounded-full',
  checkboxShape: 'rounded-md',
  fontDisplay: 'font-display',
};


const defaultTheme = signageTheme;

const markerTheme: Theme = {
  name: 'Marker',
  bg: 'bg-white',
  cardBg: 'bg-white',
  textPrimary: 'text-black',
  textSecondary: 'text-gray-800',
  textMuted: 'text-gray-500',
  accentText: 'text-blue-600',
  accentBg: 'bg-blue-600',
  accentShadow: 'rgba(0,0,0,0.1)',
  headerText: 'text-black',
  headerSubtext: 'text-gray-800',
  button: 'bg-white',
  buttonText: 'text-blue-600',
  paginationActive: 'bg-red-500',
  paginationInactive: 'bg-gray-300',
  clayShadow: '8px 8px 0px #000',
  clayButtonShadow: '4px 4px 0px #000',
  clayButtonPressedShadow: '2px 2px 0px #000',
  hoverBg: 'hover:bg-red-100',
  selectionBg: 'bg-red-200',
  bannerBg: 'bg-blue-500',
  bannerText: 'text-white',
  border: 'border-gray-200',
  cardBorder: '',
  buttonBorder: '',
  paginationShape: 'rounded-full',
  checkboxShape: 'rounded-md',
  fontDisplay: 'font-display',
};

const pixelTheme: Theme = {
  name: 'Pixel Art',
  bg: 'bg-slate-900',
  cardBg: 'bg-slate-800',
  textPrimary: 'text-cyan-300',
  textSecondary: 'text-slate-400',
  textMuted: 'text-slate-500',
  accentText: 'text-fuchsia-400',
  accentBg: 'bg-fuchsia-400',
  accentShadow: 'rgba(245, 83, 241, 0.3)',
  headerText: 'text-cyan-300',
  headerSubtext: 'text-slate-400',
  button: 'bg-slate-800',
  buttonText: 'text-cyan-300',
  paginationActive: 'bg-fuchsia-400',
  paginationInactive: 'bg-slate-700',
  clayShadow: '4px 4px 0px #0f172a',
  clayButtonShadow: '3px 3px 0px #0f172a',
  clayButtonPressedShadow: 'inset 3px 3px 0px #0f172a',
  hoverBg: 'hover:bg-slate-700',
  selectionBg: 'bg-fuchsia-400/10',
  bannerBg: 'bg-slate-800',
  bannerText: 'text-fuchsia-400',
  border: 'border-cyan-300/30',
  cardBorder: 'border-2 border-cyan-300',
  buttonBorder: 'border-2 border-cyan-300',
  paginationShape: 'rounded-none',
  checkboxShape: 'rounded-sm',
  fontDisplay: 'font-mono',
};

const eightiesPrintTheme: Theme = {
  name: '80s Print',
  bg: 'bg-[#FDF6E4]', // Cream
  cardBg: 'bg-[#FDF6E4]',
  textPrimary: 'text-[#2E2E2E]', // Dark Gray
  textSecondary: 'text-[#616161]', // Medium Gray
  textMuted: 'text-[#9E9E9E]', // Light Gray
  accentText: 'text-[#D93025]', // Retro Red
  accentBg: 'bg-[#D93025]',
  accentShadow: 'none',
  headerText: 'text-[#2E2E2E]',
  headerSubtext: 'text-[#616161]',
  button: 'bg-[#FDF6E4]',
  buttonText: 'text-[#2E2E2E]',
  paginationActive: 'bg-[#2E2E2E]',
  paginationInactive: 'bg-[#BDBDBD]',
  clayShadow: '4px 4px 0px #2E2E2E', // Simple block shadow
  clayButtonShadow: '2px 2px 0px #2E2E2E',
  clayButtonPressedShadow: '1px 1px 0px #2E2E2E', // Pressed effect
  hoverBg: 'hover:bg-[#FBC02D]/50', // Retro Yellow hover
  selectionBg: 'bg-[#FBC02D]/50',
  bannerBg: 'bg-[#4285F4]', // Retro Blue
  bannerText: 'text-white',
  border: 'border-[#2E2E2E]/50',
  cardBorder: 'border-2 border-[#2E2E2E]',
  buttonBorder: 'border-2 border-[#2E2E2E]',
  paginationShape: 'rounded-none',
  checkboxShape: 'rounded-none',
  fontDisplay: 'font-display',
};


const springTheme = createNeumorphicTheme('Spring', {
  bg: 'bg-emerald-50',
  primary: 'emerald-900',
  secondary: 'emerald-700',
  accent: 'pink-500',
  shadowDark: '#cde0d7',
  shadowLight: '#ffffff',
});

const summerTheme = createNeumorphicTheme('Summer', {
  bg: 'bg-sky-100',
  primary: 'sky-900',
  secondary: 'sky-700',
  accent: 'yellow-500',
  shadowDark: '#c3d5e0',
  shadowLight: '#ffffff',
});

const autumnTheme = createNeumorphicTheme('Autumn', {
  bg: 'bg-amber-100',
  primary: 'stone-800',
  secondary: 'amber-900',
  accent: 'red-600',
  shadowDark: '#dac7a3',
  shadowLight: '#ffffff',
});

const winterTheme = createNeumorphicTheme('Winter', {
  bg: 'bg-slate-200',
  primary: 'slate-800',
  secondary: 'slate-600',
  accent: 'sky-600',
  shadowDark: '#bec5cf',
  shadowLight: '#ffffff',
});

const matchaTheme = createNeumorphicTheme('Matcha', {
  bg: 'bg-lime-50',
  primary: 'emerald-900',
  secondary: 'lime-800',
  accent: 'amber-700',
  shadowDark: '#dbe0d2',
  shadowLight: '#ffffff',
});

const zenTheme = createNeumorphicTheme('Zen', {
  bg: 'bg-gray-50',
  primary: 'gray-800',
  secondary: 'gray-600',
  accent: 'indigo-600',
  shadowDark: '#d1d1d1',
  shadowLight: '#ffffff',
});


const halloweenTheme = createNeumorphicTheme('Halloween', {
    bg: 'bg-slate-800',
    primary: 'orange-400',
    secondary: 'purple-400',
    accent: 'lime-400',
    shadowDark: '#1f2937',
    shadowLight: '#38465c',
    buttonShadowDark: '#1a232f',
    buttonShadowLight: '#3e4e68',
});
halloweenTheme.bannerBg = 'bg-slate-800';
halloweenTheme.bannerText = 'text-purple-400';
halloweenTheme.selectionBg = 'bg-purple-500/10';
halloweenTheme.textMuted = 'text-gray-400';

const christmasTheme = createNeumorphicTheme('Christmas', {
    bg: 'bg-red-800',
    primary: 'green-50',
    secondary: 'yellow-300',
    accent: 'yellow-300',
    shadowDark: '#6b2121',
    shadowLight: '#c33b3b',
});
christmasTheme.bannerBg = 'bg-green-800';
christmasTheme.bannerText = 'text-yellow-200';
christmasTheme.selectionBg = 'bg-yellow-300/10';
christmasTheme.textMuted = 'text-green-100';


const newYearTheme = createNeumorphicTheme('New Year', {
  bg: 'bg-rose-50',
  primary: 'red-900',
  secondary: 'gray-800',
  accent: 'yellow-500',
  shadowDark: '#e6d3d5',
  shadowLight: '#ffffff',
});
newYearTheme.bannerBg = 'bg-red-700';
newYearTheme.bannerText = 'text-yellow-300';
newYearTheme.selectionBg = 'bg-yellow-500/10';

export const allThemes: Record<string, Theme> = {
  'Signage': signageTheme,
  'Marker': markerTheme,
  'Pixel Art': pixelTheme,
  '80s Print': eightiesPrintTheme,
  'Spring': springTheme,
  'Summer': summerTheme,
  'Autumn': autumnTheme,
  'Winter': winterTheme,
  'Matcha': matchaTheme,
  'Zen': zenTheme,
  'Halloween': halloweenTheme,
  'Christmas': christmasTheme,
  'New Year': newYearTheme,
};

const AUTO_THEME_KEY = 'auto';
export const SURPRISE_ME_KEY = 'surprise_me';

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

// --- Surprise Me! Theme Generation ---
// In a .tsx file, <T> can be ambiguous with a JSX tag. A trailing comma <T,> clarifies it's a generic type parameter.
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const createRandomTheme = (): Theme => {
    const isDark = Math.random() < 0.5;

    // --- Colors ---
    const lightBgs = ['bg-slate-100', 'bg-stone-100', 'bg-amber-50', 'bg-emerald-50', 'bg-sky-100', 'bg-rose-50', 'bg-[#FDF6E4]'];
    const darkBgs = ['bg-slate-900', 'bg-gray-900', 'bg-zinc-800', 'bg-neutral-900'];
    const textForLightBg = ['text-stone-800', 'text-gray-900', 'text-slate-800', 'text-[#2E2E2E]'];
    const textForDarkBg = ['text-stone-100', 'text-gray-100', 'text-cyan-300', 'text-amber-200'];
    const accents = [
        { text: 'text-orange-500', bg: 'bg-orange-500', shadow: 'rgba(249, 115, 22, 0.3)' },
        { text: 'text-sky-600', bg: 'bg-sky-600', shadow: 'rgba(2, 132, 199, 0.3)' },
        { text: 'text-emerald-500', bg: 'bg-emerald-500', shadow: 'rgba(16, 185, 129, 0.3)' },
        { text: 'text-red-600', bg: 'bg-red-600', shadow: 'rgba(220, 38, 38, 0.3)' },
        { text: 'text-fuchsia-400', bg: 'bg-fuchsia-400', shadow: 'rgba(245, 83, 241, 0.3)' },
    ];
    
    const bg = isDark ? getRandomElement(darkBgs) : getRandomElement(lightBgs);
    const textPrimary = isDark ? getRandomElement(textForDarkBg) : getRandomElement(textForLightBg);
    const accent = getRandomElement(accents);
    const textSecondary = textPrimary.replace('800', '600').replace('900', '700').replace('100', '300').replace('200', '400');
    const textMuted = textSecondary + '/70';

    // --- Shadows ---
    const shadowStyles = [
        { name: 'blocky', val: { clayShadow: '6px 6px 0px rgba(0,0,0,0.8)', clayButtonShadow: '3px 3px 0px rgba(0,0,0,0.8)', clayButtonPressedShadow: '1px 1px 0px rgba(0,0,0,0.8)' } },
        { name: 'neumorphic', val: isDark 
            ? { clayShadow: '10px 10px 20px rgba(0,0,0,0.4)', clayButtonShadow: '5px 5px 10px rgba(0,0,0,0.4)', clayButtonPressedShadow: 'inset 5px 5px 10px rgba(0,0,0,0.4)' }
            : { clayShadow: '10px 10px 20px rgba(0,0,0,0.08)', clayButtonShadow: '5px 5px 10px rgba(0,0,0,0.08)', clayButtonPressedShadow: 'inset 5px 5px 10px rgba(0,0,0,0.08)' } },
        { name: 'flat', val: { clayShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', clayButtonShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', clayButtonPressedShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' } },
        { name: 'none', val: { clayShadow: 'none', clayButtonShadow: 'none', clayButtonPressedShadow: 'none' } }
    ];
    const shadows = getRandomElement(shadowStyles).val;

    // --- Borders ---
    const borderStyles = [
        { card: `border-2 ${accent.bg.replace('bg-', 'border-')}/50`, button: `border-2 ${accent.bg.replace('bg-', 'border-')}/50` },
        { card: 'border-2 border-current/20', button: 'border-2 border-current/20' },
        { card: '', button: '' }
    ];
    const borders = getRandomElement(borderStyles);

    // --- Shapes & Fonts ---
    const shapes = ['rounded-full', 'rounded-2xl', 'rounded-lg', 'rounded-sm', 'rounded-none'];
    const fonts = ['font-display', 'font-mono', 'font-sans'];
    const shape = getRandomElement(shapes);
    const font = getRandomElement(fonts);

    return {
        name: 'Surprise Me!',
        bg, cardBg: bg, textPrimary, textSecondary, textMuted,
        accentText: accent.text, accentBg: accent.bg, accentShadow: accent.shadow,
        headerText: textPrimary, headerSubtext: textSecondary,
        button: bg, buttonText: accent.text,
        paginationActive: accent.bg, paginationInactive: isDark ? 'bg-white/10' : 'bg-black/10',
        ...shadows,
        hoverBg: 'opacity-80',
        selectionBg: accent.bg + '/10',
        bannerBg: accent.bg,
        bannerText: isDark ? 'text-black' : 'text-white',
        border: 'border-current/10',
        cardBorder: borders.card, buttonBorder: borders.button,
        paginationShape: shape,
        checkboxShape: shape === 'rounded-full' ? 'rounded-md' : shape,
        fontDisplay: font,
    };
};
// ------------------------------------


interface ThemeContextType {
  theme: Theme;
  changeTheme: (themeName: string) => void;
  currentThemeName: string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    return localStorage.getItem('selectedTheme') || AUTO_THEME_KEY;
  });

  const changeTheme = useCallback((themeName: string) => {
    if (themeName === SURPRISE_ME_KEY) {
      const newTheme = createRandomTheme();
      setTheme(newTheme);
    } else if (themeName === AUTO_THEME_KEY) {
      setTheme(getCurrentTheme());
    } else {
      setTheme(allThemes[themeName] || defaultTheme);
    }
    setCurrentThemeName(themeName);
    localStorage.setItem('selectedTheme', themeName);
  }, []);
  
  useEffect(() => {
    const storedThemeName = localStorage.getItem('selectedTheme') || AUTO_THEME_KEY;
    changeTheme(storedThemeName);
    
    if (storedThemeName === AUTO_THEME_KEY) {
      const intervalId = setInterval(() => {
        setTheme(getCurrentTheme());
      }, 1000 * 60 * 5); // Check every 5 minutes
      return () => clearInterval(intervalId);
    }
  }, [changeTheme]);
  
  useEffect(() => {
    document.body.className = '';
    const themeClassName = `theme-${theme.name.toLowerCase().replace(/ /g, '-').replace(/[!#]/g, '')}`;
    document.body.classList.add(theme.bg, themeClassName);
  }, [theme]);

  const value = { theme, changeTheme, currentThemeName };

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
