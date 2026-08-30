import React, { useState } from 'react';
import {
  HospitalIcon,
  ShelterIcon,
  WaterIcon,
  PhoneIcon,
  NavigationIcon,
  SearchIcon,
  CrosshairIcon,
  BuildingIcon,
  XIcon,
  ActivityIcon
} from './icons';
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
            <ActivityIcon size={13} color="#16a34a" />
            <span>Active Emergency Infrastructure</span>
          </div>
          <h3 className="section-title">
            <HospitalIcon size={20} color="#dc2626" />
            <span>Emergency Shelters &amp; Hospitals Near {locationName}</span>
          </h3>
          <p className="section-desc">
            Designated heat-stroke treatment centers, cooling shelters, and public drinking water stations.
          </p>
        </div>

        <div className="directory-quick-counts">
          <div className="count-pill hospital">
            <HospitalIcon size={16} color="#dc2626" />
            <span className="count-num">{hospitals.length}</span>
            <span className="count-lbl">Hospitals</span>
          </div>
          <div className="count-pill shelter">
            <ShelterIcon size={16} color="#2563eb" />
            <span className="count-num">{shelters.length}</span>
            <span className="count-lbl">Shelters</span>
          </div>
          <div className="count-pill water">
            <WaterIcon size={16} color="#0891b2" />
            <span className="count-num">{waterPoints.length}</span>
            <span className="count-lbl">Water Points</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="directory-controls">
        <div className="filter-tabs">
          {[
            { id: 'all', label: `All Facilities (${resources.length})`, icon: BuildingIcon },
            { id: 'hospital', label: `Hospitals & ICUs (${hospitals.length})`, icon: HospitalIcon },
            { id: 'shelter', label: `Cooling Shelters (${shelters.length})`, icon: ShelterIcon },
            { id: 'water', label: `Water Kiosks (${waterPoints.length})`, icon: WaterIcon },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`filter-btn ${activeFilter === tab.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                <IconComponent size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="directory-search-input">
          <SearchIcon size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search facility name, address, ICU..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          {searchFilter && (
            <button className="clear-btn" onClick={() => setSearchFilter('')} aria-label="Clear filter">
              <XIcon size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {filteredResources.length === 0 ? (
          <div className="empty-results card">
            <SearchIcon size={32} color="#94a3b8" />
            <p>No facilities match your search query in this area.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => { setActiveFilter('all'); setSearchFilter(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredResources.map((item) => (
            <div
              key={item.id}
              className={`resource-card ${item.type}`}
              style={{ cursor: onFocusOnMap ? 'pointer' : 'default' }}
              onClick={() => onFocusOnMap && onFocusOnMap(item)}
            >
              <div className="res-header">
                <div className="res-icon-wrap">
                  {item.type === 'hospital' && <HospitalIcon size={20} color="#dc2626" />}
                  {item.type === 'shelter' && <ShelterIcon size={20} color="#2563eb" />}
                  {item.type === 'water' && <WaterIcon size={20} color="#0891b2" />}
                </div>
                <div className="res-title-box">
                  <div className="res-badge-row">
                    <span className="res-category-tag">{item.categoryLabel}</span>
                    <span className="res-distance-badge">{item.distanceKm} km away</span>
                  </div>
                  <h4 className="res-name">{item.name}</h4>
                </div>
              </div>

              <div className="res-details-list">
                <div className="res-detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{item.address}</span>
                </div>

                <div className="res-detail-row">
                  <span className="detail-label">Cooling Amenities:</span>
                  <span className="detail-value feature">{item.coolingAmenity}</span>
                </div>

                <div className="res-detail-row">
                  <span className="detail-label">Capacity:</span>
                  <span className="detail-value"><strong>{item.capacity}</strong></span>
                </div>

                {item.type === 'hospital' && (
                  <div className="res-detail-row">
                    <span className="detail-label">Heat-Stroke ICU:</span>
                    <span className={`detail-value ${item.icuReady ? 'icu-active' : ''}`}>
                      {item.icuReady ? 'Dedicated Heat ICU Active' : 'Emergency Casualty Ward'}
                    </span>
                  </div>
                )}
              </div>

              <div className="res-card-actions">
                {item.phone && item.phone !== 'N/A' && (
                  <a href={`tel:${item.phone.split('/')[0].trim()}`} className="btn btn-secondary btn-sm res-call-btn">
                    <PhoneIcon size={13} />
                    <span>{item.phone}</span>
                  </a>
                )}

                <a
                  href={item.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm res-dir-btn"
                  title="Open GPS directions in Google Maps"
                >
                  <NavigationIcon size={13} />
                  <span>Get Directions</span>
                </a>

                {onFocusOnMap && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm res-map-btn"
                    onClick={() => onFocusOnMap(item)}
                    title="View pin on map"
                  >
                    <CrosshairIcon size={13} />
                    <span>View on Map</span>
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
