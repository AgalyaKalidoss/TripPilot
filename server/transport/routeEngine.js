/**
 * TripPilot AI — Intelligent Graph-based Multi-Leg Route Engine
 * Discovers direct and hub-connected journeys across verified transport edges.
 */

import { CITIES, normalizeCityName } from './cities.js';
import { CONNECTIONS } from './connections.js';

export const routeEngine = {
  /**
   * Search for all valid routes between two Indian cities/towns
   * Evaluates Direct -> 1-Hub -> 2-Hub routes without inventing fake transport.
   */
  async findRoutes(query) {
    const {
      from,
      to,
      date,
      passengers = 1,
      preference = 'balanced',
      transport = 'any',
      budget,
    } = query;

    const originCity = normalizeCityName(from);
    const destCity = normalizeCityName(to);

    if (!originCity || !destCity) {
      return {
        success: false,
        message: 'Could not recognize the origin or destination city.',
        options: [],
      };
    }

    const originId = originCity.id;
    const destId = destCity.id;

    if (originId === destId) {
      return {
        success: false,
        message: 'Origin and destination cannot be the same city.',
        options: [],
      };
    }

    // 1. Check for DIRECT connections
    const directEdges = CONNECTIONS.filter(
      (c) => c.from === originId && c.to === destId
    );

    let routeResults = [];
    let routeType = 'direct';
    let explanation = '';
    let viaHubs = [];

    if (directEdges.length > 0) {
      // Direct connections exist!
      routeType = 'direct';
      explanation = `Found verified direct transport options between ${originCity.name} and ${destCity.name}.`;

      routeResults = directEdges.map((edge, idx) =>
        this.formatDirectOption(edge, originCity, destCity, passengers, idx)
      );
    } else {
      // Direct not found in current verified edges.
      // Search for 1-HUB connecting routes: Origin -> HUB -> Destination
      routeType = 'connecting';
      const oneHubRoutes = this.findConnectingRoutes(originId, destId, passengers);

      if (oneHubRoutes.length > 0) {
        const topHub = oneHubRoutes[0].hubCity.name;
        viaHubs = [topHub];
        explanation = `Direct connection not found in the currently available verified transport data. A practical connecting route is to travel first to ${topHub}, then continue to ${destCity.name}.`;

        routeResults = oneHubRoutes.map((cr, idx) =>
          this.formatConnectingOption(cr, originCity, destCity, passengers, idx)
        );
      } else {
        // Search 2-HUB connecting route: Origin -> HUB1 -> HUB2 -> Destination
        const twoHubRoutes = this.findTwoHubRoutes(originId, destId, passengers);

        if (twoHubRoutes.length > 0) {
          const hub1 = twoHubRoutes[0].hub1.name;
          const hub2 = twoHubRoutes[0].hub2.name;
          viaHubs = [hub1, hub2];
          explanation = `Direct connection not found in our current transport network. A verified multi-city connecting journey is available via ${hub1} and ${hub2}.`;

          routeResults = twoHubRoutes.map((cr, idx) =>
            this.formatTwoHubOption(cr, originCity, destCity, passengers, idx)
          );
        } else {
          // No verified route could be safely constructed
          return {
            success: true,
            routeType: 'unreachable',
            origin: originCity,
            destination: destCity,
            viaHubs: [],
            explanation: `A verified connecting route between ${originCity.name} and ${destCity.name} could not be safely constructed from our verified schedule network. We recommend checking direct connections via state hubs or major regional airports.`,
            options: [],
          };
        }
      }
    }

    // Filter by transport mode if specified
    if (transport && transport !== 'any') {
      const filtered = routeResults.filter((opt) => {
        if (opt.type === transport) return true;
        if (opt.type === 'connecting' && opt.legs.some((l) => l.mode === transport)) return true;
        return false;
      });
      if (filtered.length > 0) {
        routeResults = filtered;
      }
    }

    // Filter by budget if specified
    if (budget && budget > 0) {
      const affordable = routeResults.filter((opt) => opt.estimatedFare <= budget);
      if (affordable.length > 0) {
        routeResults = affordable;
      }
    }

    // Sort by user preference (Cheapest / Fastest / Comfort / Balanced)
    routeResults.sort((a, b) => {
      if (preference === 'cheapest' || preference === 'budget') {
        return a.estimatedFare - b.estimatedFare;
      }
      if (preference === 'fastest') {
        return a.durationMinutes - b.durationMinutes;
      }
      if (preference === 'comfort') {
        const score = { Luxury: 4, High: 3, Medium: 2, Economy: 1 };
        return (score[b.comfort] || 2) - (score[a.comfort] || 2);
      }
      // Balanced: Normalized cost (base 1000) + duration (base 60) + transfer penalty
      const costA = a.estimatedFare / 1000;
      const timeA = a.durationMinutes / 60;
      const transferA = (a.transfers || 0) * 1.5;

      const costB = b.estimatedFare / 1000;
      const timeB = b.durationMinutes / 60;
      const transferB = (b.transfers || 0) * 1.5;

      return (costA + timeA + transferA) - (costB + timeB + transferB);
    });

    // Mark top recommendation with 1-2 sentence reason
    const finalOptions = routeResults.map((opt, index) => {
      const isRecommended = index === 0;
      let reason = '';

      if (isRecommended) {
        if (opt.transfers > 0) {
          reason = `Recommended connecting journey via ${viaHubs.join(' and ')} offering the best balance of transit duration and comfort.`;
        } else if (preference === 'cheapest' || preference === 'budget') {
          reason = `Recommended as the most economical route at ₹${opt.estimatedFare.toLocaleString('en-IN')} for ${passengers} passenger(s).`;
        } else if (preference === 'fastest') {
          reason = `Recommended as the fastest travel option with total journey time of ${opt.duration}.`;
        } else if (preference === 'comfort') {
          reason = `Recommended for premium comfort in ${opt.comfort} class with verified seating.`;
        } else {
          reason = `Recommended for the best overall balance of travel time, fair pricing, and reliable provider schedules.`;
        }
      }

      return {
        ...opt,
        isRecommended,
        recommendationReason: reason,
      };
    });

    return {
      success: true,
      routeType,
      origin: originCity,
      destination: destCity,
      viaHubs,
      explanation,
      options: finalOptions,
    };
  },

  /**
   * Find 1-Hub connecting paths: Origin -> Intermediate Hub -> Destination
   */
  findConnectingRoutes(originId, destId, passengers = 1) {
    const candidateHubs = CITIES.filter((c) => c.isHub);
    const validConnections = [];

    for (const hub of candidateHubs) {
      if (hub.id === originId || hub.id === destId) continue;

      const leg1Edges = CONNECTIONS.filter(
        (c) => c.from === originId && c.to === hub.id
      );
      const leg2Edges = CONNECTIONS.filter(
        (c) => c.from === hub.id && c.to === destId
      );

      if (leg1Edges.length > 0 && leg2Edges.length > 0) {
        // We have verified connections for both legs!
        for (const leg1 of leg1Edges) {
          for (const leg2 of leg2Edges) {
            // Prefer clean pairings (e.g. Train + Train, Bus + Train, Bus + Bus)
            const layoverMinutes = 75; // Average reasonable transfer buffer
            const totalDurationMinutes = leg1.durationMinutes + layoverMinutes + leg2.durationMinutes;
            const totalFare = (leg1.fare + leg2.fare) * passengers;

            validConnections.push({
              hubCity: hub,
              leg1,
              leg2,
              layoverMinutes,
              totalDurationMinutes,
              totalFare,
            });
          }
        }
      }
    }

    // Sort by duration so the best pairs are chosen
    validConnections.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);

    // Pick top unique multimodal / rail / bus combos (up to 6 top choices)
    return validConnections.slice(0, 6);
  },

  /**
   * Find 2-Hub connecting paths: Origin -> Hub1 -> Hub2 -> Destination
   */
  findTwoHubRoutes(originId, destId, passengers = 1) {
    const candidateHubs = CITIES.filter((c) => c.isHub);
    const routes = [];

    for (const hub1 of candidateHubs) {
      if (hub1.id === originId || hub1.id === destId) continue;

      const leg1Edges = CONNECTIONS.filter((c) => c.from === originId && c.to === hub1.id);
      if (leg1Edges.length === 0) continue;

      for (const hub2 of candidateHubs) {
        if (hub2.id === originId || hub2.id === destId || hub2.id === hub1.id) continue;

        const leg2Edges = CONNECTIONS.filter((c) => c.from === hub1.id && c.to === hub2.id);
        const leg3Edges = CONNECTIONS.filter((c) => c.from === hub2.id && c.to === destId);

        if (leg2Edges.length > 0 && leg3Edges.length > 0) {
          const l1 = leg1Edges[0];
          const l2 = leg2Edges[0];
          const l3 = leg3Edges[0];

          const layover = 90;
          const totalDuration = l1.durationMinutes + l2.durationMinutes + l3.durationMinutes + (layover * 2);
          const totalFare = (l1.fare + l2.fare + l3.fare) * passengers;

          routes.push({
            hub1,
            hub2,
            leg1: l1,
            leg2: l2,
            leg3: l3,
            totalDurationMinutes: totalDuration,
            totalFare,
          });
          break; // Stop after first valid pair for this hub combination
        }
      }
    }

    routes.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
    return routes.slice(0, 3);
  },

  /**
   * Format a Direct route option
   */
  formatDirectOption(edge, originCity, destCity, passengers, idx) {
    const totalFare = edge.fare * passengers;
    const hours = Math.floor(edge.durationMinutes / 60);
    const mins = edge.durationMinutes % 60;
    const durationStr = `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim();

    return {
      id: `direct-${edge.mode}-${edge.trainNumber || idx}`,
      type: edge.mode,
      provider: edge.provider,
      providerCode: edge.mode,
      title: edge.trainNumber ? `${edge.name} (#${edge.trainNumber})` : edge.name,
      departure: edge.departure,
      arrival: edge.arrival,
      duration: durationStr,
      durationMinutes: edge.durationMinutes,
      estimatedFare: totalFare,
      costPerPassenger: edge.fare,
      transfers: 0,
      comfort: edge.comfort || 'Medium',
      bookingUrl: edge.bookingUrl,
      fromStation: edge.fromStation || `${originCity.name} Central`,
      toStation: edge.toStation || `${destCity.name} Central`,
      legs: [
        {
          legNumber: 1,
          mode: edge.mode,
          operator: edge.provider,
          vehicleName: edge.name,
          serviceNumber: edge.trainNumber || undefined,
          fromStation: edge.fromStation || originCity.name,
          toStation: edge.toStation || destCity.name,
          departureTime: edge.departure,
          arrivalTime: edge.arrival,
          durationMinutes: edge.durationMinutes,
          fare: totalFare,
          comfort: edge.comfort,
          bookingUrl: edge.bookingUrl,
        },
      ],
    };
  },

  /**
   * Format a 1-Hub Connecting route option (e.g. Sivakasi -> Madurai -> Hyderabad)
   */
  formatConnectingOption(cr, originCity, destCity, passengers, idx) {
    const { hubCity, leg1, leg2, totalDurationMinutes, totalFare, layoverMinutes } = cr;

    const totalHours = Math.floor(totalDurationMinutes / 60);
    const totalMins = totalDurationMinutes % 60;
    const durationStr = `${totalHours}h ${totalMins > 0 ? totalMins + 'm' : ''}`.trim();

    // Mode title
    let modeLabel = 'Connecting Route';
    if (leg1.mode === 'train' && leg2.mode === 'train') {
      modeLabel = 'Connecting Rail Route';
    } else if (leg1.mode === 'bus' && leg2.mode === 'bus') {
      modeLabel = 'Connecting Express Bus';
    } else {
      modeLabel = `Multimodal (${leg1.mode.toUpperCase()} + ${leg2.mode.toUpperCase()})`;
    }

    const title = `${leg1.name} → ${leg2.name}`;

    return {
      id: `connecting-${hubCity.id}-${idx}`,
      type: leg1.mode === leg2.mode ? leg1.mode : 'multimodal',
      isConnecting: true,
      provider: `${leg1.provider} + ${leg2.provider}`,
      providerCode: 'multimodal',
      title,
      departure: leg1.departure,
      arrival: leg2.arrival,
      duration: durationStr,
      durationMinutes: totalDurationMinutes,
      estimatedFare: totalFare,
      costPerPassenger: Math.round(totalFare / passengers),
      transfers: 1,
      transferLocation: `${hubCity.name} Transport Hub`,
      layoverDuration: `${Math.floor(layoverMinutes / 60)}h ${layoverMinutes % 60}m transfer window`,
      firstTransport: `Leg 1: ${leg1.name} (${leg1.departure} → ${leg1.arrival})`,
      secondTransport: `Leg 2: ${leg2.name} (${leg2.departure} → ${leg2.arrival})`,
      comfort: leg1.comfort === 'High' && leg2.comfort === 'High' ? 'High' : 'Medium',
      bookingUrl: leg2.bookingUrl || leg1.bookingUrl,
      fromStation: leg1.fromStation,
      toStation: leg2.toStation,
      legs: [
        {
          legNumber: 1,
          mode: leg1.mode,
          operator: leg1.provider,
          vehicleName: leg1.name,
          serviceNumber: leg1.trainNumber,
          fromStation: leg1.fromStation,
          toStation: leg1.toStation,
          departureTime: leg1.departure,
          arrivalTime: leg1.arrival,
          durationMinutes: leg1.durationMinutes,
          fare: leg1.fare * passengers,
          comfort: leg1.comfort,
          bookingUrl: leg1.bookingUrl,
        },
        {
          legNumber: 2,
          mode: leg2.mode,
          operator: leg2.provider,
          vehicleName: leg2.name,
          serviceNumber: leg2.trainNumber,
          fromStation: leg2.fromStation,
          toStation: leg2.toStation,
          departureTime: leg2.departure,
          arrivalTime: leg2.arrival,
          durationMinutes: leg2.durationMinutes,
          fare: leg2.fare * passengers,
          comfort: leg2.comfort,
          bookingUrl: leg2.bookingUrl,
        },
      ],
    };
  },

  /**
   * Format a 2-Hub Connecting route option
   */
  formatTwoHubOption(cr, originCity, destCity, passengers, idx) {
    const { hub1, hub2, leg1, leg2, leg3, totalDurationMinutes, totalFare } = cr;

    const totalHours = Math.floor(totalDurationMinutes / 60);
    const totalMins = totalDurationMinutes % 60;
    const durationStr = `${totalHours}h ${totalMins > 0 ? totalMins + 'm' : ''}`.trim();

    return {
      id: `twohub-${hub1.id}-${hub2.id}-${idx}`,
      type: 'multimodal',
      isConnecting: true,
      provider: `${leg1.provider} + ${leg2.provider} + ${leg3.provider}`,
      providerCode: 'multimodal',
      title: `${leg1.name} → ${leg2.name} → ${leg3.name}`,
      departure: leg1.departure,
      arrival: leg3.arrival,
      duration: durationStr,
      durationMinutes: totalDurationMinutes,
      estimatedFare: totalFare,
      costPerPassenger: Math.round(totalFare / passengers),
      transfers: 2,
      transferLocation: `Transfers via ${hub1.name} & ${hub2.name}`,
      firstTransport: `Leg 1: ${leg1.name} to ${hub1.name}`,
      secondTransport: `Leg 2: ${leg2.name} to ${hub2.name}`,
      thirdTransport: `Leg 3: ${leg3.name} to ${destCity.name}`,
      comfort: 'Medium',
      bookingUrl: leg1.bookingUrl,
      fromStation: leg1.fromStation,
      toStation: leg3.toStation,
      legs: [
        {
          legNumber: 1,
          mode: leg1.mode,
          operator: leg1.provider,
          vehicleName: leg1.name,
          serviceNumber: leg1.trainNumber,
          fromStation: leg1.fromStation,
          toStation: leg1.toStation,
          departureTime: leg1.departure,
          arrivalTime: leg1.arrival,
          fare: leg1.fare * passengers,
          bookingUrl: leg1.bookingUrl,
        },
        {
          legNumber: 2,
          mode: leg2.mode,
          operator: leg2.provider,
          vehicleName: leg2.name,
          serviceNumber: leg2.trainNumber,
          fromStation: leg2.fromStation,
          toStation: leg2.toStation,
          departureTime: leg2.departure,
          arrivalTime: leg2.arrival,
          fare: leg2.fare * passengers,
          bookingUrl: leg2.bookingUrl,
        },
        {
          legNumber: 3,
          mode: leg3.mode,
          operator: leg3.provider,
          vehicleName: leg3.name,
          serviceNumber: leg3.trainNumber,
          fromStation: leg3.fromStation,
          toStation: leg3.toStation,
          departureTime: leg3.departure,
          arrivalTime: leg3.arrival,
          fare: leg3.fare * passengers,
          bookingUrl: leg3.bookingUrl,
        },
      ],
    };
  },
};
