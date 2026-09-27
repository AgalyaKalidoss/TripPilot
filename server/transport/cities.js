/**
 * TripPilot AI — India Cities & Transport Hubs Registry
 * Normalized locations, aliases, and transport hub classifications.
 */

export const CITIES = [
  // Major Metros & National Hubs
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 1,
    railCodes: ['MAS', 'MS', 'TBM'],
    aliases: ['madras', 'chenai', 'chennai central', 'chennai egmore'],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    isHub: true,
    hubTier: 1,
    railCodes: ['SBC', 'YPR', 'SMVB'],
    aliases: ['bangalore', 'bangalore city', 'bengaluru city', 'yesvantpur'],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    isHub: true,
    hubTier: 1,
    railCodes: ['HYB', 'SC', 'KCG'],
    aliases: ['secunderabad', 'hyderabad deccan', 'kachiguda', 'cyberabad'],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    isHub: true,
    hubTier: 1,
    railCodes: ['CSMT', 'BCT', 'BDTS', 'LTT'],
    aliases: ['bombay', 'mumbai cst', 'bandra', 'lokmanya tilak', 'dadar'],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi NCR',
    isHub: true,
    hubTier: 1,
    railCodes: ['NDLS', 'DLI', 'NZM', 'ANVT'],
    aliases: ['new delhi', 'delhi ncr', 'old delhi', 'nizamuddin', 'anand vihar', 'gurugram', 'noida'],
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    isHub: true,
    hubTier: 2,
    railCodes: ['PUNE'],
    aliases: ['poona', 'pune junction'],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    isHub: true,
    hubTier: 1,
    railCodes: ['HWH', 'SDAH', 'KOAA'],
    aliases: ['calcutta', 'howrah', 'sealdah'],
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    isHub: true,
    hubTier: 2,
    railCodes: ['ADI'],
    aliases: ['amdavad', 'ahmedabad junction'],
  },
  {
    id: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    isHub: true,
    hubTier: 2,
    railCodes: ['ERS', 'ERN'],
    aliases: ['cochin', 'ernakulam', 'ernakulam junction', 'ernakulam town'],
  },

  // Regional Hubs & Key Railway Cities
  {
    id: 'madurai',
    name: 'Madurai',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 2,
    railCodes: ['MDU'],
    aliases: ['madurai junction'],
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 2,
    railCodes: ['CBE'],
    aliases: ['kovai', 'coimbatore junction', 'coimbatore north'],
  },
  {
    id: 'salem',
    name: 'Salem',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 2,
    railCodes: ['SA'],
    aliases: ['salem junction'],
  },
  {
    id: 'erode',
    name: 'Erode',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 2,
    railCodes: ['ED'],
    aliases: ['erode junction'],
  },
  {
    id: 'tirunelveli',
    name: 'Tirunelveli',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 2,
    railCodes: ['TEN'],
    aliases: ['nellai', 'tirunelveli junction'],
  },
  {
    id: 'trichy',
    name: 'Trichy',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 2,
    railCodes: ['TPJ'],
    aliases: ['tiruchirappalli', 'tiruchi', 'trichy junction'],
  },
  {
    id: 'vijayawada',
    name: 'Vijayawada',
    state: 'Andhra Pradesh',
    isHub: true,
    hubTier: 2,
    railCodes: ['BZA'],
    aliases: ['bezawada', 'vijayawada junction'],
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    isHub: true,
    hubTier: 2,
    railCodes: ['VSKP'],
    aliases: ['vizag', 'waltair'],
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    state: 'Maharashtra',
    isHub: true,
    hubTier: 2,
    railCodes: ['NGP'],
    aliases: ['nagpur junction'],
  },
  {
    id: 'bhopal',
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    isHub: true,
    hubTier: 2,
    railCodes: ['BPL', 'RKMP'],
    aliases: ['rani kamlapati', 'habibganj'],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    isHub: true,
    hubTier: 2,
    railCodes: ['JP'],
    aliases: ['pink city', 'jaipur junction'],
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    isHub: true,
    hubTier: 2,
    railCodes: ['LKO', 'LJN'],
    aliases: ['lucknow charbagh'],
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    state: 'Punjab & Haryana',
    isHub: true,
    hubTier: 2,
    railCodes: ['CDG'],
    aliases: ['chandigarh junction', 'mohali'],
  },
  {
    id: 'thiruvananthapuram',
    name: 'Thiruvananthapuram',
    state: 'Kerala',
    isHub: true,
    hubTier: 2,
    railCodes: ['TVC'],
    aliases: ['trivandrum', 'trivandrum central'],
  },
  {
    id: 'kozhikode',
    name: 'Kozhikode',
    state: 'Kerala',
    isHub: true,
    hubTier: 3,
    railCodes: ['CLT'],
    aliases: ['calicut'],
  },

  // Regional Towns & Smaller Cities (Connecting Spoke Cities)
  {
    id: 'sivakasi',
    name: 'Sivakasi',
    state: 'Tamil Nadu',
    isHub: false,
    hubTier: 3,
    railCodes: ['SVKS'],
    nearestHubs: ['madurai', 'tirunelveli'],
    aliases: ['sivakasi town', 'sivakasi railway station'],
  },
  {
    id: 'virudhunagar',
    name: 'Virudhunagar',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 3,
    railCodes: ['VPT'],
    aliases: ['virudhunagar junction'],
  },
  {
    id: 'dindigul',
    name: 'Dindigul',
    state: 'Tamil Nadu',
    isHub: true,
    hubTier: 3,
    railCodes: ['DG'],
    aliases: ['dindigul junction'],
  },
  {
    id: 'karur',
    name: 'Karur',
    state: 'Tamil Nadu',
    isHub: false,
    hubTier: 3,
    railCodes: ['KRR'],
    nearestHubs: ['trichy', 'erode'],
    aliases: ['karur junction'],
  },
  {
    id: 'thanjavur',
    name: 'Thanjavur',
    state: 'Tamil Nadu',
    isHub: false,
    hubTier: 3,
    railCodes: ['TJ'],
    nearestHubs: ['trichy'],
    aliases: ['tanjore'],
  },
  {
    id: 'vellore',
    name: 'Vellore',
    state: 'Tamil Nadu',
    isHub: false,
    hubTier: 3,
    railCodes: ['KPD'],
    nearestHubs: ['chennai', 'bengaluru'],
    aliases: ['katpadi', 'vellore town'],
  },
  {
    id: 'hosur',
    name: 'Hosur',
    state: 'Tamil Nadu',
    isHub: false,
    hubTier: 3,
    railCodes: ['HSRA'],
    nearestHubs: ['bengaluru', 'salem'],
    aliases: ['hosur town'],
  },
  {
    id: 'mysuru',
    name: 'Mysuru',
    state: 'Karnataka',
    isHub: true,
    hubTier: 2,
    railCodes: ['MYS'],
    aliases: ['mysore', 'mysore junction'],
  },
  {
    id: 'hubballi',
    name: 'Hubballi',
    state: 'Karnataka',
    isHub: true,
    hubTier: 2,
    railCodes: ['UBL'],
    aliases: ['hubli', 'hubballi junction'],
  },
  {
    id: 'warangal',
    name: 'Warangal',
    state: 'Telangana',
    isHub: false,
    hubTier: 3,
    railCodes: ['WL', 'KZJ'],
    nearestHubs: ['hyderabad', 'vijayawada'],
    aliases: ['kazipet'],
  },
  {
    id: 'guntur',
    name: 'Guntur',
    state: 'Andhra Pradesh',
    isHub: false,
    hubTier: 3,
    railCodes: ['GNT'],
    nearestHubs: ['vijayawada'],
    aliases: ['guntur junction'],
  },
  {
    id: 'tirupati',
    name: 'Tirupati',
    state: 'Andhra Pradesh',
    isHub: true,
    hubTier: 2,
    railCodes: ['TPTY', 'RU'],
    aliases: ['renigunta'],
  },
  {
    id: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    isHub: true,
    hubTier: 2,
    railCodes: ['AGC', 'AF'],
    aliases: ['agra cantt', 'agra fort'],
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    isHub: true,
    hubTier: 2,
    railCodes: ['BSB', 'DDU'],
    aliases: ['banaras', 'kashi', 'mughalsarai', 'pt deen dayal upadhyaya'],
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    isHub: true,
    hubTier: 2,
    railCodes: ['MAO', 'KRMI'],
    aliases: ['madgaon', 'panaji', 'karmali', 'vasco'],
  },
];

