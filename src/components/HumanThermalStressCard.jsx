import React from 'react';
import { InfoIcon, RefreshCwIcon } from './icons';
import { formatTemp } from '../services/weatherService';
import './HumanThermalStressCard.css';

function getDiscomfortLevel(wbgt, utci) {
  if (wbgt >= 35 || utci >= 46) return { text: 'Extreme', className: 'text-extreme' };
  if (wbgt >= 32 || utci >= 38) return { text: 'Very Strong', className: 'text-extreme' };
  if (wbgt >= 29 || utci >= 32) return { text: 'Strong', className: 'text-high' };
  if (wbgt >= 26 || utci >= 26) return { text: 'Moderate', className: 'text-moderate' };
  if (wbgt >= 22) return { text: 'Slight', className: 'text-low' };
  return { text: 'Comfortable', className: 'text-low' };
}

function HumanThermalStressCard({ thermalMetrics, weather, lastUpdated, tempUnit = 'C' }) {
  const wbgt = thermalMetrics?.wbgt ?? (weather?.temperature ? weather.temperature - 3 : 32.0);
  const utci = thermalMetrics?.utci ?? (weather?.temperature ? weather.temperature + 2 : 35.0);
  const heatIndex = thermalMetrics?.hi ?? (weather?.feelsLike ?? weather?.temperature ?? 34.0);
  const stressCategory = thermalMetrics?.stressCategory || {
    label: 'MODERATE',
    level: 2,
    color: '#ca8a04',
    text: 'Elevated heat stress conditions. Maintain regular hydration.'
  };

  const formattedWbgt = formatTemp(wbgt, tempUnit);
  const formattedUtci = formatTemp(utci, tempUnit);
  const formattedHI = formatTemp(heatIndex, tempUnit);
  const discomfort = getDiscomfortLevel(wbgt, utci);

  // Circular gauge calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const normalizedPct = Math.min(100, Math.max(10, ((wbgt - 18) / 24) * 100));
  const strokeDashoffset = circumference - (normalizedPct / 100) * circumference;
  const gaugeColor = stressCategory.color || '#ea580c';

  const displayTime = lastUpdated || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="card human-stress-card" id="human-thermal-stress-card">
      <div className="card-top-title">
        <h3 className="card-heading">
          Human Thermal Stress Index
          <span className="info-tooltip-wrap" title="Outdoor Wet-Bulb Globe Temperature (WBGT ISO 7933 standard) & physiological heat load">
            <InfoIcon size={14} />
          </span>
        </h3>
      </div>

      <div className="stress-card-body">
        {/* Left Side: Circular Ring Gauge */}
        <div className="stress-gauge-col">
          <div className="circular-gauge-container">
            <svg viewBox="0 0 140 140" className="gauge-svg-element">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="gauge-bg-ring"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="gauge-progress-ring"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  stroke: gaugeColor,
                }}
              />
            </svg>
            <div className="gauge-center-text">
              <span className="gauge-val-big" style={{ color: gaugeColor }}>{formattedWbgt}</span>
              <span className="gauge-unit-sub">&deg;{tempUnit} (WBGT)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Severity Badge, Description, Sub-metrics */}
        <div className="stress-details-col">
          <div className="severity-headline-row">
            <span className="severity-title-red" style={{ color: gaugeColor }}>
              {stressCategory.label.toUpperCase()}
            </span>
            <span className="severity-level-pill" style={{ background: `${gaugeColor}18`, color: gaugeColor, borderColor: `${gaugeColor}44` }}>
              Level {stressCategory.level || 3}
            </span>
          </div>

          <p className="stress-description">
            {stressCategory.text || 'Real-time physiological heat load evaluated using ISO 7933 standards.'}
          </p>

          {/* Sub-Metrics Table Row */}
          <div className="submetrics-row">
            <div className="submetric-item">
              <span className="submetric-label">WBGT</span>
              <span className="submetric-val" style={{ color: gaugeColor }}>{formattedWbgt}&deg;{tempUnit}</span>
            </div>
            <div className="submetric-item">
              <span className="submetric-label">UTCI</span>
              <span className="submetric-val">{formattedUtci}&deg;{tempUnit}</span>
            </div>
            <div className="submetric-item">
              <span className="submetric-label">Heat Index</span>
              <span className="submetric-val">{formattedHI}&deg;{tempUnit}</span>
            </div>
            <div className="submetric-item">
              <span className="submetric-label">Discomfort</span>
              <span className={`submetric-val ${discomfort.className}`}>{discomfort.text}</span>
            </div>
          </div>

          <div className="stress-updated-row">
            <RefreshCwIcon size={12} color="#94a3b8" />
            <span>Updated: {displayTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HumanThermalStressCard;
