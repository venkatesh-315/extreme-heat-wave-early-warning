import React, { useState } from 'react';
import {
  FlameIcon,
  PhoneIcon,
  AmbulanceIcon,
  ShieldAlertIcon,
  ActivityIcon,
  XIcon
} from './icons';
import './Navbar.css';

function Navbar({ isLive = true }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar-root">
      {/* Top Alert Strip */}
      <div className="gov-top-bar">
        <div className="gov-top-inner">
          <div className="gov-brand-unit">
            <span className="gov-badge-icon">
              <ShieldAlertIcon size={14} color="#1e40af" />
            </span>
            <span className="gov-emblem">ThermoGuard Early Warning Network</span>
            <span className="gov-portal-tag">Real-Time Heatwave Biometeorology</span>
          </div>

          <div className="gov-helplines">
            <span className="helpline-label">24x7 Helplines:</span>
            <a href="tel:108" className="helpline-pill" title="Ambulance Service">
              <AmbulanceIcon size={13} color="#dc2626" />
              <span>Ambulance: <strong>108</strong></span>
            </a>
            <a href="tel:1077" className="helpline-pill" title="Disaster Helpline">
              <ShieldAlertIcon size={13} color="#ea580c" />
              <span>Disaster: <strong>1077</strong></span>
            </a>
            <a href="tel:104" className="helpline-pill" title="Health Information Helpline">
              <PhoneIcon size={13} color="#2563eb" />
              <span>Health: <strong>104</strong></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar-main">
        <div className="navbar-inner">
          <a href="#home" className="navbar-brand">
            <div className="brand-logo-badge">
              <FlameIcon size={22} color="#ffffff" />
            </div>
            <div className="brand-text">
              <div className="brand-name-row">
                <span className="brand-name">HeatGuard India</span>
                <span className="brand-badge">Real-Time Live</span>
              </div>
              <span className="brand-sub">Extreme Heatwave Early Warning &amp; Response Portal</span>
            </div>
          </a>

          <div className="navbar-right">
            <div className="live-status-chip">
              <span className={`live-pulse-dot ${isLive ? 'online' : ''}`} />
              <ActivityIcon size={14} color="#16a34a" />
              <span>{isLive ? 'Live Weather Feed Active' : 'Climatological Model'}</span>
            </div>

            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <XIcon size={20} /> : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu-drawer animate-fade-in">
            <div className="mobile-menu-section">
              <span className="mobile-menu-title">Emergency Helplines (Toll-Free)</span>
              <div className="mobile-helpline-grid">
                <a href="tel:108" className="helpline-pill">
                  <AmbulanceIcon size={14} color="#dc2626" />
                  <span>Ambulance: <strong>108</strong></span>
                </a>
                <a href="tel:1077" className="helpline-pill">
                  <ShieldAlertIcon size={14} color="#ea580c" />
                  <span>Disaster: <strong>1077</strong></span>
                </a>
                <a href="tel:104" className="helpline-pill">
                  <PhoneIcon size={14} color="#2563eb" />
                  <span>Health: <strong>104</strong></span>
                </a>
                <a href="tel:112" className="helpline-pill">
                  <ShieldAlertIcon size={14} color="#16a34a" />
                  <span>Unified: <strong>112</strong></span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
