import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { useAppContext } from '../contexts/AppContext';

const LoadingView: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => {
    const { language } = useAppContext();
    const [factIndex, setFactIndex] = useState(0);

    const facts = [
        translations[language].fact_1,
        translations[language].fact_2,
        translations[language].fact_3,
        translations[language].fact_4,
        translations[language].fact_5,
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setFactIndex(prevIndex => (prevIndex + 1) % facts.length);
        }, 5000); // Change fact every 5 seconds

        return () => clearInterval(interval);
    }, [facts.length]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 h-full">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-orange-500 rounded-full opacity-50 animate-ping"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9L12 3z" />
                    </svg>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400 max-w-md mb-8">{subtitle}</p>

            <div className="w-full max-w-lg min-h-[100px] bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <p className="text-orange-400 font-semibold mb-2">{language === 'ar' ? 'حقيقة سريعة!' : 'Quick Fact!'}</p>
                <p className="text-slate-300 transition-opacity duration-500 ease-in-out">{facts[factIndex]}</p>
            </div>
        </div>
    );
};

export default LoadingView;
