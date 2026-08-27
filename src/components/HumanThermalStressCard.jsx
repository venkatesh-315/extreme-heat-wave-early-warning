import React from 'react';
import { InfoIcon, RefreshCwIcon } from './icons';
import { formatTemp } from '../services/weatherService';
import './HumanThermalStressCard.css';

function HumanThermalStressCard({ thermalMetrics, weather, lastUpdated = '10:20 AM', tempUnit = 'C' }) {
  const wbgt = thermalMetrics?.wbgt ?? 38.7;
  const utci = thermalMetrics?.utci ?? 41.2;
  const heatIndex = thermalMetrics?.hi ?? 53.1;
  const stressCategory = thermalMetrics?.stressCategory || {
    label: 'CRITICAL',
    level: 5,
    text: 'Extreme heat stress conditions. High risk of heat illness and mortality.'
  };

  const formattedWbgt = formatTemp(wbgt, tempUnit);
  const formattedUtci = formatTemp(utci, tempUnit);
  const formattedHI = formatTemp(heatIndex, tempUnit);
  const rawSubWbgt = wbgt - 3.9 > 0 ? wbgt - 3.9 : wbgt;
  const formattedSubWbgt = formatTemp(rawSubWbgt, tempUnit);

  // Circular gauge calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const normalizedPct = Math.min(100, Math.max(10, ((wbgt - 20) / 25) * 100));
  const strokeDashoffset = circumference - (normalizedPct / 100) * circumference;

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
                }}
              />
            </svg>
            <div className="gauge-center-text">
              <span className="gauge-val-big">{formattedWbgt}</span>
              <span className="gauge-unit-sub">&deg;{tempUnit} (WBGT)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Severity Badge, Description, Sub-metrics */}
        <div className="stress-details-col">
          <div className="severity-headline-row">
            <span className="severity-title-red">
              {stressCategory.label.toUpperCase() === 'CATASTROPHIC' ? 'CRITICAL' : stressCategory.label.toUpperCase()}
            </span>
            <span className="severity-level-pill">
              Level {stressCategory.level || 5}
            </span>
          </div>

          <p className="stress-description">
            Extreme heat stress conditions. High risk of heat illness and mortality.
          </p>

          {/* Sub-Metrics Table Row */}
          <div className="submetrics-row">
            <div className="submetric-item">
              <span className="submetric-label">WBGT</span>
              <span className="submetric-val">{formattedSubWbgt}&deg;{tempUnit}</span>
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
              <span className="submetric-val text-extreme">Extreme</span>
            </div>
          </div>

          <div className="stress-updated-row">
            <RefreshCwIcon size={12} color="#94a3b8" />
            <span>Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HumanThermalStressCard;
