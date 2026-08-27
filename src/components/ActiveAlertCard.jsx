import React from 'react';
import { AlertTriangleIcon, ArrowRightIcon } from './icons';
import './ActiveAlertCard.css';

function ActiveAlertCard({ thermalMetrics, location, onViewAllAlerts }) {
  const imdAlert = thermalMetrics?.imdAlert || {
    title: 'EXTREME HEAT ALERT',
    level: 'Red Alert',
    description: 'Severe heatwave conditions likely to persist for next 3 days.'
  };

  const populationStr = location?.population
    ? `${(location.population / 1e6).toFixed(1)}M with high risk`
    : '3.4M with high risk';

  return (
    <div className="card active-alert-card" id="active-alert-card">
      <div className="alert-card-top">
        <span className="alert-header-badge">
          <AlertTriangleIcon size={14} color="#dc2626" />
          <span>Active Alert</span>
        </span>
      </div>

      <div className="alert-card-content">
        <div className="alert-title-row">
          <h4 className="alert-type-heading">EXTREME HEAT ALERT</h4>
          <span className="red-alert-pill">
            <span className="red-alert-dot" />
            <span>Red Alert</span>
          </span>
        </div>

        <p className="alert-desc-text">
          Severe heatwave conditions likely to persist for next 3 days.
        </p>

        <div className="alert-meta-block">
          <div className="alert-meta-line">
            <span className="meta-lbl">Affected Population</span>
            <span className="meta-val">{populationStr}</span>
          </div>

          <div className="alert-time-line">
            <span className="time-clock-icon">🕒</span>
            <span>29 Aug 2025, 10:00 AM</span>
          </div>
        </div>

        <button className="view-alerts-btn" onClick={onViewAllAlerts}>
          <span>View All Alerts</span>
          <ArrowRightIcon size={14} color="#dc2626" />
        </button>
      </div>
    </div>
  );
}

export default ActiveAlertCard;
