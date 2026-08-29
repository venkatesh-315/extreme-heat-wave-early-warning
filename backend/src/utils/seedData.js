/**
 * Curated Seed Dataset for ThermoGuard
 * Contains 40+ Indian Cities, Geographic Boundaries, Ward Profiles, Emergency Facilities, and Default Accounts
 */

const DEFAULT_USERS_DATA = [
  {
    name: 'Officer #4102',
    email: 'officer4102@gov.in',
    phone: '+91 98111 24102',
    password: 'officerPassword123',
    role: 'authority',
    title: 'Disaster Response Officer',
    department: 'SDMA / Municipal Disaster Control Command',
    avatar: 'OF',
    badge: 'Duty Officer',
    terminalAuthorized: true,
  },
  {
    name: 'Public User #8204',
    email: 'user8204@thermoguard.in',
    phone: '+91 98765 43210',
    password: 'citizenPassword123',
    role: 'citizen',
    title: 'Community Resident',
    department: 'Civic Safety Network',
    avatar: 'PU',
    badge: 'Verified Access',
    alertsOptIn: true,
  },
  {
    name: 'Admin Chief Controller',
    email: 'admin@thermoguard.gov.in',
    phone: '+91 99000 00001',
    password: 'adminPassword123',
    role: 'admin',
    title: 'System Administrator & Meteorological Lead',
    department: 'NDMA Technical Control Cell',
    avatar: 'AD',
    badge: 'Super Admin',
    terminalAuthorized: true,
  }
];

