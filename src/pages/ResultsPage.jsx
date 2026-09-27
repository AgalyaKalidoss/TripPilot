import React, { useState } from 'react';
import { 
  ArrowLeft, ExternalLink, Sparkles, Filter, 
  Clock, ShieldCheck, ArrowRight, RefreshCw, Send, CheckCircle2,
  Train, Bus, Car, Layers, AlertCircle, MapPin, Info, CornerDownRight,
  TrendingDown, Check, Compass
} from 'lucide-react';
import { api } from '../services/api.js';

export const ResultsPage = ({ trip, onUpdateTrip, onSelectOptionForHandoff, onBackToPlanner }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [refineFeedback, setRefineFeedback] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isConnecting = trip.routeType === 'connecting' || (trip.viaHubs && trip.viaHubs.length > 0);

  const quickSuggestions = [
    'Make it cheaper',
    'Make it faster',
    'Avoid buses',
    'Avoid trains',
    'Fewer transfers',
    'More comfortable',
    'Prioritize morning departure',
  ];

  const handleRefineSubmit = async (feedbackText) => {
    const text = feedbackText || refineFeedback;
    if (!text.trim()) return;

    setRefining(true);
    setRefineError(null);
    setSuccessMessage(null);

    try {
      const res = await api.refinePlan(trip._id, text.trim());
      onUpdateTrip(res.trip);
      setSuccessMessage(res.explanation || 'Updated plan according to your preferences.');
      setRefineFeedback('');
    } catch (err) {
      setRefineError(err.message || 'Unable to adjust plan right now.');
    } finally {
      setRefining(false);
    }
  };

  // Filter options
  const filteredOptions = (trip.options || []).filter((opt) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'connecting') return opt.transfers > 0;
    return opt.type === activeFilter;
  });

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'train':
        return <Train className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'bus':
        return <Bus className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'cab':
        return <Car className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Layers className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <button
            onClick={onBackToPlanner}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-2.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Modify Travel Request</span>
          </button>
          
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {trip.from} → {trip.to}
            </h1>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-100/80 px-3 py-0.5 text-xs font-bold text-orange-800 dark:bg-orange-950/80 dark:text-orange-300">
                {trip.passengers} Passenger{trip.passengers > 1 ? 's' : ''}
              </span>
              {isConnecting && (
                <span className="rounded-full bg-amber-100/80 px-3 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  Via {trip.viaHubs?.join(', ') || 'Intermediate Hub'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex-wrap">
            <span>Date: <strong className="text-neutral-800 dark:text-neutral-200">{trip.date}</strong></span>
            <span>·</span>
            <span>Priority: <strong className="capitalize text-neutral-800 dark:text-neutral-200">{trip.preference}</strong></span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Schedules
            </span>
          </div>
        </div>

        <button
          onClick={onBackToPlanner}
          className="self-start sm:self-auto rounded-xl border border-neutral-300/80 bg-white px-4 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          New Search
        </button>
      </div>

      {/* Verified Connecting Journey Explanation Banner */}
      {isConnecting && (
        <div className="rounded-3xl border border-amber-300/70 bg-amber-50/60 p-6 sm:p-7 dark:border-amber-900/50 dark:bg-amber-950/25">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 shrink-0 mt-0.5">
              <Info className="h-5 w-5" />
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">
                  Connecting Hub Route Discovery
                </h3>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50">
                  Smart Transfer Hub
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200 leading-relaxed font-normal">
                {trip.explanation || `No verified direct transport was found for this specific city pair in the transport database. TripPilot AI constructed a verified connecting route via ${trip.viaHubs?.[0] || 'the primary regional hub'}, ensuring reliable schedules and realistic transfer layovers.`}
              </p>

              {/* Transit Corridor Visual */}
              <div className="pt-2 flex items-center gap-2 flex-wrap text-xs font-bold text-amber-950 dark:text-amber-100">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 dark:bg-neutral-900 dark:border-neutral-700 shadow-xs">
                  {trip.from}
                </span>
                <span className="text-amber-500 font-bold">→</span>
                <span className="px-3 py-1.5 rounded-xl bg-orange-100 border border-orange-300 text-orange-900 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200 shadow-xs">
                  Transfer Hub: {trip.viaHubs?.join(', ') || 'Madurai'}
                </span>
                <span className="text-amber-500 font-bold">→</span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 dark:bg-neutral-900 dark:border-neutral-700 shadow-xs">
                  {trip.to}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Change My Plan" Console */}
      <div className="rounded-3xl border border-orange-200/80 bg-orange-50/40 p-6 sm:p-7 dark:border-orange-900/40 dark:bg-orange-950/20 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Change My Plan
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Customize your journey options or tap a fast suggestion
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider bg-orange-100/70 dark:bg-orange-950/60 px-2 py-0.5 rounded">
            Live AI Refinement
          </span>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 my-3">
          {quickSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              disabled={refining}
              onClick={() => handleRefineSubmit(suggestion)}
              className="text-xs rounded-full border border-orange-200/90 bg-white px-3.5 py-1.5 font-semibold text-neutral-700 shadow-xs hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/80 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRefineSubmit();
          }}
          className="flex flex-col sm:flex-row gap-2 mt-4"
        >
          <input
            type="text"
            value={refineFeedback}
            onChange={(e) => setRefineFeedback(e.target.value)}
            placeholder="e.g. Find cheaper options under ₹2000, avoid sleeper buses..."
            className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={refining || !refineFeedback.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
          >
            {refining ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>{refining ? 'Refining Plan...' : 'Apply Change'}</span>
          </button>
        </form>

        {successMessage && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {refineError && (
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-semibold">
            {refineError}
          </p>
        )}
      </div>

      {/* Mode Filters (Segmented buttons) */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-x-auto">
          {[
            { id: 'all', label: 'All Options' },
            { id: 'train', label: 'Trains' },
            { id: 'bus', label: 'Buses' },
            { id: 'cab', label: 'Cabs' },
            ...(isConnecting ? [{ id: 'connecting', label: 'Connecting Hubs' }] : []),
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-xs font-medium text-neutral-500">
          Showing <span className="font-bold text-neutral-900 dark:text-white">{filteredOptions.length}</span> verified options
        </p>
      </div>

      {/* Result Cards List */}
      <div className="space-y-6">
        {filteredOptions.map((opt, idx) => {
          const isRec = opt.isRecommended;
          const hasMultipleLegs = opt.legs && opt.legs.length > 1;

          return (
            <div
              key={opt.id || idx}
              className={`rounded-3xl border transition-all ${
                isRec
                  ? 'border-orange-500 bg-white shadow-xl shadow-orange-500/5 dark:bg-neutral-900 dark:border-orange-500 ring-1 ring-orange-500/30'
                  : 'border-neutral-200/90 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
              } p-6 sm:p-7 space-y-5`}
            >
              
              {/* Recommended Top Badge & Explanation */}
              {isRec && (
                <div className="pb-3 border-b border-orange-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-orange-500 text-white shadow-xs w-fit">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Top Recommendation</span>
                  </div>
                  {opt.recommendationReason && (
                    <p className="text-xs text-orange-950 dark:text-orange-200 font-semibold">
                      {opt.recommendationReason}
                    </p>
                  )}
                </div>
              )}

              {/* Card Header & Fare Summary */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-xl font-bold text-neutral-900 dark:text-white">
                      {opt.title}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 capitalize">
                      {opt.type}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {opt.transfers === 0 ? '· Direct Non-Stop' : `· ${opt.transfers} Transfer Hub`}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Operated by: <span className="font-bold text-neutral-800 dark:text-neutral-200">{opt.provider}</span>
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                    ₹{opt.estimatedFare?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    Total estimated fare ({trip.passengers} pax)
                  </span>
                </div>
              </div>

              {/* DETAILED LEG-BY-LEG VISUALIZATION (Requirement 8) */}
              {hasMultipleLegs ? (
                <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      Journey Legs & Transfer Details
                    </p>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Total Duration: {opt.duration}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {opt.legs.map((leg, legIdx) => (
                      <React.Fragment key={legIdx}>
                        {/* Single Leg Item */}
                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60 shrink-0 mt-0.5">
                            {getModeIcon(leg.mode)}
                          </div>

                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                                Leg {leg.legNumber || legIdx + 1}: {leg.vehicleName || leg.operator}
                              </span>
                              <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                                ₹{leg.fare?.toLocaleString('en-IN') || (opt.estimatedFare / opt.legs.length).toFixed(0)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-neutral-400 block text-[10px] uppercase font-bold">From:</span>
                                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate block">{leg.fromStation}</span>
                                <span className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">{leg.departureTime}</span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block text-[10px] uppercase font-bold">To:</span>
                                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate block">{leg.toStation}</span>
                                <span className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">{leg.arrivalTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transfer Hub Divider (if between legs) */}
                        {legIdx < opt.legs.length - 1 && (
                          <div className="flex items-center gap-3 px-3 py-1 text-xs text-amber-800 dark:text-amber-300">
                            <div className="h-6 w-0.5 bg-amber-400/80 mx-4" />
                            <div className="flex items-center gap-2 text-xs font-semibold bg-amber-100/90 dark:bg-amber-950/80 px-3.5 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-900/80">
                              <MapPin className="h-3.5 w-3.5 text-amber-600" />
                              <span>Transfer at {opt.transferLocation || 'Intermediate Hub'}</span>
                              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-normal">
                                ({opt.layoverDuration || 'Safe buffer included'})
                              </span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                /* Direct Route Visuals */
                <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Departure</span>
                    <span className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">{opt.departure}</span>
                    <span className="text-[11px] text-neutral-500 block truncate max-w-[150px]">{opt.fromStation}</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{opt.duration}</span>
                    <div className="flex items-center gap-1 text-neutral-300 dark:text-neutral-600 my-0.5">
                      <span>———</span>
                      <ArrowRight className="h-3.5 w-3.5 text-orange-500" />
                      <span>———</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">Direct Non-Stop</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Arrival</span>
                    <span className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">{opt.arrival}</span>
                    <span className="text-[11px] text-neutral-500 block truncate max-w-[150px]">{opt.toStation}</span>
                  </div>
                </div>
              )}

              {/* Card Footer: Handoff & Booking CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Verified Schedules · No hidden booking markup</span>
                </div>

                <button
                  onClick={() => onSelectOptionForHandoff(opt)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer"
                >
                  <span>Continue to Official Booking</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

            </div>
          );
        })}

        {filteredOptions.length === 0 && (
          <div className="text-center py-12 rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              No options match the selected transport filter.
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="mt-3 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              Show all transport options
            </button>
          </div>
        )}
      </div>

      {/* Trust Notice */}
      <div className="pt-4 text-center">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Fares and live availability are subject to provider terms. TripPilot AI provides intelligent journey planning and redirects directly to official booking systems.
        </p>
      </div>

    </div>
  );
};
