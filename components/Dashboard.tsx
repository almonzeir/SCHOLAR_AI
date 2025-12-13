
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
import ProfileView from './dashboard/ProfileView';
import OpportunitiesView from './dashboard/OpportunitiesView';
import ActionPlanView from './dashboard/ActionPlanView';
import ChatCompanion from './dashboard/ChatCompanion';
import { User as UserIcon, Target as TargetIcon, Calendar as CalendarIcon, LogOut, Bell, Flame as FlameIcon, UserPlus as UserPlusIcon } from 'lucide-react';
import { translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { ThemeSwitcher } from './ThemeSwitcher';

const Dashboard: React.FC = () => {
    const { userProfile, initializeDataForProfile, language, profileUpdated, error, clearError } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('opportunities');
    const t = translations[language];

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
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden selection:bg-orange-500 selection:text-white">
            {/* Sidebar for Desktop */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 border-r border-white/10 dark:border-white/5 bg-white/30 dark:bg-black/40 backdrop-blur-2xl z-20"
            >
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <Logo className="w-8 h-8 text-orange-500" />
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Scholar<span className="text-orange-500">AI</span>
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden ${
                                activeTab === tab.id
                                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full"
                                />
                            )}
                            <div className={`p-1 rounded-lg ${activeTab === tab.id ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-transparent'}`}>
                                {tab.icon}
                            </div>
                            {tab.label}
                        </button>
                    ))}

                    {/* Gamification: Invite Friend (Mockup) */}
                    <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                        <div className="p-1 rounded-lg bg-transparent">
                            <UserPlusIcon className="w-5 h-5" />
                        </div>
                        Invite Friends
                        <span className="ml-auto text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">NEW</span>
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                    {/* Gamification: Streak Counter */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                         <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-sm">
                            <FlameIcon className="w-4 h-4 fill-current" />
                            3 Day Streak
                         </div>
                         <div className="text-xs text-orange-500/70">Keep it up!</div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {userProfile?.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userProfile?.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.journey_starts}</p>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4">
                 <div className="flex items-center gap-2">
                    <Logo className="w-8 h-8 text-orange-500" />
                    <span className="text-lg font-bold text-slate-900 dark:text-white">ScholarAI</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                    {userProfile?.name.charAt(0)}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:pl-72 relative min-h-screen pt-20 lg:pt-0">
                 {/* Decorative background blobs */}
                 <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                     <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] animate-blob" />
                     <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                 </div>

                {/* Top Bar (Desktop) */}
                <header className="hidden lg:flex items-center justify-between h-20 px-8 border-b border-white/10 backdrop-blur-md sticky top-0 z-10 bg-white/5">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
                        </button>
                        <ThemeSwitcher isDashboard={true} />
                        <LanguageSwitcher isDashboard={true} />
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 relative z-10 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {profileUpdated && !error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 text-orange-700 dark:text-orange-300 px-6 py-4 rounded-2xl relative mb-8 flex items-center justify-between backdrop-blur-md shadow-lg shadow-orange-500/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-full">
                                        <TargetIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span className="font-semibold">{t.profile_updated}</span>
                                </div>
                                <button onClick={handleRescan} className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20">
                                    {t.rescan_button}
                                </button>
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl relative mb-8 flex items-center justify-between backdrop-blur-md"
                            >
                                <div>
                                    <p className="font-bold">An Error Occurred</p>
                                    <p className="text-sm opacity-80">{error}</p>
                                </div>
                                <button onClick={handleRescan} className="bg-red-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20">
                                    Retry
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 z-30 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                                activeTab === tab.id
                                    ? 'text-orange-500'
                                    : 'text-slate-400 dark:text-slate-500'
                            }`}
                        >
                            {tab.icon}
                            <span className="text-[10px] font-bold">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <ChatCompanion />
        </div>
    );
};

export default Dashboard;