const CURATED_LOCATIONS_DATA = [
  // Rajasthan & NCR Heat Belt
  { id: 'raj-phl', name: 'Phalodi', district: 'Phalodi', state: 'Rajasthan', lat: 27.1306, lon: 72.3627, population: 49756, region: 'North', isHotspot: true },
  { id: 'raj-bmr', name: 'Barmer', district: 'Barmer', state: 'Rajasthan', lat: 25.7521, lon: 71.3967, population: 100051, region: 'North', isHotspot: true },
  { id: 'raj-bkr', name: 'Bikaner', district: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lon: 73.3119, population: 644406, region: 'North', isHotspot: true },
  { id: 'raj-jpr', name: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, population: 3073350, region: 'North', isHotspot: true },
  { id: 'raj-jdh', name: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243, population: 1138300, region: 'North', isHotspot: true },
  { id: 'raj-chu', name: 'Churu', district: 'Churu', state: 'Rajasthan', lat: 28.2900, lon: 74.9600, population: 120147, region: 'North', isHotspot: true },
  { id: 'raj-sgr', name: 'Sri Ganganagar', district: 'Sri Ganganagar', state: 'Rajasthan', lat: 29.9038, lon: 73.8772, population: 250000, region: 'North', isHotspot: true },

  // Delhi NCR
  { id: 'del-del', name: 'New Delhi', district: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, population: 33000000, region: 'North', isHotspot: true },
  { id: 'del-ngf', name: 'Najafgarh (South West Delhi)', district: 'South West Delhi', state: 'Delhi', lat: 28.6092, lon: 76.9798, population: 906452, region: 'North', isHotspot: true },
  { id: 'ncr-ggn', name: 'Gurugram', district: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266, population: 1514085, region: 'North', isHotspot: true },
  { id: 'ncr-noi', name: 'Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910, population: 642381, region: 'North', isHotspot: true },

  // Gujarat
  { id: 'guj-ahm', name: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, population: 8450000, region: 'West', isHotspot: true },
  { id: 'guj-srt', name: 'Surat', district: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311, population: 6564000, region: 'West', isHotspot: false },
  { id: 'guj-rjk', name: 'Rajkot', district: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022, population: 1390640, region: 'West', isHotspot: true },
  { id: 'guj-knd', name: 'Kandla (Deendayal Port)', district: 'Kutch', state: 'Gujarat', lat: 23.0333, lon: 70.2167, population: 157390, region: 'West', isHotspot: true },

  // Maharashtra & Vidarbha
  { id: 'mah-ngp', name: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, population: 2497870, region: 'Central', isHotspot: true },
  { id: 'mah-chd', name: 'Chandrapur', district: 'Chandrapur', state: 'Maharashtra', lat: 19.9615, lon: 79.2961, population: 320379, region: 'Central', isHotspot: true },
  { id: 'mah-akp', name: 'Akola', district: 'Akola', state: 'Maharashtra', lat: 20.7002, lon: 77.0082, population: 537489, region: 'Central', isHotspot: true },
  { id: 'mah-mum', name: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, population: 20667656, region: 'West', isHotspot: false },
  { id: 'mah-pun', name: 'Pune', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, population: 6834000, region: 'West', isHotspot: false },

  // Madhya Pradesh
  { id: 'mp-bpl', name: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, population: 1798218, region: 'Central', isHotspot: true },
  { id: 'mp-ind', name: 'Indore', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, population: 2167447, region: 'Central', isHotspot: true },
  { id: 'mp-gwl', name: 'Gwalior', district: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828, population: 1069276, region: 'Central', isHotspot: true },

  // Uttar Pradesh & Bihar
  { id: 'up-lko', name: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, population: 3678200, region: 'North', isHotspot: true },
  { id: 'up-kan', name: 'Kanpur', district: 'Kanpur Nagar', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319, population: 2920496, region: 'North', isHotspot: true },
  { id: 'up-var', name: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, population: 1432280, region: 'North', isHotspot: true },
  { id: 'up-pry', name: 'Prayagraj (Allahabad)', district: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463, population: 1216719, region: 'North', isHotspot: true },
  { id: 'bih-pat', name: 'Patna', district: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, population: 1684222, region: 'East', isHotspot: true },
  { id: 'bih-gay', name: 'Gaya', district: 'Gaya', state: 'Bihar', lat: 24.7914, lon: 85.0002, population: 470839, region: 'East', isHotspot: true },

  // Eastern & Coastal
  { id: 'wb-kol', name: 'Kolkata', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, population: 14850066, region: 'East', isHotspot: true },
  { id: 'odi-bhu', name: 'Bhubaneswar', district: 'Khurda', state: 'Odisha', lat: 20.2961, lon: 85.8245, population: 1003187, region: 'East', isHotspot: true },
  { id: 'odi-ttg', name: 'Titlagarh (Balangir)', district: 'Balangir', state: 'Odisha', lat: 20.2962, lon: 83.1492, population: 31256, region: 'East', isHotspot: true },

  // Southern & Deccan Plateau
  { id: 'tel-hyd', name: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, population: 10534418, region: 'South', isHotspot: true },
  { id: 'tel-rmg', name: 'Ramagundam', district: 'Peddapalli', state: 'Telangana', lat: 18.7618, lon: 79.5186, population: 229644, region: 'South', isHotspot: true },
  { id: 'ap-vzg', name: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, population: 2035922, region: 'South', isHotspot: true },
  { id: 'ap-vjw', name: 'Vijayawada', district: 'NTR', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, population: 1048240, region: 'South', isHotspot: true },
  { id: 'ap-knl', name: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373, population: 460184, region: 'South', isHotspot: true },
  { id: 'tn-che', name: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, population: 10971108, region: 'South', isHotspot: true },
  { id: 'kar-blr', name: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', lat: 12.9716, lon: 77.5946, population: 12327000, region: 'South', isHotspot: false },
  { id: 'kar-klb', name: 'Kalaburagi (Gulbarga)', district: 'Kalaburagi', state: 'Karnataka', lat: 17.3297, lon: 76.8343, population: 533587, region: 'South', isHotspot: true },
];

const HISTORICAL_MORTALITY_DATA = [
  { year: 2019, deaths: 1270, avgMaxTemp: 43.8, peakWbgt: 33.4, severeSpells: 8 },
  { year: 2020, deaths: 1114, avgMaxTemp: 42.9, peakWbgt: 32.8, severeSpells: 5 },
  { year: 2021, deaths: 1380, avgMaxTemp: 43.5, peakWbgt: 33.2, severeSpells: 7 },
  { year: 2022, deaths: 1845, avgMaxTemp: 45.2, peakWbgt: 34.6, severeSpells: 14 },
  { year: 2023, deaths: 1998, avgMaxTemp: 44.9, peakWbgt: 34.2, severeSpells: 12 },
  { year: 2024, deaths: 2360, avgMaxTemp: 45.8, peakWbgt: 35.1, severeSpells: 18 },
  { year: 2025, deaths: 2610, avgMaxTemp: 46.1, peakWbgt: 35.4, severeSpells: 21 },
];

const SUMMER_2026_METEOROLOGY = {
  seasonTitle: 'Summer 2026 Seasonal Heatwave Outlook',
  duration: 'April – June 2026',
  anomalyProjection: '+1.5°C to +3.5°C Above Long-Period Average (LPA)',
  activeHeatwaveSubdivisions: [
    'West Rajasthan (Phalodi, Barmer, Bikaner)',
    'East Rajasthan & Haryana-Delhi',
    'Vidarbha & Marathwada (Nagpur, Chandrapur, Akola)',
    'West & East Madhya Pradesh',
    'Gangetic West Bengal & Coastal Odisha',
    'Telangana & Rayalaseema (Hyderabad, Ramagundam, Kurnool)',
    'Indo-Gangetic Plains (UP & Bihar)',
  ],
  heatActionThresholds: {
    plainsMaxTemp: 40.0,
    coastalMaxTemp: 37.0,
    hillsMaxTemp: 30.0,
    wbgtDanger: 32.0,
    wbgtLethal: 35.0,
  },
};

/**
 * Generate Ward microclimate records for a location
 */
function generateWardsForLocation(location, baseTemp = 43.5, baseHumidity = 30) {
  const zoneOffsets = [
    { name: 'Ward 1 · Central Commercial & Transit Hub', offsetLat: 0.015, offsetLon: -0.012, type: 'Dense Concrete / Urban Heat Island', pop: '95,000' },
    { name: 'Ward 2 · North Industrial & Labour Colony', offsetLat: 0.045, offsetLon: 0.022, type: 'Industrial Tin-Sheds & High Exposure', pop: '140,000' },
    { name: 'Ward 3 · East Residential & Slum Cluster', offsetLat: -0.022, offsetLon: 0.048, type: 'Informal Settlements / Low Green Cover', pop: '110,000' },
    { name: 'Ward 4 · South Green Institutional Area', offsetLat: -0.052, offsetLon: 0.012, type: 'High Canopy & Parkland Buffer', pop: '60,000' },
    { name: 'Ward 5 · West High-Density Old City', offsetLat: 0.012, offsetLon: -0.058, type: 'Narrow Lanes & Trapped Heat', pop: '175,000' },
    { name: 'Ward 6 · North-East Peri-Urban Sector', offsetLat: 0.038, offsetLon: 0.042, type: 'Open Brick Kilns & Unpaved Land', pop: '85,000' },
  ];

  const {
    calculateWBGT,
    calculateHeatIndex,
    calculateUTCI,
    calculateMortalityRisk,
    getStressCategory,
    getImdWarningLevel
  } = require('../services/thermalCalculationService');

  return zoneOffsets.map((z, i) => {
    const isUhi = i === 0 || i === 1 || i === 4;
    const tempDelta = isUhi ? 1.8 + Math.random() * 1.5 : -1.2 + Math.random() * 0.8;
    const humDelta = isUhi ? -4 : 6;

    const t = parseFloat((baseTemp + tempDelta).toFixed(1));
    const rh = Math.max(12, Math.min(90, Math.round(baseHumidity + humDelta)));
    const w = 2.5;
    const sr = 900;

    const wbgt = calculateWBGT(t, rh, w, sr);
    const hi = calculateHeatIndex(t, rh);
    const utci = calculateUTCI(t, rh, w, sr);
    const risk = calculateMortalityRisk(wbgt, utci, hi, t);

    return {
      wardId: `ward-${i + 1}`,
      name: z.name,
      microclimateType: z.type,
      population: z.pop,
      coordinates: {
        lat: location.lat + z.offsetLat,
        lon: location.lon + z.offsetLon,
      },
      temperature: t,
      humidity: rh,
      wbgt: parseFloat(wbgt.toFixed(1)),
      heatIndex: parseFloat(hi.toFixed(1)),
      utci: parseFloat(utci.toFixed(1)),
      mortalityRisk: risk,
      stressCategory: getStressCategory(wbgt, t),
      imdAlert: getImdWarningLevel(t, wbgt, location.lat),
      coolingCenters: isUhi ? 3 : 1,
      hospitals: isUhi ? 2 : 1,
      waterKiosks: isUhi ? 8 : 4,
    };
  });
}

/**
 * Generate Emergency Facilities for a location
 */
function generateEmergencyResourcesForLocation(location) {
  const cleanName = location.name.split(',')[0].replace(/\(.*\)/, '').trim();

  const templates = [
    {
      name: `District Civil Hospital & Heat-Stroke Centre, ${cleanName}`,
      type: 'hospital',
      categoryLabel: 'District Civil Hospital (Dedicated Heat ICU)',
      offsetLat: 0.012,
      offsetLon: -0.008,
      phone: '108 / 011-23348121',
      address: `Civil Hospital Road, ${cleanName}`,
      icuReady: true,
      coolingAmenity: 'Rapid Immersion Cooling Tubs, IV Saline Reserves',
      capacity: '180 Beds · 18 ICU Heat-Stroke Beds',
    },
    {
      name: `${cleanName} Medical College & Associated Hospital`,
      type: 'hospital',
      categoryLabel: 'Apex Teaching Hospital & 24x7 Casualty',
      offsetLat: -0.018,
      offsetLon: 0.014,
      phone: '102 / 108',
      address: `Medical College Campus, ${cleanName}`,
      icuReady: true,
      coolingAmenity: 'Central AC Emergency Triage & Ice-Bath Protocols',
      capacity: '320 Beds · 30 ICU Beds',
    },
    {
      name: `ESIC Model Hospital & Occupational Heat Ward`,
      type: 'hospital',
      categoryLabel: 'Workers & Industrial Emergency Hospital',
      offsetLat: 0.025,
      offsetLon: 0.021,
      phone: '1800-11-2526',
      address: `Industrial Area Phase II, ${cleanName}`,
      icuReady: true,
      coolingAmenity: 'ORS Distribution Hub & Rehydration Ward',
      capacity: '120 Beds',
    },
    {
      name: `Municipal 24/7 Air-Cooled Shelter (Rain Basera)`,
      type: 'shelter',
      categoryLabel: 'Cooling Shelter & Relief Centre',
      offsetLat: 0.006,
      offsetLon: 0.009,
      phone: '1077 (Emergency Helpline)',
      address: `Near Railway Station Bus Terminal, ${cleanName}`,
      icuReady: false,
      coolingAmenity: 'High-Capacity Air Coolers, RO Water, Free Mattresses',
      capacity: '200 Persons (Free Entry)',
    },
    {
      name: `Red Cross & Rotary Community AC Hall`,
      type: 'shelter',
      categoryLabel: 'Vulnerable & Senior Citizens Cool Zone',
      offsetLat: 0.019,
      offsetLon: -0.022,
      phone: '104 (Health Information)',
      address: `Red Cross Bhawan, Red Cross Road, ${cleanName}`,
      icuReady: false,
      coolingAmenity: 'Fully Air-Conditioned Hall, Doctor & Paramedic on site',
      capacity: '150 Persons',
    },
    {
      name: `Jal Board & Municipal Cold Drinking Water Kiosk (Pyaau)`,
      type: 'water',
      categoryLabel: 'Free Chilled Drinking Water & ORS Booth',
      offsetLat: 0.003,
      offsetLon: 0.004,
      phone: '1916 (Jal Board)',
      address: `Central Chowk & Auto Stand, ${cleanName}`,
      icuReady: false,
      coolingAmenity: 'Continuous Chilled RO Water, Free ORS Packets',
      capacity: 'Unlimited Public Dispenser',
    },
  ];

  return templates.map((item, idx) => {
    const lat = location.lat + item.offsetLat;
    const lon = location.lon + item.offsetLon;
    const dLat = (lat - location.lat) * 111;
    const dLon = (lon - location.lon) * 111 * Math.cos((location.lat * Math.PI) / 180);
    const distKm = parseFloat(Math.sqrt(dLat * dLat + dLon * dLon).toFixed(1));

    return {
      name: item.name,
      type: item.type,
      categoryLabel: item.categoryLabel,
      coordinates: { lat, lon },
      distanceKm: distKm,
      address: item.address,
      phone: item.phone,
      status: 'OPEN 24/7',
      icuReady: item.icuReady,
      coolingAmenity: item.coolingAmenity,
      capacity: item.capacity,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
    };
  });
}

module.exports = {
  DEFAULT_USERS_DATA,
  CURATED_LOCATIONS_DATA,
  HISTORICAL_MORTALITY_DATA,
  SUMMER_2026_METEOROLOGY,
  generateWardsForLocation,
  generateEmergencyResourcesForLocation,
};
