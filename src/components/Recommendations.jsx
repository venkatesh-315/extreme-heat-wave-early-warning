import React, { useState, useEffect } from 'react';
import {
  ACTION_CENTER_TRANSLATIONS,
  INDIAN_LANGUAGES,
  MULTILINGUAL_EXPANDED_SMS
} from '../data/translations';
import {
  ShieldAlertIcon,
  MessageSquareIcon,
  CopyIcon,
  SendIcon,
  CheckIcon,
  HospitalIcon,
  WaterIcon,
  UsersIcon,
  BuildingIcon,
  GlobeIcon
} from './icons';
import { useLanguage } from '../context/LanguageContext';
import './Recommendations.css';

const PRIORITY_CONFIG = {
  CRITICAL: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'CRITICAL ACTION' },
  HIGH: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'HIGH PRIORITY' },
  MODERATE: { color: '#ca8a04', bg: '#fefce8', border: '#fef08a', label: 'MODERATE' },
  LOW: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'STANDARD' },
};

function Recommendations({ recommendations = [], location, thermalMetrics }) {
  const { currentLanguageObj, t } = useLanguage();
  const initialCode = currentLanguageObj?.code || 'en-IN';
  const [selectedLang, setSelectedLang] = useState(initialCode);
  const [activeSmsTemplateId, setActiveSmsTemplateId] = useState('sms-general');
  const [smsLang, setSmsLang] = useState(initialCode);
  const [copiedId, setCopiedId] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState(null);

  // Synchronize when global website language changes
  useEffect(() => {
    if (currentLanguageObj?.code) {
      setSelectedLang(currentLanguageObj.code);
      setSmsLang(currentLanguageObj.code);
    }
  }, [currentLanguageObj?.code]);

  const currentLangConfig = ACTION_CENTER_TRANSLATIONS[selectedLang] || ACTION_CENTER_TRANSLATIONS['en-IN'];
  const activeTemplate = MULTILINGUAL_EXPANDED_SMS.find((t) => t.id === activeSmsTemplateId) || MULTILINGUAL_EXPANDED_SMS[0];
  const activeSmsVersion = activeTemplate.versions[smsLang] || activeTemplate.versions['en-IN'] || { text: '', script: '' };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSimulateDispatch = (channel) => {
    const langObj = INDIAN_LANGUAGES.find((l) => l.code === smsLang);
    setDispatchStatus(`Queued broadcast via ${channel} in ${langObj?.name || 'Local Language'} (${langObj?.nativeName || ''}).`);
    setTimeout(() => setDispatchStatus(null), 3500);
  };

  const criticalCount = recommendations.filter((r) => r.priority === 'CRITICAL').length;

  return (
    <div className="recommendations-section" id="recommendations-section">
      {/* 1. REGIONAL LANGUAGE TEXT TRANSLATOR BAR */}
      <div className="regional-lang-banner card animate-fade-in">
        <div className="rlb-top-bar">
          <div className="rlb-left-identity">
            <div className="rlb-icon-box">
              <GlobeIcon size={22} color="#1d4ed8" />
            </div>
            <div>
              <div className="rlb-badge-row">
                <span className="rlb-multi-tag">
                  <GlobeIcon size={12} />
                  <span>8 Indian Regional Languages</span>
                </span>
                <span className="rlb-current-tag">
                  Active: <strong>{currentLangConfig.nativeLabel} ({currentLangConfig.langName})</strong>
                </span>
              </div>
              <h3 className="rlb-title">Regional Language Directives &amp; Action Plan</h3>
              <p className="rlb-subtitle">
                Select your preferred Indian language to view real-time NDMA heat action directives and advisories in native text.
              </p>
            </div>
          </div>
        </div>

        {/* Language Selector Pills */}
        <div className="rlb-lang-strip">
          <span className="rlb-lang-label">
            <GlobeIcon size={14} />
            <span>Select Language:</span>
          </span>
          <div className="rlb-lang-pills-list">
            {INDIAN_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`rlb-lang-pill ${selectedLang === lang.code ? 'active' : ''}`}
                onClick={() => setSelectedLang(lang.code)}
              >
                <span className="rlb-flag">{lang.flag}</span>
                <span className="rlb-native-name">{lang.nativeName}</span>
                <span className="rlb-eng-name">({lang.name})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Executive Heat Action Plan Header */}
      <div className="hap-executive-card card">
        <div className="hap-left">
          <div className="hap-badge">
            <ShieldAlertIcon size={13} color="#dc2626" />
            <span>Heat Action Protocols &middot; {currentLangConfig.nativeLabel}</span>
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
            <span className="hsp-lbl">{t('gis_critical_directives', 'Critical Directives')}</span>
          </div>
          <div className="hap-stat-pill">
            <span className="hsp-val">{thermalMetrics?.wbgt}&deg;C</span>
            <span className="hsp-lbl">WBGT</span>
          </div>
          <div className="hap-stat-pill">
            <span className="hsp-val">{thermalMetrics?.mortalityRisk}%</span>
            <span className="hsp-lbl">{t('card_mortality_risk', 'Mortality Risk')}</span>
          </div>
        </div>
      </div>

      {/* 3. Action Recommendations List Rendered in Selected Local Language */}
      <div className="action-items-list">
        {recommendations.map((item, idx) => {
          const conf = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.LOW;
          const trans = currentLangConfig.directiveTranslations?.[item.title] || null;
          const title = trans?.title || item.title || item.category;
          const action = trans?.action || item.action;

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="action-category">{item.category}</span>
                    <span
                      className="action-priority-badge"
                      style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}
                    >
                      {conf.label}
                    </span>
                  </div>

                  <span className="directive-lang-badge">
                    {currentLangConfig.nativeLabel}
                  </span>
                </div>

                <h4 className="action-title-text">{title}</h4>
                <p className="action-desc-text">{action}</p>

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

      {/* 4. MULTI-LINGUAL SMS & WHATSAPP BROADCAST ENGINE (TEXT ONLY) */}
      <div className="sms-broadcast-card card" id="sms-dispatcher">
        <div className="sms-card-header">
          <div>
            <div className="sms-badge-tag">
              <MessageSquareIcon size={13} color="#1d4ed8" />
              <span>Multi-Lingual SMS &amp; Messaging Templates</span>
            </div>
            <h4 className="section-title" style={{ marginTop: '4px' }}>
              Multi-Lingual Emergency Alert Broadcast Engine
            </h4>
            <p className="section-desc">
              Pre-approved emergency advisory templates translated into 8 regional Indian languages for SMS, WhatsApp, Wireless Emergency Alerts (WEA), and Radio.
            </p>
          </div>
        </div>

        {/* Template Category Switcher */}
        <div className="sms-template-selector-tabs">
          {MULTILINGUAL_EXPANDED_SMS.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              className={`sms-category-tab ${activeSmsTemplateId === tmpl.id ? 'active' : ''}`}
              onClick={() => setActiveSmsTemplateId(tmpl.id)}
            >
              <strong>{tmpl.label}</strong>
              <span className="sms-cat-pill">{tmpl.category}</span>
            </button>
          ))}
        </div>

        {/* Regional Language Tabs for SMS */}
        <div className="sms-language-tabs">
          <span className="sms-lang-label">
            <GlobeIcon size={13} />
            <span>SMS Language:</span>
          </span>
          {INDIAN_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`sms-lang-tab ${smsLang === lang.code ? 'active' : ''}`}
              onClick={() => setSmsLang(lang.code)}
            >
              <span className="sms-lang-tag">{lang.nativeName}</span>
              <span className="sms-tab-name">({lang.name})</span>
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
              <div className="sms-bubble">
                <div className="sms-bubble-lang-header">
                  <span className="lang-indicator-badge">
                    {INDIAN_LANGUAGES.find((l) => l.code === smsLang)?.flag} {INDIAN_LANGUAGES.find((l) => l.code === smsLang)?.nativeName}
                  </span>
                  <span className="sms-chars-badge">{activeSmsVersion.text.length} chars</span>
                </div>
                <p className="sms-bubble-content-text">{activeSmsVersion.text}</p>
              </div>

              <div className="sms-timestamp">District Disaster Management Authority &middot; Just Now</div>
            </div>
          </div>

          {/* Dispatch Controls & Audience Stats */}
          <div className="sms-controls-side">
            <div className="target-audience-box">
              <div className="aud-row">
                <span className="aud-lbl">Target Audience:</span>
                <strong>{activeTemplate.recipient}</strong>
              </div>
              <div className="aud-row">
                <span className="aud-lbl">Selected Language:</span>
                <span className="aud-lang-pill">
                  {INDIAN_LANGUAGES.find((l) => l.code === smsLang)?.flag} {INDIAN_LANGUAGES.find((l) => l.code === smsLang)?.nativeName} ({INDIAN_LANGUAGES.find((l) => l.code === smsLang)?.name})
                </span>
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
                onClick={() => handleCopy(`sms-${activeTemplate.id}-${smsLang}`, activeSmsVersion.text)}
              >
                {copiedId === `sms-${activeTemplate.id}-${smsLang}` ? (
                  <CheckIcon size={14} color="#16a34a" />
                ) : (
                  <CopyIcon size={14} />
                )}
                <span>
                  {copiedId === `sms-${activeTemplate.id}-${smsLang}`
                    ? 'Copied to Clipboard!'
                    : `Copy ${INDIAN_LANGUAGES.find((l) => l.code === smsLang)?.name} SMS`}
                </span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleSimulateDispatch('Cellular SMS Gateway')}
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
                <span>WhatsApp Blast</span>
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

      {/* 5. Sector-Wise Operational Checklist */}
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
