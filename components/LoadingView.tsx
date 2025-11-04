import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { useAppContext } from '../contexts/AppContext';

const LoadingView: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => {
    const { language } = useAppContext();
    const t = translations[language];

    const [factIndex, setFactIndex] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);
    const [isStatusVisible, setIsStatusVisible] = useState(true);

    const facts = [
        t.fact_1,
        t.fact_2,
        t.fact_3,
        t.fact_4,
        t.fact_5,
    ];

    const statusMessages = [
        t.loading_status_1,
        t.loading_status_2,
        t.loading_status_3,
        t.loading_status_4,
        t.loading_status_5,
    ];

    useEffect(() => {
        const factInterval = setInterval(() => {
            setFactIndex(prevIndex => (prevIndex + 1) % facts.length);
        }, 5000); // Change fact every 5 seconds

        return () => clearInterval(factInterval);
    }, [facts.length]);

    useEffect(() => {
        const statusInterval = setInterval(() => {
            setIsStatusVisible(false); // Fade out
            setTimeout(() => {
                setStatusIndex(prevIndex => (prevIndex + 1) % statusMessages.length);
                setIsStatusVisible(true); // Fade in
            }, 500); // Duration of fade-out transition, must match CSS
        }, 3500); // Change status every 3.5 seconds

        return () => clearInterval(statusInterval);
    }, [statusMessages.length]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 h-full">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-orange-500 rounded-full opacity-50 animate-ping"></div>
                <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <svg className="w-12 h-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9L12 3z" />
                    </svg>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
            
            <div className="h-12 flex items-center justify-center">
                 <p className={`text-slate-600 dark:text-slate-300 max-w-md text-lg font-medium transition-opacity duration-500 ${isStatusVisible ? 'opacity-100' : 'opacity-0'}`}>
                    {statusMessages[statusIndex]}
                </p>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">{subtitle}</p>

            <div className="w-full max-w-lg mb-8 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-orange-600 font-semibold mb-2">{language === 'ar' ? 'حقيقة سريعة!' : 'Quick Fact!'}</p>
                <p className="text-slate-600 dark:text-slate-300 transition-opacity duration-500 ease-in-out" key={factIndex}>{facts[factIndex]}</p>
            </div>

            <div className="w-full max-w-lg bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                 <p className="text-sm text-slate-600 dark:text-slate-300">{t.loading_come_back}</p>
            </div>
        </div>
    );
};

export default LoadingView;