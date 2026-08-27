import React, { useState } from 'react';
import { MULTILINGUAL_SMS_TEMPLATES } from '../data/mockData';
import {
  ShieldAlertIcon,
  MessageSquareIcon,
  CopyIcon,
  SendIcon,
  CheckIcon,
  HospitalIcon,
  WaterIcon,
  UsersIcon,
  BuildingIcon
} from './icons';
import './Recommendations.css';

const PRIORITY_CONFIG = {
  CRITICAL: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'CRITICAL ACTION' },
  HIGH: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'HIGH PRIORITY' },
  MODERATE: { color: '#ca8a04', bg: '#fefce8', border: '#fef08a', label: 'MODERATE' },
  LOW: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'STANDARD' },
};

function Recommendations({ recommendations = [], location, thermalMetrics }) {
  const [activeSmsIndex, setActiveSmsIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState(null);

  const selectedTemplate = MULTILINGUAL_SMS_TEMPLATES[activeSmsIndex] || MULTILINGUAL_SMS_TEMPLATES[0];

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSimulateDispatch = (channel) => {
    setDispatchStatus(`Queued broadcast via ${channel} to district telemetry gateways.`);
    setTimeout(() => setDispatchStatus(null), 3500);
  };

  const criticalCount = recommendations.filter((r) => r.priority === 'CRITICAL').length;

  return (
    <div className="recommendations-section" id="recommendations-section">
      {/* Executive Heat Action Plan Header */}
      <div className="hap-executive-card card">
        <div className="hap-left">
          <div className="hap-badge">
            <ShieldAlertIcon size={13} color="#dc2626" />
            <span>Heat Action Protocols</span>
          </div>
          <h3 className="section-title">
            Inter-Agency Directives &amp; Public Advisories &mdash; {location?.name}
          </h3>
          <p className="section-desc">
            Standard operating procedures triggered for Current WBGT {thermalMetrics?.wbgt}&deg;C &amp; {thermalMetrics?.mortalityRisk}% Excess Mortality Risk.
          </p>
        </div>

        <div className="hap-stats-row">
          <div className="hap-stat-pill critical">
            <span className="hsp-val">{criticalCount}</span>
            <span className="hsp-lbl">Critical Directives</span>
          </div>
          <div className="hap-stat-pill">
            <span className="hsp-val">{thermalMetrics?.wbgt}&deg;C</span>
            <span className="hsp-lbl">Current WBGT</span>
          </div>
          <div className="hap-stat-pill">
            <span className="hsp-val">{thermalMetrics?.mortalityRisk}%</span>
            <span className="hsp-lbl">Mortality Risk</span>
          </div>
        </div>
      </div>

      {/* Action Recommendations List */}
      <div className="action-items-list">
        {recommendations.map((item, idx) => {
          const conf = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.LOW;
          return (
            <div
              key={idx}
              className="action-card card"
              style={{ borderLeft: `4px solid ${conf.color}` }}
            >
              <div className="action-icon-col">
                <ShieldAlertIcon size={20} color={conf.color} />
              </div>

              <div className="action-body">
                <div className="action-top-row">
                  <span className="action-category">{item.category}</span>
                  <span
                    className="action-priority-badge"
                    style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}
                  >
                    {conf.label}
                  </span>
                </div>

                <h4 className="action-title-text">{item.title || item.category}</h4>
                <p className="action-desc-text">{item.action}</p>

                {item.authority && (
                  <div className="action-authority">
                    <span>Enforcing Authority:</span> <strong>{item.authority}</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Lingual SMS & WhatsApp Broadcast Generator */}
      <div className="sms-broadcast-card card" id="sms-dispatcher">
        <div className="sms-card-header">
          <div>
            <h4 className="section-title">
              <MessageSquareIcon size={18} color="#1e40af" />
              <span>Multi-Lingual Emergency Alert Broadcast Engine</span>
            </h4>
            <p className="section-desc">
              Pre-approved bi-lingual advisory templates for SMS, WhatsApp, Wireless Emergency Alerts (WEA), and Radio.
            </p>
          </div>
        </div>

        <div className="sms-language-tabs">
          {MULTILINGUAL_SMS_TEMPLATES.map((tmpl, idx) => (
            <button
              key={tmpl.id}
              className={`sms-lang-tab ${activeSmsIndex === idx ? 'active' : ''}`}
              onClick={() => setActiveSmsIndex(idx)}
            >
              <span className="sms-lang-tag">{tmpl.lang === 'Hindi' ? 'हिन्दी' : 'English'}</span>
              <span className="sms-tab-name">{tmpl.label}</span>
            </button>
          ))}
        </div>

        <div className="sms-preview-layout">
          {/* Phone Simulation */}
          <div className="phone-screen-mock">
            <div className="phone-top-bar">
              <span>National Disaster Alert &middot; 1077</span>
              <span>Cellular Broadcast</span>
            </div>
            <div className="phone-bubble-box">
              <div className="sms-bubble">{selectedTemplate.content}</div>
              <div className="sms-timestamp">District Disaster Management Authority &middot; Just Now</div>
            </div>
          </div>

          {/* Dispatch Controls & Audience Stats */}
          <div className="sms-controls-side">
            <div className="target-audience-box">
              <div className="aud-row">
                <span className="aud-lbl">Target Audience:</span>
                <strong>{selectedTemplate.recipient}</strong>
              </div>
              <div className="aud-row">
                <span className="aud-lbl">Estimated Reach:</span>
                <strong>~1.85 Million Mobile Subscribers</strong>
              </div>
              <div className="aud-row">
                <span className="aud-lbl">Delivery SLA:</span>
                <span className="aud-green">Under 120 Seconds</span>
              </div>
            </div>

            <div className="dispatch-buttons-group">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopy(selectedTemplate.id, selectedTemplate.content)}
              >
                {copiedId === selectedTemplate.id ? <CheckIcon size={14} color="#16a34a" /> : <CopyIcon size={14} />}
                <span>{copiedId === selectedTemplate.id ? 'Copied to Clipboard!' : 'Copy Alert Text'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleSimulateDispatch('SMS Gateway')}
              >
                <SendIcon size={14} />
                <span>Dispatch SMS Broadcast</span>
              </button>

              <button
                type="button"
                className="btn btn-sm whatsapp-btn"
                onClick={() => handleSimulateDispatch('WhatsApp Channel')}
              >
                <MessageSquareIcon size={14} />
                <span>WhatsApp Channel Blast</span>
              </button>
            </div>

            {dispatchStatus && (
              <div className="dispatch-alert-success animate-fade-in">
                <CheckIcon size={16} color="#15803d" />
                <span>{dispatchStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sector-Wise Operational Checklist */}
      <div className="sector-checklist-card card">
        <h4 className="section-title">
          <BuildingIcon size={18} color="#1e40af" />
          <span>Municipal Sector-Wise Readiness Checklist</span>
        </h4>
        <div className="sector-grid">
          {[
            { icon: BuildingIcon, iconColor: '#2563eb', title: 'Cooling Centers', status: 'ACTIVE', desc: 'Air-cooled community halls & night shelters open 24/7' },
            { icon: WaterIcon, iconColor: '#0891b2', title: 'Water Tankers', status: 'DEPLOYED', desc: 'High-frequency refill trips to vulnerable areas and transit hubs' },
            { icon: ShieldAlertIcon, iconColor: '#ea580c', title: 'Power Grid Priority', status: 'ALERTED', desc: 'Zero load-shedding directives active for hospitals & ICU units' },
            { icon: HospitalIcon, iconColor: '#dc2626', title: 'Health ICUs', status: 'EQUIPPED', desc: 'Ice baths, cold IV saline, and ORS packets pre-stocked' },
            { icon: UsersIcon, iconColor: '#7c3aed', title: 'Labour Regulations', status: 'ENFORCED', desc: 'Mandatory halt on outdoor construction 11:00 AM - 4:30 PM' },
            { icon: ShieldAlertIcon, iconColor: '#059669', title: 'Public Transit', status: 'CHECKED', desc: 'Cool drinking water & ORS booths at major metro & bus hubs' },
          ].map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <div key={i} className="sector-item">
                <div className="sector-icon-wrap" style={{ background: `${item.iconColor}14` }}>
                  <ItemIcon size={18} color={item.iconColor} />
                </div>
                <div className="sector-texts">
                  <div className="sector-top">
                    <span className="sector-name">{item.title}</span>
                    <span className="sector-status-pill">{item.status}</span>
                  </div>
                  <p className="sector-desc">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
