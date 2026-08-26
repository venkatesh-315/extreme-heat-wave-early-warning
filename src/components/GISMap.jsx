import React, { useEffect, useRef, useState } from 'react';
import './GISMap.css';

const getRiskColor = (risk) => {
  if (risk >= 70) return '#991b1b';
  if (risk >= 55) return '#dc2626';
  if (risk >= 40) return '#ea580c';
  if (risk >= 25) return '#f97316';
  if (risk >= 15) return '#ca8a04';
  return '#16a34a';
};

const getRiskLabel = (risk) => {
  if (risk >= 70) return 'CATASTROPHIC';
  if (risk >= 55) return 'EXTREME';
  if (risk >= 40) return 'VERY HIGH';
  if (risk >= 25) return 'HIGH';
  if (risk >= 15) return 'MODERATE';
  return 'LOW';
};

function GISMap({ location, wards = [], emergencyResources = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupsRef = useRef({
    heatZones: null,
    hospitals: null,
    shelters: null,
    water: null,
  });

  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    heatZones: true,
    hospitals: true,
    shelters: true,
    water: true,
  });
  const [mapError, setMapError] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!location?.lat || !location?.lon) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        if (!mapRef.current || !isMounted) return;

        // Remove old map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize new map with Light Positron Tiles
        const map = L.map(mapRef.current, {
          center: [location.lat, location.lon],
          zoom: 12,
          zoomControl: true,
          attributionControl: true,
        });

        // Clean, crisp Light Tile Layer (CartoDB Positron / OSM)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        // Center Location Marker (Search Pin)
        const centerIcon = L.divIcon({
          html: `<div class="center-pin-wrap">
            <div class="center-pulse-ring"></div>
            <div class="center-dot">📍</div>
          </div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        L.marker([location.lat, location.lon], { icon: centerIcon })
          .addTo(map)
          .bindPopup(`
            <div class="map-light-popup center-popup">
              <div class="popup-title">📍 ${location.name}</div>
              <div class="popup-sub">${location.state || 'India'} · ${location.lat.toFixed(4)}°N, ${location.lon.toFixed(4)}°E</div>
            </div>
          `);

        // Initialize Layer Groups
        const heatGroup = L.layerGroup();
        const hospitalGroup = L.layerGroup();
        const shelterGroup = L.layerGroup();
        const waterGroup = L.layerGroup();

        // 1. Plot Heat Zones / Wards
        wards.forEach((ward) => {
          const color = getRiskColor(ward.mortalityRisk);
          const radius = 35 + ward.mortalityRisk * 0.7;

          // Thermal buffer circle
          L.circle([ward.lat, ward.lon], {
            radius: radius * 60,
            color: color,
            fillColor: color,
            fillOpacity: 0.22,
            weight: 2,
            opacity: 0.8,
          }).addTo(heatGroup);

          // Ward interactive pin
          const wardIcon = L.divIcon({
            html: `<div class="ward-light-pin" style="--pin-color: ${color}">
              <span class="ward-pin-temp">${ward.wbgt}°</span>
              <span class="ward-pin-sub">WBGT</span>
            </div>`,
            className: '',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });

          L.marker([ward.lat, ward.lon], { icon: wardIcon })
            .addTo(heatGroup)
            .on('click', () => {
              setSelectedWard(ward);
              setSelectedResource(null);
            })
            .bindPopup(`
              <div class="map-light-popup">
                <div class="popup-header-row">
                  <span class="popup-badge" style="background: ${color}18; color: ${color}; border: 1px solid ${color}44">
                    ${getRiskLabel(ward.mortalityRisk)}
                  </span>
                  <span class="popup-pop">Pop: ${ward.population || 'N/A'}</span>
                </div>
                <div class="popup-title">${ward.name}</div>
                <div class="popup-type">${ward.microclimateType || 'Urban Zone'}</div>
                <div class="popup-grid">
                  <div class="pg-item"><span>WBGT</span><strong style="color:${color}">${ward.wbgt}°C</strong></div>
                  <div class="pg-item"><span>Air Temp</span><strong>${ward.temperature}°C</strong></div>
                  <div class="pg-item"><span>Heat Index</span><strong style="color:#ea580c">${ward.heatIndex}°C</strong></div>
                  <div class="pg-item"><span>Mortality Risk</span><strong style="color:${color}">${ward.mortalityRisk}%</strong></div>
                </div>
              </div>
            `);
        });

        // 2. Plot Emergency Resources (Hospitals, Cooling Shelters, Drinking Water)
        emergencyResources.forEach((res) => {
          let iconHtml = '';
          let targetGroup = hospitalGroup;

          if (res.type === 'hospital') {
            targetGroup = hospitalGroup;
            iconHtml = `<div class="res-light-pin hospital">
              <span>🏥</span>
            </div>`;
          } else if (res.type === 'shelter') {
            targetGroup = shelterGroup;
            iconHtml = `<div class="res-light-pin shelter">
              <span>🏠</span>
            </div>`;
          } else {
            targetGroup = waterGroup;
            iconHtml = `<div class="res-light-pin water">
              <span>💧</span>
            </div>`;
          }

          const markerIcon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });

          L.marker([res.lat, res.lon], { icon: markerIcon })
            .addTo(targetGroup)
            .on('click', () => {
              setSelectedResource(res);
              setSelectedWard(null);
            })
            .bindPopup(`
              <div class="map-light-popup res-popup">
                <div class="popup-badge-row">
                  <span class="popup-res-tag ${res.type}">${res.categoryLabel}</span>
                  <span class="popup-dist">${res.distanceKm} km</span>
                </div>
                <div class="popup-title">${res.name}</div>
                <div class="popup-address">${res.address}</div>
                <div class="popup-feature">❄️ ${res.coolingAmenity}</div>
                <div class="popup-capacity">👥 Capacity: <strong>${res.capacity}</strong></div>
                ${res.phone ? `<div class="popup-phone">📞 Tel: <strong>${res.phone}</strong></div>` : ''}
                <div class="popup-actions">
                  <a href="${res.mapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-dir-btn">
                    🗺️ Get Directions
                  </a>
                </div>
              </div>
            `);
        });

        // Add layer groups to map
        heatGroup.addTo(map);
        hospitalGroup.addTo(map);
        shelterGroup.addTo(map);
        waterGroup.addTo(map);

        layerGroupsRef.current = {
          heatZones: heatGroup,
          hospitals: hospitalGroup,
          shelters: shelterGroup,
          water: waterGroup,
        };

        mapInstanceRef.current = map;
      } catch {
        // Map loading fallback
        setMapError(true);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, wards, emergencyResources]);

  // Handle Layer Toggle Switcher
  const toggleLayer = (layerKey) => {
    const nextState = !activeLayers[layerKey];
    setActiveLayers((prev) => ({ ...prev, [layerKey]: nextState }));

    const group = layerGroupsRef.current[layerKey];
    const map = mapInstanceRef.current;

    if (group && map) {
      if (nextState) {
        group.addTo(map);
      } else {
        map.removeLayer(group);
      }
    }
  };

  // Center on a specific resource
  const focusOnItem = (item) => {
    if (mapInstanceRef.current && item?.lat && item?.lon) {
      mapInstanceRef.current.flyTo([item.lat, item.lon], 15, { duration: 1 });
      if (item.type) setSelectedResource(item);
      else setSelectedWard(item);
    }
  };

  return (
    <div className="gis-wrapper card" id="gis-interactive-map">
      <div className="gis-top-bar">
        <div className="gis-header-titles">
          <h3 className="section-title">
            🗺️ GIS Heat Vulnerability &amp; Emergency Infrastructure Map
          </h3>
          <p className="section-desc">
            Showing hyper-local microclimates, thermal stress zones, hospitals, and emergency cooling shelters for {location?.name}.
          </p>
        </div>

        {/* Dynamic Layer Switchers */}
        <div className="gis-layer-toggles">
          <button
            className={`layer-toggle-btn ${activeLayers.heatZones ? 'active heat' : ''}`}
            onClick={() => toggleLayer('heatZones')}
            title="Toggle Thermal Stress Zones"
          >
            <span>🔥</span>
            <span>Heat Zones</span>
          </button>
          <button
            className={`layer-toggle-btn ${activeLayers.hospitals ? 'active hospital' : ''}`}
            onClick={() => toggleLayer('hospitals')}
            title="Toggle Emergency Hospitals"
          >
            <span>🏥</span>
            <span>Hospitals ({emergencyResources.filter((r) => r.type === 'hospital').length})</span>
          </button>
          <button
            className={`layer-toggle-btn ${activeLayers.shelters ? 'active shelter' : ''}`}
            onClick={() => toggleLayer('shelters')}
            title="Toggle Cooling Shelters"
          >
            <span>🏠</span>
            <span>Cool Shelters ({emergencyResources.filter((r) => r.type === 'shelter').length})</span>
          </button>
          <button
            className={`layer-toggle-btn ${activeLayers.water ? 'active water' : ''}`}
            onClick={() => toggleLayer('water')}
            title="Toggle Water Stations"
          >
            <span>💧</span>
            <span>Water Booths ({emergencyResources.filter((r) => r.type === 'water').length})</span>
          </button>
        </div>
      </div>

      <div className="gis-main-content">
        {/* Leaflet Map Box */}
        <div className="map-view-box">
          {mapError ? (
            <div className="map-fallback-view">
              <span>🗺️</span>
              <p>Map view is loading or unavailable. Showing tabular facility listings below.</p>
            </div>
          ) : (
            <div ref={mapRef} className="leaflet-map-element" id="gis-leaflet-canvas" />
          )}

          {/* Map Legend */}
          <div className="gis-floating-legend">
            <span className="legend-head">Risk Scale (WBGT):</span>
            <div className="legend-items">
              <span className="leg-dot" style={{ background: '#16a34a' }}>&lt;26° Safe</span>
              <span className="leg-dot" style={{ background: '#ca8a04' }}>26-28° Caution</span>
              <span className="leg-dot" style={{ background: '#ea580c' }}>28-32° Alert</span>
              <span className="leg-dot" style={{ background: '#dc2626' }}>&gt;32° Danger</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Quick Navigation of Nearby Facilities & Wards */}
        <div className="gis-sidebar">
          <div className="sidebar-header">
            <h4>Facilities &amp; Heat Zones</h4>
            <span className="sidebar-count">{emergencyResources.length} facilities</span>
          </div>

          <div className="sidebar-items-list scroll-area">
            {/* Wards */}
            <div className="sidebar-group-label">Microclimate Wards</div>
            {wards.map((ward) => {
              const color = getRiskColor(ward.mortalityRisk);
              return (
                <button
                  key={ward.id}
                  className={`sidebar-item ward-type ${selectedWard?.id === ward.id ? 'selected' : ''}`}
                  onClick={() => focusOnItem(ward)}
                >
                  <div className="item-color-bar" style={{ background: color }} />
                  <div className="item-details">
                    <span className="item-name">{ward.name}</span>
                    <span className="item-meta">WBGT: {ward.wbgt}°C · Temp: {ward.temperature}°C</span>
                  </div>
                  <span className="item-badge" style={{ background: `${color}18`, color }}>
                    {ward.mortalityRisk}% Risk
                  </span>
                </button>
              );
            })}

            {/* Emergency Facilities */}
            <div className="sidebar-group-label" style={{ marginTop: '12px' }}>Emergency Points</div>
            {emergencyResources.map((res) => (
              <button
                key={res.id}
                className={`sidebar-item res-type ${selectedResource?.id === res.id ? 'selected' : ''}`}
                onClick={() => focusOnItem(res)}
              >
                <span className="item-icon">{res.icon}</span>
                <div className="item-details">
                  <span className="item-name">{res.name}</span>
                  <span className="item-meta">{res.categoryLabel} · {res.distanceKm} km</span>
                </div>
                <span className="item-action-icon">🎯</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Item Drawer / Detail Panel */}
      {selectedWard && (
        <div className="gis-detail-banner ward animate-fade-in">
          <div className="detail-banner-header">
            <div className="detail-title-group">
              <span className="detail-badge" style={{ background: getRiskColor(selectedWard.mortalityRisk), color: '#ffffff' }}>
                {getRiskLabel(selectedWard.mortalityRisk)} RISK
              </span>
              <h4>{selectedWard.name}</h4>
              <span className="detail-pop">Pop: {selectedWard.population}</span>
            </div>
            <button className="detail-close-btn" onClick={() => setSelectedWard(null)}>✕</button>
          </div>
          <div className="detail-grid-metrics">
            <div className="detail-stat"><span>Wet-Bulb Globe (WBGT)</span><strong>{selectedWard.wbgt}°C</strong></div>
            <div className="detail-stat"><span>Dry Air Temp</span><strong>{selectedWard.temperature}°C</strong></div>
            <div className="detail-stat"><span>Heat Index</span><strong>{selectedWard.heatIndex}°C</strong></div>
            <div className="detail-stat"><span>Relative Humidity</span><strong>{selectedWard.humidity}%</strong></div>
            <div className="detail-stat"><span>Mortality Vulnerability</span><strong style={{ color: getRiskColor(selectedWard.mortalityRisk) }}>{selectedWard.mortalityRisk}%</strong></div>
            <div className="detail-stat"><span>Cooling Centers</span><strong>{selectedWard.coolingCenters} Active</strong></div>
          </div>
        </div>
      )}

      {selectedResource && (
        <div className="gis-detail-banner resource animate-fade-in">
          <div className="detail-banner-header">
            <div className="detail-title-group">
              <span className="res-icon-lg">{selectedResource.icon}</span>
              <div>
                <span className="res-type-pill">{selectedResource.categoryLabel}</span>
                <h4>{selectedResource.name}</h4>
              </div>
            </div>
            <button className="detail-close-btn" onClick={() => setSelectedResource(null)}>✕</button>
          </div>
          <div className="res-detail-body">
            <div className="res-info-line">📍 <strong>Address:</strong> {selectedResource.address} ({selectedResource.distanceKm} km from center)</div>
            <div className="res-info-line">❄️ <strong>Cooling Amenities:</strong> {selectedResource.coolingAmenity}</div>
            <div className="res-info-line">👥 <strong>Capacity:</strong> {selectedResource.capacity}</div>
            <div className="res-actions-row">
              {selectedResource.phone && selectedResource.phone !== 'N/A' && (
                <a href={`tel:${selectedResource.phone.split('/')[0].trim()}`} className="btn btn-secondary btn-sm">
                  📞 Call Facility ({selectedResource.phone})
                </a>
              )}
              <a href={selectedResource.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                🗺️ Open GPS Navigation
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GISMap;
