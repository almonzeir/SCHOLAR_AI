import React from 'react';
import { useAppContext } from '../contexts/AppContext';

export const LanguageSwitcher = React.memo(({ isDashboard }: { isDashboard: boolean }) => {
    const { language, setLanguage } = useAppContext();

    const commonClasses = "px-3 py-1 text-sm font-semibold rounded-full transition-colors backdrop-blur-sm";
    const buttonClasses = "text-slate-800 bg-slate-200 hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600";
    
    return (
        <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className={`${commonClasses} ${buttonClasses}`}>
            {language === 'ar' ? 'English' : 'العربية'}
        </button>
    );
});