/**
 * Normalize and find matching city from user text input
 */
export function normalizeCityName(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const cleaned = rawInput.trim().toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');

  if (!cleaned) return null;

  // Exact name or ID match
  const exact = CITIES.find(
    (c) => c.name.toLowerCase() === cleaned || c.id === cleaned
  );
  if (exact) return exact;

  // Alias exact match
  const aliasMatch = CITIES.find((c) =>
    c.aliases.some((a) => a.toLowerCase() === cleaned)
  );
  if (aliasMatch) return aliasMatch;

  // Rail code match
  const railMatch = CITIES.find((c) =>
    c.railCodes?.some((rc) => rc.toLowerCase() === cleaned)
  );
  if (railMatch) return railMatch;

  // Substring match (e.g. "Chennai Central" -> Chennai, "Bengaluru City" -> Bengaluru)
  const substringMatch = CITIES.find(
    (c) => cleaned.includes(c.name.toLowerCase()) ||
           c.aliases.some((a) => cleaned.includes(a.toLowerCase()))
  );
  if (substringMatch) return substringMatch;

  // Fallback: return capitalized cleaned string
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return {
    id: cleaned.replace(/\s+/g, '_'),
    name: capitalized,
    state: 'India',
    isHub: false,
    hubTier: 3,
    aliases: [cleaned],
  };
}
