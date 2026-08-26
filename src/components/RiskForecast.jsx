import React, { useState } from 'react';
import './RiskForecast.css';

const STRESS_COLORS = {
  Low: '#22c55e',
  Moderate: '#eab308',
  High: '#f97316',
  'Very High': '#ef4444',
  Extreme: '#dc2626',
  Catastrophic: '#7f1d1d',
};

const WBGT_RANGES = [
  { label: 'No Risk', range: '< 26°C', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  { label: 'Moderate', range: '26–28°C', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  { label: 'High', range: '28–30°C', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { label: 'Very High', range: '30–32°C', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { label: 'Extreme', range: '32–35°C', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
  { label: 'Catastrophic', range: '> 35°C', color: '#7f1d1d', bg: 'rgba(127,29,29,0.15)' },
];

function RiskForecast({ forecast, city }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const selected = forecast[selectedDay];

  if (!forecast?.length || !selected) return null;

  return (
    <div className="forecast-section" id="risk-forecast">
      <div className="forecast-header-row">
        <h3 className="section-title">📅 5-Day Risk Forecast — {city?.name}</h3>
        <p className="forecast-desc">WBGT-based heat stress & mortality risk prediction</p>
      </div>

      {/* Day cards strip */}
      <div className="forecast-strip">
        {forecast.map((day, i) => {
          const color = STRESS_COLORS[day.stressCategory.label] || '#ff6b00';
          return (
            <button
              key={i}
              id={`forecast-day-${i}`}
              className={`forecast-day-card ${selectedDay === i ? 'selected' : ''}`}
              onClick={() => setSelectedDay(i)}
              style={{ '--day-color': color }}
            >
              <span className="day-label">{day.day}</span>
              <span className="day-date">{day.date}</span>
              <span className="day-temp">{day.temperature}°C</span>
              <div className="day-risk-bar">
                <div className="day-risk-fill" style={{ width: `${day.mortalityRisk}%`, background: color }} />
              </div>
              <span className="day-risk-pct" style={{ color }}>{day.mortalityRisk}%</span>
              <span className="day-stress" style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}>
                {day.stressCategory.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed view for selected day */}
      <div className="forecast-detail card">
        <div className="detail-header">
          <h4 className="detail-day">{selected.day} — {selected.date}</h4>
          <span className="detail-stress-badge"
            style={{
              background: `${STRESS_COLORS[selected.stressCategory.label]}18`,
              border: `1px solid ${STRESS_COLORS[selected.stressCategory.label]}44`,
              color: STRESS_COLORS[selected.stressCategory.label]
            }}>
            {selected.stressCategory.label} Thermal Stress
          </span>
        </div>

        <div className="detail-metrics">
          {[
            { label: 'Temperature', value: `${selected.temperature}°C`, icon: '🌡️', color: '#ff6b00' },
            { label: 'Humidity', value: `${selected.humidity}%`, icon: '💧', color: '#3b82f6' },
            { label: 'Wind Speed', value: `${selected.windSpeed} km/h`, icon: '💨', color: '#a855f7' },
            { label: 'Solar Radiation', value: `${selected.solarRadiation} W/m²`, icon: '☀️', color: '#ffd700' },
            { label: 'WBGT', value: `${selected.wbgt}°C`, icon: '🔥', color: '#ff6b00' },
            { label: 'UTCI', value: `${selected.utci}°C`, icon: '🌐', color: '#a855f7' },
            { label: 'Heat Index', value: `${selected.heatIndex}°C`, icon: '🌡️', color: '#ef4444' },
            { label: 'Mortality Risk', value: `${selected.mortalityRisk}%`, icon: '⚠️', color: STRESS_COLORS[selected.stressCategory.label] },
          ].map((m, i) => (
            <div className="detail-metric" key={i}>
              <span className="detail-metric-icon">{m.icon}</span>
              <div>
                <span className="detail-metric-label">{m.label}</span>
                <span className="detail-metric-value" style={{ color: m.color }}>{m.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WBGT Reference Table */}
      <div className="wbgt-reference card">
        <h4 className="ref-title">📋 WBGT Risk Reference Scale (ISO 7933)</h4>
        <div className="ref-scale">
          {WBGT_RANGES.map((r, i) => (
            <div key={i} className="ref-item" style={{ background: r.bg, borderColor: `${r.color}33` }}>
              <div className="ref-dot" style={{ background: r.color }} />
              <div>
                <span className="ref-label" style={{ color: r.color }}>{r.label}</span>
                <span className="ref-range">{r.range} WBGT</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RiskForecast;
