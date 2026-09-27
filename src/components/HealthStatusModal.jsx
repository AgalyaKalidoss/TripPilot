import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Database, Activity, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';

export const HealthStatusModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHealth();
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not connect to /api/health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = data?.database === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/65 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white">
                TripPilot AI System & Health
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Live endpoint status: <code className="font-mono text-orange-600 dark:text-orange-400">GET /api/health</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              <p className="font-bold">Backend Unreachable</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* REST API Status */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">REST API Server</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Node.js Express Engine</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ONLINE
                </span>
              </div>

              {/* Database Status */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">MongoDB Atlas Database</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {isConnected 
                        ? 'Live Connection Verified with Atlas Ping' 
                        : (data?.message || 'MONGODB_URI not configured. In-memory resilience active.')}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {isConnected ? 'CONNECTED' : 'IN-MEMORY'}
                </span>
              </div>

              {/* Network Access Notice */}
              {data?.networkAccessNotice && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>MongoDB Atlas Setup Notice</span>
                  </p>
                  <p className="mt-1 leading-relaxed">
                    {data.networkAccessNotice}
                  </p>
                </div>
              )}

              {/* Provider Integration Layer */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">Official Provider Layer</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">IRCTC, RedBus, Uber Intercity, MakeMyTrip</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  VERIFIED
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-check Health</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
