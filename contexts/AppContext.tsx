import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile, Scholarship, ActionItem } from '../types';
import * as geminiService from '../services/geminiService';

type Language = 'ar' | 'en';

const APP_STORAGE_KEY = 'scholarai_user_profile';

interface AppContextType {
  userProfile: UserProfile | null;
  scholarships: Scholarship[];
  actionPlan: ActionItem[];
  loading: boolean;
  error: string | null;
  language: Language;
  profileUpdated: boolean;
  setLanguage: (lang: Language) => void;
  initializeDataForProfile: (profile: UserProfile, isRescan?: boolean) => void;
  updateActionItem: (id: string, completed: boolean) => void;
  getScholarshipById: (id: string) => Scholarship | undefined;
  updateScholarshipFeedback: (scholarshipId: string, feedback: 'good' | 'bad') => void;
  updateUserProfile: (newProfile: UserProfile) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [actionPlan, setActionPlan] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>('ar');
  const [profileUpdated, setProfileUpdated] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

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
      
      const [summary, generatedPlan] = await Promise.all([
          geminiService.generateProfileSummary(profile, language),
          geminiService.generateSmartActionPlan(foundScholarships, profile, language)
      ]);
      
      setUserProfile(prev => prev ? {...prev, summary} : profile);
      setScholarships(foundScholarships);
      setActionPlan(generatedPlan);
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

  const updateActionItem = (id: string, completed: boolean) => {
    setActionPlan(prev => prev.map(item => item.id === id ? { ...item, completed } : item));
  };

  const getScholarshipById = useCallback((id: string) => {
    return scholarships.find(s => s.id === id);
  }, [scholarships]);

  const clearError = () => setError(null);

  return (
    <AppContext.Provider value={{ userProfile, scholarships, actionPlan, loading, error, language, profileUpdated, setLanguage, initializeDataForProfile, updateActionItem, getScholarshipById, updateScholarshipFeedback, updateUserProfile, clearError }}>
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