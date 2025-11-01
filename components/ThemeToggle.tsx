import React, { useState, useRef, useEffect } from 'react';
import { useTheme, allThemes } from '../contexts/ThemeContext';
import PaletteIcon from './icons/PaletteIcon';

const AUTO_THEME_KEY = 'auto';

const ThemeToggle: React.FC = () => {
  const { theme, changeTheme, currentThemeName } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (name: string) => {
    changeTheme(name);
    setIsOpen(false);
  };

  const themeListForRender = [
    { name: '季節に合わせる', key: AUTO_THEME_KEY, themeObj: null },
    ...Object.entries(allThemes).map(([key, themeObj]) => ({ name: themeObj.name, key, themeObj }))
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${theme.headerText} p-2 rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current`}
        aria-label="テーマを切り替える"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <PaletteIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg z-10 ${theme.cardBg} ring-1 ring-black ring-opacity-5`}
          style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
        >
          <div className="py-1 custom-scrollbar max-h-72 overflow-y-auto" role="menu" aria-orientation="vertical">
            {themeListForRender.map(({ name, key, themeObj }) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${theme.textPrimary} hover:${theme.accentBg} hover:${theme.buttonText}`}
                role="menuitem"
              >
                <div className="flex items-center">
                  {themeObj && <span className={`w-4 h-4 rounded-full mr-3 inline-block ${themeObj.accentBg}`}></span>}
                  <span>{name}</span>
                </div>

                {currentThemeName === key && (
                  <svg className={`w-5 h-5 ${theme.accentText}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
