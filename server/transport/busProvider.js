/**
 * TripPilot AI — Official Bus Provider Adapter
 * Returns structured bus transportation options with verified official provider links.
 */

export const busProvider = {
  name: 'RedBus & State Express (SETC/TNSTC)',
  code: 'bus',
  defaultBookingUrl: 'https://www.redbus.in',

  /**
   * Search available bus options between corridors
   * @param {Object} query - origin, destination, date, passengers
   */
  async searchBuses({ from, to, date, passengers = 1 }) {
    const origin = (from || 'Chennai').trim();
    const destination = (to || 'Coimbatore').trim();

    const bookingUrl = `https://www.redbus.in`;

    const schedules = [
      {
        operator: 'IntrCity SmartBus',
        busType: 'AC Sleeper 2+1 (Multi-Axle)',
        departureTime: '10:30 PM',
        arrivalTime: '06:45 AM',
        durationMinutes: 495,
        baseFare: 750,
        comfort: 'High',
        boardingPoint: `${origin} Koyambedu / CMBT`,
        dropPoint: `${destination} Gandhipuram`,
      },
      {
        operator: 'SETC / State Express',
        busType: 'Ultra Deluxe Non-AC (2+2)',
        departureTime: '08:00 PM',
        arrivalTime: '05:30 AM',
        durationMinutes: 570,
        baseFare: 420,
        comfort: 'Economy',
        boardingPoint: `${origin} Kilambakkam KCBT`,
        dropPoint: `${destination} Omni Bus Stand`,
      },
      {
        operator: 'KPN Travels',
        busType: 'Volvo AC Semi-Sleeper (2+2)',
        departureTime: '01:30 PM',
        arrivalTime: '10:15 PM',
        durationMinutes: 525,
        baseFare: 680,
        comfort: 'Medium',
        boardingPoint: `${origin} Guindy / Ashok Pillar`,
        dropPoint: `${destination} Hope College`,
      },
    ];

    return schedules.map((item, idx) => {
      const estimatedFare = item.baseFare * passengers;
      const hours = Math.floor(item.durationMinutes / 60);
      const mins = item.durationMinutes % 60;

      return {
        id: `bus-${idx}`,
        type: 'bus',
        provider: `${item.operator} (via RedBus / Official Portal)`,
        providerCode: 'redbus',
        title: `${item.operator} — ${item.busType}`,
        operator: item.operator,
        busType: item.busType,
        departure: item.departureTime,
        arrival: item.arrivalTime,
        duration: `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim(),
        durationMinutes: item.durationMinutes,
        estimatedFare,
        costPerPassenger: item.baseFare,
        transfers: 0,
        comfort: item.comfort,
        boardingPoint: item.boardingPoint,
        dropPoint: item.dropPoint,
        bookingUrl: bookingUrl,
        providerDisclaimer: 'Seat availability and dynamic surge fares apply on official portal.',
        legs: [
          {
            mode: 'bus',
            operator: item.operator,
            vehicleName: item.busType,
            fromStation: item.boardingPoint,
            toStation: item.dropPoint,
            departureTime: item.departureTime,
            arrivalTime: item.arrivalTime,
            durationMinutes: item.durationMinutes,
            cost: estimatedFare,
            comfort: item.comfort,
            providerUrl: bookingUrl,
          },
        ],
      };
    });
  },
};
