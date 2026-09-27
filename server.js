/**
 * TripPilot AI — Production Node.js & Express Full-Stack Server
 * JavaScript ES Module implementation.
 */

import dotenv from 'dotenv';
dotenv.config({ override: true });

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './server/db.js';
import { generateTravelPlans } from './server/planner.js';
import { interpretFeedback, parseNaturalLanguageTrip, processTravelAssistantMessage } from './server/ai.js';
import { transportService } from './server/transport/transportService.js';
import { routeEngine } from './server/transport/routeEngine.js';
import { CITIES } from './server/transport/cities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'trippilot_production_jwt_secret_2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Authentication Middlewares
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to continue.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please sign in again.',
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Continue as guest
    }
  }
  next();
}

async function startServer() {
  // Connect to database
  await dbManager.connect();

  const app = express();

  // Configure CORS
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
      if (!origin) return callback(null, true);
      // In development or local preview, allow localhost / 127.0.0.1 or exact FRONTEND_URL
      if (
        origin === FRONTEND_URL ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('.run.app') ||
        origin.includes('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for deployment previews
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());

  // ==========================================
  // API Endpoints
  // ==========================================

  // 1. Health & MongoDB Verification Endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const health = await dbManager.checkHealth();
      const statusCode = health.status === 'ok' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (err) {
      res.status(500).json({
        status: 'error',
        database: 'disconnected',
        service: 'TripPilot AI API',
        message: 'Health verification encounter error.',
      });
    }
  });

  // 2. Authentication: Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide full name, email, and password.',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters.',
        });
      }

      const existing = await dbManager.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await dbManager.createUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      });

      const token = jwt.sign(
        { userId: user._id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      console.error('[API Register Error]', err.message);
      res.status(500).json({
        success: false,
        message: 'Unable to complete registration. Please try again.',
      });
    }
  });

  // 3. Authentication: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please enter both email and password.',
        });
      }

      const user = await dbManager.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      console.error('[API Login Error]', err.message);
      res.status(500).json({
        success: false,
        message: 'Login failed due to a server error.',
      });
    }
  });

  // 4. Authentication: Get Current Profile
  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await dbManager.findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.json({ id: user._id, name: user.name, email: user.email });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  });

  // 5. Trip Planning: Create Trip & Generate Options
  app.post('/api/trips', optionalAuth, async (req, res) => {
    try {
      const {
        from,
        to,
        date,
        passengers = 1,
        budget,
        preference = 'balanced',
        transport = 'any',
        comfort = 'medium',
        specialRequirements = '',
      } = req.body;

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          message: 'Please specify both starting location and destination.',
        });
      }

      const numPassengers = Math.max(1, parseInt(passengers, 10) || 1);
      const parsedBudget = budget ? parseInt(budget, 10) : undefined;

      // Generate structured transportation options
      const options = await generateTravelPlans({
        from: from.trim(),
        to: to.trim(),
        date: date || new Date().toISOString().split('T')[0],
        passengers: numPassengers,
        budget: parsedBudget,
        preference,
        transport,
        comfort,
        specialRequirements,
      });

      const userId = req.user ? req.user.userId : 'guest-user';

      const trip = await dbManager.createTrip({
        userId,
        from: from.trim(),
        to: to.trim(),
        date: date || new Date().toISOString().split('T')[0],
        passengers: numPassengers,
        budget: parsedBudget,
        preference,
        transport,
        comfort,
        specialRequirements,
        routeType: options.routeType || 'direct',
        viaHubs: options.viaHubs || [],
        explanation: options.explanation || '',
        options,
        selectedOptionIndex: 0,
        feedbackHistory: [],
        status: 'active',
      });

      res.status(201).json(trip);
    } catch (err) {
      console.error('[API Create Trip Error]', err.message);
      res.status(500).json({
        success: false,
        message: 'Unable to generate travel options. Please try again.',
      });
    }
  });

  // 6. Natural Language Prompt Parser
  app.post('/api/ai/parse-prompt', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt text is required.' });
      }
      const parsed = await parseNaturalLanguageTrip(prompt);
      res.json(parsed);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Could not parse travel prompt.' });
    }
  });

  // 6b. Travel Route Chatbot Assistant
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Message is required.' });
      }
      const reply = await processTravelAssistantMessage({
        userMessage: message.trim(),
        sessionContext: context || {},
      });
      res.json(reply);
    } catch (err) {
      console.error('[API Chat Error]', err.message);
      res.status(500).json({
        success: false,
        message: 'Travel assistant is unavailable right now. Please try again.',
      });
    }
  });

  // 6c. Supported Cities Registry
  app.get('/api/cities', (req, res) => {
    try {
      res.json(transportService.getSupportedCities());
    } catch (err) {
      res.status(500).json({ success: false, message: 'Could not load cities.' });
    }
  });

  // 6d. Direct Route Search
  app.post('/api/routes/search', async (req, res) => {
    try {
      const result = await routeEngine.findRoutes(req.body);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Could not perform route search.' });
    }
  });

  // 7. Get User's Trips
  app.get('/api/trips', requireAuth, async (req, res) => {
    try {
      const trips = await dbManager.getTripsByUser(req.user.userId);
      res.json(trips);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to retrieve saved trips.' });
    }
  });

  // 8. Get Single Trip
  app.get('/api/trips/:id', async (req, res) => {
    try {
      const trip = await dbManager.getTripById(req.params.id);
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found.' });
      }
      res.json(trip);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error retrieving trip details.' });
    }
  });

  // 9. Update Trip
  app.put('/api/trips/:id', requireAuth, async (req, res) => {
    try {
      const updated = await dbManager.updateTrip(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Trip not found.' });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update trip.' });
    }
  });

  // 10. Delete Trip
  app.delete('/api/trips/:id', requireAuth, async (req, res) => {
    try {
      const deleted = await dbManager.deleteTrip(req.params.id, req.user.userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
      }
      res.json({ success: true, message: 'Trip deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete trip.' });
    }
  });

  // 11. "Change My Plan" — Conversational Refinement
  app.post('/api/trips/:id/refine', async (req, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide feedback for what you want to change.',
        });
      }

      const trip = await dbManager.getTripById(id);
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found.' });
      }

      // Interpret feedback with GenAI / rule-based fallback
      const adjustments = await interpretFeedback(feedback, {
        from: trip.from,
        to: trip.to,
        preference: trip.preference,
        transport: trip.transport,
        budget: trip.budget,
        comfort: trip.comfort,
      });

      // Regenerate options with adjusted constraints
      const newOptions = await generateTravelPlans({
        from: trip.from,
        to: trip.to,
        date: trip.date,
        passengers: trip.passengers,
        budget: adjustments.budget,
        preference: adjustments.preference,
        transport: adjustments.transport,
        comfort: adjustments.comfort,
        specialRequirements: trip.specialRequirements,
      });

      const updatedHistory = [
        ...(trip.feedbackHistory || []),
        {
          message: feedback,
          aiExplanation: adjustments.explanation,
          timestamp: new Date().toISOString(),
        },
      ];

      const updatedTrip = await dbManager.updateTrip(id, {
        preference: adjustments.preference,
        transport: adjustments.transport,
        budget: adjustments.budget,
        comfort: adjustments.comfort,
        routeType: newOptions.routeType || trip.routeType || 'direct',
        viaHubs: newOptions.viaHubs || trip.viaHubs || [],
        explanation: newOptions.explanation || trip.explanation || '',
        options: newOptions,
        selectedOptionIndex: 0,
        feedbackHistory: updatedHistory,
      });

      await dbManager.logFeedback({
        tripId: id,
        feedback,
        adjustments,
      });

      res.json({
        success: true,
        message: 'Plan revised successfully.',
        explanation: adjustments.explanation,
        source: adjustments.source,
        trip: updatedTrip,
      });
    } catch (err) {
      console.error('[API Refine Error]', err.message);
      res.status(500).json({
        success: false,
        message: 'Unable to revise plan at this time. Please try again.',
      });
    }
  });

  // 12. Select Preferred Option
  app.post('/api/trips/:id/select', async (req, res) => {
    try {
      const { id } = req.params;
      const { optionIndex } = req.body;

      const trip = await dbManager.getTripById(id);
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found.' });
      }

      const idx = parseInt(optionIndex, 10) || 0;
      const updated = await dbManager.updateTrip(id, {
        selectedOptionIndex: idx,
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to record selected option.' });
    }
  });

  // 13. Record Booking Intent (Official Provider Handoff)
  app.post('/api/booking-intents', optionalAuth, async (req, res) => {
    try {
      const { tripId, selectedOptionIndex } = req.body;
      const trip = await dbManager.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found.' });
      }

      const option = trip.options[selectedOptionIndex] || trip.options[0];
      if (!option) {
        return res.status(400).json({ success: false, message: 'Invalid travel option selected.' });
      }

      const userId = req.user ? req.user.userId : trip.userId;

      const intent = await dbManager.createBookingIntent({
        userId,
        tripId: trip._id.toString(),
        from: trip.from,
        to: trip.to,
        date: trip.date,
        passengers: trip.passengers,
        selectedPlan: option,
        provider: option.provider,
        providerUrl: option.bookingUrl,
        estimatedCost: option.estimatedFare,
        createdAt: new Date().toISOString(),
      });

      // Update trip status to saved/selected
      await dbManager.updateTrip(tripId, {
        status: 'saved',
        selectedOptionIndex,
      });

      res.status(201).json({
        success: true,
        message: 'Ready to continue to official provider.',
        intent,
      });
    } catch (err) {
      console.error('[API Booking Intent Error]', err.message);
      res.status(500).json({
        success: false,
        message: 'Could not record booking intent.',
      });
    }
  });

  // 14. Get User's Booking Intents
  app.get('/api/booking-intents', requireAuth, async (req, res) => {
    try {
      const intents = await dbManager.getBookingIntentsByUser(req.user.userId);
      res.json(intents);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to retrieve booking history.' });
    }
  });

  // 15. Verified Official Providers Directory
  app.get('/api/providers', (req, res) => {
    res.json(transportService.getOfficialProviders());
  });

  // ==========================================
  // Vite Integration & Static Frontend Serving
  // ==========================================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TripPilot Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[TripPilot Server Launch Error]', err);
  process.exit(1);
});
