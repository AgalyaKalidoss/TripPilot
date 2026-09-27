import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { HealthStatusModal } from './components/HealthStatusModal.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { ProviderHandoffModal } from './components/ProviderHandoffModal.jsx';
import { TravelChatbot } from './components/TravelChatbot.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { PlanTripPage } from './pages/PlanTripPage.jsx';
import { ResultsPage } from './pages/ResultsPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { MyTripsPage } from './pages/MyTripsPage.jsx';
import { api } from './services/api.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  
  // Trip planning state
  const [initialOrigin, setInitialOrigin] = useState('Chennai');
  const [initialDestination, setInitialDestination] = useState('Coimbatore');
  const [currentTrip, setCurrentTrip] = useState(null);

  // Provider Handoff modal state (No fake booking simulation)
  const [selectedHandoffOption, setSelectedHandoffOption] = useState(null);
  const [handoffTrip, setHandoffTrip] = useState(null);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);

  // Navigation handlers
  const handleStartPlanning = (from, to) => {
    if (from) setInitialOrigin(from);
    if (to) setInitialDestination(to);
    setCurrentTab('plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTripGenerated = (trip) => {
    setCurrentTrip(trip);
    setCurrentTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTrip = (trip) => {
    setCurrentTrip(trip);
    setCurrentTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOptionForHandoff = async (option) => {
    if (!currentTrip) return;
    try {
      // Record booking intent in database (Requirement 26)
      const optIdx = currentTrip.options.findIndex((o) => o.id === option.id);
      await api.createBookingIntent(currentTrip._id, optIdx >= 0 ? optIdx : 0);
    } catch {
      // Continue handoff even if offline
    }

    setHandoffTrip(currentTrip);
    setSelectedHandoffOption(option);
    setIsHandoffModalOpen(true);
  };

  const handleContinueBookingFromSaved = (trip, option) => {
    setHandoffTrip(trip);
    setSelectedHandoffOption(option);
    setIsHandoffModalOpen(true);
  };

  const handlePlanRouteFromChat = (from, to) => {
    if (from) setInitialOrigin(from);
    if (to) setInitialDestination(to);
    setCurrentTab('plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
          
          {/* Main Navigation */}
          <Navbar
            currentTab={currentTab}
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            openHealthModal={() => setIsHealthModalOpen(true)}
          />

          {/* Page Routing */}
          <main className="flex-1">
            {currentTab === 'landing' && (
              <LandingPage
                onStartPlanning={handleStartPlanning}
                openHealthModal={() => setIsHealthModalOpen(true)}
              />
            )}

            {currentTab === 'plan' && (
              <PlanTripPage
                initialFrom={initialOrigin}
                initialTo={initialDestination}
                onTripGenerated={handleTripGenerated}
                onCancel={() => setCurrentTab('landing')}
              />
            )}

            {currentTab === 'results' && currentTrip && (
              <ResultsPage
                trip={currentTrip}
                onUpdateTrip={(updated) => setCurrentTrip(updated)}
                onSelectOptionForHandoff={handleSelectOptionForHandoff}
                onBackToPlanner={() => setCurrentTab('plan')}
              />
            )}

            {currentTab === 'results' && !currentTrip && (
              <div className="py-24 text-center">
                <p className="text-sm text-neutral-500">No active journey selected.</p>
                <button
                  onClick={() => setCurrentTab('plan')}
                  className="mt-3 rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  Start New Plan
                </button>
              </div>
            )}

            {currentTab === 'dashboard' && (
              <DashboardPage
                onPlanTrip={() => setCurrentTab('plan')}
                onViewTrip={handleViewTrip}
                onContinueBooking={handleContinueBookingFromSaved}
              />
            )}

            {currentTab === 'mytrips' && (
              <MyTripsPage
                onPlanTrip={() => setCurrentTab('plan')}
                onViewTrip={handleViewTrip}
                onContinueBooking={handleContinueBookingFromSaved}
              />
            )}
          </main>

          {/* System & Authentication Modals */}
          <HealthStatusModal
            isOpen={isHealthModalOpen}
            onClose={() => setIsHealthModalOpen(false)}
          />

          <AuthModal />

          {/* Official Provider Handoff Modal (No fake tickets) */}
          <ProviderHandoffModal
            trip={handoffTrip}
            option={selectedHandoffOption}
            isOpen={isHandoffModalOpen}
            onClose={() => setIsHandoffModalOpen(false)}
          />

          {/* Lightweight Travel Route Assistant Chatbot (Requirements 12-22) */}
          <TravelChatbot onPlanJourney={handlePlanRouteFromChat} />

          {/* Clean Footer */}
          <footer className="border-t border-neutral-200 bg-white py-8 dark:border-neutral-800 dark:bg-neutral-950 transition-colors">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 dark:text-white">TripPilot AI</span>
                <span>·</span>
                <span>Multimodal Travel Intelligence Platform</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Official Provider Redirection</span>
                <span>·</span>
                <button
                  onClick={() => setIsHealthModalOpen(true)}
                  className="text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
                >
                  System Status
                </button>
              </div>
            </div>
          </footer>

        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
