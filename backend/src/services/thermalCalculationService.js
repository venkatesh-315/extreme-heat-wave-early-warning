/**
 * Thermodynamic Equations & Biometeorological Algorithms
 * Standardized for Indian Climatology and NDMA Heat Action Plan Guidelines
 */

/**
 * Magnus-Tetens formula for Dew Point (°C)
 * @param {number} T - Dry-bulb temperature (°C)
 * @param {number} RH - Relative humidity (%)
 * @returns {number} Dew point in °C
 */
function calculateDewPoint(T, RH) {
  const a = 17.27;
  const b = 237.7;
  const safeRH = Math.max(1, Math.min(100, Number(RH) || 50));
  const temp = Number(T) || 30;
  const alpha = ((a * temp) / (b + temp)) + Math.log(safeRH / 100);
  return parseFloat(((b * alpha) / (a - alpha)).toFixed(1));
}

/**
 * Rothfusz Regression equation for Heat Index (NOAA / NWS) with adjustments
 * @param {number} T - Temperature (°C)
 * @param {number} RH - Relative humidity (%)
 * @returns {number} Heat index in °C
 */
function calculateHeatIndex(T, RH) {
  const tempC = Number(T) || 30;
  const rh = Math.max(1, Math.min(100, Number(RH) || 50));

  if (tempC < 27) return parseFloat(tempC.toFixed(1));

  const TF = tempC * 1.8 + 32;
  let HI_F = -42.379
    + 2.04901523 * TF
    + 10.14333127 * rh
    - 0.22475541 * TF * rh
    - 0.00683783 * TF * TF
    - 0.05481717 * rh * rh
    + 0.00122874 * TF * TF * rh
    + 0.00085282 * TF * rh * rh
    - 0.00000199 * TF * TF * rh * rh;

  // Adjustments for low and high humidity
  if (rh < 13 && TF >= 80 && TF <= 112) {
    HI_F -= ((13 - rh) / 4) * Math.sqrt(Math.max(0, (17 - Math.abs(TF - 95)) / 17));
  } else if (rh > 85 && TF >= 80 && TF <= 87) {
    HI_F += ((rh - 85) / 10) * ((87 - TF) / 5);
  }

  const HI_C = (HI_F - 32) * (5 / 9);
  return parseFloat(HI_C.toFixed(1));
}

/**
 * Wet Bulb Globe Temperature (WBGT) estimation
 * Uses standard Australian Bureau of Meteorology & Liljegren approximation
 * @param {number} T - Ambient temperature (°C)
 * @param {number} RH - Relative humidity (%)
 * @param {number} v - Wind speed at 10m in m/s (default 2.5 m/s)
 * @param {number} Sr - Solar radiation in W/m² (default 800 W/m²)
 * @returns {number} WBGT in °C
 */
function calculateWBGT(T, RH, v = 2.5, Sr = 800) {
  const temp = Number(T) || 35;
  const rh = Math.max(1, Math.min(100, Number(RH) || 40));
  const wind = Math.max(0.2, Number(v) || 2.5);
  const solar = Math.max(0, Number(Sr) || 800);

  // Stull (2011) wet-bulb temperature approximation
  const Tw = temp * Math.atan(0.151977 * Math.sqrt(rh + 8.313659))
    + Math.atan(temp + rh)
    - Math.atan(rh - 1.676331)
    + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh)
    - 4.686035;

  // Globe temperature estimation
  const Tg = temp + 0.025 * solar - 0.8 * Math.sqrt(Math.max(0.3, wind));

  // Outdoor WBGT formula with direct solar radiation: WBGT = 0.7*Tw + 0.2*Tg + 0.1*T
  const wbgt = 0.7 * Tw + 0.2 * Tg + 0.1 * temp;
  return parseFloat(wbgt.toFixed(1));
}

/**
 * Universal Thermal Climate Index (UTCI) 6th-order polynomial approximation
 * @param {number} T - Ambient temperature (°C)
 * @param {number} RH - Relative humidity (%)
 * @param {number} v - Wind speed at 10m in m/s
 * @param {number} Sr - Solar radiation in W/m²
 * @returns {number} UTCI in °C
 */
function calculateUTCI(T, RH, v = 2.5, Sr = 800) {
  const temp = Number(T) || 35;
  const rh = Math.max(1, Math.min(100, Number(RH) || 40));
  const wind = Math.max(0.5, Number(v) || 2.5);
  const solar = Math.max(0, Number(Sr) || 800);

  const va = Math.max(0.5, wind);
  const Tmrt = temp + 0.0014 * solar - 0.08 * Math.sqrt(va);
  const D_Tmrt = Tmrt - temp;
  const Pa = (rh / 100) * 6.105 * Math.exp((17.27 * temp) / (237.3 + temp));

  const utci = temp + 0.607562052
    - 0.0227712343 * temp
    + 8.06470249e-4 * temp * temp
    - 1.54816591e-4 * temp * temp * temp
    - 3.30261334e-4 * temp * temp * va
    + 1.16011335e-5 * temp * temp * va * va
    + D_Tmrt * (0.0276021403 + 1.74491801e-4 * temp - 1.23252154e-3 * va)
    + Pa * (0.398374029 + 1.83945314e-4 * temp * temp - 1.73290961e-2 * va);

  return parseFloat(utci.toFixed(1));
}

