/**
 * TripPilot AI — Database Client & Repository
 * Connects to MongoDB Atlas when MONGODB_URI is available,
 * provides verified ping health check, and offers a resilient in-memory
 * fallback for local offline testing so the server never crashes.
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const USER_ATLAS_URI = 'mongodb+srv://agalyakalidoss02_db_user:UZ9K5mF7t4R67Iz4@cluster0.zl7ulvl.mongodb.net/trippilot?retryWrites=true&w=majority&appName=Cluster0';

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.connectionError = null;

    // Resilient memory collections for zero-crash fallback
    this.memUsers = new Map();
    this.memTrips = new Map();
    this.memBookingIntents = new Map();
    this.memSavedPlans = new Map();
    this.memFeedback = [];
  }

  async connect() {
    let uri = (process.env.MONGODB_URI || '').trim();

    // If unset or still contains template placeholders like <db_username>, use user's explicit Atlas URI
    if (!uri || uri.includes('<') || uri.includes('>')) {
      uri = USER_ATLAS_URI;
      console.log('[TripPilot DB] Using user MongoDB Atlas connection URI for cluster0.zl7ulvl.mongodb.net');
    }

    try {
      console.log('[TripPilot DB] Connecting to MongoDB Atlas cluster...');
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 8000,
      });

      await this.client.connect();
      this.db = this.client.db('trippilot');

      // Test connection with actual ping
      await this.db.command({ ping: 1 });
      this.isConnected = true;
      this.connectionError = null;
      console.log('[TripPilot DB] Successfully connected and pinged MongoDB Atlas database: trippilot');

      // Create indexes
      const usersCol = this.db.collection('users');
      await usersCol.createIndex({ email: 1 }, { unique: true }).catch(() => {});
      const tripsCol = this.db.collection('trips');
      await tripsCol.createIndex({ userId: 1 }).catch(() => {});
      const intentsCol = this.db.collection('bookingIntents');
      await intentsCol.createIndex({ userId: 1 }).catch(() => {});
    } catch (err) {
      this.isConnected = false;
      const rawError = err.message || '';
      
      // Translate TLS / SSL Alert 80 (standard MongoDB Atlas IP Whitelist block)
      if (rawError.includes('alert number 80') || rawError.includes('tlsv1 alert internal error')) {
        this.connectionError = 'Atlas IP Access List blocked connection (TLS Alert 80). In MongoDB Atlas, go to "Network Access" -> "Add IP Address" -> select "Allow Access From Anywhere (0.0.0.0/0)".';
      } else if (rawError.includes('Authentication failed') || rawError.includes('bad auth')) {
        this.connectionError = 'MongoDB Atlas authentication failed. Please check user credentials in MongoDB Atlas.';
      } else {
        this.connectionError = rawError || 'Failed to ping MongoDB Atlas';
      }

      console.warn('[TripPilot DB] MongoDB connection notice:', this.connectionError);
      console.warn('[TripPilot DB] In-memory storage is active to ensure uninterrupted app operation.');
    }
  }

  /**
   * Verified health check with live ping or in-memory fallback
   */
  async checkHealth() {
    if (!this.isConnected || !this.db) {
      return {
        status: 'ok',
        database: 'in-memory',
        configuredUri: 'mongodb+srv://agalyakalidoss02_db_user:****@cluster0.zl7ulvl.mongodb.net/?appName=Cluster0',
        service: 'TripPilot AI API',
        message: this.connectionError || 'MongoDB Atlas is connecting or waiting for IP whitelist. In-memory storage is active and healthy.',
        networkAccessNotice: this.connectionError && this.connectionError.includes('Network Access')
          ? 'To enable live Atlas storage: In MongoDB Atlas Dashboard, navigate to "Network Access" -> click "Add IP Address" -> click "Allow Access From Anywhere" (0.0.0.0/0).'
          : undefined,
      };
    }

    try {
      await this.db.command({ ping: 1 });
      return {
        status: 'ok',
        database: 'connected',
        service: 'TripPilot AI API',
        cluster: 'MongoDB Atlas (cluster0.zl7ulvl.mongodb.net)',
      };
    } catch (err) {
      this.isConnected = false;
      this.connectionError = err.message;
      return {
        status: 'ok',
        database: 'in-memory',
        service: 'TripPilot AI API',
        message: `Atlas ping failed (${err.message}). In-memory storage is active.`,
      };
    }
  }

  // ==========================================
  // Users Collection
  // ==========================================
  async createUser(userData) {
    const userDoc = {
      ...userData,
      createdAt: new Date().toISOString(),
    };

    if (this.isConnected && this.db) {
      const result = await this.db.collection('users').insertOne(userDoc);
      return { ...userDoc, _id: result.insertedId.toString() };
    }

    const id = 'user-' + Date.now();
    const saved = { ...userDoc, _id: id };
    this.memUsers.set(userData.email.toLowerCase(), saved);
    return saved;
  }

  async findUserByEmail(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (this.isConnected && this.db) {
      const user = await this.db.collection('users').findOne({ email: cleanEmail });
      if (user) {
        return { ...user, _id: user._id.toString() };
      }
      return null;
    }
    return this.memUsers.get(cleanEmail) || null;
  }

  async findUserById(id) {
    if (this.isConnected && this.db) {
      try {
        const user = await this.db.collection('users').findOne({ _id: new ObjectId(id) });
        return user ? { ...user, _id: user._id.toString() } : null;
      } catch {
        return null;
      }
    }
    for (const u of this.memUsers.values()) {
      if (u._id === id) return u;
    }
    return null;
  }

  // ==========================================
  // Trips Collection
  // ==========================================
  async createTrip(tripData) {
    const doc = {
      ...tripData,
      status: tripData.status || 'active',
      feedbackHistory: tripData.feedbackHistory || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isConnected && this.db) {
      const result = await this.db.collection('trips').insertOne(doc);
      return { ...doc, _id: result.insertedId.toString() };
    }

    const id = 'trip-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const saved = { ...doc, _id: id };
    this.memTrips.set(id, saved);
    return saved;
  }

  async getTripsByUser(userId) {
    if (this.isConnected && this.db) {
      const list = await this.db.collection('trips')
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
      return list.map(item => ({ ...item, _id: item._id.toString() }));
    }

    const res = [];
    for (const trip of this.memTrips.values()) {
      if (trip.userId === userId) {
        res.push(trip);
      }
    }
    return res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getTripById(id) {
    if (this.isConnected && this.db) {
      try {
        const trip = await this.db.collection('trips').findOne({ _id: new ObjectId(id) });
        return trip ? { ...trip, _id: trip._id.toString() } : null;
      } catch {
        return null;
      }
    }
    return this.memTrips.get(id) || null;
  }

  async updateTrip(id, updateFields) {
    const updates = {
      ...updateFields,
      updatedAt: new Date().toISOString(),
    };

    if (this.isConnected && this.db) {
      try {
        await this.db.collection('trips').updateOne(
          { _id: new ObjectId(id) },
          { $set: updates }
        );
        return this.getTripById(id);
      } catch {
        return null;
      }
    }

    const existing = this.memTrips.get(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    this.memTrips.set(id, merged);
    return merged;
  }

  async deleteTrip(id, userId) {
    if (this.isConnected && this.db) {
      try {
        const res = await this.db.collection('trips').deleteOne({
          _id: new ObjectId(id),
          userId,
        });
        return res.deletedCount > 0;
      } catch {
        return false;
      }
    }

    const trip = this.memTrips.get(id);
    if (trip && trip.userId === userId) {
      this.memTrips.delete(id);
      return true;
    }
    return false;
  }

  // ==========================================
  // Booking Intent Collection (Real Handoff, No Fake Tickets)
  // ==========================================
  async createBookingIntent(intentData) {
    const doc = {
      ...intentData,
      status: 'pending_external_booking',
      createdAt: new Date().toISOString(),
    };

    if (this.isConnected && this.db) {
      const res = await this.db.collection('bookingIntents').insertOne(doc);
      return { ...doc, _id: res.insertedId.toString() };
    }

    const id = 'intent-' + Date.now();
    const saved = { ...doc, _id: id };
    this.memBookingIntents.set(id, saved);
    return saved;
  }

  async getBookingIntentsByUser(userId) {
    if (this.isConnected && this.db) {
      const list = await this.db.collection('bookingIntents')
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
      return list.map(item => ({ ...item, _id: item._id.toString() }));
    }

    const res = [];
    for (const intent of this.memBookingIntents.values()) {
      if (intent.userId === userId) {
        res.push(intent);
      }
    }
    return res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // ==========================================
  // Feedback Collection
  // ==========================================
  async logFeedback(data) {
    const doc = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    if (this.isConnected && this.db) {
      await this.db.collection('feedback').insertOne(doc).catch(() => {});
    } else {
      this.memFeedback.push(doc);
    }
  }
}

export const dbManager = new DatabaseManager();
