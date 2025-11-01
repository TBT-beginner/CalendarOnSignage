
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import PaletteIcon from './icons/PaletteIcon';

const ThemeToggle: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label="Toggle theme"
    >
      <PaletteIcon className="w-6 h-6" />
    </button>
  );
};

export default ThemeToggle;
