import React from 'react';
import { AlertTriangleIcon, AmbulanceIcon, PhoneIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';
import './AlertBanner.css';

function AlertBanner({ location, stressCategory, mortalityRisk, imdAlert }) {
  const { t } = useLanguage();
  const isExtreme = stressCategory?.level >= 5 || (mortalityRisk ?? 0) >= 60;
  const alertColor = imdAlert?.color || (isExtreme ? '#dc2626' : '#ea580c');
  const alertTitle = isExtreme
    ? t('alert_red_name', 'RED ALERT — Severe Heatwave Action')
    : t('alert_orange_name', 'ORANGE ALERT — Heatwave Warning');
  const alertBodyText = isExtreme
    ? t('alert_banner_red', 'RED EMERGENCY: Wet Bulb Globe Temperature is at critical lethal thresholds. Outdoor work paused.')
    : t('alert_banner_orange', 'ORANGE WARNING: High thermal stress detected. Vulnerable groups must remain indoors.');

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
            {alertBodyText} ({t('card_mortality_risk', 'Mortality Risk')}: <strong>{mortalityRisk}%</strong>)
          </p>
        </div>

        <div className="alert-quick-actions">
          <a href="tel:108" className="btn btn-danger btn-sm">
            <AmbulanceIcon size={14} color="#ffffff" />
            <span>{t('helplineAmbulance', 'Call 108 Ambulance')}</span>
          </a>
          <a href="tel:1077" className="btn btn-secondary btn-sm">
            <PhoneIcon size={14} />
            <span>{t('helplineDisaster', '1077 Disaster Desk')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AlertBanner;
