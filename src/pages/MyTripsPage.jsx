import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Trash2, ExternalLink, ArrowRight, 
  MapPin, Clock, RefreshCw, X, ShieldCheck, Compass
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const MyTripsPage = ({ onPlanTrip, onViewTrip, onContinueBooking }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchTrips = async () => {
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
    if (isAuthenticated) {
      fetchTrips();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this trip from your saved list?')) return;

    setDeletingId(id);
    try {
      await api.deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message || 'Could not delete trip.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      trip.from.toLowerCase().includes(query) ||
      trip.to.toLowerCase().includes(query);

    const matchesDate = !filterDate || trip.date === filterDate;
    return matchesSearch && matchesDate;
  });

  if (!isAuthenticated) {
    return (
      <div className="py-24 px-4 max-w-lg mx-auto text-center">
        <div className="h-14 w-14 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold text-neutral-900 dark:text-white">
          Sign In to Access Saved Trips
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Your saved routes, preferences, and verified official provider links will appear here after logging in.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 rounded-xl bg-orange-500 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            My Planned Trips
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Browse and manage your saved multi-leg journeys and official booking handoffs.
          </p>
        </div>
        <button
          onClick={onPlanTrip}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>Plan New Route</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Filter and Search Bar with High Contrast (Requirement 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl border border-neutral-200/90 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs transition-colors">
        <div className="sm:col-span-7 relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city or station (e.g. Sivakasi, Hyderabad)..."
            className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-9 py-2.5 text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="sm:col-span-5 flex gap-2">
          <div className="relative flex-1 flex items-center">
            <Calendar className="absolute left-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3 py-2.5 text-xs sm:text-sm font-medium text-neutral-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              title="Clear date filter"
              className="px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={fetchTrips}
            title="Refresh list"
            className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Trips List */}
      {loading ? (
        <div className="py-16 text-center text-sm font-medium text-neutral-500">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-orange-500" />
          Loading saved journeys...
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-3">
            <Compass className="h-6 w-6" />
          </div>
          <p className="text-base font-bold text-neutral-900 dark:text-white">
            {searchQuery || filterDate ? 'No journeys match your search filters' : 'No saved trips found'}
          </p>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {searchQuery || filterDate ? 'Try clearing your search query or date filter.' : 'Generate a new journey plan to store and compare transport options.'}
          </p>
          <button
            onClick={onPlanTrip}
            className="mt-5 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Plan Journey Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const isConnecting = trip.routeType === 'connecting' || (trip.viaHubs && trip.viaHubs.length > 0);
            const bestOption = trip.options?.[0];

            return (
              <div
                key={trip._id}
                onClick={() => onViewTrip(trip)}
                className="group p-5 sm:p-6 rounded-2xl border border-neutral-200/90 bg-white hover:border-orange-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {trip.from} → {trip.to}
                      </h3>
                      {isConnecting ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Via {trip.viaHubs?.join(', ') || 'Hub'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          Direct
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {trip.date}
                      </span>
                      <span>·</span>
                      <span>{trip.passengers} Passenger{trip.passengers > 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span className="capitalize">{trip.preference} priority</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {bestOption && (
                      <div className="text-right pr-2">
                        <span className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white block">
                          ₹{bestOption.estimatedFare?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-neutral-400">Lowest estimated fare</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleDelete(e, trip._id)}
                      disabled={deletingId === trip._id}
                      title="Delete trip"
                      className="p-2.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onViewTrip(trip)}
                      className="flex items-center gap-1.5 rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 px-4 py-2.5 text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors"
                    >
                      <span>View Route</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
