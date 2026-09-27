import React, { useState } from 'react';
import { 
  ArrowRight, Compass, ShieldCheck, Train, Bus, Car, 
  ArrowUpRight, Sparkles, MapPin, ArrowLeftRight, CheckCircle2,
  Layers, Clock, ExternalLink, Route
} from 'lucide-react';

export const LandingPage = ({ onStartPlanning, openHealthModal }) => {
  const [quickFrom, setQuickFrom] = useState('Chennai');
  const [quickTo, setQuickTo] = useState('Coimbatore');

  const popularRoutes = [
    { from: 'Sivakasi', to: 'Hyderabad', hub: 'Via Madurai Hub', mode: 'Train + Sleeper Bus', duration: '14h 30m' },
    { from: 'Chennai', to: 'Hyderabad', hub: 'Direct Superfast', mode: 'Vande Bharat / SF', duration: '8h 30m' },
    { from: 'Chennai', to: 'Bengaluru', hub: 'Direct High-Speed', mode: 'Vande Bharat / Shatabdi', duration: '4h 30m' },
    { from: 'Coimbatore', to: 'Chennai', hub: 'Direct Rail', mode: 'Vande Bharat / Kovai SF', duration: '5h 50m' },
    { from: 'Madurai', to: 'Mumbai', hub: 'Direct Express', mode: 'Superfast Rail', duration: '24h 10m' },
    { from: 'Delhi', to: 'Mumbai', hub: 'Direct Premium Rail', mode: 'Tejas Rajdhani', duration: '15h 40m' },
  ];

  const handleSwap = () => {
    setQuickFrom(quickTo);
    setQuickTo(quickFrom);
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    onStartPlanning(quickFrom, quickTo);
  };

  const providers = [
    {
      name: 'Indian Railways (IRCTC)',
      category: 'National Railway System',
      description: 'Vande Bharat, Rajdhani, Shatabdi & Superfast Express bookings directly on the official IRCTC portal.',
      coverage: 'All India Rail Network',
      badge: 'Official Rail Partner'
    },
    {
      name: 'RedBus & State RTCs',
      category: 'Intercity Bus Network',
      description: 'KSRTC, SETC, APSRTC, TSRTC, and private luxury AC multi-axle sleeper buses with live tracking.',
      coverage: '100,000+ Verified Routes',
      badge: 'Official Bus Network'
    },
    {
      name: 'Uber Intercity',
      category: 'On-Demand Outstation Cabs',
      description: 'Comfortable one-way and round-trip city-to-city cabs with doorstep pickup and verified drivers.',
      coverage: 'Major Metros & Tier-2 Corridors',
      badge: 'Door-to-Door Partner'
    },
    {
      name: 'MakeMyTrip & Cleartrip',
      category: 'Verified Multimodal Travel',
      description: 'Comprehensive intercity connections and verified bus/flight handoff with zero platform markup.',
      coverage: 'Pan-India Coverage',
      badge: 'Authorized Aggregator'
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-neutral-200/80 dark:border-neutral-800/80">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-orange-400/12 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/80 px-3.5 py-1 text-xs font-semibold text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                <span>India-Wide Multimodal Route Intelligence</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
                Plan your journey. <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  We'll handle the complexity.
                </span>
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                TripPilot AI discovers direct and verified multi-leg hub connections across India. Compare rail, bus, and cab options with zero fake data, then book directly on official provider portals.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => onStartPlanning()}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Plan My Trip</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 rounded-xl border border-neutral-300/80 bg-white px-5 py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700/80 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <span>How It Works</span>
                </a>
              </div>

              {/* Verified Trust Points */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Official Provider Handoff</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Route className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Smart Hub-Based Multi-Leg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Zero Added Fees or Markup</span>
                </div>
              </div>

            </div>

            {/* Right Column: Quick Route Search Box */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xl shadow-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
                
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">Quick Route Search</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Explore direct and hub-connected journeys</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
                    <Compass className="h-4 w-4" />
                  </div>
                </div>

                <form onSubmit={handleQuickSubmit} className="mt-5 space-y-3.5">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Origin Station / City
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3.5 h-4 w-4 text-orange-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={quickFrom}
                        onChange={(e) => setQuickFrom(e.target.value)}
                        placeholder="e.g. Chennai, Sivakasi, Madurai"
                        className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-10 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center -my-1 relative z-10">
                    <button
                      type="button"
                      onClick={handleSwap}
                      title="Swap cities"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Destination Station / City
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3.5 h-4 w-4 text-orange-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={quickTo}
                        onChange={(e) => setQuickTo(e.target.value)}
                        placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
                        className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-10 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    <span>Discover Best Options</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {/* Popular Corridors Preview */}
                <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      Popular Travel Corridors
                    </p>
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                      Verified Data
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {popularRoutes.slice(0, 4).map((route, idx) => (
                      <button
                        key={idx}
                        onClick={() => onStartPlanning(route.from, route.to)}
                        className="text-left p-2.5 rounded-xl bg-neutral-50 hover:bg-orange-50/80 border border-neutral-100 dark:bg-neutral-800/60 dark:border-neutral-800 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                          {route.from} → {route.to}
                        </p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                          {route.hub} · {route.duration}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section (Curated 4-Step Process) */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Intelligent Architecture
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mt-1">
              How TripPilot Works
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              From discovering hidden connecting hub routes to seamless handoff with official ticketing authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="relative p-6 sm:p-7 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/40 hover:border-orange-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-bold dark:bg-orange-950 dark:text-orange-300 mb-5">
                01
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Enter Journey & Preferences
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Specify origin, destination, travel dates, passengers, and budget. Choose between fastest, cheapest, or maximum comfort modes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 sm:p-7 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/40 hover:border-orange-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-bold dark:bg-orange-950 dark:text-orange-300 mb-5">
                02
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Multi-Leg Graph Routing
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                If no direct train or bus exists, our routing engine connects you through major verified transit hubs (e.g. Sivakasi via Madurai to Hyderabad).
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 sm:p-7 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/40 hover:border-orange-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-bold dark:bg-orange-950 dark:text-orange-300 mb-5">
                03
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Dynamic "Change My Plan"
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Want to avoid overnight buses, cut fares, or reduce transfer layover? Instantly refine your itinerary with real-time AI adjustments.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 sm:p-7 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/40 hover:border-orange-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-bold dark:bg-orange-950 dark:text-orange-300 mb-5">
                04
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Official Provider Booking
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Complete your seat reservations securely on IRCTC, RedBus, or Uber. We never collect payment cards or charge hidden fees.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onStartPlanning()}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors cursor-pointer"
            >
              <span>Start Planning Your Journey</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Verified Providers Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Verified Ecosystem
            </span>
            <h2 className="font-heading text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
              Direct Provider Handoff
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              We connect you with official government and verified private transportation operators across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((p, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      {p.category}
                    </span>
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>{p.coverage}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Verified</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Network Coverage Grid */}
      <section className="py-16 bg-white dark:bg-neutral-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/70 p-8 sm:p-10 dark:border-neutral-800 dark:bg-neutral-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Pan-India Transit Network
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                39+ Major Hubs & Secondary Cities Connected
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                From metropolitan hubs like Chennai, Bengaluru, Hyderabad, and Mumbai to regional centers including Sivakasi, Madurai, Erode, Salem, and Tirunelveli.
              </p>
            </div>
            
            <button
              onClick={() => onStartPlanning()}
              className="rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer shrink-0 self-start lg:self-auto"
            >
              Plan Your Itinerary
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
