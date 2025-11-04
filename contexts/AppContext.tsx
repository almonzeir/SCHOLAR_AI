import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile, Scholarship, ActionItem } from '../types';
import * as geminiService from '../services/geminiService';

type Language = 'ar' | 'en';
type Theme = 'light' | 'dark';
type View = 'loading' | 'onboarding' | 'dashboard';

const APP_STORAGE_KEY = 'scholarai_user_profile';
const ACTION_PLAN_STORAGE_KEY = 'scholarai_action_plan';
const THEME_STORAGE_KEY = 'scholarai_theme';

interface AppContextType {
  userProfile: UserProfile | null;
  scholarships: Scholarship[];
  actionPlan: ActionItem[];
  loading: boolean;
  error: string | null;
  isPlanLoading: boolean;
  planError: string | null;
  language: Language;
  profileUpdated: boolean;
  view: View;
  setLanguage: (lang: Language) => void;
  initializeDataForProfile: (profile: UserProfile, isRescan?: boolean) => void;
  getScholarshipById: (id: string) => Scholarship | undefined;
  updateScholarshipFeedback: (scholarshipId: string, feedback: 'good' | 'bad') => void;
  updateUserProfile: (newProfile: UserProfile) => void;
  clearError: () => void;
  generateActionPlan: () => void;
  updateActionItemStatus: (itemId: string, completed: boolean) => void;
  onboardingComplete: (profile: UserProfile) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    // All primary state is now managed solely within this provider.
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [view, setView] = useState<View>('loading');
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [actionPlan, setActionPlan] = useState<ActionItem[]>(() => {
        try {
            const savedPlan = localStorage.getItem(ACTION_PLAN_STORAGE_KEY);
            return savedPlan ? JSON.parse(savedPlan) : [];
        } catch (error) {
            return [];
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlanLoading, setIsPlanLoading] = useState(false);
    const [planError, setPlanError] = useState<string | null>(null);
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLang = localStorage.getItem('scholarai_language') as Language;
        return savedLang || 'en';
    });
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
        return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });
    const [profileUpdated, setProfileUpdated] = useState(false);
    
    // This effect runs ONCE on mount to determine the initial application state.
    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem(APP_STORAGE_KEY);
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                setUserProfile(profile);
                // Automatically fetch data if a profile exists.
                initializeDataForProfile(profile);
                setView('dashboard');
            } else {
                setLoading(false);
                setView('onboarding');
            }
        } catch (error) {
            console.error("Failed to load user profile, starting onboarding.", error);
            localStorage.removeItem(APP_STORAGE_KEY);
            setLoading(false);
            setView('onboarding');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('scholarai_language', language);
    }, [language]);
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(ACTION_PLAN_STORAGE_KEY, JSON.stringify(actionPlan));
    }, [actionPlan]);

    const setLanguage = (lang: Language) => setLanguageState(lang);
    const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));

    const initializeDataForProfile = useCallback(async (profile: UserProfile, isRescan = false) => {
        setLoading(true);
        setError(null);
        setProfileUpdated(false);
        try {
            const foundScholarships = await geminiService.findAndRankScholarships(profile, language);
            const summary = await geminiService.generateProfileSummary(profile, language);
            const feedback = await geminiService.generateProfileFeedback(profile, foundScholarships, language);
            
            const profileWithAIInsights: UserProfile = { ...profile, summary, profileFeedback: feedback };

            setUserProfile(profileWithAIInsights);
            setScholarships(foundScholarships);
            
            if (isRescan) {
                setActionPlan([]);
            }

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during initialization.');
        } finally {
            setLoading(false);
        }
    }, [language]);
    
    // This function is now the bridge between Onboarding and the main app state.
    const onboardingComplete = useCallback((profile: UserProfile) => {
        try {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(profile));
            setUserProfile(profile);
            initializeDataForProfile(profile);
            setView('dashboard');
        } catch (err) {
            console.error("Failed to save profile after onboarding", err);
            setError("There was a problem saving your profile. Please try again.");
        }
    }, [initializeDataForProfile]);

    const getScholarshipById = useCallback((id: string) => {
        return scholarships.find(s => s.id === id);
    }, [scholarships]);

    const updateScholarshipFeedback = useCallback((scholarshipId: string, feedback: 'good' | 'bad') => {
        setScholarships(prev =>
            prev.map(s =>
                s.id === scholarshipId ? { ...s, feedback: s.feedback === feedback ? undefined : feedback } : s
            )
        );
    }, []);

    const updateUserProfile = (newProfile: UserProfile) => {
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newProfile));
        setUserProfile(newProfile);
        setProfileUpdated(true);
    };

    const clearError = () => setError(null);
    
    const generateActionPlan = useCallback(async () => {
        setIsPlanLoading(true);
        setPlanError(null);
        try {
            const likedScholarships = scholarships.filter(s => s.feedback !== 'bad');
            if (likedScholarships.length === 0) {
                 setActionPlan([]);
                 return;
            }
            const plan = await geminiService.generateActionPlan(likedScholarships, language);
            setActionPlan(plan);
        } catch (e: any) {
            setPlanError(e.message || 'Failed to generate action plan.');
        } finally {
            setIsPlanLoading(false);
        }
    }, [scholarships, language]);

    const updateActionItemStatus = (itemId: string, completed: boolean) => {
        setActionPlan(prev => prev.map(item => item.id === itemId ? { ...item, completed } : item));
    };

    const value: AppContextType = {
        userProfile,
        scholarships,
        actionPlan,
        loading,
        error,
        isPlanLoading,
        planError,
        language,
        profileUpdated,
        view,
        setLanguage,
        initializeDataForProfile,
        getScholarshipById,
        updateScholarshipFeedback,
        updateUserProfile,
        clearError,
        generateActionPlan,
        updateActionItemStatus,
        onboardingComplete,
        theme,
        toggleTheme,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};