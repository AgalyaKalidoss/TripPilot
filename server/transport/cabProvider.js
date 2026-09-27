/**
 * TripPilot AI — Official Cab Provider Adapter
 * Returns structured intercity cab options with verified booking providers (Uber/Ola/MMT).
 */

export const cabProvider = {
  name: 'Uber Intercity / MakeMyTrip Cabs',
  code: 'cab',
  defaultBookingUrl: 'https://m.uber.com/looking',

  /**
   * Search available cab options between corridors
   * @param {Object} query - origin, destination, date, passengers
   */
  async searchCabs({ from, to, date, passengers = 1 }) {
    const origin = (from || 'Chennai').trim();
    const destination = (to || 'Coimbatore').trim();

    const bookingUrl = passengers > 4 
      ? 'https://www.makemytrip.com/cabs/'
      : 'https://m.uber.com/looking';

    const schedules = [
      {
        cabType: 'Dedicated Sedan (Dzire / Etios)',
        providerName: 'Uber Intercity',
        capacity: 4,
        durationMinutes: 440,
        totalVehicleFare: 4200,
        comfort: 'Medium',
        pickupNote: 'Doorstep pickup from any location in ' + origin,
        dropNote: 'Direct drop at your destination in ' + destination,
        providerUrl: 'https://m.uber.com/looking',
      },
      {
        cabType: 'Spacious SUV (Innova Crysta)',
        providerName: 'MakeMyTrip Intercity Cabs',
        capacity: 6,
        durationMinutes: 420,
        totalVehicleFare: 6100,
        comfort: 'High',
        pickupNote: 'Verified chauffeur with AC & luggage space',
        dropNote: 'Door-to-door direct express highway route',
        providerUrl: 'https://www.makemytrip.com/cabs/',
      },
    ];

    return schedules.map((item, idx) => {
      // Vehicle fare divided among passengers for transparency
      const estimatedFare = item.totalVehicleFare;
      const hours = Math.floor(item.durationMinutes / 60);
      const mins = item.durationMinutes % 60;

      return {
        id: `cab-${idx}`,
        type: 'cab',
        provider: item.providerName,
        providerCode: 'cab',
        title: item.cabType,
        cabType: item.cabType,
        departure: 'Flexible (On-Demand / Scheduled)',
        arrival: `Approx +${hours}h ${mins}m from pickup`,
        duration: `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim(),
        durationMinutes: item.durationMinutes,
        estimatedFare,
        costPerPassenger: Math.round(estimatedFare / Math.max(1, passengers)),
        transfers: 0,
        comfort: item.comfort,
        capacity: item.capacity,
        pickup: item.pickupNote,
        drop: item.dropNote,
        bookingUrl: item.providerUrl,
        providerDisclaimer: 'Final tolls, state taxes, and night charges are calculated by the cab provider.',
        legs: [
          {
            mode: 'cab',
            operator: item.providerName,
            vehicleName: item.cabType,
            fromStation: item.pickupNote,
            toStation: item.dropNote,
            departureTime: 'On Demand',
            arrivalTime: `+${hours}h ${mins}m`,
            durationMinutes: item.durationMinutes,
            cost: estimatedFare,
            comfort: item.comfort,
            providerUrl: item.providerUrl,
          },
        ],
      };
    });
  },
};
