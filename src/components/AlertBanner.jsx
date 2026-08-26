import React from 'react';
import './AlertBanner.css';

function AlertBanner({ city, stressCategory, mortalityRisk }) {
  const isExtreme = stressCategory.level >= 5;

  return (
    <div className={`alert-banner ${isExtreme ? 'extreme' : 'very-high'}`}>
      <div className="alert-inner">
        <div className="alert-icon-wrap">
          <span className={`alert-pulse-ring ${isExtreme ? 'extreme' : ''}`} />
          <span className="alert-icon">⚠️</span>
        </div>
        <div className="alert-content">
          <span className="alert-label">
            {isExtreme ? '🔴 CATASTROPHIC HEAT EMERGENCY' : '🟠 EXTREME HEAT WARNING'}
          </span>
          <span className="alert-message">
            {city?.name} — {stressCategory.label} thermal stress conditions detected.
            Mortality Risk: <strong>{mortalityRisk}%</strong>. 
            {mortalityRisk >= 70 ? ' Immediate evacuation of vulnerable populations recommended.' : ' Activate heat action plan immediately.'}
          </span>
        </div>
        <div className="alert-actions">
          <button id="alert-sms-btn" className="alert-btn sms">📱 Send SMS Alert</button>
          <button id="alert-whatsapp-btn" className="alert-btn whatsapp">💬 WhatsApp Blast</button>
        </div>
      </div>
    </div>
  );
}

export default AlertBanner;
