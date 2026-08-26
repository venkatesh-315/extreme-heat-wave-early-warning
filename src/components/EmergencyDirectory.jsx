import React, { useState } from 'react';
import './EmergencyDirectory.css';

function EmergencyDirectory({ resources = [], locationName = '', onFocusOnMap }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  const hospitals = resources.filter((r) => r.type === 'hospital');
  const shelters = resources.filter((r) => r.type === 'shelter');
  const waterPoints = resources.filter((r) => r.type === 'water');

  const filteredResources = resources.filter((r) => {
    const matchesCategory = activeFilter === 'all' || r.type === activeFilter;
    const matchesSearch =
      searchFilter === '' ||
      r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.categoryLabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.address.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="emergency-directory-section card" id="emergency-directory">
      <div className="directory-header">
        <div className="directory-titles">
          <div className="directory-badge">
            <span className="live-dot" />
            <span>Active Emergency Network</span>
          </div>
          <h3 className="section-title">
            🏥 Emergency Shelters &amp; Hospitals Near {locationName}
          </h3>
          <p className="section-desc">
            Verified heat-stroke medical centers, municipal cooling shelters (Rain Basera), and drinking water stations.
          </p>
        </div>

        <div className="directory-quick-counts">
          <div className="count-pill hospital">
            <span className="count-icon">🏥</span>
            <span className="count-num">{hospitals.length}</span>
            <span className="count-lbl">Hospitals</span>
          </div>
          <div className="count-pill shelter">
            <span className="count-icon">🏠</span>
            <span className="count-num">{shelters.length}</span>
            <span className="count-lbl">Cooling Shelters</span>
          </div>
          <div className="count-pill water">
            <span className="count-icon">💧</span>
            <span className="count-num">{waterPoints.length}</span>
            <span className="count-lbl">Water Booths</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="directory-controls">
        <div className="filter-tabs">
          {[
            { id: 'all', label: `All Facilities (${resources.length})`, icon: '🏢' },
            { id: 'hospital', label: `Hospitals & ICUs (${hospitals.length})`, icon: '🏥' },
            { id: 'shelter', label: `Cooling Shelters (${shelters.length})`, icon: '🏠' },
            { id: 'water', label: `Water Kiosks (${waterPoints.length})`, icon: '💧' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-btn ${activeFilter === tab.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="directory-search-input">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Filter by facility name, address, ICU..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          {searchFilter && (
            <button className="clear-btn" onClick={() => setSearchFilter('')}>✕</button>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {filteredResources.length === 0 ? (
          <div className="empty-results card">
            <span>🔍</span>
            <p>No facilities match your search query in this area.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => { setActiveFilter('all'); setSearchFilter(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredResources.map((item) => (
            <div key={item.id} className={`resource-card ${item.type}`}>
              <div className="res-header">
                <div className="res-icon-wrap">
                  <span>{item.icon}</span>
                </div>
                <div className="res-title-box">
                  <div className="res-badge-row">
                    <span className="res-category-tag">{item.categoryLabel}</span>
                    <span className="res-distance-badge">📍 {item.distanceKm} km away</span>
                  </div>
                  <h4 className="res-name">{item.name}</h4>
                </div>
              </div>

              <div className="res-details-list">
                <div className="res-detail-row">
                  <span className="detail-label">📍 Address:</span>
                  <span className="detail-value">{item.address}</span>
                </div>

                <div className="res-detail-row">
                  <span className="detail-label">❄️ Cooling Feature:</span>
                  <span className="detail-value feature">{item.coolingAmenity}</span>
                </div>

                <div className="res-detail-row">
                  <span className="detail-label">👥 Capacity:</span>
                  <span className="detail-value"><strong>{item.capacity}</strong></span>
                </div>

                {item.type === 'hospital' && (
                  <div className="res-detail-row">
                    <span className="detail-label">🚨 Heat-Stroke ICU:</span>
                    <span className={`detail-value ${item.icuReady ? 'icu-active' : ''}`}>
                      {item.icuReady ? '✅ Dedicated Heat ICU Active' : 'Standard Emergency Ward'}
                    </span>
                  </div>
                )}
              </div>

              <div className="res-card-actions">
                {item.phone && item.phone !== 'N/A' && (
                  <a href={`tel:${item.phone.split('/')[0].trim()}`} className="btn btn-secondary btn-sm res-call-btn">
                    📞 {item.phone}
                  </a>
                )}

                <a
                  href={item.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm res-dir-btn"
                  title="Open GPS directions in Google Maps"
                >
                  🗺️ Get Directions
                </a>

                {onFocusOnMap && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm res-map-btn"
                    onClick={() => onFocusOnMap(item)}
                    title="View pin on map"
                  >
                    🔍 View on Map
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EmergencyDirectory;
