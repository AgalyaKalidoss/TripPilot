import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, ArrowRight, CheckCircle2, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';

export const ProviderHandoffModal = ({ trip, option, isOpen, onClose }) => {
  const [redirecting, setRedirecting] = useState(false);

  if (!isOpen || !option) return null;

  const handleContinueToProvider = () => {
    setRedirecting(true);
    const targetUrl = option.bookingUrl || 'https://www.irctc.co.in/nget/train-search';
    
    // Safely open official provider website in a new tab
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      setRedirecting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/65 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-orange-100/80 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Official Provider Handoff</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
              Ready to Book
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Compact Trip Summary */}
        <div className="py-5 space-y-4">
          
          {/* Corridor & Selected Option Summary */}
          <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-800/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Selected Itinerary</p>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-0.5 font-heading">
                  {trip?.from || 'Origin'} → {trip?.to || 'Destination'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {option.title}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-extrabold text-orange-600 dark:text-orange-400">
                  ₹{option.estimatedFare?.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-neutral-400">Estimated fare</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200/80 dark:border-neutral-700/60 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-medium">{option.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-medium">{trip?.date || 'Today'}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                <span className="font-bold capitalize text-neutral-800 dark:text-neutral-200">
                  {option.type} ({option.transfers} transfer)
                </span>
              </div>
            </div>
          </div>

          {/* Provider Card */}
          <div className="rounded-2xl border border-orange-200/80 bg-orange-50/40 p-4 sm:p-5 dark:border-orange-900/40 dark:bg-orange-950/20">
            <p className="text-xs font-bold text-orange-950 dark:text-orange-200 uppercase tracking-wide">
              Official Ticketing Operator:
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                {option.provider}
              </span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                Verified Portal
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
              You will complete passenger seat selection and payment on the provider's official portal. TripPilot AI never stores payment cards or adds booking surcharges.
            </p>
          </div>

          {/* Transparent Disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-neutral-400 shrink-0" />
            <p>
              Real-time seat quotas and tatkal fares are finalized on the provider's platform. TripPilot AI guarantees verified schedule accuracy.
            </p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Review Options
          </button>
          
          <button
            onClick={handleContinueToProvider}
            disabled={redirecting}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all cursor-pointer"
          >
            <span>{redirecting ? 'Connecting...' : 'Proceed to Official Booking'}</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
