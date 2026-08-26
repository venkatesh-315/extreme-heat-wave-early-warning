import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#home" className="navbar-brand">
          <div className="brand-icon">🔥</div>
          <div className="brand-text">
            <span className="brand-name">HeatGuard</span>
            <span className="brand-sub">India · SIH26083</span>
          </div>
        </a>

        <div className="navbar-links">
          <a href="#home" className="nav-link">Dashboard</a>
          <a href="#home" className="nav-link">About</a>
          <a href="#home" className="nav-link">API Docs</a>
          <div className="live-indicator">
            <span className="live-dot" />
            Live Data
          </div>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <a href="#home" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Dashboard</a>
          <a href="#home" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#home" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>API Docs</a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
