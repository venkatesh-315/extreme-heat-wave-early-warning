// ============================================================
// Summer 2026 Indian Climatological Dataset & NDMA HAP Standards
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
 * Summer 2026 Baseline Reference Climatology
 */
export const SUMMER_2026_METEOROLOGY = {
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
 * Historical Heatwave Mortality Trend (India, 2018–2026 Forecast)
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

/**
 * Generate Ward-level microclimate heat zones around coordinates from live weather data
 */
export function generateWardData(lat, lon, baseTemp = 36.0, baseHumidity = 50, solarRadiation = 750, windSpeed = 12) {
  const centerLat = Number(lat);
  const centerLon = Number(lon);

  const zoneConfigs = [
    {
      id: 'w1',
      name: 'Ward 1 · Central Commercial & Transit Hub',
      shortName: 'Ward 1 · Central Commercial',
      offsetLat: 0.0,
      offsetLon: 0.0,
      type: 'Dense Concrete / Urban Heat Island',
      tempDelta: 1.8,
      humDelta: -5,
      pop: '95,000',
    },
    {
      id: 'w2',
      name: 'Ward 2 · North Industrial & Labour Colony',
      shortName: 'Ward 2 · North Labour Colony',
      offsetLat: 0.016,
      offsetLon: -0.014,
      type: 'Industrial Tin-Sheds & High Exposure',
      tempDelta: 2.3,
      humDelta: -4,
      pop: '140,000',
    },
    {
      id: 'w3',
      name: 'Ward 3 · East Residential & Slum Cluster',
      shortName: 'Ward 3 · East Slum Cluster',
      offsetLat: -0.018,
      offsetLon: 0.018,
      type: 'Informal Settlements / Low Green Cover',
      tempDelta: 1.2,
      humDelta: 3,
      pop: '110,000',
    },
    {
      id: 'w4',
      name: 'Ward 4 · South Green Institutional Area',
      shortName: 'Ward 4 · South Green Area',
      offsetLat: -0.024,
      offsetLon: -0.022,
      type: 'High Canopy & Parkland Buffer',
      tempDelta: -1.6,
      humDelta: 7,
      pop: '60,000',
    },
    {
      id: 'w5',
      name: 'Ward 5 · West High-Density Old City',
      shortName: 'Ward 5 · Old City',
      offsetLat: 0.022,
      offsetLon: 0.025,
      type: 'Narrow Lanes & Trapped Heat',
      tempDelta: 0.9,
      humDelta: -2,
      pop: '175,000',
    },
    {
      id: 'w6',
      name: 'Ward 6 · Peri-Urban Agricultural Belt',
      shortName: 'Ward 6 · Peri-Urban Sector',
      offsetLat: 0.035,
      offsetLon: -0.030,
      type: 'Open Soil & High Direct Sunlight',
      tempDelta: 0.2,
      humDelta: 4,
      pop: '85,000',
    },
  ];

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

    let tagColor = '#16a34a';
    let tagBg = '#f0fdf4';
    let categoryTag = 'LOW';

    if (risk >= 70 || wbgt >= 35) {
      categoryTag = 'CRITICAL';
      tagColor = '#991b1b';
      tagBg = '#fff1f2';
    } else if (risk >= 55 || wbgt >= 32) {
      categoryTag = 'VERY HIGH';
      tagColor = '#dc2626';
      tagBg = '#fef2f2';
    } else if (risk >= 40 || wbgt >= 29) {
      categoryTag = 'HIGH';
      tagColor = '#ea580c';
      tagBg = '#fff7ed';
    } else if (risk >= 20 || wbgt >= 26) {
      categoryTag = 'MODERATE';
      tagColor = '#ca8a04';
      tagBg = '#fefce8';
    }

    return {
      id: z.id,
      name: z.name,
      shortName: z.shortName,
      microclimateType: z.type,
      population: z.pop,
      lat: centerLat + z.offsetLat,
      lon: centerLon + z.offsetLon,
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
