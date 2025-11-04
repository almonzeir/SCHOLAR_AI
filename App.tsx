import React, { useState, useCallback } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';
import { AppProvider } from './contexts/AppContext';

const APP_STORAGE_key = 'scholarai_user_profile';

// Moved AppContent outside of the App component to prevent it from being
// re-created on every render, which ensures a stable component tree and
// prevents unexpected unmounting and state loss issues.
const AppContent = ({ view, userProfile, onOnboardingComplete }: {
  view: 'onboarding' | 'dashboard';
  userProfile: UserProfile | null;
  onOnboardingComplete: (profile: UserProfile) => void;
}) => {
  return (
    <div className="min-h-screen text-slate-900 dark:bg-slate-900">
      {view === 'onboarding' ? (
        <Onboarding onComplete={onOnboardingComplete} />
      ) : userProfile ? (
        <Dashboard initialProfile={userProfile} />
      ) : (
        // This case should ideally not be hit if logic is correct
        <Onboarding onComplete={onOnboardingComplete} />
      )}
    </div>
  );
};

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const savedProfile = localStorage.getItem(APP_STORAGE_key);
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
    localStorage.setItem(APP_STORAGE_key, JSON.stringify(profile));
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

export default App;
