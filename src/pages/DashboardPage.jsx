import React, { useState, useEffect } from 'react';
import { 
  Compass, Plus, Calendar, MapPin, Clock, ArrowRight, 
  RefreshCw, Layers, ExternalLink, ShieldCheck, Route, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const DashboardPage = ({ onPlanTrip, onViewTrip, onContinueBooking }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getTrips();
      setTrips(Array.isArray(data) ? data : []);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="py-24 px-4 max-w-lg mx-auto text-center">
        <div className="h-14 w-14 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold text-neutral-900 dark:text-white">
          Sign In to Your Dashboard
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Sign in to track your planned routes, compare transportation across India, and access verified official booking handoffs.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 rounded-xl bg-orange-500 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-orange-700 bg-orange-100/70 dark:bg-orange-950/60 dark:text-orange-300 mb-2">
            <span>Traveler Workspace</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'Traveler'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {user?.email} · Manage your multi-leg journeys and official booking handoffs.
          </p>
        </div>

        <button
          onClick={onPlanTrip}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Plan New Journey</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Planned Journeys</span>
          <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1.5 font-heading">
            {trips.length}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Stored in MongoDB Atlas</p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Multimodal Modes</span>
          <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1.5 font-heading">
            4 Modes
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Rail, Bus, Cab & Smart Hub Connections</p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Official Ticketing</span>
          <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-1.5 font-heading">
            100% Direct
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">IRCTC, RedBus, Uber, MMT</p>
        </div>
      </div>

      {/* Recent Journeys Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
              Recent Planned Journeys
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Review saved routes or continue to official provider ticketing
            </p>
          </div>
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm font-medium text-neutral-500">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-orange-500" />
            Loading journeys from Atlas...
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200/90 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-3">
              <Compass className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-neutral-900 dark:text-white">
              No journeys planned yet
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Start by entering an origin and destination to compare verified transportation options across India.
            </p>
            <button
              onClick={onPlanTrip}
              className="mt-5 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
            >
              Plan Your First Route
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => {
              const bestOption = trip.options?.[0];
              const isHub = trip.routeType === 'connecting' || (trip.viaHubs && trip.viaHubs.length > 0);

              return (
                <div
                  key={trip._id}
                  onClick={() => onViewTrip(trip)}
                  className="group p-5 rounded-2xl border border-neutral-200/80 bg-white hover:border-orange-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {trip.date}
                      </span>
                      {isHub ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Via {trip.viaHubs?.[0] || 'Hub'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          Direct
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {trip.from} → {trip.to}
                    </h3>

                    {bestOption && (
                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Top Option</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">{bestOption.title}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-400 block text-[10px]">From</span>
                          <span className="font-extrabold text-orange-600 dark:text-orange-400">
                            ₹{bestOption.estimatedFare?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">
                      {trip.options?.length || 0} verified options
                    </span>
                    <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <span>View Route Details</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
