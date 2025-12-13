
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
import ProfileView from './dashboard/ProfileView';
import OpportunitiesView from './dashboard/OpportunitiesView';
import ActionPlanView from './dashboard/ActionPlanView';
import ChatCompanion from './dashboard/ChatCompanion';
import { User as UserIcon, Target as TargetIcon, Calendar as CalendarIcon, LogOut, Bell, Flame as FlameIcon, UserPlus as UserPlusIcon, Menu, X } from 'lucide-react';
import { translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { ThemeSwitcher } from './ThemeSwitcher';

const Dashboard: React.FC = () => {
    const { userProfile, initializeDataForProfile, language, profileUpdated, error, clearError } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('opportunities');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    // Safety check for userProfile to prevent crashes
    if (!userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-space text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
                    <p className="text-slate-400">Loading Profile...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen bg-deep-space text-white overflow-hidden selection:bg-orange-500 selection:text-white relative">
             {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                 <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] animate-blob" />
                 <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                 <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
             </div>

            {/* Sidebar for Desktop */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 glass-panel border-r-0 z-20 m-4 rounded-3xl"
            >
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            <Logo className="w-6 h-6 text-orange-500" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Scholar<span className="text-orange-500">AI</span>
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                                activeTab === tab.id
                                    ? 'text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <div className={`p-1 rounded-lg ${activeTab === tab.id ? 'bg-white/20' : 'bg-transparent'}`}>
                                {tab.icon}
                            </div>
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}

                    {/* Gamification: Invite Friend */}
                    <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all mt-8 group border border-dashed border-white/10 hover:border-green-500/50">
                        <div className="p-1 rounded-lg bg-transparent group-hover:bg-green-500/20 transition-colors">
                            <UserPlusIcon className="w-5 h-5 group-hover:text-green-400" />
                        </div>
                        <span className="group-hover:text-green-400 transition-colors">Invite Friends</span>
                        <span className="ml-auto text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full shadow-lg shadow-green-500/20 animate-pulse">NEW</span>
                    </button>
                </nav>

                <div className="p-6 mt-auto space-y-4">
                    {/* Gamification: Streak Counter */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                         <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                            <FlameIcon className="w-4 h-4 fill-orange-500 animate-pulse" />
                            3 Day Streak
                         </div>
                         <div className="text-xs text-orange-500/70">Keep it up!</div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/10">
                            {userProfile.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{userProfile.name}</p>
                            <p className="text-xs text-slate-400 truncate">{t.journey_starts}</p>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-b border-white/10 z-30 flex items-center justify-between px-4">
                 <div className="flex items-center gap-2">
                    <Logo className="w-8 h-8 text-orange-500" />
                    <span className="text-lg font-bold text-white">ScholarAI</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-orange-500/20">
                        {userProfile.name.charAt(0)}
                    </div>
                    {/* Mobile Menu Toggle could go here */}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:pl-[22rem] relative min-h-screen pt-20 lg:pt-0 overflow-y-auto custom-scrollbar">
                {/* Top Bar (Desktop) */}
                <header className="hidden lg:flex items-center justify-between h-24 px-8 sticky top-0 z-10">
                    <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white text-glow">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                    </div>

                    <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors relative group">
                            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black shadow-[0_0_10px_red] animate-pulse"></span>
                        </button>
                        <div className="w-px h-6 bg-white/10"></div>
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
                                className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-200 px-6 py-4 rounded-2xl relative mb-8 flex items-center justify-between backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-full animate-pulse">
                                        <TargetIcon className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <span className="font-semibold text-white">{t.profile_updated}</span>
                                </div>
                                <button onClick={handleRescan} className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50">
                                    {t.rescan_button}
                                </button>
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-300 px-6 py-4 rounded-2xl relative mb-8 flex items-center justify-between backdrop-blur-md"
                            >
                                <div>
                                    <p className="font-bold text-white">An Error Occurred</p>
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
            <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 z-30 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
                                activeTab === tab.id
                                    ? 'text-orange-500'
                                    : 'text-slate-500'
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabMobile"
                                    className="absolute -top-1 w-8 h-1 bg-orange-500 rounded-full shadow-[0_0_10px_orange]"
                                />
                            )}
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
