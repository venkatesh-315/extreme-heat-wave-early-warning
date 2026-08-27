import React from 'react';
import { ShieldAlertIcon, AmbulanceIcon, PhoneIcon } from './icons';
import './Footer.css';

function Footer() {
  return (
    <footer className="civic-footer-root">
      <div className="footer-top-strip">
        <div className="footer-container footer-top-inner">
          <div className="footer-brand-block">
            <div className="f-logo-row">
              <ShieldAlertIcon size={18} color="#1e40af" />
              <span className="f-brand-title">HeatGuard India</span>
            </div>
            <p className="f-brand-desc">
              National Extreme Heatwave Early Warning, Thermal Stress Biometeorology &amp; Emergency Response Portal (Summer 2026).
            </p>
          </div>

          <div className="footer-helplines-block">
            <span className="f-block-title">Emergency Helplines (24x7 Toll-Free)</span>
            <div className="f-helpline-grid">
              <div className="f-hl-item">
                <AmbulanceIcon size={18} color="#dc2626" />
                <div>
                  <span className="f-hl-num">108</span>
                  <span className="f-hl-name">Ambulance &amp; Emergency Medical Services</span>
                </div>
              </div>
              <div className="f-hl-item">
                <ShieldAlertIcon size={18} color="#ea580c" />
                <div>
                  <span className="f-hl-num">1077</span>
                  <span className="f-hl-name">Disaster Helpline &amp; Relief Control</span>
                </div>
              </div>
              <div className="f-hl-item">
                <PhoneIcon size={18} color="#2563eb" />
                <div>
                  <span className="f-hl-num">104</span>
                  <span className="f-hl-name">Health Helpline &amp; Heat Stroke Support</span>
                </div>
              </div>
              <div className="f-hl-item">
                <ShieldAlertIcon size={18} color="#16a34a" />
                <div>
                  <span className="f-hl-num">112</span>
                  <span className="f-hl-name">Emergency Response Support System (Unified)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom-strip">
        <div className="footer-container footer-bottom-inner">
          <div className="f-attribution-links">
            <span>Scientific Standards:</span>
            <span>WMO / WHO Thermal Comfort Guidelines</span>
            <span>&middot;</span>
            <span>ISO 7933 / WBGT Standard</span>
            <span>&middot;</span>
            <span>Universal Thermal Climate Index (UTCI)</span>
          </div>
          <div className="f-copyright">
            ThermoGuard Early Warning System &middot; Heatwave Resilience &amp; Preparedness Platform
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
