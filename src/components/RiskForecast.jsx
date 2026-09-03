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
import { useLanguage } from '../context/LanguageContext';
import './RiskForecast.css';

const STRESS_COLORS = {
  Low: '#16a34a',
  Moderate: '#ca8a04',
  High: '#f97316',
  'Very High': '#ea580c',
  Extreme: '#dc2626',
  Catastrophic: '#991b1b',
};

function RiskForecast({ forecast = [], location }) {
  const { t } = useLanguage();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selected = forecast[selectedDayIndex] || forecast[0];

  if (!forecast || forecast.length === 0 || !selected) return null;

  return (
    <div className="forecast-section card" id="risk-forecast">
      <div className="forecast-header">
        <div>
          <div className="forecast-badge">
            <CalendarIcon size={13} color="#1e40af" />
            <span>{t('fc_synoptic_title', '7-Day IMD Synoptic Outlook')}</span>
          </div>
          <h3 className="section-title">
            {t('fc_summer_title', 'Summer 2026 Thermal Risk Forecast')} &mdash; {location?.name}
          </h3>
          <p className="section-desc">
            {t('fc_summer_desc', 'Day-by-day maximum temperature, humidity, WBGT, and mortality risk projections.')}
          </p>
        </div>
      </div>

      {/* 7-Day Horizontal Strip */}
      <div className="forecast-cards-strip">
        {forecast.map((day, i) => {
          const color = STRESS_COLORS[day.stressCategory?.label] || '#ea580c';
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
                <span className="fc-risk-pct" style={{ color }}>{day.mortalityRisk}% {t('fc_risk', 'Risk')}</span>
                <span
                  className="fc-tag"
                  style={{ background: `${color}14`, color, border: `1px solid ${color}33` }}
                >
                  {day.stressCategory?.label || 'Normal'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day In-Depth Breakdown */}
      <div className="selected-day-detail card">
        <div className="day-detail-header">
          <div className="day-detail-titles">
            <span className="day-detail-date">{t('fc_advisory_for', 'Detailed Advisory for')} {selected.day} ({selected.date})</span>
            <h4>{selected.temperature}&deg;C {t('fc_max_temp', 'Max Air Temperature')} &middot; {selected.wbgt}&deg;C WBGT</h4>
          </div>
          <span
            className="detail-alert-badge"
            style={{
              background: `${STRESS_COLORS[selected.stressCategory?.label]}15`,
              color: STRESS_COLORS[selected.stressCategory?.label],
              border: `1px solid ${STRESS_COLORS[selected.stressCategory?.label]}44`,
            }}
          >
            {selected.stressCategory?.label} ({selected.stressCategory?.text || 'Alert'})
          </span>
        </div>

        <div className="day-detail-grid">
          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#fff7ed' }}>
              <ThermometerIcon size={18} color="#ea580c" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">{t('param_temperature', 'Max Temperature')}</span>
              <strong className="dd-value" style={{ color: '#ea580c' }}>{selected.temperature}&deg;C</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#fef2f2' }}>
              <FlameIcon size={18} color="#dc2626" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">WBGT</span>
              <strong className="dd-value" style={{ color: '#dc2626' }}>{selected.wbgt}&deg;C</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#fff1f2' }}>
              <GaugeIcon size={18} color="#b91c1c" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">{t('hourly_heat_index', 'Heat Index')}</span>
              <strong className="dd-value" style={{ color: '#b91c1c' }}>{selected.heatIndex}&deg;C</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#f5f3ff' }}>
              <ActivityIcon size={18} color="#7c3aed" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">UTCI</span>
              <strong className="dd-value" style={{ color: '#7c3aed' }}>{selected.utci}&deg;C</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#f0f9ff' }}>
              <WaterIcon size={18} color="#0284c7" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">{t('gis_rel_humidity', 'Relative Humidity')}</span>
              <strong className="dd-value" style={{ color: '#0284c7' }}>{selected.humidity}%</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#fffbeb' }}>
              <SunIcon size={18} color="#d97706" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">{t('card_solar', 'Solar Irradiance')}</span>
              <strong className="dd-value" style={{ color: '#d97706' }}>{selected.solarRadiation} W/m²</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#f8fafc' }}>
              <WindIcon size={18} color="#64748b" />
            </div>
            <div className="dd-texts">
              <span className="dd-label">{t('param_wind', 'Wind Speed')}</span>
              <strong className="dd-value" style={{ color: '#64748b' }}>{selected.windSpeed} km/h</strong>
            </div>
          </div>

          <div className="dd-item">
            <div className="dd-icon-box" style={{ background: '#fef2f2' }}>
              <ShieldAlertIcon size={18} color={STRESS_COLORS[selected.stressCategory?.label]} />
            </div>
            <div className="dd-texts">
              <span className="dd-label">{t('card_mortality_risk', 'Excess Mortality Risk')}</span>
              <strong className="dd-value" style={{ color: STRESS_COLORS[selected.stressCategory?.label] }}>
                {selected.mortalityRisk}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ISO & Warning Matrix Reference */}
      <div className="forecast-matrix-ref">
        <h4 className="matrix-title">Heat Action Matrix Guidance (Summer 2026)</h4>
        <div className="matrix-chips">
          <div className="matrix-chip green">
            <span className="chip-badge">GREEN</span>
            <span className="chip-desc">&lt;40&deg;C: Normal conditions. Standard hydration advisory.</span>
          </div>
          <div className="matrix-chip yellow">
            <span className="chip-badge">YELLOW</span>
            <span className="chip-desc">40-42&deg;C: Be Updated. Outdoor workers stay hydrated.</span>
          </div>
          <div className="matrix-chip orange">
            <span className="chip-badge">ORANGE</span>
            <span className="chip-desc">42-44&deg;C: Be Prepared. Halt work 12-3 PM. Open cooling shelters.</span>
          </div>
          <div className="matrix-chip red">
            <span className="chip-badge">RED</span>
            <span className="chip-desc">&gt;44&deg;C or WBGT &gt;32&deg;: Take Action. Emergency protocols active.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskForecast;
