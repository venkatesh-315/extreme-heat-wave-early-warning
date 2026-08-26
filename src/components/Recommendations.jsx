import React, { useState } from 'react';
import './Recommendations.css';

const PRIORITY_CONFIG = {
  CRITICAL: { color: '#ff2d2d', bg: 'rgba(255,45,45,0.1)', border: 'rgba(255,45,45,0.3)', icon: '🔴' },
  HIGH: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', icon: '🟠' },
  MODERATE: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', icon: '🟡' },
  LOW: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', icon: '🟢' },
};

const SMS_TEMPLATES = [
  {
    id: 'sms-general',
    label: 'General Public Advisory',
    content: '🌡️ HEAT ALERT: Extreme heatwave conditions in your area. Stay indoors 11AM-4PM. Drink water every 30 mins. Call 104 for heat emergencies. Stay safe! — District Administration',
  },
  {
    id: 'sms-workers',
    label: 'Outdoor Workers Alert',
    content: '⚠️ WORKER HEAT SAFETY: All outdoor work suspended 11AM-4PM due to extreme heat. Mandatory shade breaks. Drink 1L water/hour. Seek shade immediately if dizzy. — Labour Dept',
  },
  {
    id: 'sms-health',
    label: 'Healthcare System Alert',
    content: '🏥 HEALTH SYSTEM ALERT: Activate Heat Action Plan. Pre-position IV fluids & ORS. All PHCs to extend hours till 8PM. WBGT > 32°C recorded. — CMO Office',
  },
  {
    id: 'sms-cooling',
    label: 'Cooling Centre Notification',
    content: '❄️ FREE COOLING CENTRES NOW OPEN: Government schools & community halls open 24/7 with AC, water & food. Bring elderly & children. Free of cost. — Municipal Corporation',
  },
];

