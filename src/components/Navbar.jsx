import React, { useState, useEffect } from 'react';
import { 
  Compass, Moon, Sun, LogOut, Activity, Menu, X, 
  MapPin, Calendar, LayoutDashboard, History, Sparkles, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { api } from '../services/api.js';

export const Navbar = ({ currentTab, setCurrentTab, openHealthModal }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'error', database: 'disconnected' }));
  }, []);

  const navLinks = [
    { id: 'landing', label: 'Home', icon: Compass },
    { id: 'plan', label: 'Plan Trip', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mytrips', label: 'My Trips', icon: History },
  ];

  const isDbConnected = health?.database === 'connected';

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 sm:pt-4 pb-2 transition-all">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
        
        {/* 1. Brand Mark Pod (Distinct Elevated Floating Unit) */}
        <div 
          onClick={() => {
            setCurrentTab('landing');
            setMobileMenuOpen(false);
          }}
          className="group flex cursor-pointer items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white/90 px-3.5 py-2 shadow-sm shadow-neutral-900/5 backdrop-blur-xl transition-all hover:border-orange-300 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-xs shadow-orange-500/30 transition-transform group-hover:scale-105">
            <Compass className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span className="font-heading text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                TripPilot
              </span>
              <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-100/70 dark:bg-orange-950/60 px-1 py-0.2 rounded">
                AI
              </span>
            </div>
            <span className="text-[9px] font-medium tracking-wide text-neutral-400 dark:text-neutral-500 hidden sm:inline">
              India Rail · Bus · Cab
            </span>
          </div>
        </div>

        {/* 2. Grouped Floating Navigation Capsule (Center Grouped, Not Normal Navbar) */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-neutral-200/80 bg-white/90 p-1.5 shadow-sm shadow-neutral-900/5 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/90">
          {navLinks.map((link) => {
            const active = currentTab === link.id;
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800/80'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 3. Control & Profile Companion Dock (Separated visually) */}
        <div className="hidden md:flex items-center gap-2 rounded-2xl sm:rounded-full border border-neutral-200/80 bg-white/90 p-1.5 pl-3 shadow-sm shadow-neutral-900/5 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/90">
          
          {/* Atlas Health Mini Status Indicator */}
          <button
            onClick={openHealthModal}
            title={isDbConnected ? 'MongoDB Atlas: Connected' : 'System: Checking / In-Memory'}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isDbConnected
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                  : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
              }`}
            />
            <span className="hidden xl:inline text-neutral-500 dark:text-neutral-400">Atlas</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Profile / Auth Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-neutral-200 dark:border-neutral-800">
              <div 
                onClick={() => setCurrentTab('dashboard')}
                className="flex items-center gap-2 cursor-pointer rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 pr-2.5 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 hidden lg:inline max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 pl-1 border-l border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-orange-600 dark:text-neutral-200 dark:hover:text-orange-400 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="rounded-full bg-orange-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}

        </div>

        {/* Mobile Navigation Trigger Header */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/90 text-neutral-600 dark:border-neutral-800/80 dark:bg-neutral-900/90 dark:text-neutral-300 backdrop-blur-xl"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-600" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/90 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800/80 dark:bg-neutral-900/90 dark:text-neutral-200 dark:hover:bg-neutral-800 backdrop-blur-xl cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Sleek Mobile Floating Menu Sheet (Requirements 6 & 8) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-neutral-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-2xl dark:border-neutral-800/90 dark:bg-neutral-900/95 transition-all animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1.5">
            {navLinks.map((link) => {
              const active = currentTab === link.id;
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="my-2 border-t border-neutral-100 dark:border-neutral-800 pt-2 space-y-1.5">
              <button
                onClick={() => {
                  openHealthModal();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <span>Database & API Status</span>
                </div>
                <span
                  className={`h-2 w-2 rounded-full ${
                    isDbConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </button>

              {isAuthenticated && user ? (
                <div className="flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-3 mt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white leading-none">{user.name}</p>
                      <p className="text-[10px] text-neutral-500 truncate max-w-[160px] mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      openAuthModal('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-600 cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
