import React, { useState, useCallback, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';
import { AppProvider } from './contexts/AppContext';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'onboarding' | 'dashboard'>('onboarding');

  const handleOnboardingComplete = useCallback((profile: UserProfile) => {
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