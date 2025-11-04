import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import ProfileView from './dashboard/ProfileView';
import OpportunitiesView from './dashboard/OpportunitiesView';
import ActionPlanView from './dashboard/ActionPlanView';
import ChatCompanion from './dashboard/ChatCompanion';
import { UserIcon, TargetIcon, CalendarIcon } from './icons';
import { translations } from '../translations';
import { UserProfile } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { ThemeSwitcher } from './ThemeSwitcher';


const Dashboard: React.FC<{initialProfile: UserProfile}> = ({ initialProfile }) => {
    const { userProfile, initializeDataForProfile, language, profileUpdated, error, clearError } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('opportunities');
    const t = translations[language];

    useEffect(() => {
        if(initialProfile){
            initializeDataForProfile(initialProfile);
        }
    }, [initialProfile]);

    const handleRescan = () => {
        if(userProfile){
            clearError();
            initializeDataForProfile(userProfile, true);
        }
    };

    type Tab = 'profile' | 'opportunities' | 'actionPlan';

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'opportunities', label: t.tab_opportunities, icon: <TargetIcon className="w-5 h-5" /> },
        { id: 'actionPlan', label: t.tab_action_plan, icon: <CalendarIcon className="w-5 h-5" /> },
        { id: 'profile', label: t.tab_profile, icon: <UserIcon className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileView />;
            case 'opportunities':
                return <OpportunitiesView />;
            case 'actionPlan':
                return <ActionPlanView />;
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Logo className="w-12 h-12" />
                            <h1 className="text-2xl font-bold tracking-tight">
                                <span className="text-slate-900 dark:text-white">Scholar</span>
                                <span className="text-orange-500">AI</span>
                            </h1>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className={language === 'ar' ? 'text-left' : 'text-right'}>
                               <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.welcome_user.replace('{name}', userProfile?.name.split(' ')[0] || '')}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">{t.journey_starts}</p>
                            </div>
                            <ThemeSwitcher isDashboard={true} />
                            <LanguageSwitcher isDashboard={true} />
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                 {profileUpdated && !error && (
                    <div className="bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500 text-orange-700 dark:text-orange-300 px-4 py-3 rounded-lg relative mb-6 flex items-center justify-between">
                        <span className="font-semibold">{t.profile_updated}</span>
                        <button onClick={handleRescan} className="bg-orange-500 text-white px-4 py-1 rounded-md text-sm font-bold hover:bg-orange-600">
                            {t.rescan_button}
                        </button>
                    </div>
                )}
                {error && (
                     <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-center justify-between">
                        <div>
                            <p className="font-bold">An Error Occurred</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <button onClick={handleRescan} className="bg-red-500 text-white px-4 py-1 rounded-md text-sm font-bold hover:bg-red-600">
                            Retry
                        </button>
                    </div>
                )}
                <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                    <nav className={`-mb-px flex ${language === 'ar' ? 'space-x-reverse space-x-6' : 'space-x-6'}`} aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-orange-500 text-orange-500'
                                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
                                } flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div>
                    {renderContent()}
                </div>
            </main>
            <ChatCompanion />
        </div>
    );
};

export default Dashboard;