import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="civic-footer-root">
      <div className="footer-top-strip">
        <div className="footer-container footer-top-inner">
          <div className="footer-brand-block">
            <div className="f-logo-row">
              <span className="f-icon">🇮🇳</span>
              <span className="f-brand-title">HeatGuard India · SIH26083</span>
            </div>
            <p className="f-brand-desc">
              National Extreme Heatwave Early Warning, Thermal Stress Biometeorology &amp; Emergency Resilience Platform (Summer 2026 Edition).
            </p>
          </div>

          <div className="footer-helplines-block">
            <span className="f-block-title">National Emergency Helplines (24x7 Toll-Free)</span>
            <div className="f-helpline-grid">
              <div className="f-hl-item">
                <span className="f-hl-num">108</span>
                <span className="f-hl-name">National Ambulance / Emergency Medical Service</span>
              </div>
              <div className="f-hl-item">
                <span className="f-hl-num">1077</span>
                <span className="f-hl-name">NDMA / SDMA District Disaster Control Room</span>
              </div>
              <div className="f-hl-item">
                <span className="f-hl-num">104</span>
                <span className="f-hl-name">State Health Information &amp; Heat-Stroke Helpline</span>
              </div>
              <div className="f-hl-item">
                <span className="f-hl-num">112</span>
                <span className="f-hl-name">Emergency Response Support System (ERSS Unified)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom-strip">
        <div className="footer-container footer-bottom-inner">
          <div className="f-attribution-links">
            <span>Aligned with:</span>
            <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer">IMD (Mausam)</a>
            <span>·</span>
            <a href="https://ndma.gov.in" target="_blank" rel="noopener noreferrer">NDMA Heat Action Plans</a>
            <span>·</span>
            <a href="https://moes.gov.in" target="_blank" rel="noopener noreferrer">Ministry of Earth Sciences</a>
            <span>·</span>
            <span>WMO / ISO 7933 WBGT Standards</span>
          </div>
          <div className="f-copyright">
            Smart India Hackathon (SIH 2026) · Problem Code SIH26083 · Human Thermal Stress Early Warning
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
