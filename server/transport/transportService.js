/**
 * TripPilot AI — Unified Transport Service
 * Integrates with Graph Route Engine for India-wide direct & multi-leg routes.
 */

import { routeEngine } from './routeEngine.js';
import { CITIES, normalizeCityName } from './cities.js';

export const transportService = {
  /**
   * Search available transport routes (direct or connecting)
   */
  async getAvailableRoutes(query) {
    return routeEngine.findRoutes(query);
  },

  /**
   * Direct wrapper for travel plan generator
   */
  async getAvailableOptions(query) {
    const routeRes = await routeEngine.findRoutes(query);
    return {
      options: routeRes.options || [],
      routeType: routeRes.routeType || 'direct',
      viaHubs: routeRes.viaHubs || [],
      explanation: routeRes.explanation || '',
      origin: routeRes.origin,
      destination: routeRes.destination,
    };
  },

  /**
   * Get list of supported cities / hubs for autocompletion
   */
  getSupportedCities() {
    return CITIES.map((c) => ({
      id: c.id,
      name: c.name,
      state: c.state,
      isHub: c.isHub,
      hubTier: c.hubTier,
    }));
  },

  /**
   * Normalize an input city name
   */
  normalizeCity(cityName) {
    return normalizeCityName(cityName);
  },

  /**
   * Official list of verified provider directories
   */
  getOfficialProviders() {
    return [
      {
        name: 'Indian Railways (IRCTC)',
        category: 'Train',
        url: 'https://www.irctc.co.in/nget/train-search',
        verified: true,
        logo: 'irctc',
        description: 'Official portal for Indian Railways reservations, Tatkal, Vande Bharat, and Rajdhani express trains.',
      },
      {
        name: 'RedBus & State Express (SETC / TNSTC / KSRTC / TSRTC)',
        category: 'Bus',
        url: 'https://www.redbus.in',
        verified: true,
        logo: 'redbus',
        description: 'Authorized aggregator for government RTCs and private verified multi-axle sleeper buses.',
      },
      {
        name: 'Uber Intercity & MakeMyTrip Cabs',
        category: 'Cab',
        url: 'https://www.makemytrip.com/cabs/',
        verified: true,
        logo: 'uber',
        description: 'Door-to-door verified chauffeur-driven highway sedans and SUVs with transparent billing.',
      },
    ];
  },
};
