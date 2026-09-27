import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Users, ArrowRight, Sparkles, 
  DollarSign, Zap, Smile, Sliders, Train, Bus, Car, Layers,
  ArrowLeftRight, Info, ShieldCheck, Check
} from 'lucide-react';
import { api } from '../services/api.js';

export const PlanTripPage = ({ initialFrom = 'Chennai', initialTo = 'Coimbatore', onTripGenerated, onCancel }) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(1);
  const [budget, setBudget] = useState('');
  const [preference, setPreference] = useState('balanced');
  const [transport, setTransport] = useState('any');
  const [comfort, setComfort] = useState('medium');

  // Cities autocomplete registry
  const [cityList, setCityList] = useState([]);

  // Optional Natural Language prompt state
  const [showNlp, setShowNlp] = useState(false);
  const [nlpPrompt, setNlpPrompt] = useState('');
  const [nlpParsing, setNlpParsing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialFrom) setFrom(initialFrom);
    if (initialTo) setTo(initialTo);
  }, [initialFrom, initialTo]);

  useEffect(() => {
    api.getCities().then((data) => {
      if (Array.isArray(data)) setCityList(data);
    }).catch(() => {});
  }, []);

  const popularCorridors = [
    { from: 'Sivakasi', to: 'Hyderabad' },
    { from: 'Chennai', to: 'Hyderabad' },
    { from: 'Chennai', to: 'Bengaluru' },
    { from: 'Coimbatore', to: 'Chennai' },
    { from: 'Salem', to: 'Bengaluru' },
    { from: 'Erode', to: 'Chennai' },
    { from: 'Madurai', to: 'Mumbai' },
    { from: 'Delhi', to: 'Mumbai' },
  ];

  const preferenceOptions = [
    { id: 'cheapest', label: 'Cheapest', desc: 'Lowest estimated fare', icon: DollarSign },
    { id: 'fastest', label: 'Fastest', desc: 'Shortest travel duration', icon: Zap },
    { id: 'comfort', label: 'Comfortable', desc: 'AC sleeper & high class', icon: Smile },
    { id: 'balanced', label: 'Balanced', desc: 'Optimal time & cost mix', icon: Sliders },
  ];

  const transportOptions = [
    { id: 'any', label: 'Any Mode', icon: Layers },
    { id: 'train', label: 'Train', icon: Train },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'cab', label: 'Cab', icon: Car },
  ];

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleNlpParse = async (e) => {
    e.preventDefault();
    if (!nlpPrompt.trim()) return;

    setNlpParsing(true);
    setError(null);
    try {
      const parsed = await api.parsePrompt(nlpPrompt);
      if (parsed.from) setFrom(parsed.from);
      if (parsed.to) setTo(parsed.to);
      if (parsed.passengers) setPassengers(parsed.passengers);
      if (parsed.budget) setBudget(parsed.budget.toString());
      if (parsed.preference) setPreference(parsed.preference);
      if (parsed.transport) setTransport(parsed.transport);
      setShowNlp(false);
    } catch {
      setError('Could not auto-fill from prompt. You can adjust the guided form below.');
    } finally {
      setNlpParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        from: from.trim(),
        to: to.trim(),
        date,
        passengers: parseInt(passengers, 10) || 1,
        budget: budget ? parseInt(budget, 10) : undefined,
        preference,
        transport,
        comfort,
      };

      const trip = await api.createTrip(payload);
      onTripGenerated(trip);
    } catch (err) {
      setError(err.message || 'Unable to generate travel options. Please check inputs and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Title Header */}
      <div className="mb-8 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/80 px-3.5 py-1 text-xs font-semibold text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300 mb-2">
          <span>Intelligent Route Planner</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Plan Your Travel Route
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Search across 39+ Indian cities and hubs. Our multi-leg route engine connects smaller cities through major verified transport centers.
        </p>
      </div>

      {/* Datalist for Cities Autocomplete */}
      <datalist id="india-cities">
        {cityList.map((c) => (
          <option key={c.id} value={c.name}>{c.name} ({c.state})</option>
        ))}
      </datalist>

      {/* Optional Natural Language Assistant Prompt */}
      <div className="mb-6 rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Natural Language Auto-Fill
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Describe your journey in plain words and we will fill this form
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNlp(!showNlp)}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer"
          >
            {showNlp ? 'Close Assistant' : 'Type in Plain English'}
          </button>
        </div>

        {showNlp && (
          <form onSubmit={handleNlpParse} className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              Example: "Plan a trip from Sivakasi to Hyderabad next Friday for 1 person under ₹3000 preferring trains."
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={nlpPrompt}
                onChange={(e) => setNlpPrompt(e.target.value)}
                placeholder="Type your travel intention..."
                className="flex-1 rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={nlpParsing || !nlpPrompt.trim()}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
              >
                {nlpParsing ? 'Extracting...' : 'Auto-Fill Form'}
              </button>
            </div>
          </form>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Primary Guided Planning Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-7 transition-colors">
        
        {/* Origin & Destination with Autocomplete and Swap */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative items-center">
            
            {/* Origin Input */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                Origin Station / City
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 h-4 w-4 text-orange-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  list="india-cities"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="e.g. Sivakasi, Chennai, Madurai"
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-3 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            {/* Destination Input */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                Destination Station / City
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 h-4 w-4 text-orange-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  list="india-cities"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-3 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

          </div>

          {/* Quick Swap & Corridor Shortcuts */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 cursor-pointer"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Swap Origin & Destination</span>
            </button>
            <span className="text-[11px] text-neutral-400">
              India Rail & Bus Coverage Verified
            </span>
          </div>

          {/* Corridor quick chips */}
          <div className="pt-2">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Fast Corridors:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {popularCorridors.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFrom(c.from);
                    setTo(c.to);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    from.toLowerCase() === c.from.toLowerCase() && to.toLowerCase() === c.to.toLowerCase()
                      ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold dark:bg-orange-950 dark:text-orange-300'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300'
                  }`}
                >
                  {c.from} → {c.to}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date, Passengers & Budget Cap */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
              Date of Travel
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-neutral-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
              Passengers
            </label>
            <div className="relative flex items-center">
              <Users className="absolute left-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="number"
                min="1"
                max="9"
                required
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-neutral-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
              Budget Cap (Optional)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-neutral-400">₹</span>
              <input
                type="number"
                min="100"
                step="50"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full rounded-xl border border-neutral-300 bg-white pl-8 pr-3.5 py-2.5 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Priority Strategy Selection */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2.5 uppercase tracking-wider">
            Travel Priority:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {preferenceOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = preference === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreference(opt.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-sm dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-500'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? 'text-orange-500' : 'text-neutral-400 dark:text-neutral-500'}`} />
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Transport Mode */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2.5 uppercase tracking-wider">
            Preferred Transport Mode:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {transportOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = transport === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTransport(opt.id)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                      : 'border-neutral-200 bg-neutral-50/50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-5 py-3 text-xs font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Finding Verified Routes...' : 'Discover Best Options'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </form>

    </div>
  );
};
