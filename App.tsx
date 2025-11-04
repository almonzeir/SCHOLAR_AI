import React from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Logo } from './components/Logo';

// This new component is the main router for the app. It consumes the
// centralized state from AppContext to decide what to render.
const AppContent = () => {
  const { view, onboardingComplete, userProfile } = useAppContext();

  // The 'loading' state occurs for a brief moment while the context
  // checks localStorage for an existing profile.
  if (view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Logo className="w-24 h-24 animate-pulse" />
      </div>
    );
  }

  if (view === 'onboarding') {
    return <Onboarding onComplete={onboardingComplete} />;
  }

  // The Dashboard is only rendered when the view is set and a user profile exists.
  if (view === 'dashboard' && userProfile) {
    // The Dashboard no longer needs to be passed an initialProfile prop,
    // as it gets the profile directly from the context.
    return <Dashboard />;
  }

  // Fallback case, which should ideally not be reached.
  return <Onboarding onComplete={onboardingComplete} />;
};


function App() {
  // All state logic (useState, useCallback) has been removed from App.tsx
  // and is now handled exclusively by AppProvider, making this component
  // a clean, stable entry point.
  return (
    <AppProvider>
      <div className="min-h-screen text-slate-900 dark:bg-slate-900">
        <AppContent />
      </div>
    </AppProvider>
  );
}

export default App;
