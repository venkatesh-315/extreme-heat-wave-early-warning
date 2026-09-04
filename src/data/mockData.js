// ============================================================
// Real-Time Indian Climatological Dataset & NDMA HAP Standards
// Extreme Heatwave Early Warning & Emergency Response System
// ============================================================

import { CURATED_INDIAN_LOCATIONS } from '../services/geocodingService.js';
import {
  calculateHeatIndex,
  calculateWBGT,
  calculateUTCI,
  calculateMortalityRisk,
  getStressCategory,
  getImdWarningLevel,
} from '../services/weatherService.js';

export const INDIAN_CITIES = CURATED_INDIAN_LOCATIONS;

/**
 * Real-Time Reference Climatology & Operational Standards
 */
export const REALTIME_METEOROLOGY = {
  seasonTitle: 'National Heatwave & Real-Time Biometeorological Outlook',
  duration: 'Continuous Live Synoptic Monitoring',
  anomalyProjection: 'Live Thermal Stress Anomalies Against Long-Period Average (LPA)',
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

// Backward-compatibility alias
export const SUMMER_2026_METEOROLOGY = REALTIME_METEOROLOGY;

/**
 * Historical Heatwave Mortality Trend (India, 2018–Present)
 */
export const HISTORICAL_MORTALITY = [
  { year: 2019, deaths: 1270, avgMaxTemp: 43.8, peakWbgt: 33.4, severeSpells: 8 },
  { year: 2020, deaths: 1114, avgMaxTemp: 42.9, peakWbgt: 32.8, severeSpells: 5 },
  { year: 2021, deaths: 1380, avgMaxTemp: 43.5, peakWbgt: 33.2, severeSpells: 7 },
  { year: 2022, deaths: 1845, avgMaxTemp: 45.2, peakWbgt: 34.6, severeSpells: 14 },
  { year: 2023, deaths: 1998, avgMaxTemp: 44.9, peakWbgt: 34.2, severeSpells: 12 },
  { year: 2024, deaths: 2360, avgMaxTemp: 45.8, peakWbgt: 35.1, severeSpells: 18 },
  { year: 2025, deaths: 2610, avgMaxTemp: 46.1, peakWbgt: 35.4, severeSpells: 21 },
];

// State-level key meteorological districts and microclimate zones across India
export const STATE_DISTRICT_REGIONS = {
  rajasthan: [
    { name: 'Phalodi District (Extreme Desert Heat Hub)', shortName: 'Phalodi', type: 'Arid Sand Dunes & Extreme Solar Radiation', lat: 27.1311, lon: 72.3639, tempDelta: 3.5, humDelta: -12, pop: '50,000' },
    { name: 'Jaipur District (State Capital)', shortName: 'Jaipur', type: 'Urban Concrete & Built-up Basin', lat: 26.9124, lon: 75.7873, tempDelta: 1.2, humDelta: -3, pop: '3,046,163' },
    { name: 'Churu District (Shekhawati Heat Belt)', shortName: 'Churu', type: 'Open Desert Plain & Severe Diurnal Swings', lat: 28.2900, lon: 74.9600, tempDelta: 3.2, humDelta: -10, pop: '120,157' },
    { name: 'Bikaner District (Thar Perimeter)', shortName: 'Bikaner', type: 'High Direct Radiation & Low Vegetation', lat: 28.0229, lon: 73.3119, tempDelta: 2.8, humDelta: -8, pop: '644,406' },
    { name: 'Jodhpur District (Sun City / Marwar)', shortName: 'Jodhpur', type: 'Rocky Terrain & Trapped Ambient Heat', lat: 26.2389, lon: 73.0243, tempDelta: 2.1, humDelta: -6, pop: '1,033,918' },
    { name: 'Barmer District (South-West Desert)', shortName: 'Barmer', type: 'Arid Flatlands & High Surface Heat', lat: 25.7532, lon: 71.3967, tempDelta: 2.9, humDelta: -9, pop: '100,051' },
    { name: 'Kota District (Hadoti Region)', shortName: 'Kota', type: 'Chambal Basin & Industrial Thermal Zone', lat: 25.2138, lon: 75.8648, tempDelta: 1.8, humDelta: 2, pop: '1,001,694' },
    { name: 'Jaisalmer District (Thar Core)', shortName: 'Jaisalmer', type: 'Deep Desert Sand Dunes', lat: 26.9157, lon: 70.9083, tempDelta: 3.4, humDelta: -11, pop: '65,471' },
  ],
  maharashtra: [
    { name: 'Nagpur District (Vidarbha Apex Heat Center)', shortName: 'Nagpur', type: 'Central Black Soil & Severe Radiant Heat', lat: 21.1458, lon: 79.0882, tempDelta: 2.8, humDelta: -6, pop: '2,940,000' },
    { name: 'Chandrapur District (Coal & Steel Basin)', shortName: 'Chandrapur', type: 'Heavy Industrial & Thermal Radiation', lat: 19.9615, lon: 79.2961, tempDelta: 3.4, humDelta: -5, pop: '320,379' },
    { name: 'Akola District (Marathwada/Vidarbha Plain)', shortName: 'Akola', type: 'Arid Agro Basin & Heat Wave Pocket', lat: 20.7002, lon: 77.0082, tempDelta: 2.9, humDelta: -7, pop: '537,489' },
    { name: 'Mumbai City & Suburban District', shortName: 'Mumbai', type: 'Coastal High-Humidity Heat Trap (Sweatbox)', lat: 19.0760, lon: 72.8777, tempDelta: -1.5, humDelta: 26, pop: '20,667,656' },
    { name: 'Pune District (Deccan Plateau)', shortName: 'Pune', type: 'Plateau Urban Heat Island', lat: 18.5204, lon: 73.8567, tempDelta: 0.2, humDelta: 6, pop: '6,834,000' },
    { name: 'Nashik District (Northern Maharashtra)', shortName: 'Nashik', type: 'Semi-Arid Agriculture Zone', lat: 19.9975, lon: 73.7898, tempDelta: 0.8, humDelta: 2, pop: '1,486,053' },
    { name: 'Chhatrapati Sambhajinagar District', shortName: 'Sambhajinagar', type: 'Marathwada Dry Basin', lat: 19.8762, lon: 75.3433, tempDelta: 2.0, humDelta: -4, pop: '1,175,116' },
    { name: 'Amravati District (Cotton Plain)', shortName: 'Amravati', type: 'Open Black Soil Heat Exposure', lat: 20.9374, lon: 77.7796, tempDelta: 2.5, humDelta: -5, pop: '647,057' },
  ],
  telangana: [
    { name: 'Hyderabad District (State Capital)', shortName: 'Hyderabad', type: 'Dense Urban Canopy & Granite Radiant Heat', lat: 17.3850, lon: 78.4867, tempDelta: 1.5, humDelta: -4, pop: '10,534,418' },
    { name: 'Ramagundam District (Godavari Valley)', shortName: 'Ramagundam', type: 'Thermal Power & Open-Cast Mining Zone', lat: 18.7618, lon: 79.5186, tempDelta: 3.2, humDelta: -6, pop: '229,644' },
    { name: 'Karimnagar District (Northern Telangana)', shortName: 'Karimnagar', type: 'Semi-Arid Agro Basin', lat: 18.4386, lon: 79.1288, tempDelta: 2.4, humDelta: -5, pop: '261,185' },
    { name: 'Warangal District (Kakatiya Plains)', shortName: 'Warangal', type: 'Plateau Urban Heat Island', lat: 17.9689, lon: 79.5941, tempDelta: 1.9, humDelta: -3, pop: '811,844' },
    { name: 'Nizamabad District (North-West Plains)', shortName: 'Nizamabad', type: 'Agricultural Heat Zone', lat: 18.6725, lon: 78.0941, tempDelta: 2.2, humDelta: -4, pop: '311,152' },
    { name: 'Khammam District (Eastern Valley)', shortName: 'Khammam', type: 'River Basin High Humidity Heat', lat: 17.2473, lon: 80.1514, tempDelta: 2.5, humDelta: 5, pop: '313,504' },
  ],
  gujarat: [
    { name: 'Ahmedabad District (Sabarmati Basin)', shortName: 'Ahmedabad', type: 'Dense Industrial & Urban Heat Island', lat: 23.0225, lon: 72.5714, tempDelta: 2.2, humDelta: -4, pop: '8,253,226' },
    { name: 'Surat District (Tapi Coastal Plain)', shortName: 'Surat', type: 'High Humidity Coastal Industrial Zone', lat: 21.1702, lon: 72.8311, tempDelta: -0.5, humDelta: 22, pop: '6,081,322' },
    { name: 'Vadodara District (Central Gujarat)', shortName: 'Vadodara', type: 'Chemical & Petrochemical Belt', lat: 22.3072, lon: 73.1812, tempDelta: 1.6, humDelta: 3, pop: '2,065,771' },
    { name: 'Rajkot District (Saurashtra Plateau)', shortName: 'Rajkot', type: 'Semi-Arid Open Plain', lat: 22.3039, lon: 70.8022, tempDelta: 2.4, humDelta: -5, pop: '1,390,640' },
    { name: 'Bhuj District (Kachchh Desert Margin)', shortName: 'Bhuj', type: 'Arid Salt Flats & High Heat Radiation', lat: 23.2420, lon: 69.6669, tempDelta: 2.9, humDelta: -8, pop: '213,514' },
    { name: 'Surendranagar District (Zalawad Zone)', shortName: 'Surendranagar', type: 'Cotton & Dryland Thermal Pocket', lat: 22.7284, lon: 71.6371, tempDelta: 2.7, humDelta: -6, pop: '253,606' },
  ],
  'uttar pradesh': [
    { name: 'Lucknow District (State Capital)', shortName: 'Lucknow', type: 'Awadh Gangetic Plain Heat Island', lat: 26.8467, lon: 80.9462, tempDelta: 1.6, humDelta: -2, pop: '3,678,200' },
    { name: 'Kanpur Nagar District (Industrial Ganga Hub)', shortName: 'Kanpur', type: 'Heavy Industrial & Dense Concrete Island', lat: 26.4499, lon: 80.3319, tempDelta: 2.2, humDelta: -3, pop: '2,920,496' },
    { name: 'Varanasi District (Eastern UP Basin)', shortName: 'Varanasi', type: 'Dense Riverfront Urban Heat Island', lat: 25.3176, lon: 82.9739, tempDelta: 2.1, humDelta: 4, pop: '1,432,280' },
    { name: 'Prayagraj District (Sangam Basin)', shortName: 'Prayagraj', type: 'River Confluence Radiant Heat Basin', lat: 25.4358, lon: 81.8463, tempDelta: 2.3, humDelta: 2, pop: '1,216,719' },
    { name: 'Banda District (Bundelkhand Heat Epicenter)', shortName: 'Banda', type: 'Rocky Plateau & Extreme Thermal Stress', lat: 25.4756, lon: 80.3347, tempDelta: 3.4, humDelta: -10, pop: '154,470' },
    { name: 'Jhansi District (Bundelkhand Frontier)', shortName: 'Jhansi', type: 'Rocky Dryland Heat Pocket', lat: 25.4484, lon: 78.5685, tempDelta: 3.0, humDelta: -8, pop: '505,693' },
    { name: 'Agra District (Yamuna Ravines)', shortName: 'Agra', type: 'Semi-Arid Dry Ravine Basin', lat: 27.1767, lon: 78.0081, tempDelta: 2.5, humDelta: -7, pop: '1,585,704' },
  ],
  bihar: [
    { name: 'Patna District (State Capital)', shortName: 'Patna', type: 'Ganga Valley Urban Heat Island', lat: 25.5941, lon: 85.1376, tempDelta: 1.8, humDelta: 3, pop: '1,684,222' },
    { name: 'Gaya District (Southern Bihar Thermal Pocket)', shortName: 'Gaya', type: 'Rocky Hills & Severe Dry Heat', lat: 24.7914, lon: 85.0002, tempDelta: 3.1, humDelta: -7, pop: '470,839' },
    { name: 'Bhagalpur District (Silk City)', shortName: 'Bhagalpur', type: 'Eastern Gangetic Plain', lat: 25.2425, lon: 86.9842, tempDelta: 2.0, humDelta: 6, pop: '410,210' },
    { name: 'Muzaffarpur District (North Bihar Plains)', shortName: 'Muzaffarpur', type: 'Alluvial Basin & Humid Heat', lat: 26.1226, lon: 85.3906, tempDelta: 1.4, humDelta: 8, pop: '393,724' },
    { name: 'Darbhanga District (Mithila Basin)', shortName: 'Darbhanga', type: 'Wetland Plain Humid Heat', lat: 26.1542, lon: 85.8918, tempDelta: 1.3, humDelta: 9, pop: '380,125' },
    { name: 'Purnia District (Kosi Floodplain)', shortName: 'Purnia', type: 'Eastern Agro Basin', lat: 25.7771, lon: 87.4753, tempDelta: 1.1, humDelta: 10, pop: '282,248' },
  ],
  'tamil nadu': [
    { name: 'Chennai District (State Capital)', shortName: 'Chennai', type: 'Coromandel Coastal Extreme Humidity Zone', lat: 13.0827, lon: 80.2707, tempDelta: 0.8, humDelta: 24, pop: '10,971,108' },
    { name: 'Madurai District (Vaigai Basin)', shortName: 'Madurai', type: 'Inland Thermal Plain & Intense Solar Heat', lat: 9.9252, lon: 78.1198, tempDelta: 2.4, humDelta: -4, pop: '1,465,625' },
    { name: 'Tiruchirappalli District (Cauvery Delta)', shortName: 'Trichy', type: 'Central Plain Heat Island', lat: 10.7905, lon: 78.7047, tempDelta: 2.2, humDelta: 2, pop: '916,857' },
    { name: 'Coimbatore District (Kongu Region)', shortName: 'Coimbatore', type: 'Western Plateau Industrial Zone', lat: 11.0168, lon: 76.9558, tempDelta: -1.2, humDelta: 6, pop: '1,601,438' },
    { name: 'Salem District (Steel Basin)', shortName: 'Salem', type: 'Surrounded Hills Trapped Heat', lat: 11.6643, lon: 78.1460, tempDelta: 2.3, humDelta: -3, pop: '829,267' },
    { name: 'Vellore District (Northern Inland)', shortName: 'Vellore', type: 'Rocky Basin Known Hotspot', lat: 12.9165, lon: 79.1325, tempDelta: 2.8, humDelta: 0, pop: '504,079' },
  ],
  karnataka: [
    { name: 'Bengaluru Urban District (State Capital)', shortName: 'Bengaluru', type: 'Plateau Urban Heat Island', lat: 12.9716, lon: 77.5946, tempDelta: 0.5, humDelta: 4, pop: '12,327,000' },
    { name: 'Kalaburagi District (Gulbarga Sun Hub)', shortName: 'Kalaburagi', type: 'North Karnataka Black Soil Heat Epicenter', lat: 17.3297, lon: 76.8343, tempDelta: 3.3, humDelta: -9, pop: '533,587' },
    { name: 'Ballari District (Mining & Heat Basin)', shortName: 'Ballari', type: 'Arid Rocky Mining Belt', lat: 15.1394, lon: 76.9214, tempDelta: 2.9, humDelta: -8, pop: '410,445' },
    { name: 'Raichur District (Doab Thermal Zone)', shortName: 'Raichur', type: 'Krishna-Tungabhadra Agro Plain', lat: 16.2076, lon: 77.3463, tempDelta: 3.1, humDelta: -7, pop: '234,073' },
    { name: 'Belagavi District (North-West Plains)', shortName: 'Belagavi', type: 'Western Border Transitional Zone', lat: 15.8497, lon: 74.4977, tempDelta: 0.4, humDelta: 2, pop: '610,350' },
    { name: 'Mysuru District (Southern Heritage Basin)', shortName: 'Mysuru', type: 'Southern Plateau Buffer', lat: 12.2958, lon: 76.6394, tempDelta: -0.6, humDelta: 6, pop: '920,550' },
  ],
  'madhya pradesh': [
    { name: 'Bhopal District (State Capital)', shortName: 'Bhopal', type: 'Malwa-Vindhyan Lake Basin Heat Island', lat: 23.2599, lon: 77.4126, tempDelta: 1.7, humDelta: -3, pop: '1,798,218' },
    { name: 'Indore District (Commercial Capital)', shortName: 'Indore', type: 'Malwa Plateau Urban Heat Island', lat: 22.7196, lon: 75.8577, tempDelta: 1.4, humDelta: -2, pop: '2,167,447' },
    { name: 'Gwalior District (Chambal Heat Ravines)', shortName: 'Gwalior', type: 'Northern Rocky Basin Thermal Zone', lat: 26.2183, lon: 78.1828, tempDelta: 3.0, humDelta: -8, pop: '1,069,276' },
    { name: 'Jabalpur District (Narmada Valley)', shortName: 'Jabalpur', type: 'Central Valley Basin', lat: 23.1815, lon: 79.9864, tempDelta: 2.1, humDelta: 1, pop: '1,268,848' },
    { name: 'Khajuraho / Chhatarpur (Bundelkhand)', shortName: 'Chhatarpur', type: 'Bundelkhand Arid Heat Pocket', lat: 24.8318, lon: 79.9199, tempDelta: 3.2, humDelta: -9, pop: '147,500' },
    { name: 'Ujjain District (Shipra Basin)', shortName: 'Ujjain', type: 'Malwa Agro Plain', lat: 23.1765, lon: 75.7885, tempDelta: 1.8, humDelta: -4, pop: '515,215' },
  ],
  'west bengal': [
    { name: 'Kolkata District (State Capital)', shortName: 'Kolkata', type: 'Hooghly Delta Extreme Humid Sweatbox', lat: 22.5726, lon: 88.3639, tempDelta: 1.2, humDelta: 24, pop: '14,850,066' },
    { name: 'Asansol District (Paschim Bardhaman)', shortName: 'Asansol', type: 'Rarh Region Coal & Steel Thermal Belt', lat: 23.6739, lon: 86.9524, tempDelta: 2.8, humDelta: -3, pop: '563,917' },
    { name: 'Howrah District (Industrial Riverside)', shortName: 'Howrah', type: 'Dense Industrial & Urban Heat Island', lat: 22.5958, lon: 88.2636, tempDelta: 1.4, humDelta: 22, pop: '1,077,070' },
    { name: 'Siliguri District (North Bengal Gateway)', shortName: 'Siliguri', type: 'Sub-Himalayan Terai Zone', lat: 26.7271, lon: 88.3953, tempDelta: -2.1, humDelta: 12, pop: '515,574' },
    { name: 'Malda District (Ganga-Mahananda Plains)', shortName: 'Malda', type: 'Mango Belt Agro Heat Zone', lat: 25.0094, lon: 88.1411, tempDelta: 1.9, humDelta: 14, pop: '379,129' },
    { name: 'Durgapur District (Steel Industrial City)', shortName: 'Durgapur', type: 'Damodar Basin Industrial Heat', lat: 23.5204, lon: 87.3119, tempDelta: 2.5, humDelta: 2, pop: '566,517' },
  ],
  odisha: [
    { name: 'Bhubaneswar District (State Capital)', shortName: 'Bhubaneswar', type: 'Coastal Plain & High Humidity Heat', lat: 20.2961, lon: 85.8245, tempDelta: 1.5, humDelta: 20, pop: '1,003,187' },
    { name: 'Titlagarh District (Balangir Heat Capital)', shortName: 'Titlagarh', type: 'KBK Region Extreme Continental Heat Hub', lat: 20.2962, lon: 83.1492, tempDelta: 3.8, humDelta: -10, pop: '31,256' },
    { name: 'Sambalpur District (Western Odisha Plain)', shortName: 'Sambalpur', type: 'Hirakud Basin Thermal Zone', lat: 21.4669, lon: 83.9812, tempDelta: 2.7, humDelta: -4, pop: '269,575' },
    { name: 'Cuttack District (Mahanadi River Delta)', shortName: 'Cuttack', type: 'Delta Alluvial Humid Heat', lat: 20.4625, lon: 85.8830, tempDelta: 1.3, humDelta: 22, pop: '606,007' },
    { name: 'Rourkela District (Sundargarh Steel City)', shortName: 'Rourkela', type: 'Industrial Valley Basin', lat: 22.2604, lon: 84.8536, tempDelta: 2.4, humDelta: -2, pop: '552,239' },
    { name: 'Jharsuguda District (Industrial Belt)', shortName: 'Jharsuguda', type: 'Coal & Power Thermal Belt', lat: 21.8554, lon: 84.0062, tempDelta: 3.1, humDelta: -6, pop: '175,000' },
  ],
  delhi: [
    { name: 'New Delhi Central District (Connaught Place / Ridge)', shortName: 'Central Delhi', type: 'Dense Built-up & High Pavement Heat', lat: 28.6139, lon: 77.2090, tempDelta: 1.8, humDelta: -4, pop: '582,320' },
    { name: 'Rohini District (North West Delhi)', shortName: 'Rohini', type: 'High Density Residential & Commercial Island', lat: 28.7166, lon: 77.1126, tempDelta: 2.3, humDelta: -5, pop: '3,656,539' },
    { name: 'Dwarka District (South West Delhi / Airport)', shortName: 'Dwarka', type: 'Open Tarmac & Wide Concrete Corridors', lat: 28.5921, lon: 77.0460, tempDelta: 1.5, humDelta: -3, pop: '2,292,958' },
    { name: 'Mayur Vihar District (East Delhi / Yamuna)', shortName: 'Mayur Vihar', type: 'Yamuna Floodplain Humid Heat Pocket', lat: 28.6083, lon: 77.2954, tempDelta: 1.1, humDelta: 8, pop: '1,709,346' },
    { name: 'Okhla Industrial Area (South East Delhi)', shortName: 'Okhla', type: 'Industrial Tin Roofs & Low Green Buffer', lat: 28.5300, lon: 77.2700, tempDelta: 2.7, humDelta: -6, pop: '1,500,000' },
    { name: 'Narela Industrial Sub-City (North Delhi)', shortName: 'Narela', type: 'Industrial Grain & Factory Open Exposure', lat: 28.8500, lon: 77.0900, tempDelta: 2.9, humDelta: -7, pop: '800,000' },
  ],
  punjab: [
    { name: 'Ludhiana District (Industrial Hub)', shortName: 'Ludhiana', type: 'Heavy Industrial & Dense Urban Heat Island', lat: 30.9010, lon: 75.8573, tempDelta: 2.2, humDelta: -2, pop: '1,618,879' },
    { name: 'Amritsar District (Majha Plain)', shortName: 'Amritsar', type: 'Border Plain Direct Solar Heat', lat: 31.6340, lon: 74.8723, tempDelta: 2.0, humDelta: 1, pop: '1,132,383' },
    { name: 'Bathinda District (Malwa Cotton Belt)', shortName: 'Bathinda', type: 'Semi-Arid Sandy Plain & Thermal Hub', lat: 30.2110, lon: 74.9455, tempDelta: 2.9, humDelta: -7, pop: '285,788' },
    { name: 'Patiala District (Eastern Punjab)', shortName: 'Patiala', type: 'Agricultural Alluvial Basin', lat: 30.3398, lon: 76.3869, tempDelta: 1.6, humDelta: 2, pop: '446,246' },
    { name: 'Jalandhar District (Doaba Plain)', shortName: 'Jalandhar', type: 'Manufacturing & Commercial Island', lat: 31.3260, lon: 75.5762, tempDelta: 1.8, humDelta: 0, pop: '862,414' },
  ],
  haryana: [
    { name: 'Hisar District (Thar Margin Heat Epicenter)', shortName: 'Hisar', type: 'Arid Sandy Plains & Extreme Heat Spells', lat: 29.1492, lon: 75.7217, tempDelta: 3.1, humDelta: -9, pop: '301,249' },
    { name: 'Gurugram District (Millennium City)', shortName: 'Gurugram', type: 'High-Rise Glass & Concrete Urban Heat Island', lat: 28.4595, lon: 77.0266, tempDelta: 2.0, humDelta: -3, pop: '876,969' },
    { name: 'Faridabad District (Industrial Corridor)', shortName: 'Faridabad', type: 'Dense Industrial & Automotive Manufacturing', lat: 28.4089, lon: 77.3178, tempDelta: 2.4, humDelta: -4, pop: '1,414,050' },
    { name: 'Rohtak District (Central Haryana)', shortName: 'Rohtak', type: 'Agricultural Heat Plain', lat: 28.8955, lon: 76.6066, tempDelta: 2.2, humDelta: -5, pop: '374,292' },
    { name: 'Karnal District (GT Road Belt)', shortName: 'Karnal', type: 'Paddy Belt Alluvial Plain', lat: 29.6857, lon: 76.9905, tempDelta: 1.5, humDelta: 3, pop: '286,827' },
  ],
};

/**
 * Generate Ward-level or State-District-level microclimate heat zones from live weather data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} baseTemp - Base air temperature
 * @param {number} baseHumidity - Base relative humidity
 * @param {number} solarRadiation - Solar radiation W/m2
 * @param {number} windSpeed - Wind speed km/h
 * @param {boolean} isState - Whether selected location is an Indian State / UT
 * @param {string} locationName - Name of location / state
 */
export function generateWardData(lat, lon, baseTemp = 36.0, baseHumidity = 50, solarRadiation = 750, windSpeed = 12, isState = false, locationName = '') {
  const centerLat = Number(lat);
  const centerLon = Number(lon);
  const normName = (locationName || '').toLowerCase().trim();

  // 1. Check if user selected an Indian State or region with mapped district networks
  let zoneConfigs = null;

  if (isState || normName.includes('state') || normName.includes('pradesh') || normName.includes('rajasthan') || normName.includes('maharashtra') || normName.includes('bengal') || normName.includes('nadu') || normName.includes('kashmir')) {
    for (const [stateKey, districts] of Object.entries(STATE_DISTRICT_REGIONS)) {
      if (normName.includes(stateKey) || stateKey.includes(normName)) {
        zoneConfigs = districts.map((d, i) => ({
          id: `dist-${stateKey}-${i + 1}`,
          name: d.name,
          shortName: d.shortName,
          type: d.type,
          lat: d.lat,
          lon: d.lon,
          tempDelta: d.tempDelta,
          humDelta: d.humDelta,
          pop: d.pop,
          isStateDistrict: true,
        }));
        break;
      }
    }
  }

  // 2. Default state fallback if state not in specific key list (e.g. Goa, Kerala, Assam, etc.)
  if (!zoneConfigs && isState) {
    zoneConfigs = [
      { id: 'st-d1', name: `${locationName} · Northern Regional District`, shortName: 'Northern District', type: 'Northern Agro & Plain Zone', lat: centerLat + 0.65, lon: centerLon + 0.35, tempDelta: 1.4, humDelta: -4, pop: '1,450,000', isStateDistrict: true },
      { id: 'st-d2', name: `${locationName} · Central Capital District`, shortName: 'Capital District', type: 'State Administrative & Urban Core', lat: centerLat, lon: centerLon, tempDelta: 2.1, humDelta: -3, pop: '2,800,000', isStateDistrict: true },
      { id: 'st-d3', name: `${locationName} · Western Arid / Industrial Zone`, shortName: 'Western Sector', type: 'Industrial / Dryland Heat Pocket', lat: centerLat - 0.45, lon: centerLon - 0.70, tempDelta: 2.8, humDelta: -7, pop: '1,120,000', isStateDistrict: true },
      { id: 'st-d4', name: `${locationName} · Eastern Basin & Floodplain`, shortName: 'Eastern Basin', type: 'River Basin & Humid Heat', lat: centerLat - 0.30, lon: centerLon + 0.65, tempDelta: 1.2, humDelta: 8, pop: '1,650,000', isStateDistrict: true },
      { id: 'st-d5', name: `${locationName} · Southern Plateau / Foothills`, shortName: 'Southern Sector', type: 'High Exposure Southern Zone', lat: centerLat - 0.85, lon: centerLon - 0.20, tempDelta: 2.3, humDelta: -2, pop: '950,000', isStateDistrict: true },
    ];
  }

  // 3. City/Town/Locality standard microclimate zones around center coordinates
  if (!zoneConfigs) {
    const cleanCityName = locationName ? locationName.split(',')[0].trim() : 'Ward Area';
    zoneConfigs = [
      {
        id: 'w1',
        name: `${cleanCityName} · Central Commercial & Transit Hub`,
        shortName: 'Central Commercial Hub',
        lat: centerLat,
        lon: centerLon,
        type: 'Dense Concrete / Urban Heat Island',
        tempDelta: 1.8,
        humDelta: -5,
        pop: '95,000',
      },
      {
        id: 'w2',
        name: `${cleanCityName} · North Industrial & Labour Corridor`,
        shortName: 'North Labour Corridor',
        lat: centerLat + 0.016,
        lon: centerLon - 0.014,
        type: 'Industrial Tin-Sheds & High Exposure',
        tempDelta: 2.3,
        humDelta: -4,
        pop: '140,000',
      },
      {
        id: 'w3',
        name: `${cleanCityName} · East High-Density Residential Cluster`,
        shortName: 'East Residential Cluster',
        lat: centerLat - 0.018,
        lon: centerLon + 0.018,
        type: 'Informal Settlements / Low Green Cover',
        tempDelta: 1.2,
        humDelta: 3,
        pop: '110,000',
      },
      {
        id: 'w4',
        name: `${cleanCityName} · South Green Parkland Buffer`,
        shortName: 'South Green Parkland',
        lat: centerLat - 0.024,
        lon: centerLon - 0.022,
        type: 'High Tree Canopy & Cooling Buffer',
        tempDelta: -1.6,
        humDelta: 7,
        pop: '60,000',
      },
      {
        id: 'w5',
        name: `${cleanCityName} · West High-Density Old City Sector`,
        shortName: 'West Old City Sector',
        lat: centerLat + 0.022,
        lon: centerLon + 0.025,
        type: 'Narrow Lanes & Trapped Ambient Heat',
        tempDelta: 0.9,
        humDelta: -2,
        pop: '175,000',
      },
      {
        id: 'w6',
        name: `${cleanCityName} · Peri-Urban Agriculture Belt`,
        shortName: 'Peri-Urban Sector',
        lat: centerLat + 0.035,
        lon: centerLon - 0.030,
        type: 'Open Soil & Direct Solar Radiance',
        tempDelta: 0.2,
        humDelta: 4,
        pop: '85,000',
      },
    ];
  }

  return zoneConfigs.map((z) => {
    const t = parseFloat((baseTemp + z.tempDelta).toFixed(1));
    const rh = Math.max(12, Math.min(95, Math.round(baseHumidity + z.humDelta)));
    const w = (windSpeed || 12) / 3.6;
    const sr = solarRadiation || 750;

    const wbgt = calculateWBGT(t, rh, w, sr);
    const hi = calculateHeatIndex(t, rh);
    const utci = calculateUTCI(t, rh, w, sr);
    const risk = calculateMortalityRisk(wbgt, utci, hi, t);
    const stressCat = getStressCategory(wbgt, t);
    const imdAlert = getImdWarningLevel(t, wbgt, centerLat);

    let tagColor = '#10b981';
    let tagBg = '#ecfdf5';
    let categoryTag = 'SAFE';

    if (risk >= 55 || wbgt >= 32) {
      categoryTag = 'DANGER';
      tagColor = '#ef4444';
      tagBg = '#fef2f2';
    } else if (risk >= 40 || wbgt >= 28) {
      categoryTag = 'HIGH ALERT';
      tagColor = '#f97316';
      tagBg = '#fff7ed';
    } else if (risk >= 20 || wbgt >= 26) {
      categoryTag = 'CAUTION';
      tagColor = '#eab308';
      tagBg = '#fefce8';
    }

    return {
      id: z.id,
      name: z.name,
      shortName: z.shortName,
      microclimateType: z.type,
      population: z.pop,
      lat: z.lat != null ? z.lat : (centerLat + (z.offsetLat || 0)),
      lon: z.lon != null ? z.lon : (centerLon + (z.offsetLon || 0)),
      isStateDistrict: Boolean(z.isStateDistrict),
      temperature: t,
      airTemp: t,
      humidity: rh,
      wbgt: parseFloat(wbgt.toFixed(1)),
      heatIndex: parseFloat(hi.toFixed(1)),
      utci: parseFloat(utci.toFixed(1)),
      mortalityRisk: risk,
      stressCategory: stressCat,
      categoryTag: categoryTag,
      tagColor: tagColor,
      tagBg: tagBg,
      color: tagColor,
      imdAlert: imdAlert,
      coolingCenters: z.tempDelta > 0 ? 3 : 1,
      hospitals: z.tempDelta > 0 ? 2 : 1,
      waterKiosks: z.tempDelta > 0 ? 8 : 4,
    };
  });
}

/**
 * Generate Comprehensive Public Health Recommendations (NDMA Heat Action Plan)
 */
export function generateRecommendations(wbgt, mortalityRisk, population = 1500000, temp = 43) {
  const recs = [];

  if (wbgt >= 32 || temp >= 44) {
    recs.push({
      priority: 'CRITICAL',
      category: 'Labour & Industry',
      title: 'Mandatory Suspension of Peak Outdoor Labour',
      action: 'Enforce strict halt on construction, agriculture and brick-kiln work between 11:00 AM and 4:30 PM. Mandate shaded rest sheds with electrolyte solution.',
      authority: 'District Magistrate & Labour Commissioner',
    });
    recs.push({
      priority: 'CRITICAL',
      category: 'Public Health & Hospitals',
      title: 'Activate Heat-Stroke Protocol in All ICUs',
      action: 'Pre-position cold IV normal saline, ice-bath submersion bags, and dantrolene. Ensure 24x7 power backup for mortuaries and critical wards.',
      authority: 'Chief Medical Officer (CMO)',
    });
    recs.push({
      priority: 'CRITICAL',
      category: 'Water & Civic Municipalities',
      title: 'Emergency Water Tanker & Pyaau Deployment',
      action: 'Double tanker supply trips to slums, urban heat islands, bus terminuses, and homeless clusters. Refill all public drinking water stations every 3 hours.',
      authority: 'Municipal Corporation / Jal Board',
    });
    recs.push({
      priority: 'CRITICAL',
      category: 'Schools & Vulnerable Groups',
      title: 'Reschedule / Close Educational Institutions',
      action: 'Mandate early morning school timings (close by 10:30 AM) or switch to virtual mode. Ban outdoor sports and open morning assemblies.',
      authority: 'Director of School Education',
    });
  } else if (wbgt >= 28 || temp >= 40) {
    recs.push({
      priority: 'HIGH',
      category: 'Public Health',
      title: 'Open Free Municipal Cooling Shelters',
      action: 'Open air-conditioned/cooled public halls, community libraries, and night shelters (Rain Basera) for public respite from 10 AM to 6 PM.',
      authority: 'Municipal Emergency Response',
    });
    recs.push({
      priority: 'HIGH',
      category: 'Workers Advisory',
      title: 'Mandate Work-Rest Cycles (45 min work / 15 min rest)',
      action: 'Employers must provide 1 liter cool drinking water per worker per hour and shaded rest zones.',
      authority: 'Occupational Health Board',
    });
    recs.push({
      priority: 'HIGH',
      category: 'Power Grid',
      title: 'Zero Load-Shedding Directive for Health Facilities',
      action: 'State Electricity Board priority hotline active. Backup diesel generators on standby for all district hospitals and cooling centres.',
      authority: 'Disaster Coordination Cell',
    });
  }

  if (mortalityRisk >= 60) {
    const estExcess = Math.round(population * mortalityRisk * 0.000025);
    recs.push({
      priority: 'CRITICAL',
      category: 'Civil Defence & NDRF',
      title: `Catastrophic Heat Threat · Approx ${estExcess.toLocaleString()} Excess Vulnerable Exposure`,
      action: 'Deploy Civil Defence volunteers and Red Cross mobile medical vans in high-density informal colonies for active heat-stress screening.',
      authority: 'State Disaster Response Force (SDRF)',
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 'LOW',
      category: 'General Public Advisory',
      title: 'Normal Heatwave Precautions',
      action: 'Stay hydrated, carry water bottles, avoid direct sunlight during peak hours (12 PM - 3 PM), wear loose cotton clothing.',
      authority: 'NDMA Public Health Advisory',
    });
  }

  return recs;
}

/**
 * Multi-lingual SMS / WhatsApp Dispatch Templates (English & Hindi)
 */
export const MULTILINGUAL_SMS_TEMPLATES = [
  {
    id: 'sms-general-en',
    lang: 'English',
    label: 'Public Heat Emergency Advisory',
    recipient: 'General Public (Mobile Broadcast / WEA)',
    content: 'NDMA HEAT ALERT: Extreme heatwave warning in your district. Avoid outdoor activities between 11 AM–4:30 PM. Drink plenty of water and ORS. Call 108 for medical emergency, 1077 for shelter locations. — District Disaster Management Authority',
  },
  {
    id: 'sms-general-hi',
    lang: 'Hindi',
    label: 'सार्वजनिक लू चेतावनी (Hindi)',
    recipient: 'आम नागरिक / एसएमएस अलर्ट',
    content: 'लू चेतावनी (NDMA): आपके क्षेत्र में भीषण गर्मी व लू का रेड अलर्ट। दोपहर 11 से 4:30 बजे तक धूप में निकलने से बचें। लगातार पानी व ओआरएस (ORS) पिएं। आपातकाल में 108 या 1077 पर कॉल करें। — जिला आपदा प्रबंधन प्राधिकरण',
  },
  {
    id: 'sms-workers-en',
    lang: 'English',
    label: 'Outdoor Worker Safety Directive',
    content: 'HEAT SAFETY DIRECTIVE: All strenuous outdoor and rooftop construction work paused 11 AM - 4 PM. Mandatory cool water and shade breaks every 30 mins. For helpline call 104.',
  },
  {
    id: 'sms-workers-hi',
    lang: 'Hindi',
    label: 'श्रमिक सुरक्षा निर्देश (Hindi)',
    recipient: 'ठेकेदार, निर्माण श्रमिक, फैक्ट्री',
    content: 'कार्यस्थल निर्देश: भीषण गर्मी के कारण सुबह 11 से शाम 4 बजे तक खुले में भारी निर्माण कार्य से बचें। श्रमिकों हेतु छांव व ठंडे पेयजल का अनिवार्य प्रबंध करें। — हीटवेव सुरक्षा सेल',
  },
  {
    id: 'sms-hospital-en',
    lang: 'English',
    label: 'Hospital Preparedness Notice',
    recipient: 'All PHCs, CHCs, Private & Public Hospitals',
    content: 'HEALTH ALERT: Activate Heat-Stroke protocol immediately. Reserve dedicated cooling beds, stock IV fluids, ORS, and ice packs. Maintain heat monitoring logs.',
  },
];

// Re-export calculations for backward compatibility
export {
  calculateHeatIndex,
  calculateWBGT,
  calculateUTCI,
  calculateMortalityRisk,
  getStressCategory,
  getImdWarningLevel,
};
