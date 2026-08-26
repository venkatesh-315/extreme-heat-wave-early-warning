// ============================================================
// MOCK DATA — SIH26083 Extreme Heatwave Early Warning System
// ============================================================

export const INDIAN_CITIES = [
  { id: 'del', name: 'New Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi', population: 32941000 },
  { id: 'mum', name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra', population: 20667656 },
  { id: 'hyd', name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana', population: 10534418 },
  { id: 'ahm', name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat', population: 8253226 },
  { id: 'nag', name: 'Nagpur', lat: 21.1458, lon: 79.0882, state: 'Maharashtra', population: 2940000 },
  { id: 'jpr', name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan', population: 3046163 },
  { id: 'lko', name: 'Lucknow', lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh', population: 3678200 },
  { id: 'pat', name: 'Patna', lat: 25.5941, lon: 85.1376, state: 'Bihar', population: 1684222 },
  { id: 'bhu', name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, state: 'Odisha', population: 1003187 },
  { id: 'che', name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu', population: 10971108 },
];

export const MOCK_WEATHER_DATA = {
  del: {
    temperature: 44.2,
    humidity: 28,
    windSpeed: 12.4,
    solarRadiation: 950,
    dewPoint: 18.3,
    pressure: 995,
    visibility: 6.2,
    uvIndex: 11,
    feelsLike: 48.7,
    cloudCover: 10,
    weatherCondition: 'Sunny & Extreme Heat',
    lastUpdated: new Date().toISOString(),
  },
  mum: {
    temperature: 36.8,
    humidity: 82,
    windSpeed: 18.2,
    solarRadiation: 620,
    dewPoint: 31.4,
    pressure: 1004,
    visibility: 5.0,
    uvIndex: 8,
    feelsLike: 52.1,
    cloudCover: 40,
    weatherCondition: 'Humid & Hazy',
    lastUpdated: new Date().toISOString(),
  },
  hyd: {
    temperature: 41.5,
    humidity: 35,
    windSpeed: 9.8,
    solarRadiation: 880,
    dewPoint: 22.1,
    pressure: 998,
    visibility: 8.4,
    uvIndex: 10,
    feelsLike: 44.3,
    cloudCover: 15,
    weatherCondition: 'Hot & Partly Sunny',
    lastUpdated: new Date().toISOString(),
  },
  ahm: {
    temperature: 43.8,
    humidity: 22,
    windSpeed: 15.6,
    solarRadiation: 980,
    dewPoint: 15.9,
    pressure: 993,
    visibility: 7.1,
    uvIndex: 12,
    feelsLike: 46.2,
    cloudCover: 5,
    weatherCondition: 'Extreme Heat',
    lastUpdated: new Date().toISOString(),
  },
  nag: {
    temperature: 45.1,
    humidity: 18,
    windSpeed: 8.3,
    solarRadiation: 1020,
    dewPoint: 14.2,
    pressure: 990,
    visibility: 9.0,
    uvIndex: 12,
    feelsLike: 47.8,
    cloudCover: 3,
    weatherCondition: 'Severe Heat',
    lastUpdated: new Date().toISOString(),
  },
  jpr: {
    temperature: 42.6,
    humidity: 20,
    windSpeed: 20.1,
    solarRadiation: 930,
    dewPoint: 13.8,
    pressure: 991,
    visibility: 7.8,
    uvIndex: 11,
    feelsLike: 43.9,
    cloudCover: 8,
    weatherCondition: 'Hot & Windy',
    lastUpdated: new Date().toISOString(),
  },
  lko: {
    temperature: 43.4,
    humidity: 32,
    windSpeed: 10.5,
    solarRadiation: 900,
    dewPoint: 20.5,
    pressure: 994,
    visibility: 6.5,
    uvIndex: 10,
    feelsLike: 48.1,
    cloudCover: 12,
    weatherCondition: 'Hot & Humid',
    lastUpdated: new Date().toISOString(),
  },
  pat: {
    temperature: 40.3,
    humidity: 55,
    windSpeed: 7.2,
    solarRadiation: 820,
    dewPoint: 27.8,
    pressure: 1001,
    visibility: 5.5,
    uvIndex: 9,
    feelsLike: 50.6,
    cloudCover: 25,
    weatherCondition: 'Humid Heat',
    lastUpdated: new Date().toISOString(),
  },
  bhu: {
    temperature: 38.9,
    humidity: 68,
    windSpeed: 14.3,
    solarRadiation: 720,
    dewPoint: 29.4,
    pressure: 1002,
    visibility: 6.0,
    uvIndex: 8,
    feelsLike: 51.4,
    cloudCover: 30,
    weatherCondition: 'Very Humid',
    lastUpdated: new Date().toISOString(),
  },
  che: {
    temperature: 37.2,
    humidity: 75,
    windSpeed: 16.8,
    solarRadiation: 680,
    dewPoint: 28.9,
    pressure: 1005,
    visibility: 7.3,
    uvIndex: 8,
    feelsLike: 49.8,
    cloudCover: 20,
    weatherCondition: 'Humid & Warm',
    lastUpdated: new Date().toISOString(),
  },
};

// 5-day forecast mock data generator
export function generateForecast(cityId) {
  const base = MOCK_WEATHER_DATA[cityId] || MOCK_WEATHER_DATA['del'];
  const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
  return days.map((label, i) => {
    const tempVariation = (Math.random() - 0.3) * 4;
    const humVariation = (Math.random() - 0.5) * 10;
    const temp = parseFloat((base.temperature + tempVariation * (i + 1) * 0.5).toFixed(1));
    const hum = Math.max(10, Math.min(95, parseFloat((base.humidity + humVariation).toFixed(0))));
    const wind = parseFloat((base.windSpeed + (Math.random() - 0.5) * 5).toFixed(1));
    const solar = Math.max(200, base.solarRadiation + Math.round((Math.random() - 0.5) * 200));
    const hi = calculateHeatIndex(temp, hum);
    const wbgt = calculateWBGT(temp, hum, wind, solar);
    const utci = calculateUTCI(temp, hum, wind, solar);
    const risk = calculateMortalityRisk(wbgt, utci, hi);
    return {
      day: label,
      date: new Date(Date.now() + i * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      temperature: temp,
      humidity: Math.round(hum),
      windSpeed: wind,
      solarRadiation: solar,
      heatIndex: parseFloat(hi.toFixed(1)),
      wbgt: parseFloat(wbgt.toFixed(1)),
      utci: parseFloat(utci.toFixed(1)),
      mortalityRisk: risk,
      stressCategory: getStressCategory(wbgt),
    };
  });
}

// Ward-level GIS data (mock zones around city center)
export function generateWardData(cityId) {
  const city = INDIAN_CITIES.find(c => c.id === cityId) || INDIAN_CITIES[0];
  const wards = [
    { name: 'Zone A - Central', offsetLat: 0.02, offsetLon: -0.01 },
    { name: 'Zone B - North', offsetLat: 0.07, offsetLon: 0.02 },
    { name: 'Zone C - East', offsetLat: -0.01, offsetLon: 0.06 },
    { name: 'Zone D - South', offsetLat: -0.05, offsetLon: 0.01 },
    { name: 'Zone E - West', offsetLat: 0.01, offsetLon: -0.07 },
    { name: 'Zone F - NE', offsetLat: 0.05, offsetLon: 0.05 },
    { name: 'Zone G - SE', offsetLat: -0.04, offsetLon: 0.04 },
    { name: 'Zone H - NW', offsetLat: 0.04, offsetLon: -0.05 },
  ];
  const base = MOCK_WEATHER_DATA[cityId] || MOCK_WEATHER_DATA['del'];
  return wards.map((w, i) => {
    const temp = parseFloat((base.temperature + (Math.random() - 0.5) * 3).toFixed(1));
    const hum = Math.round(base.humidity + (Math.random() - 0.5) * 12);
    const wind = parseFloat((base.windSpeed + (Math.random() - 0.5) * 4).toFixed(1));
    const solar = base.solarRadiation + Math.round((Math.random() - 0.5) * 150);
    const wbgt = calculateWBGT(temp, hum, wind, solar);
    const hi = calculateHeatIndex(temp, hum);
    const risk = calculateMortalityRisk(wbgt, calculateUTCI(temp, hum, wind, solar), hi);
    const elderlyDensity = Math.round(8 + Math.random() * 25);
    const outdoorWorkers = Math.round(15 + Math.random() * 40);
    return {
      id: `ward-${i}`,
      name: w.name,
      lat: city.lat + w.offsetLat,
      lon: city.lon + w.offsetLon,
      temperature: temp,
      humidity: hum,
      windSpeed: wind,
      wbgt: parseFloat(wbgt.toFixed(1)),
      heatIndex: parseFloat(hi.toFixed(1)),
      mortalityRisk: risk,
      stressCategory: getStressCategory(wbgt),
      elderlyDensity,
      outdoorWorkers,
      coolingCenters: Math.round(1 + Math.random() * 4),
      hospitals: Math.round(1 + Math.random() * 3),
    };
  });
}

// ============================================================
// THERMAL STRESS ALGORITHMS
// ============================================================

/**
 * Heat Index (HI) — Rothfusz Regression
 * @param {number} T - Temperature in °C
 * @param {number} RH - Relative Humidity (%)
 * @returns {number} Heat Index in °C
 */
export function calculateHeatIndex(T, RH) {
  // Convert to Fahrenheit for standard formula
  const TF = T * 9/5 + 32;
  let HI_F = -42.379 + 2.04901523*TF + 10.14333127*RH
    - 0.22475541*TF*RH - 0.00683783*TF*TF
    - 0.05481717*RH*RH + 0.00122874*TF*TF*RH
    + 0.00085282*TF*RH*RH - 0.00000199*TF*TF*RH*RH;
  // Adjustments
  if (RH < 13 && TF >= 80 && TF <= 112) {
    HI_F -= ((13-RH)/4) * Math.sqrt((17 - Math.abs(TF-95)) / 17);
  } else if (RH > 85 && TF >= 80 && TF <= 87) {
    HI_F += ((RH-85)/10) * ((87-TF)/5);
  }
  // Convert back to Celsius
  return (HI_F - 32) * 5/9;
}

/**
 * Wet-Bulb Globe Temperature (WBGT) — Simplified outdoor formula
 * @param {number} T - Dry bulb temp °C
 * @param {number} RH - Relative Humidity %
 * @param {number} v - Wind speed m/s
 * @param {number} Sr - Solar radiation W/m²
 * @returns {number} WBGT in °C
 */
export function calculateWBGT(T, RH, v, Sr) {
  // Wet bulb temp (Stull approximation)
  const Tw = T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659))
    + Math.atan(T + RH)
    - Math.atan(RH - 1.676331)
    + 0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH)
    - 4.686035;
  // Globe temperature approximation
  const Tg = T + 0.25 * (Sr / 100) - 0.7 * Math.sqrt(Math.max(0.5, v));
  // WBGT outdoor: 0.7*Tw + 0.2*Tg + 0.1*T
  return 0.7 * Tw + 0.2 * Tg + 0.1 * T;
}

/**
 * Universal Thermal Climate Index (UTCI) — Simplified polynomial approximation
 * @param {number} T - Air temperature °C
 * @param {number} RH - Relative humidity %
 * @param {number} v - Wind speed m/s
 * @param {number} Sr - Solar radiation W/m²
 * @returns {number} UTCI in °C
 */
export function calculateUTCI(T, RH, v, Sr) {
  // Mean radiant temperature approximation
  const Tmrt = T + 0.0014 * Sr - 0.08 * Math.sqrt(Math.max(0.5, v));
  const va = Math.max(0.5, v);
  const D_Tmrt = Tmrt - T;
  // Vapour pressure
  const Pa = (RH / 100) * 6.105 * Math.exp(17.27 * T / (237.3 + T));
  // UTCI polynomial (6th order approximation)
  const UTCI = T + 0.607562052
    - 0.0227712343 * T
    + 8.06470249e-4 * T * T
    - 1.54816591e-4 * T * T * T
    - 3.30261334e-4 * T * T * va
    + 1.16011335e-5 * T * T * va * va
    + D_Tmrt * (0.0276021403 + 1.74491801e-4 * T - 1.23252154e-3 * va)
    + Pa * (0.398374029 + 1.83945314e-4 * T * T - 1.73290961e-2 * va);
  return UTCI;
}

/**
 * Calculate Mortality Risk Index (0-100)
 */
export function calculateMortalityRisk(wbgt, utci, hi) {
  let risk = 0;
  // WBGT contribution (most critical)
  if (wbgt < 26) risk += 5;
  else if (wbgt < 28) risk += 15;
  else if (wbgt < 30) risk += 30;
  else if (wbgt < 32) risk += 50;
  else if (wbgt < 35) risk += 70;
  else risk += 90;
  // UTCI contribution
  if (utci > 46) risk += 10;
  else if (utci > 38) risk += 5;
  // HI contribution
  if (hi > 54) risk += 5;
  else if (hi > 41) risk += 3;
  return Math.min(100, Math.round(risk));
}

/**
 * Get stress category label from WBGT
 */
export function getStressCategory(wbgt) {
  if (wbgt < 26) return { label: 'Low', color: '#22c55e', bgColor: 'rgba(34,197,94,0.15)', level: 1 };
  if (wbgt < 28) return { label: 'Moderate', color: '#eab308', bgColor: 'rgba(234,179,8,0.15)', level: 2 };
  if (wbgt < 30) return { label: 'High', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)', level: 3 };
  if (wbgt < 32) return { label: 'Very High', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)', level: 4 };
  if (wbgt < 35) return { label: 'Extreme', color: '#dc2626', bgColor: 'rgba(220,38,38,0.2)', level: 5 };
  return { label: 'Catastrophic', color: '#7f1d1d', bgColor: 'rgba(127,29,29,0.25)', level: 6 };
}

/**
 * Get UTCI stress category
 */
export function getUTCICategory(utci) {
  if (utci < 9) return { label: 'No Thermal Stress', color: '#3b82f6' };
  if (utci < 26) return { label: 'No Thermal Stress', color: '#22c55e' };
  if (utci < 32) return { label: 'Moderate Heat Stress', color: '#eab308' };
  if (utci < 38) return { label: 'Strong Heat Stress', color: '#f97316' };
  if (utci < 46) return { label: 'Very Strong Heat Stress', color: '#ef4444' };
  return { label: 'Extreme Heat Stress', color: '#7f1d1d' };
}

/**
 * Generate public health recommendations based on stress level
 */
export function generateRecommendations(wbgt, mortalityRisk, population) {
  const recs = [];
  if (wbgt >= 28) {
    recs.push({ priority: 'HIGH', category: 'Public Health', icon: '🏥', action: 'Activate all cooling centres and distribute ORS packets in vulnerable zones.' });
    recs.push({ priority: 'HIGH', category: 'Outdoor Workers', icon: '👷', action: 'Suspend outdoor work from 11AM–4PM. Mandatory water breaks every 30 minutes.' });
  }
  if (wbgt >= 30) {
    recs.push({ priority: 'CRITICAL', category: 'Healthcare', icon: '🚑', action: 'Pre-position ambulances and heat-stroke kits in high-density elderly zones.' });
    recs.push({ priority: 'CRITICAL', category: 'Power Grid', icon: '⚡', action: 'Alert DISCOM to reduce outages. Priority power to hospitals and cooling centres.' });
    recs.push({ priority: 'HIGH', category: 'Schools', icon: '🏫', action: 'Issue advisory to close schools or shift to online mode for vulnerable age groups.' });
  }
  if (wbgt >= 32) {
    recs.push({ priority: 'CRITICAL', category: 'Mass Alert', icon: '📱', action: 'Issue Wireless Emergency Alert (WEA) & WhatsApp blast to all residents.' });
    recs.push({ priority: 'CRITICAL', category: 'Water Supply', icon: '💧', action: 'Double water tanker deployment frequency to slums and urban heat islands.' });
    recs.push({ priority: 'CRITICAL', category: 'Administration', icon: '🏛️', action: 'Activate district Heat Action Plan. Convene emergency coordination meeting.' });
  }
  if (mortalityRisk > 60) {
    recs.push({ priority: 'CRITICAL', category: 'Mortality Alert', icon: '⚠️', action: `Estimated ${Math.round(population * mortalityRisk * 0.00003)} excess deaths projected. Deploy NDRF teams immediately.` });
  }
  if (recs.length === 0) {
    recs.push({ priority: 'LOW', category: 'Advisory', icon: '☀️', action: 'Conditions are manageable. Advise residents to stay hydrated and avoid peak sun hours.' });
  }
  return recs;
}

// Historical mortality data (mock)
export const HISTORICAL_MORTALITY = [
  { year: 2019, deaths: 312 },
  { year: 2020, deaths: 284 },
  { year: 2021, deaths: 398 },
  { year: 2022, deaths: 467 },
  { year: 2023, deaths: 531 },
  { year: 2024, deaths: 612 },
  { year: 2025, deaths: 748 },
];

// Hourly temperature data for today (mock)
export function generateHourlyData(baseTemp, baseHumidity) {
  return Array.from({ length: 24 }, (_, h) => {
    const tempCurve = -8 * Math.cos((h - 14) * Math.PI / 12);
    const humCurve = 15 * Math.cos((h - 6) * Math.PI / 12);
    const t = parseFloat((baseTemp + tempCurve).toFixed(1));
    const rh = Math.max(10, Math.min(95, Math.round(baseHumidity + humCurve)));
    const w = parseFloat((8 + Math.random() * 10).toFixed(1));
    const sr = h >= 6 && h <= 18 ? Math.round(100 * Math.sin((h - 6) * Math.PI / 12) * 10) : 0;
    return {
      hour: `${h.toString().padStart(2, '0')}:00`,
      temperature: t,
      humidity: rh,
      heatIndex: parseFloat(calculateHeatIndex(t, rh).toFixed(1)),
      wbgt: parseFloat(calculateWBGT(t, rh, w, sr).toFixed(1)),
    };
  });
}
