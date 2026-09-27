/**
 * TripPilot AI — Frontend API Client
 * Clean JavaScript ES Module implementation.
 */

function resolveApiBase() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // If no envUrl or points to dead port 5000, use relative '/api'
  if (!envUrl || envUrl.includes(':5000')) {
    return '/api';
  }

  if (typeof window !== 'undefined') {
    // Prevent Mixed Content errors
    if (window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
      return '/api';
    }

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0';

    if (!isLocalhost && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return '/api';
    }
  }

  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

const API_BASE = resolveApiBase();

function getAuthHeader() {
  const token = localStorage.getItem('trippilot_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // System Health
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      return data;
    } catch (err) {
      throw new Error('Unable to connect to TripPilot API server.');
    }
  },

  // Authentication
  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed.');
    }
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid email or password.');
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Session expired.');
    }
    return data;
  },

  // Trip Planning
  async createTrip(params) {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to generate travel options.');
    }
    return data;
  },

  async getTrips() {
    const res = await fetch(`${API_BASE}/trips`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to retrieve saved trips.');
    }
    return data;
  },

  async getTrip(id) {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Trip not found.');
    }
    return data;
  },

  async deleteTrip(id) {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Could not delete trip.');
    }
    return data;
  },

  // "Change My Plan" (GenAI Refinement)
  async refinePlan(tripId, feedback) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/refine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ feedback }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to revise plan.');
    }
    return data;
  },

  // Select Option
  async selectOption(tripId, optionIndex) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ optionIndex }),
    });
    return res.json();
  },

  // Booking Intent (Official Provider Handoff)
  async createBookingIntent(tripId, selectedOptionIndex) {
    const res = await fetch(`${API_BASE}/booking-intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ tripId, selectedOptionIndex }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to initialize provider handoff.');
    }
    return data;
  },

  async getBookingIntents() {
    const res = await fetch(`${API_BASE}/booking-intents`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  // Directory & NLP
  async getProviders() {
    const res = await fetch(`${API_BASE}/providers`);
    return res.json();
  },

  async parsePrompt(prompt) {
    const res = await fetch(`${API_BASE}/ai/parse-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    return res.json();
  },

  // Cities Registry
  async getCities() {
    try {
      const res = await fetch(`${API_BASE}/cities`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  // Route Engine Search
  async searchRoutes(params) {
    const res = await fetch(`${API_BASE}/routes/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Lightweight Travel Route Chatbot Assistant
  async sendChatMessage(message, context = {}) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Chatbot assistant is currently unavailable.');
    }
    return data;
  },
};
