import React from 'react';
import { useAppContext } from '../contexts/AppContext';

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useAppContext();
    const isDashboard = window.location.pathname.includes('dashboard'); // A simple check

    const commonClasses = "px-3 py-1 text-sm font-semibold rounded-full text-white transition-colors backdrop-blur-sm";
    const dashboardClasses = "bg-gray-700 hover:bg-gray-600";
    const onboardingClasses = "absolute top-6 right-6 bg-gray-700/50 hover:bg-gray-600/50";
    
    return (
        <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className={`${commonClasses} ${isDashboard ? dashboardClasses : onboardingClasses}`}>
            {language === 'ar' ? 'English' : 'العربية'}
        </button>
    );
};
