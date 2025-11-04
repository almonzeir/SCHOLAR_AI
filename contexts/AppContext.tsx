import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile, Scholarship, ActionItem } from '../types';
import * as geminiService from '../services/geminiService';

type Language = 'ar' | 'en';
type Theme = 'light' | 'dark';

const APP_STORAGE_KEY = 'scholarai_user_profile';
const THEME_STORAGE_KEY = 'scholarai_theme';

interface AppContextType {
  userProfile: UserProfile | null;
  scholarships: Scholarship[];
  loading: boolean;
  error: string | null;
  language: Language;
  profileUpdated: boolean;
  setLanguage: (lang: Language) => void;
  initializeDataForProfile: (profile: UserProfile, isRescan?: boolean) => void;
  getScholarshipById: (id: string) => Scholarship | undefined;
  updateScholarshipFeedback: (scholarshipId: string, feedback: 'good' | 'bad') => void;
  updateUserProfile: (newProfile: UserProfile) => void;
  clearError: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>('ar');
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleTheme = () => {
    setTheme(prev => {
        const newTheme = prev === 'light' ? 'dark' : 'light';
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        return newTheme;
    });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const initializeDataForProfile = useCallback(async (profile: UserProfile, isRescan = false) => {
    setLoading(true);
    setError(null);
    if (!isRescan) {
      setUserProfile(profile);
    }
    
    setProfileUpdated(false);

    try {
      const foundScholarships = await geminiService.findAndRankScholarships(profile, language);
      
      const [summary, feedback] = await Promise.all([
          geminiService.generateProfileSummary(profile, language),
          geminiService.generateProfileFeedback(profile, foundScholarships, language)
      ]);
      
      setUserProfile(prev => prev ? {...prev, summary, profileFeedback: feedback} : {...profile, summary, profileFeedback: feedback});
      setScholarships(foundScholarships);

    } catch (e: any) {
        setError(e.message || "An unexpected error occurred. Please try again.");
        console.error("Failed to initialize data:", e);
    } finally {
        setLoading(false);
    }
  }, [language]);

  const updateScholarshipFeedback = (scholarshipId: string, feedback: 'good' | 'bad') => {
    setScholarships(prev => prev.map(s => s.id === scholarshipId ? { ...s, feedback } : s));
  };

  const updateUserProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setProfileUpdated(true);
  };

  const getScholarshipById = useCallback((id: string) => {
    return scholarships.find(s => s.id === id);
  }, [scholarships]);

  const clearError = () => setError(null);

  return (
    <AppContext.Provider value={{ userProfile, scholarships, loading, error, language, profileUpdated, setLanguage, initializeDataForProfile, getScholarshipById, updateScholarshipFeedback, updateUserProfile, clearError, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};