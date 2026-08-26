import React from 'react';
import './AlertBanner.css';

function AlertBanner({ location, stressCategory, mortalityRisk, imdAlert }) {
  const isExtreme = stressCategory?.level >= 5;
  const alertColor = imdAlert?.color || (isExtreme ? '#dc2626' : '#ea580c');
  const alertTitle = imdAlert?.title || (isExtreme ? 'RED ALERT — Severe Heatwave Action' : 'ORANGE ALERT — Heatwave Warning');

  return (
    <div
      className={`alert-banner-light ${isExtreme ? 'extreme' : 'high'}`}
      style={{ borderLeftColor: alertColor }}
      role="alert"
    >
      <div className="alert-inner-row">
        <div className="alert-icon-wrap" style={{ background: `${alertColor}15`, color: alertColor }}>
          <span className="alert-pulse" style={{ borderColor: alertColor }} />
          <span className="alert-emoji">⚠️</span>
        </div>

        <div className="alert-content-block">
          <div className="alert-headline-row">
            <span className="alert-tag" style={{ background: alertColor, color: '#ffffff' }}>
              {alertTitle}
            </span>
            <span className="alert-loc-name">
              {location?.name} ({location?.state})
            </span>
          </div>

          <p className="alert-body-text">
            Dangerous thermal stress detected. Mortality Risk: <strong>{mortalityRisk}%</strong>.
            {mortalityRisk >= 60
              ? ' Outdoor labor suspended 11 AM - 4 PM. Municipal cooling shelters & heat ICUs on immediate active status.'
              : ' Maintain scheduled hydration, avoid direct sunlight, and check on elderly citizens.'}
          </p>
        </div>

        <div className="alert-quick-actions">
          <a href="tel:108" className="btn btn-danger btn-sm">
            🚑 Call 108 Ambulance
          </a>
          <a href="tel:1077" className="btn btn-secondary btn-sm">
            🚨 1077 Disaster Desk
          </a>
        </div>
      </div>
    </div>
  );
}

export default AlertBanner;
