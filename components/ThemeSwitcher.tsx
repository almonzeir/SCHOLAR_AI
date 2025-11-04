import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { SunIcon, MoonIcon } from './icons';

export const ThemeSwitcher = React.memo(({ isDashboard }: { isDashboard: boolean }) => {
    const { theme, toggleTheme } = useAppContext();

    const commonClasses = "p-2 rounded-full transition-colors";
    const buttonClasses = "text-slate-800 bg-slate-200 hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600";

    return (
        <button
            onClick={toggleTheme}
            className={`${commonClasses} ${buttonClasses}`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
    );
});