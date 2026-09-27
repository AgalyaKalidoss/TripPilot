# TripPilot AI — Intelligent Multimodal Travel Planning Platform

TripPilot AI is a production-ready, AI-powered travel planning and transportation discovery platform built with **JavaScript (React 19 + Node.js Express)**, **Tailwind CSS v4**, **MongoDB Atlas**, and **Google Gemini GenAI**.

Rather than acting as a booking simulator, TripPilot AI organizes, ranks, and compares real transportation options across **Train, Bus, Cab, and Multimodal routes**, provides conversational **"Change My Plan"** refinement, and seamlessly transitions travelers to **official verified provider websites** (IRCTC, RedBus, Uber, MakeMyTrip) to complete real bookings and payments.

---

## 1. Key Features

- **Multimodal Routing Engine**: Compares Express Trains (IRCTC Vande Bharat / Superfast), Intercity Buses (RedBus / SETC / TNSTC), Doorstep Outstation Cabs (Uber Intercity / MMT), and Hybrid Train + Cab transfers.
- **Official Provider Redirection**: Direct, verified provider URLs for booking with transparent estimated fares and clear handoff notices. Zero fake tickets or simulated payment screens.
- **Conversational "Change My Plan"**: Powered by Google Gemini with deterministic rule-based fallback. Travelers can refine plans in plain English (e.g. *"I want a cheaper option without buses"* or *"Prioritize speed"*).
- **Guided Form & Natural Language Input**: Structured journey planning (From, To, Date, Passengers, What's important [Cheapest, Fastest, Comfortable, Balanced], Preferred transport) with optional natural language auto-fill.
- **Persistent Storage**: Stores user accounts, planned journeys, booking intents, and feedback in **MongoDB Atlas** (`users`, `trips`, `bookingIntents`, `feedback`).
- **Verified Health Monitoring**: Live `GET /api/health` endpoint that actually pings MongoDB Atlas and returns real connection status.
- **Modern Orange & Dark Mode UI**: Clean, professional orange and charcoal aesthetic with full dark mode support.

---

## 2. Tech Stack

- **Frontend**: React 19, JavaScript (JSX), Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js (ES Modules), Express 4, CORS, MongoDB Node.js Driver, JSONWebToken, BcryptJS, Google GenAI SDK (`@google/genai`).
- **Database**: MongoDB Atlas.
- **AI**: Google Gemini 2.5 Flash / 3.8 Flash (`@google/genai`).
- **Deployment**: Render Web Service.

---

## 3. Project Architecture

```
User Browser
     │
     ▼
React 19 Frontend (JavaScript JSX + Tailwind CSS v4)
     │  (Protected Bearer JWT & REST API requests)
     ▼
Node.js Express Server (server.js on 0.0.0.0:PORT)
     ├── Provider Layer (trainProvider, busProvider, cabProvider)
     ├── Planner Engine (multimodal combinations & ranking)
     ├── AI Service (Gemini + resilient fallback)
     ├── MongoDB Atlas Repository (users, trips, bookingIntents)
     │
     ├──► MongoDB Atlas Database (Ping-verified)
     │
     └──► Official Provider Portals (IRCTC, RedBus, Uber, MMT)
```

---

## 4. Environment Variables

Create a `.env` file from `.env.example`:

```bash
# Server Configuration
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/trippilot?retryWrites=true&w=majority
JWT_SECRET=trippilot_production_jwt_secret_2026
GEMINI_API_KEY=AIzaSy...
FRONTEND_URL=http://localhost:5173

# Client Configuration (leave empty for same-origin monolithic deployment)
VITE_API_URL=
```

---

## 5. Local Development Commands

```bash
# 1. Install dependencies
npm install

# 2. Build frontend assets
npm run build

# 3. Start development server (serves frontend and backend on port 3000)
npm run dev

# 4. Verify system health
curl http://localhost:3000/api/health
```

---

## 6. Render Deployment Steps

1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your Git repository.
3. Configure the service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
4. In the **Environment Variables** section on Render, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `NODE_ENV`: `production`
5. Click **Deploy**.
6. Verify deployment by visiting `https://<your-render-app>.onrender.com/api/health`.
