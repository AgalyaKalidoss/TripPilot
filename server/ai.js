/**
 * TripPilot AI — Generative AI & Travel Assistant Engine
 * Powered by Google Gemini (gemini-3.8-flash) with robust deterministic fallback.
 * Strictly uses the shared Graph Route Engine for 100% data consistency.
 */

import { GoogleGenAI } from '@google/genai';
import { routeEngine } from './transport/routeEngine.js';
import { normalizeCityName, CITIES } from './transport/cities.js';

const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('[TripPilot AI] Failed to initialize GoogleGenAI client:', err.message);
  }
}

/**
 * Interpret user feedback to adjust plan constraints ("Change My Plan")
 */
export async function interpretFeedback(feedbackText, currentConstraints) {
  const text = (feedbackText || '').toLowerCase().trim();

  // Rule-based fallback parser (instant, deterministic, zero-crash)
  const ruleBased = {
    preference: currentConstraints.preference || 'balanced',
    transport: currentConstraints.transport || 'any',
    budget: currentConstraints.budget,
    comfort: currentConstraints.comfort || 'medium',
    explanation: 'Revised your options based on your requested changes.',
    source: 'rule-based',
  };

  const explanations = [];

  // 1. Budget / Cheap
  if (text.includes('cheap') || text.includes('lower cost') || text.includes('budget') || text.includes('less expensive') || text.includes('save money')) {
    ruleBased.preference = 'cheapest';
    explanations.push('prioritized lower-cost transportation');
    if (ruleBased.budget) {
      ruleBased.budget = Math.round(ruleBased.budget * 0.85);
    }
  }

  // 2. Speed / Fastest
  if (text.includes('fast') || text.includes('quick') || text.includes('less time') || text.includes('duration') || text.includes('speed')) {
    ruleBased.preference = 'fastest';
    explanations.push('prioritized the fastest travel time');
  }

  // 3. Comfort
  if (text.includes('comfort') || text.includes('luxury') || text.includes('premium') || text.includes('sleeper') || text.includes('first class')) {
    ruleBased.preference = 'comfort';
    ruleBased.comfort = 'High';
    explanations.push('prioritized high-comfort and AC seating');
  }

  // 4. Exclude / Include Transport Modes
  if (text.includes('no bus') || text.includes('avoid bus') || text.includes("don't want bus") || text.includes("don't want a bus") || text.includes('without bus') || text.includes('stop bus')) {
    ruleBased.transport = 'train';
    explanations.push('excluded buses in favor of trains and cabs');
  } else if (text.includes('no train') || text.includes('avoid train') || text.includes("don't want train")) {
    ruleBased.transport = 'bus';
    explanations.push('excluded trains in favor of bus routes');
  } else if (text.includes('no cab') || text.includes('avoid cab') || text.includes('no taxi')) {
    ruleBased.transport = 'train';
    explanations.push('avoided cabs in favor of scheduled public transit');
  }

  // 5. Transfer preference
  if (text.includes('fewer transfer') || text.includes('no transfer') || text.includes('direct')) {
    ruleBased.preference = 'fastest';
    explanations.push('prioritized routes with minimal transfers');
  }

  // 6. Increase budget
  if (text.includes('increase budget') || text.includes('more budget') || text.includes('higher budget')) {
    ruleBased.budget = ruleBased.budget ? Math.round(ruleBased.budget * 1.35) : 5000;
    explanations.push('increased budget headroom');
  }

  if (explanations.length > 0) {
    const capitalized = explanations[0].charAt(0).toUpperCase() + explanations[0].slice(1);
    ruleBased.explanation = explanations.length === 1 
      ? `${capitalized}.` 
      : `${capitalized} and ${explanations.slice(1).join(', ')}.`;
  }

  // Attempt Gemini API call if key is present
  if (aiClient) {
    try {
      const prompt = `
You are TripPilot AI's journey refinement engine.
A traveler currently has these constraints:
- Origin: "${currentConstraints.from}"
- Destination: "${currentConstraints.to}"
- Current Preference: "${currentConstraints.preference}"
- Current Transport Mode: "${currentConstraints.transport}"
- Current Budget: ${currentConstraints.budget || 'None'}

User Feedback: "${feedbackText}"

Return a JSON object with:
{
  "preference": "cheapest" | "fastest" | "comfort" | "balanced",
  "transport": "any" | "train" | "bus" | "cab" | "multimodal",
  "budgetAdjustment": number or null,
  "explanation": "Brief 1-2 sentence explanation of the change"
}
Output strictly valid JSON only.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text.trim());
      return {
        preference: parsed.preference || ruleBased.preference,
        transport: parsed.transport || ruleBased.transport,
        budget: parsed.budgetAdjustment
          ? Math.round((currentConstraints.budget || 2500) * parsed.budgetAdjustment)
          : ruleBased.budget,
        comfort: ruleBased.comfort,
        explanation: parsed.explanation || ruleBased.explanation,
        source: 'gemini',
      };
    } catch (err) {
      console.warn('[TripPilot AI] Gemini inference failed, using rule-based response:', err.message);
    }
  }

  return ruleBased;
}

/**
 * Smart Location & Prompt Extraction
 * Handles diverse natural language forms:
 * - "from Sivakasi to Hyderabad"
 * - "travel Sivakasi Hyderabad"
 * - "I need to go from Coimbatore to Delhi"
 * - "Chennai to Bangalore tomorrow"
 * - "How can I reach Hyderabad from Sivakasi?"
 */
export async function parseNaturalLanguageTrip(promptText) {
  const text = (promptText || '').trim();

  const fallback = {
    from: '',
    to: '',
    passengers: 1,
    budget: undefined,
    preference: 'balanced',
    transport: 'any',
  };

  const STOP_WORDS = new Set([
    'i', 'want', 'need', 'wish', 'like', 'plan', 'go', 'reach', 'travel',
    'how', 'can', 'what', 'where', 'me', 'please', 'to', 'from', 'a', 'an',
    'the', 'is', 'are', 'in', 'at', 'on', 'by', 'way', 'route', 'trip', 'journey',
  ]);

  const isValidCity = (str) => {
    if (!str || STOP_WORDS.has(str.toLowerCase().trim())) return null;
    const norm = normalizeCityName(str);
    // Check if the normalized city corresponds to a registered city or valid alias
    const found = CITIES.find((c) => c.name.toLowerCase() === norm.name.toLowerCase() || c.id === norm.id);
    return found ? norm.name : null;
  };

  // Heuristic 1: "reach <Dest> from <Origin>"
  const reachMatch = text.match(/(?:how\s+(?:can|do)\s+i\s+)?reach\s+([A-Za-z\s]+?)\s+from\s+([A-Za-z\s]+?)(?:\s+tomorrow|\s+for|\s+on|\s+under|\.|\?|$)/i);
  if (reachMatch) {
    const c1 = isValidCity(reachMatch[1]);
    const c2 = isValidCity(reachMatch[2]);
    if (c1) fallback.to = c1;
    if (c2) fallback.from = c2;
  }

  // Heuristic 2: "from <Origin> to <Dest>"
  if (!fallback.from || !fallback.to) {
    const fromToMatch = text.match(/from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\s+tomorrow|\s+for|\s+on|\s+under|\.|\?|$)/i);
    if (fromToMatch) {
      const c1 = isValidCity(fromToMatch[1]);
      const c2 = isValidCity(fromToMatch[2]);
      if (c1) fallback.from = c1;
      if (c2) fallback.to = c2;
    }
  }

  // Heuristic 3: "<Origin> to <Dest>" (e.g. "Chennai to Bangalore tomorrow", "Sivakasi to Hyderabad")
  if (!fallback.from || !fallback.to) {
    const simpleToMatch = text.match(/\b([A-Za-z]+)\s+to\s+([A-Za-z]+)\b/i);
    if (simpleToMatch) {
      const c1 = isValidCity(simpleToMatch[1]);
      const c2 = isValidCity(simpleToMatch[2]);
      if (c1 && c2) {
        fallback.from = c1;
        fallback.to = c2;
      }
    }
  }

  // Heuristic 4: "to <Dest>" only (e.g. "I want to go to Hyderabad", "to Hyderabad")
  if (!fallback.to) {
    const toOnlyMatch = text.match(/(?:go|travel|head|ticket)\s+to\s+([A-Za-z]+)/i);
    if (toOnlyMatch) {
      const c = isValidCity(toOnlyMatch[1]);
      if (c) fallback.to = c;
    }
  }

  // Heuristic 5: "from <Origin>" only (e.g. "from Sivakasi", "starting from Chennai")
  if (!fallback.from) {
    const fromOnlyMatch = text.match(/(?:from|starting\s+(?:from|at))\s+([A-Za-z]+)/i);
    if (fromOnlyMatch) {
      const c = isValidCity(fromOnlyMatch[1]);
      if (c) fallback.from = c;
    }
  }

  // Passenger count
  const passMatch = text.match(/(\d+)\s*(?:people|passengers|persons|travelers)/i);
  if (passMatch) {
    fallback.passengers = parseInt(passMatch[1], 10);
  }

  // Budget
  const budgetMatch = text.match(/(?:under|budget|below|max)\s*₹?\s*(\d+)/i);
  if (budgetMatch) {
    fallback.budget = parseInt(budgetMatch[1], 10);
  }

  // Preferences
  const lower = text.toLowerCase();
  if (lower.includes('comfort')) fallback.preference = 'comfort';
  if (lower.includes('cheap') || lower.includes('budget')) fallback.preference = 'cheapest';
  if (lower.includes('fast') || lower.includes('quick')) fallback.preference = 'fastest';
  if (lower.includes('train')) fallback.transport = 'train';
  if (lower.includes('bus') && !lower.includes("don't want") && !lower.includes('avoid') && !lower.includes('no bus')) {
    fallback.transport = 'bus';
  }
  if (lower.includes("no bus") || lower.includes("avoid bus")) {
    fallback.transport = 'train';
  }

  // Normalize cities
  if (fallback.from) {
    const norm = normalizeCityName(fallback.from);
    if (norm) fallback.from = norm.name;
  }
  if (fallback.to) {
    const norm = normalizeCityName(fallback.to);
    if (norm) fallback.to = norm.name;
  }

  // If Gemini client is available and NO cities were extracted, attempt AI extraction with fast timeout
  if (aiClient && !fallback.from && !fallback.to) {
    try {
      const prompt = `
Extract travel details from this user query:
"${text}"

Supported Indian cities include: Chennai, Bengaluru, Hyderabad, Mumbai, Delhi, Madurai, Coimbatore, Sivakasi, Salem, Erode, Tirunelveli, Kochi, Pune, Jaipur, Lucknow, Kolkata, etc.

Return valid JSON:
{
  "from": "normalized origin city name or empty string",
  "to": "normalized destination city name or empty string",
  "passengers": number (default 1),
  "budget": number or null,
  "preference": "cheapest" | "fastest" | "comfort" | "balanced",
  "transport": "any" | "train" | "bus" | "cab"
}
Output strictly JSON.`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 1500)
      );

      const res = await Promise.race([
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
        timeoutPromise,
      ]);

      const parsed = JSON.parse(res.text.trim());
      return {
        from: parsed.from ? normalizeCityName(parsed.from)?.name || parsed.from : fallback.from,
        to: parsed.to ? normalizeCityName(parsed.to)?.name || parsed.to : fallback.to,
        passengers: parsed.passengers || fallback.passengers,
        budget: parsed.budget || fallback.budget,
        preference: parsed.preference || fallback.preference,
        transport: parsed.transport || fallback.transport,
      };
    } catch (err) {
      // Deterministic fallback returns cleanly
    }
  }

  return fallback;
}

/**
 * Small Lightweight Travel Assistant (Chatbot Service)
 * Strictly queries the shared routeEngine so chatbot & main planner are 100% aligned.
 */
export async function processTravelAssistantMessage({ userMessage, sessionContext = {} }) {
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();

  // 1. Extract newly mentioned parameters
  const extracted = await parseNaturalLanguageTrip(text);

  const context = {
    from: extracted.from || sessionContext.from || '',
    to: extracted.to || sessionContext.to || '',
    passengers: extracted.passengers || sessionContext.passengers || 1,
    preference: extracted.preference !== 'balanced' ? extracted.preference : (sessionContext.preference || 'balanced'),
    transport: extracted.transport !== 'any' ? extracted.transport : (sessionContext.transport || 'any'),
    date: sessionContext.date || new Date().toISOString().split('T')[0],
  };

  // Check specific intent: e.g. "I want to go to Hyderabad"
  const onlyToMatch = text.match(/(?:go|travel|reach|head)\s+to\s+([A-Za-z]+)/i);
  if (onlyToMatch && !context.from && (!context.to || context.to === '')) {
    const norm = normalizeCityName(onlyToMatch[1]);
    if (norm) context.to = norm.name;
  }

  // Check specific intent: "From Sivakasi"
  const onlyFromMatch = text.match(/(?:from|starting\s+(?:from|at))\s+([A-Za-z]+)/i);
  if (onlyFromMatch && (!context.from || context.from === '')) {
    const norm = normalizeCityName(onlyFromMatch[1]);
    if (norm) context.from = norm.name;
  }

  // Check single word city responses (e.g. if assistant asked "Where are you travelling from?" and user said "Sivakasi")
  if (!context.from && text.split(/\s+/).length <= 2) {
    const norm = normalizeCityName(text);
    if (norm && norm.id !== context.to?.toLowerCase()) {
      context.from = norm.name;
    }
  } else if (!context.to && text.split(/\s+/).length <= 2) {
    const norm = normalizeCityName(text);
    if (norm && norm.id !== context.from?.toLowerCase()) {
      context.to = norm.name;
    }
  }

  // 2. Evaluate context completeness
  if (!context.to) {
    return {
      message: "Hello! Where would you like to travel to? (e.g. Hyderabad, Bengaluru, Chennai, Mumbai, or Delhi)",
      context,
      suggestedActions: [
        { label: "Hyderabad", query: "I want to go to Hyderabad" },
        { label: "Bengaluru", query: "I want to go to Bengaluru" },
        { label: "Chennai", query: "I want to go to Chennai" },
        { label: "Mumbai", query: "I want to go to Mumbai" },
      ],
    };
  }

  if (!context.from) {
    return {
      message: `Sure! Where will you be travelling to ${context.to} from? (e.g. Sivakasi, Madurai, Coimbatore, Chennai, or Salem)`,
      context,
      suggestedActions: [
        { label: "From Sivakasi", query: "From Sivakasi" },
        { label: "From Chennai", query: "From Chennai" },
        { label: "From Madurai", query: "From Madurai" },
        { label: "From Coimbatore", query: "From Coimbatore" },
      ],
    };
  }

  // 3. BOTH from and to are known — Query the exact same Graph Route Engine!
  const routeResult = await routeEngine.findRoutes({
    from: context.from,
    to: context.to,
    date: context.date,
    passengers: context.passengers,
    preference: context.preference,
    transport: context.transport,
  });

  const { routeType, viaHubs, explanation, options } = routeResult;

  if (!options || options.length === 0) {
    return {
      message: `A verified connecting route between ${context.from} and ${context.to} could not be safely constructed in our verified transport network. We suggest traveling via a major state hub like Chennai or Bengaluru.`,
      context,
      suggestedActions: [
        { label: "Change Destination", query: "I want to change destination" },
        { label: "Check from Chennai", query: `From Chennai to ${context.to}` },
      ],
    };
  }

  const top = options[0];

  let reply = '';
  let actions = [];

  if (routeType === 'direct') {
    reply = `Verified direct transport is available from **${context.from}** to **${context.to}**!\n\n` +
      `Recommended option: **${top.title}** (${top.duration}, estimated fare ₹${top.estimatedFare.toLocaleString('en-IN')}).\n` +
      `Operated by ${top.provider} with verified booking handoff.`;

    actions = [
      {
        type: 'plan_journey',
        label: 'Plan Full Journey',
        payload: { from: context.from, to: context.to, passengers: context.passengers, preference: context.preference },
      },
      {
        type: 'set_preference',
        label: 'Find Cheapest',
        query: `Cheapest route from ${context.from} to ${context.to}`,
      },
      {
        type: 'set_preference',
        label: 'Find Fastest',
        query: `Fastest route from ${context.from} to ${context.to}`,
      },
    ];
  } else {
    // Connecting route
    const hubName = viaHubs && viaHubs.length > 0 ? viaHubs[0] : 'a transport hub';
    reply = `Direct connection not found in our current transport data.\n\n` +
      `A practical connecting route is available through **${hubName}**:\n` +
      `**${context.from} → ${hubName} → ${context.to}**\n\n` +
      `• **Leg 1**: ${top.legs[0]?.vehicleName || context.from + ' to ' + hubName} (${top.legs[0]?.durationMinutes ? Math.floor(top.legs[0].durationMinutes / 60) + 'h ' + (top.legs[0].durationMinutes % 60) + 'm' : ''})\n` +
      `• **Transfer**: ${hubName} Central Junction\n` +
      `• **Leg 2**: ${top.legs[1]?.vehicleName || hubName + ' to ' + context.to} (${top.legs[1]?.durationMinutes ? Math.floor(top.legs[1].durationMinutes / 60) + 'h ' + (top.legs[1].durationMinutes % 60) + 'm' : ''})\n\n` +
      `Total estimated journey time is **${top.duration}** with combined fare around **₹${top.estimatedFare.toLocaleString('en-IN')}**.`;

    actions = [
      {
        type: 'plan_journey',
        label: 'Plan This Journey',
        payload: { from: context.from, to: context.to, passengers: context.passengers, preference: context.preference },
      },
      {
        type: 'set_preference',
        label: 'Make It Cheaper',
        query: `Make Sivakasi to ${context.to} cheaper`,
      },
      {
        type: 'change_route',
        label: 'Change Cities',
        query: 'I want to travel somewhere else',
      },
    ];
  }

  return {
    message: reply,
    context,
    routeType,
    viaHubs,
    topOption: {
      title: top.title,
      duration: top.duration,
      estimatedFare: top.estimatedFare,
      transfers: top.transfers,
      legs: top.legs,
    },
    suggestedActions: actions,
  };
}