function Recommendations({ recommendations, city, thermalMetrics }) {
  const [copiedId, setCopiedId] = useState(null);
  const [activeSmsTab, setActiveSmsTab] = useState(0);
  const [alertSent, setAlertSent] = useState(false);

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSendAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  const criticalCount = recommendations.filter(r => r.priority === 'CRITICAL').length;

  return (
    <div className="recommendations-section" id="recommendations-section">
      {/* Summary banner */}
      <div className="reco-summary card">
        <div className="reco-summary-left">
          <h3 className="section-title">🚨 Action Recommendations — {city?.name}</h3>
          <p className="reco-subtitle">
            {criticalCount} critical · {recommendations.length - criticalCount} high-priority actions required
          </p>
        </div>
        <div className="reco-summary-stats">
          <div className="reco-stat">
            <span className="reco-stat-val" style={{ color: '#ff2d2d' }}>{criticalCount}</span>
            <span className="reco-stat-label">Critical Actions</span>
          </div>
          <div className="reco-stat">
            <span className="reco-stat-val" style={{ color: '#f97316' }}>{thermalMetrics?.wbgt?.toFixed(1)}°C</span>
            <span className="reco-stat-label">Current WBGT</span>
          </div>
          <div className="reco-stat">
            <span className="reco-stat-val" style={{ color: '#ef4444' }}>{thermalMetrics?.mortalityRisk}%</span>
            <span className="reco-stat-label">Mortality Risk</span>
          </div>
        </div>
      </div>

      {/* Recommendations list */}
      <div className="reco-list">
        {recommendations.map((rec, i) => {
          const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG['LOW'];
          return (
            <div
              key={i}
              id={`recommendation-${i}`}
              className="reco-item"
              style={{ background: config.bg, border: `1px solid ${config.border}` }}
            >
              <div className="reco-icon-wrap">
                <span className="reco-emoji">{rec.icon}</span>
              </div>
              <div className="reco-body">
                <div className="reco-header-row">
                  <span className="reco-category">{rec.category}</span>
                  <span
                    className="reco-priority-badge"
                    style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
                  >
                    {config.icon} {rec.priority}
                  </span>
                </div>
                <p className="reco-action">{rec.action}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SMS/WhatsApp Alert Panel */}
      <div className="alert-panel card" id="alert-dispatch-panel">
        <div className="alert-panel-header">
          <h4 className="alert-panel-title">📱 Automated Alert Dispatch System</h4>
          <p className="alert-panel-desc">Pre-built regional alert templates — SMS · WhatsApp · IVR</p>
        </div>

        <div className="sms-tabs">
          {SMS_TEMPLATES.map((tmpl, i) => (
            <button
              key={i}
              id={`sms-tab-${i}`}
              className={`sms-tab ${activeSmsTab === i ? 'active' : ''}`}
              onClick={() => setActiveSmsTab(i)}
            >
              {tmpl.label}
            </button>
          ))}
        </div>

        <div className="sms-preview">
          <div className="sms-phone-mock">
            <div className="phone-status-bar">
              <span>SMS · 12:34</span>
              <span>📶 ✉️</span>
            </div>
            <div className="phone-message-wrap">
              <div className="phone-bubble">{SMS_TEMPLATES[activeSmsTab].content}</div>
              <div className="phone-meta">District Administration · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
            </div>
          </div>

          <div className="sms-actions">
            <div className="target-stats">
              <div className="target-item">
                <span className="target-icon">👥</span>
                <div>
                  <span className="target-label">Target Recipients</span>
                  <span className="target-value">2.4M residents</span>
                </div>
              </div>
              <div className="target-item">
                <span className="target-icon">⏱️</span>
                <div>
                  <span className="target-label">Est. Delivery</span>
                  <span className="target-value">3–5 minutes</span>
                </div>
              </div>
              <div className="target-item">
                <span className="target-icon">💸</span>
                <div>
                  <span className="target-label">Cost Estimate</span>
                  <span className="target-value">₹12,000</span>
                </div>
              </div>
            </div>

            <div className="dispatch-btns">
              <button
                id="copy-sms-btn"
                className="btn btn-secondary"
                onClick={() => handleCopy(SMS_TEMPLATES[activeSmsTab].id, SMS_TEMPLATES[activeSmsTab].content)}
              >
                {copiedId === SMS_TEMPLATES[activeSmsTab].id ? '✅ Copied!' : '📋 Copy Template'}
              </button>
              <button
                id="send-sms-btn"
                className="btn btn-primary"
                onClick={handleSendAlert}
              >
                {alertSent ? '✅ Alert Queued!' : '🚀 Send SMS Alert'}
              </button>
              <button id="send-whatsapp-btn" className="btn" style={{ background: 'rgba(37,211,102,0.2)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)' }}>
                💬 WhatsApp Blast
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Heat Action Plan checklist */}
      <div className="hap-card card" id="heat-action-plan">
        <h4 className="hap-title">📋 Heat Action Plan (HAP) Checklist</h4>
        <div className="hap-grid">
          {[
            { icon: '❄️', title: 'Cooling Centers', desc: 'Open govt buildings with AC, fans, water, food', status: 'ACTIVATE' },
            { icon: '💧', title: 'Water Tankers', desc: 'Double frequency to slums & heat islands', status: 'DISPATCH' },
            { icon: '⚡', title: 'Power Grid', desc: 'No load-shedding in hospitals & ICUs', status: 'ALERT DISCOM' },
            { icon: '🏥', title: 'Healthcare', desc: 'Pre-position IV fluids, ORS, ice packs', status: 'PREPARE' },
            { icon: '📢', title: 'Media Advisory', desc: 'Issue press release & social media alerts', status: 'ISSUE' },
            { icon: '👮', title: 'Field Teams', desc: 'Deploy heat patrol teams in vulnerable zones', status: 'DEPLOY' },
          ].map((item, i) => (
            <div key={i} className="hap-item" id={`hap-item-${i}`}>
              <span className="hap-icon">{item.icon}</span>
              <div className="hap-info">
                <span className="hap-item-title">{item.title}</span>
                <span className="hap-item-desc">{item.desc}</span>
              </div>
              <span className="hap-status">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
