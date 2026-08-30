import React from 'react';
import { InfoIcon, RefreshCwIcon, ShieldAlertIcon } from './icons';
import { formatTemp } from '../services/weatherService';
import './HumanThermalStressCard.css';

function HumanThermalStressCard({ thermalMetrics, mlPrediction, weather, lastUpdated = '10:20 AM', tempUnit = 'C' }) {
  const wbgt = thermalMetrics?.wbgt ?? 38.7;
  const utci = thermalMetrics?.utci ?? 41.2;
  const heatIndex = thermalMetrics?.hi ?? 53.1;
  const mortalityRisk = mlPrediction?.mortality_risk ?? thermalMetrics?.mortalityRisk ?? 45;
  const hospitalizationRisk = mlPrediction?.hospitalization_risk ?? thermalMetrics?.hospitalizationRisk ?? 52;
  const riskLevel = mlPrediction?.risk_level ?? 'HIGH';
  const modelVersion = mlPrediction?.model_version ?? 'v1.0.0';
  const timestamp = mlPrediction?.prediction_timestamp ? new Date(mlPrediction.prediction_timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : lastUpdated;

  const stressCategory = thermalMetrics?.stressCategory || {
    label: riskLevel,
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
      <div className="card-top-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-heading">
          Human Thermal Stress &amp; ML Risk
          <span className="info-tooltip-wrap" title="Outdoor Wet-Bulb Globe Temperature (WBGT ISO 7933) combined with dual-target XGBoost ML inference">
            <InfoIcon size={14} />
          </span>
        </h3>
        <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
          ML Model {modelVersion}
        </span>
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
          <div className="severity-headline-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="severity-title-red">
              {riskLevel || stressCategory.label}
            </span>
            <span className="severity-level-pill" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              Mortality: {mortalityRisk}%
            </span>
            <span className="severity-level-pill" style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
              Hospitalization: {hospitalizationRisk}%
            </span>
          </div>

          <p className="stress-description">
            Dual-target XGBoost model predictions indicate elevated biometeorological stress and public health burden.
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
              <span className="submetric-label">Risk Level</span>
              <span className="submetric-val text-extreme">{riskLevel}</span>
            </div>
          </div>

          <div className="stress-updated-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCwIcon size={12} color="#94a3b8" />
              <span>Inference Time: {timestamp}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Schema v1.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HumanThermalStressCard;
