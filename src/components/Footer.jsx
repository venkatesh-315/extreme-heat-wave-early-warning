import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">🔥</span>
          <div>
            <span className="footer-name">HeatGuard India</span>
            <span className="footer-tagline">Extreme Heatwave Early Warning System · SIH 2026 · Problem Code SIH26083</span>
          </div>
        </div>

        <div className="footer-info">
          <div className="footer-tech">
            <span className="footer-tech-label">Powered by</span>
            <div className="footer-chips">
              {['WBGT (ISO 7933)', 'UTCI (ISO 11079)', 'Rothfusz HI', 'Leaflet GIS', 'React + Recharts'].map(t => (
                <span key={t} className="tech-chip">{t}</span>
              ))}
            </div>
          </div>
          <p className="footer-disclaimer">
            ⚠️ This is a prototype dashboard built for SIH 2026 using mock data. For production deployment, integrate with IMD API, OpenWeatherMap, and NDMA databases.
          </p>
        </div>

        <div className="footer-bottom">
          <span>© 2026 HeatGuard India — Built for Smart India Hackathon 2026</span>
          <div className="footer-links">
            <span>NDMA</span>
            <span>IMD</span>
            <span>Ministry of Health</span>
            <span>NIOSH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
