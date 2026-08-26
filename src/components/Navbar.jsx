import React, { useState } from 'react';
import './Navbar.css';

function Navbar({ onOpenImdModal, isLive = true }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar-root">
      {/* Top National Strip */}
      <div className="gov-top-bar">
        <div className="gov-top-inner">
          <div className="gov-brand-unit">
            <span className="gov-flag">🇮🇳</span>
            <span className="gov-emblem">Government of India · Ministry of Earth Sciences (MoES)</span>
            <span className="gov-portal-tag">NDMA &amp; IMD Unified Early Warning Network</span>
          </div>
          <div className="gov-helplines">
            <span className="helpline-label">Emergency Helplines:</span>
            <a href="tel:108" className="helpline-pill" title="National Ambulance Service">
              🚑 Ambulance: <strong>108</strong>
            </a>
            <a href="tel:1077" className="helpline-pill" title="Disaster Control Room">
              🚨 Disaster Helpline: <strong>1077</strong>
            </a>
            <a href="tel:104" className="helpline-pill" title="Heat Illness Advisory">
              🩺 Health: <strong>104</strong>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar-main">
        <div className="navbar-inner">
          <a href="#home" className="navbar-brand">
            <div className="brand-logo-badge">
              <span className="brand-icon">🔥</span>
            </div>
            <div className="brand-text">
              <div className="brand-name-row">
                <span className="brand-name">HeatGuard India</span>
                <span className="brand-badge">Summer 2026</span>
              </div>
              <span className="brand-sub">National Extreme Heatwave Early Warning &amp; Response Portal</span>
            </div>
          </a>

          <div className="navbar-right">
            <div className="live-status-chip">
              <span className={`live-pulse-dot ${isLive ? 'online' : ''}`} />
              <span>{isLive ? 'IMD Live Feed Active' : 'Climatological Model'}</span>
            </div>

            <button
              id="imd-api-config-btn"
              className="btn btn-secondary btn-sm api-config-btn"
              onClick={onOpenImdModal}
              title="Configure IMD API Key and Data Sources"
            >
              <span>🛰️</span>
              <span>IMD API Settings</span>
            </button>

            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu-drawer animate-fade-in">
            <div className="mobile-menu-section">
              <span className="mobile-menu-title">Emergency Helplines (Toll-Free)</span>
              <div className="mobile-helpline-grid">
                <a href="tel:108" className="helpline-pill">🚑 Ambulance: <strong>108</strong></a>
                <a href="tel:1077" className="helpline-pill">🚨 Disaster: <strong>1077</strong></a>
                <a href="tel:104" className="helpline-pill">🩺 Health Info: <strong>104</strong></a>
                <a href="tel:112" className="helpline-pill">👮 National Emergency: <strong>112</strong></a>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm mobile-api-btn"
              onClick={() => {
                setMenuOpen(false);
                if (onOpenImdModal) onOpenImdModal();
              }}
            >
              🛰️ Configure IMD Weather API Key
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