/**
 * Multi-parametric Heatwave Mortality Risk Index (0 - 99%)
 */
function calculateMortalityRisk(wbgt, utci, hi, temp) {
  const w = Number(wbgt) || 30;
  const u = Number(utci) || 38;
  const t = Number(temp) || 40;

  let risk = 0;
  if (w >= 35) risk += 65;
  else if (w >= 32) risk += 45;
  else if (w >= 30) risk += 30;
  else if (w >= 28) risk += 15;
  else if (w >= 26) risk += 5;

  if (t >= 46) risk += 25;
  else if (t >= 44) risk += 15;
  else if (t >= 42) risk += 8;

  if (u >= 46) risk += 10;
  else if (u >= 38) risk += 5;

  return Math.min(99, Math.max(4, Math.round(risk)));
}

/**
 * IMD 4-tier warning level classifier with terrain adjustment
 */
function getImdWarningLevel(temp, wbgt, lat = 20) {
  const t = Number(temp) || 40;
  const w = Number(wbgt) || 30;
  const isHills = lat > 30.5;
  const threshold = isHills ? 30 : 40;

  if (w >= 33 || t >= threshold + 5.5) {
    return {
      level: 'RED',
      code: 'RED_WARNING',
      title: 'RED ALERT — Take Action',
      description: 'Severe heatwave conditions. Very high probability of heat illness and heat stroke for all ages.',
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
    };
  }
  if (w >= 30 || t >= threshold + 3.5) {
    return {
      level: 'ORANGE',
      code: 'ORANGE_ALERT',
      title: 'ORANGE ALERT — Be Prepared',
      description: 'Heatwave conditions persisting. High health risk for vulnerable people (infants, elderly, chronic illness).',
      color: '#ea580c',
      bgColor: '#fff7ed',
      borderColor: '#fed7aa',
    };
  }
  if (w >= 27 || t >= threshold) {
    return {
      level: 'YELLOW',
      code: 'YELLOW_WATCH',
      title: 'YELLOW WATCH — Be Updated',
      description: 'Moderate heat stress. Tolerable for general public but caution required for outdoor workers.',
      color: '#ca8a04',
      bgColor: '#fefce8',
      borderColor: '#fef08a',
    };
  }
  return {
    level: 'GREEN',
    code: 'GREEN_NORMAL',
    title: 'GREEN — Normal Conditions',
    description: 'No heatwave warning. Temperature within climatological normal range.',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  };
}

/**
 * Human Thermal Stress Category Descriptor
 */
function getStressCategory(wbgt, temp) {
  const w = Number(wbgt) || 30;
  const t = Number(temp) || 40;

  if (w >= 35 || t >= 47) {
    return { label: 'Catastrophic', level: 6, color: '#991b1b', bg: '#fff1f2', border: '#fecdd3', text: 'Lethal Human Limit' };
  }
  if (w >= 32 || t >= 45) {
    return { label: 'Extreme', level: 5, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: 'Dangerous Thermal Stress' };
  }
  if (w >= 30 || t >= 42) {
    return { label: 'Very High', level: 4, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', text: 'Severe Heat Burden' };
  }
  if (w >= 28 || t >= 39) {
    return { label: 'High', level: 3, color: '#f97316', bg: '#fffaf5', border: '#ffedd5', text: 'Caution Required' };
  }
  if (w >= 25 || t >= 35) {
    return { label: 'Moderate', level: 2, color: '#eab308', bg: '#fefce8', border: '#fef08a', text: 'Increased Fatigue Risk' };
  }
  return { label: 'Low', level: 1, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: 'Normal Activity Safe' };
}

/**
 * Compute unified biometeorological profile
 */
function computeFullThermalProfile({ temperature, humidity, windSpeed = 3.0, solarRadiation = 850, lat = 22.0 }) {
  const t = Number(temperature);
  const rh = Number(humidity);
  const windMs = Number(windSpeed) > 10 ? Number(windSpeed) / 3.6 : Number(windSpeed); // convert km/h to m/s if needed
  const sr = Number(solarRadiation);

  const dewPoint = calculateDewPoint(t, rh);
  const hi = calculateHeatIndex(t, rh);
  const wbgt = calculateWBGT(t, rh, windMs, sr);
  const utci = calculateUTCI(t, rh, windMs, sr);
  const mortalityRisk = calculateMortalityRisk(wbgt, utci, hi, t);
  const stressCategory = getStressCategory(wbgt, t);
  const imdAlert = getImdWarningLevel(t, wbgt, lat);

  return {
    dewPoint,
    hi,
    wbgt,
    utci,
    mortalityRisk,
    stressCategory,
    imdAlert,
  };
}

module.exports = {
  calculateDewPoint,
  calculateHeatIndex,
  calculateWBGT,
  calculateUTCI,
  calculateMortalityRisk,
  getImdWarningLevel,
  getStressCategory,
  computeFullThermalProfile,
};
