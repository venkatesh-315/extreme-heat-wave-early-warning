import React, { useState } from 'react';
import { getImdApiConfig, saveImdApiConfig } from '../services/weatherService';
import { SatelliteIcon, CheckCircleIcon, XIcon, ActivityIcon } from './icons';
import './ImdApiModal.css';

function ImdApiModal({ isOpen, onClose, onConfigSaved }) {
  const [config, setConfig] = useState(() => getImdApiConfig());
  const [saveStatus, setSaveStatus] = useState(null);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveImdApiConfig(config);
    setSaveStatus('success');

    if (onConfigSaved) onConfigSaved(config);

    setTimeout(() => {
      setSaveStatus(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop-light" onClick={onClose}>
      <div className="modal-content-card card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <SatelliteIcon size={20} color="#1e40af" />
            </div>
            <div>
              <h3 className="modal-title">IMD Weather API &amp; Meteorological Gateway</h3>
              <p className="modal-sub">Configure India Meteorological Department (IMD) / Mausam Data Integration</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="api-provider-select">
              Meteorological Data Provider / Forecast Model:
            </label>
            <select
              id="api-provider-select"
              className="form-select"
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value })}
            >
              <option value="imd_openmeteo_ensemble">
                IMD &amp; Open-Meteo High-Resolution Ensemble (Active / 0.1 deg India Grid)
              </option>
              <option value="imd_mausam_api">
                IMD Mausam National API (Requires Departmental API Key)
              </option>
              <option value="custom_imd">
                Custom State Disaster Management Authority (SDMA) Server
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="imd-api-key-input">
              IMD / Mausam API Access Key:
            </label>
            <input
              id="imd-api-key-input"
              type="password"
              className="form-input"
              placeholder="e.g. imd_live_key_xxxxxxxxxxxxxxxx"
              value={config.apiKey || ''}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            />
            <span className="form-hint">
              Leave blank to automatically use the high-resolution calibrated India meteorological feed.
            </span>
          </div>

          {config.provider === 'custom_imd' && (
            <div className="form-group animate-fade-in">
              <label className="form-label" htmlFor="custom-endpoint-input">
                Custom SDMA / Regional IMD Endpoint URL:
              </label>
              <input
                id="custom-endpoint-input"
                type="url"
                className="form-input"
                placeholder="https://sdma-telemetry.gov.in/api/v1/weather"
                value={config.customEndpoint || ''}
                onChange={(e) => setConfig({ ...config, customEndpoint: e.target.value })}
              />
            </div>
          )}

          <div className="api-info-box">
            <div className="info-badge">
              <ActivityIcon size={14} color="#15803d" />
              <span>Standard Operational Configuration</span>
            </div>
            <p className="info-text">
              The portal continuously ingests dry-bulb air temperature, relative humidity, dew point, solar flux, and 10m wind speed to solve psychrometric wet-bulb temperature, outdoor WBGT (ISO 7933), and UTCI in real time.
            </p>
          </div>

          {saveStatus === 'success' && (
            <div className="save-status-alert success animate-fade-in">
              <CheckCircleIcon size={16} color="#15803d" />
              <span>IMD Configuration saved. Live meteorological feeds updated.</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircleIcon size={15} color="#ffffff" />
              <span>Save &amp; Connect Live Feed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImdApiModal;
