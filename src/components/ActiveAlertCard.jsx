import React, { useState, useEffect } from 'react';
import { AlertTriangleIcon, ArrowRightIcon, ClockIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';
import './ActiveAlertCard.css';

function ActiveAlertCard({ thermalMetrics, location, onViewAllAlerts }) {
  const { t } = useLanguage();
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

  const isRed = imdAlert.level === 'Red Alert' || (thermalMetrics?.mortalityRisk ?? 0) >= 60;
  const isOrange = imdAlert.level === 'Orange Alert' || (thermalMetrics?.mortalityRisk ?? 0) >= 40;

  const translatedTitle = isRed
    ? t('alert_red_name', imdAlert.title || 'Severe Heatwave Red Alert')
    : isOrange
    ? t('alert_orange_name', imdAlert.title || 'High Heatwave Orange Alert')
    : t('alert_yellow_name', imdAlert.title || 'Moderate Heat Advisory');

  const translatedDesc = isRed
    ? t('alert_red_desc', imdAlert.description)
    : isOrange
    ? t('alert_orange_desc', imdAlert.description)
    : t('alert_yellow_desc', imdAlert.description);

  const translatedLevel = isRed
    ? t('status_extreme_danger', 'Red Alert')
    : isOrange
    ? t('status_danger', 'Orange Alert')
    : t('status_caution', 'Yellow Watch');

  const riskPct = thermalMetrics?.mortalityRisk ?? 25;
  const rawPop = location?.population || 2500000;
  const affectedCount = Math.round((rawPop * (riskPct / 100)) / 10000) / 100; // in Lakhs
  const populationStr = affectedCount >= 100
    ? `${(affectedCount / 100).toFixed(2)} ${t('unit_cr', 'Cr')} ${t('vulnerable_suffix', 'vulnerable')}`
    : `${affectedCount.toFixed(2)} ${t('unit_lakh', 'Lakh')} ${t('vulnerable_suffix', 'vulnerable')}`;

  const alertColor = imdAlert.color || '#ea580c';
  const alertBg = imdAlert.bgColor || '#fff7ed';

  return (
    <div className="card active-alert-card" id="active-alert-card">
      <div className="alert-card-top">
        <span className="alert-header-badge" style={{ color: alertColor }}>
          <AlertTriangleIcon size={14} color={alertColor} />
          <span>{t('card_alert_title', 'Active Alert')}</span>
        </span>
      </div>

      <div className="alert-card-content">
        <div className="alert-title-row">
          <h4 className="alert-type-heading" style={{ color: alertColor }}>
            {translatedTitle}
          </h4>
          <span className="red-alert-pill" style={{ background: alertBg, color: alertColor, borderColor: `${alertColor}44` }}>
            <span className="red-alert-dot" style={{ background: alertColor }} />
            <span>{translatedLevel}</span>
          </span>
        </div>

        <p className="alert-desc-text">
          {translatedDesc}
        </p>

        <div className="alert-meta-block">
          <div className="alert-meta-line">
            <span className="meta-lbl">{t('card_pop_title', 'Vulnerable Population')}</span>
            <span className="meta-val">{populationStr}</span>
          </div>

          <div className="alert-time-line">
            <span className="time-clock-icon">
              <ClockIcon size={13} color={alertColor} />
            </span>
            <span>{currentDateTimeStr || t('telemetrySync', 'Present Date Live Sync')}</span>
          </div>
        </div>

        <button className="view-alerts-btn" onClick={onViewAllAlerts} style={{ color: alertColor }}>
          <span>{t('card_alert_btn', 'View Full Alerts →')}</span>
          <ArrowRightIcon size={14} color={alertColor} />
        </button>
      </div>
    </div>
  );
}

export default ActiveAlertCard;
