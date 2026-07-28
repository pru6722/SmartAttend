import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme"
      className="relative flex items-center w-16 h-9 rounded-full p-1 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner cursor-pointer transition-colors duration-300 focus:outline-none"
    >
      {/* Background Icons */}
      <div className="flex justify-between w-full px-1 text-slate-400 select-none">
        <Sun className={`w-4 h-4 text-amber-500 transition-opacity ${isDark ? 'opacity-40' : 'opacity-100'}`} />
        <Moon className={`w-4 h-4 text-sky-400 transition-opacity ${isDark ? 'opacity-100' : 'opacity-40'}`} />
      </div>

      {/* Sliding Animated Thumb Pill */}
      <div
        className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center transition-transform duration-300 ${
          isDark ? 'transform translate-x-7 bg-slate-900' : 'transform translate-x-0 bg-white'
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-sky-400 fill-sky-400/20" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        )}
      </div>
    </button>
  );
};
