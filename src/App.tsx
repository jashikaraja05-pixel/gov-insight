import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { LandingHero } from './components/landing/LandingHero';
import { AuthScreen } from './components/auth/AuthScreen';
import { PeopleDashboard } from './components/people/PeopleDashboard';
import { GovernmentDashboard } from './components/government/GovernmentDashboard';
import { ResponsibleAIModal } from './components/common/ResponsibleAIModal';
import { GovInsightLogo } from './components/common/GovInsightLogo';
import { SUPPORTED_LANGUAGES, COUNTRY_PROFILES, t } from './services/i18n';
import { SupportedLanguage, CountryProfile } from './types';
import { ShieldCheck, Users, Building2, LogOut } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'people' | 'government'>('landing');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]); // English default
  const [currentCountry, setCurrentCountry] = useState<CountryProfile>(COUNTRY_PROFILES[0]); // India default
  const [isResponsibleAiOpen, setIsResponsibleAiOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLoginSuccess = (role: 'people' | 'government', userData?: any) => {
    setCurrentUser(userData || null);
    setIsLoggedIn(true);
    setCurrentView(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const handleNavigate = (view: 'landing' | 'auth' | 'people' | 'government') => {
    if ((view === 'people' || view === 'government') && !isLoggedIn) {
      setCurrentView('auth');
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Universal Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        currentCountry={currentCountry}
        onCountryChange={(country) => setCurrentCountry(country)}
        onOpenResponsibleAi={() => setIsResponsibleAiOpen(true)}
        isLoggedIn={isLoggedIn}
      />

      {/* User Session Bar when logged in */}
      {isLoggedIn && currentUser && (
        <div className="bg-red-950/40 border-b border-red-500/20 px-4 py-2 text-xs text-slate-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-400">Authenticated Session:</span>
              <span className="font-bold text-white">{currentUser.name}</span>
              {currentUser.department && (
                <span className="hidden sm:inline text-red-400 font-mono">({currentUser.department})</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW 1: CLEAN LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingHero
            currentLanguage={currentLanguage}
            onGetStarted={() => setCurrentView('auth')}
          />
        )}

        {/* VIEW 2: LOGIN & REGISTRATION SCREEN */}
        {currentView === 'auth' && (
          <AuthScreen
            currentLanguage={currentLanguage}
            onLoginSuccess={handleLoginSuccess}
            onBackToLanding={() => setCurrentView('landing')}
          />
        )}

        {/* VIEW 3: CITIZEN PEOPLE DASHBOARD */}
        {currentView === 'people' &&
          (isLoggedIn ? (
            <PeopleDashboard
              currentLanguage={currentLanguage}
              onLanguageChange={(lang) => setCurrentLanguage(lang)}
              onOpenResponsibleAi={() => setIsResponsibleAiOpen(true)}
              onSwitchToGov={() => setCurrentView('government')}
              userData={currentUser}
            />
          ) : (
            <AuthScreen
              currentLanguage={currentLanguage}
              onLoginSuccess={handleLoginSuccess}
              onBackToLanding={() => setCurrentView('landing')}
            />
          ))}

        {/* VIEW 4: AUTHORIZED GOVERNMENT DASHBOARD */}
        {currentView === 'government' &&
          (isLoggedIn ? (
            <GovernmentDashboard
              currentLanguage={currentLanguage}
              currentCountry={currentCountry}
              onOpenResponsibleAi={() => setIsResponsibleAiOpen(true)}
              onSwitchToCitizen={() => setCurrentView('people')}
            />
          ) : (
            <AuthScreen
              currentLanguage={currentLanguage}
              onLoginSuccess={handleLoginSuccess}
              onBackToLanding={() => setCurrentView('landing')}
            />
          ))}
      </main>

      {/* Responsible AI Oversight Modal */}
      <ResponsibleAIModal
        isOpen={isResponsibleAiOpen}
        onClose={() => setIsResponsibleAiOpen(false)}
      />
    </div>
  );
}
