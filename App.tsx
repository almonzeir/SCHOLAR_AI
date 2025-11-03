import React, { useState, useCallback, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { UserProfile } from './types';
import { AppProvider } from './contexts/AppContext';

const APP_STORAGE_KEY = 'scholarai_user_profile';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const savedProfile = localStorage.getItem(APP_STORAGE_KEY);
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
      return null;
    }
  });

  const [view, setView] = useState<'onboarding' | 'dashboard'>(
    userProfile ? 'dashboard' : 'onboarding'
  );

  const handleOnboardingComplete = useCallback((profile: UserProfile) => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(profile));
    setUserProfile(profile);
    setView('dashboard');
  }, []);

  return (
    <AppProvider>
        <AppContent 
            view={view} 
            userProfile={userProfile} 
            onOnboardingComplete={handleOnboardingComplete}
        />
    </AppProvider>
  );
}

// Sub-component to access the context
const AppContent = ({ view, userProfile, onOnboardingComplete }: any) => {
    
    return (
        <div className="min-h-screen text-slate-900 dark:text-slate-100">
           <Header />
           {view === 'onboarding' ? (
            <Onboarding onComplete={onOnboardingComplete} />
          ) : userProfile ? (
            <Dashboard initialProfile={userProfile} />
          ) : (
            <div className="flex items-center justify-center h-screen">Loading...</div>
          )}
        </div>
    )
}

export default App;