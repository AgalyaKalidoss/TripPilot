/**
 * TripPilot AI — Intelligent Travel Planning Engine
 * Integrates Graph Route Engine to provide verified direct & multi-leg routes.
 */

import { routeEngine } from './transport/routeEngine.js';

export async function generateTravelPlans(constraints) {
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
  } = constraints;

  // Query graph route engine
  const routeResult = await routeEngine.findRoutes({
    from,
    to,
    date,
    passengers,
    budget,
    preference,
    transport,
    comfort,
  });

  const options = routeResult.options || [];

  // Attach route metadata to the options array for backward compatibility
  options.routeType = routeResult.routeType || 'direct';
  options.viaHubs = routeResult.viaHubs || [];
  options.explanation = routeResult.explanation || '';
  options.origin = routeResult.origin;
  options.destination = routeResult.destination;

  return options;
}
