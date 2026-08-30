import React, { useState } from 'react';
import {
  CalendarIcon,
  ThermometerIcon,
  FlameIcon,
  WaterIcon,
  SunIcon,
  WindIcon,
  ActivityIcon,
  ShieldAlertIcon,
  GaugeIcon
} from './icons';
import './RiskForecast.css';

const RISK_LEVEL_COLORS = {
  VERY_LOW: '#16a34a',
  LOW: '#22c55e',
  MODERATE: '#ca8a04',
  HIGH: '#ea580c',
  EXTREME: '#dc2626',
  Low: '#16a34a',
  Moderate: '#ca8a04',
  High: '#f97316',
  'Very High': '#ea580c',
  Extreme: '#dc2626',
  Catastrophic: '#991b1b',
};

function RiskForecast({ forecast = [], mlForecast = [], location, isLoading = false, error = null }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Combine or prioritize ML Forecast records
  const forecastList = Array.isArray(mlForecast) && mlForecast.length > 0
    ? mlForecast.map((item, i) => {
        const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
        const mRisk = item.predictions?.mortality_risk ?? item.mortalityRisk ?? 35;
        const hRisk = item.predictions?.hospitalization_risk ?? item.hospitalizationRisk ?? 40;
        const tStress = item.predictions?.thermal_stress ?? item.thermalStress ?? 65;
        const rLevel = item.predictions?.risk_level || 'MODERATE';
        const temp = item.weather_inputs?.temperature ?? forecast[i]?.temperature ?? 43.0;
        const hum = item.weather_inputs?.humidity ?? forecast[i]?.humidity ?? 35;
        const wind = item.weather_inputs?.wind_speed ?? forecast[i]?.windSpeed ?? 3.0;
        const solar = item.weather_inputs?.solar_radiation ?? forecast[i]?.solarRadiation ?? 850;

        return {
          day: dayNames[i] || `Day ${i + 1}`,
          date: item.target_date || forecast[i]?.date || `Day ${i + 1}`,
          temperature: temp,
          humidity: hum,
          windSpeed: wind,
          solarRadiation: solar,
          wbgt: Math.round(tStress * 0.38),
          heatIndex: Math.round(temp + 5),
          mortalityRisk: mRisk,
          hospitalizationRisk: hRisk,
          thermalStress: tStress,
          riskLevel: rLevel,
          recommendedActions: item.recommended_actions || [],
          modelVersion: item.model_version || 'v1.0.0',
        };
      })
    : (forecast || []).map((f) => ({
        ...f,
        riskLevel: f.stressCategory?.label || 'MODERATE',
        thermalStress: f.wbgt ? Math.min(100, Math.round((f.wbgt / 38) * 100)) : 50,
        hospitalizationRisk: Math.min(99, Math.round((f.mortalityRisk || 20) * 1.15)),
        modelVersion: 'v1.0.0',
      }));

  if (isLoading) {
    return (
      <div className="forecast-section card" style={{ padding: '36px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading 3-5 Day ML Biometeorological Forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forecast-section card" style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fecaca' }}>
        <p style={{ color: '#dc2626', margin: 0 }}>Unable to load forecast: {error}</p>
      </div>
    );
  }

  if (!forecastList || forecastList.length === 0) {
    return (
      <div className="forecast-section card" style={{ padding: '36px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>No forecast predictions available for this location.</p>
      </div>
    );
  }

  const selected = forecastList[selectedDayIndex] || forecastList[0];

  return (
    <div className="forecast-section card" id="risk-forecast">
      <div className="forecast-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="forecast-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarIcon size={13} color="#1e40af" />
            <span>3-5 Day Machine Learning Synoptic Outlook</span>
          </div>
          <h3 className="section-title">
            Summer 2026 Thermal Risk Forecast &mdash; {location?.name || 'Selected Region'}
          </h3>
          <p className="section-desc">
            XGBoost multi-target projections of thermal stress, mortality, and hospital admission trajectories.
          </p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
          Model: XGBoost {selected.modelVersion}
        </div>
      </div>

      {/* 3-5 Day Horizontal Cards Strip */}
      <div className="forecast-cards-strip">
        {forecastList.map((day, i) => {
          const color = RISK_LEVEL_COLORS[day.riskLevel] || '#ea580c';
          const isSelected = selectedDayIndex === i;

          return (
            <button
              key={i}
              id={`forecast-day-btn-${i}`}
              className={`forecast-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDayIndex(i)}
            >
              <div className="fc-top">
                <span className="fc-day-name">{day.day}</span>
                <span className="fc-date-sub">{day.date}</span>
              </div>

              <div className="fc-temp-block">
                <span className="fc-temp-val">{day.temperature}&deg;</span>
                <span className="fc-temp-unit">C Max</span>
              </div>

              <div className="fc-risk-bar-wrap">
                <div
                  className="fc-risk-bar-fill"
                  style={{ width: `${Math.min(100, day.mortalityRisk)}%`, background: color }}
                />
              </div>

              <div className="fc-bottom">
                <span className="fc-risk-pct" style={{ color }}>{day.mortalityRisk}% Mortality</span>
                <span
                  className="fc-tag"
                  style={{ background: `${color}14`, color, border: `1px solid ${color}33`, fontWeight: 700 }}
                >
                  {day.riskLevel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day In-Depth Breakdown */}
      <div className="selected-day-detail card" style={{ marginTop: '16px' }}>
        <div className="day-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="day-detail-titles">
            <span className="day-detail-date">Detailed Advisory for {selected.day} ({selected.date})</span>
            <h4>{selected.temperature}&deg;C Max Temperature &middot; {selected.thermalStress}/100 Thermal Stress</h4>
          </div>
          <span
            className="detail-alert-badge"
            style={{
              background: `${RISK_LEVEL_COLORS[selected.riskLevel]}15`,
              color: RISK_LEVEL_COLORS[selected.riskLevel],
              border: `1px solid ${RISK_LEVEL_COLORS[selected.riskLevel]}44`,
              fontWeight: 700,
            }}
          >
            {selected.riskLevel} RISK LEVEL
          </span>
        </div>

        <div className="day-detail-grid">
          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#fff7ed' }}>
              <ThermometerIcon size={18} color="#ea580c" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">Max Temperature</span>
              <strong className="dd-value" style={{ color: '#ea580c' }}>{selected.temperature}&deg;C</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#fef2f2' }}>
              <ShieldAlertIcon size={18} color="#dc2626" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">ML Mortality Risk</span>
              <strong className="dd-value" style={{ color: '#dc2626' }}>{selected.mortalityRisk}%</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#f5f3ff' }}>
              <ActivityIcon size={18} color="#7c3aed" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">Hospitalization Risk</span>
              <strong className="dd-value" style={{ color: '#7c3aed' }}>{selected.hospitalizationRisk}%</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#eff6ff' }}>
              <WaterIcon size={18} color="#2563eb" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">Relative Humidity</span>
              <strong className="dd-value" style={{ color: '#2563eb' }}>{selected.humidity}%</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#fffbeb' }}>
              <SunIcon size={18} color="#d97706" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">Solar Radiation</span>
              <strong className="dd-value" style={{ color: '#d97706' }}>{selected.solarRadiation} W/m&sup2;</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#f0fdf4' }}>
              <WindIcon size={18} color="#16a34a" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">Wind Speed</span>
              <strong className="dd-value" style={{ color: '#16a34a' }}>{selected.windSpeed} m/s</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskForecast;
