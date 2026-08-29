import React, { useState, useEffect } from 'react';
import { AlertTriangleIcon, ArrowRightIcon, ClockIcon } from './icons';
import './ActiveAlertCard.css';

function ActiveAlertCard({ thermalMetrics, location, onViewAllAlerts }) {
  const [currentDateTimeStr, setCurrentDateTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setCurrentDateTimeStr(`${datePart}, ${timePart}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const imdAlert = thermalMetrics?.imdAlert || {
    title: 'MODERATE HEAT WATCH',
    level: 'Yellow Watch',
    description: 'Heat stress conditions active. General public advised to stay hydrated.',
    color: '#ca8a04',
    bgColor: '#fefce8',
    borderColor: '#fef08a',
  };

  const riskPct = thermalMetrics?.mortalityRisk ?? 25;
  const rawPop = location?.population || 2500000;
  const affectedCount = Math.round((rawPop * (riskPct / 100)) / 10000) / 100; // in Lakhs
  const populationStr = affectedCount >= 100
    ? `${(affectedCount / 100).toFixed(2)} Cr vulnerable`
    : `${affectedCount.toFixed(2)} Lakh vulnerable`;

  const alertColor = imdAlert.color || '#ea580c';
  const alertBg = imdAlert.bgColor || '#fff7ed';

  return (
    <div className="card active-alert-card" id="active-alert-card">
      <div className="alert-card-top">
        <span className="alert-header-badge" style={{ color: alertColor }}>
          <AlertTriangleIcon size={14} color={alertColor} />
          <span>Active Alert</span>
        </span>
      </div>

      <div className="alert-card-content">
        <div className="alert-title-row">
          <h4 className="alert-type-heading" style={{ color: alertColor }}>
            {imdAlert.title || 'HEAT ALERT'}
          </h4>
          <span className="red-alert-pill" style={{ background: alertBg, color: alertColor, borderColor: `${alertColor}44` }}>
            <span className="red-alert-dot" style={{ background: alertColor }} />
            <span>{imdAlert.level || 'Active'}</span>
          </span>
        </div>

        <p className="alert-desc-text">
          {imdAlert.description || 'Continuous biometeorological monitoring for vulnerable population groups.'}
        </p>

        <div className="alert-meta-block">
          <div className="alert-meta-line">
            <span className="meta-lbl">Vulnerable Population</span>
            <span className="meta-val">{populationStr}</span>
          </div>

          <div className="alert-time-line">
            <span className="time-clock-icon">
              <ClockIcon size={13} color={alertColor} />
            </span>
            <span>{currentDateTimeStr || 'Present Date Live Sync'}</span>
          </div>
        </div>

        <button className="view-alerts-btn" onClick={onViewAllAlerts} style={{ color: alertColor }}>
          <span>View All Alerts</span>
          <ArrowRightIcon size={14} color={alertColor} />
        </button>
      </div>
    </div>
  );
}

export default ActiveAlertCard;
