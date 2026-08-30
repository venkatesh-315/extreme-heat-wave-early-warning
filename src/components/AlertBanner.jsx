import React from 'react';
import { AlertTriangleIcon, AmbulanceIcon, PhoneIcon } from './icons';
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
          <AlertTriangleIcon size={20} color={alertColor} />
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
            High thermal burden detected. Mortality Risk: <strong>{mortalityRisk}%</strong>.
            {mortalityRisk >= 60
              ? ' Outdoor manual work suspended 11 AM - 4:30 PM. Municipal cooling shelters and heat ICUs on active emergency status.'
              : ' Maintain scheduled hydration, avoid peak solar exposure, and monitor vulnerable seniors and children.'}
          </p>
        </div>

        <div className="alert-quick-actions">
          <a href="tel:108" className="btn btn-danger btn-sm">
            <AmbulanceIcon size={14} color="#ffffff" />
            <span>Call 108 Ambulance</span>
          </a>
          <a href="tel:1077" className="btn btn-secondary btn-sm">
            <PhoneIcon size={14} />
            <span>1077 Disaster Desk</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AlertBanner;
