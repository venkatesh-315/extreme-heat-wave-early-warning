import React, { useEffect, useRef, useState } from 'react';
import {
  InfoIcon,
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  MaximizeIcon,
  XIcon,
  ShieldAlertIcon
} from './icons';
import { formatTemp } from '../services/weatherService';
import './WardRiskMapCard.css';

const RISK_CATEGORIES = [
  { id: 'low', label: 'Low (0-20)', shortLabel: '0-20 Low', range: '0–20', color: '#22c55e', title: 'Normal Summer', significance: 'Tolerable heat load. Routine hydration advised.', action: 'Standard advisory' },
  { id: 'moderate', label: 'Moderate (20-40)', shortLabel: '20-40 Mod', range: '20–40', color: '#eab308', title: 'Elevated Caution', significance: 'Increased hydration required; caution for infants & seniors.', action: 'Shaded rest spots' },
  { id: 'high', label: 'High (40-60)', shortLabel: '40-60 High', range: '40–60', color: '#f97316', title: 'Severe Burden', significance: 'High risk of heat illness. 45m work / 15m rest cycles.', action: 'Enforce rest cycles' },
  { id: 'very-high', label: 'Very High (60-80)', shortLabel: '60-80 V.High', range: '60–80', color: '#ea580c', title: 'Dangerous Heatwave', significance: 'Halt outdoor manual labor 12:00 PM - 4:00 PM.', action: 'Cooling shelters open' },
  { id: 'extreme', label: 'Extreme (80-100)', shortLabel: '80-100 Ext', range: '80–100', color: '#991b1b', title: 'Critical Threat', significance: 'Life-threatening biometeorology. Emergency ICUs & water tankers.', action: 'Disaster protocol' },
];

function WardRiskMapCard({ location, wards = [], tempUnit = 'C' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState('Risk Index');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategoryModal, setActiveCategoryModal] = useState(false);

  // Invalidate Leaflet map size, center map view, and re-enable zoom whenever fullscreen changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const invalidateAndCenter = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.scrollWheelZoom.enable();
        mapInstanceRef.current.dragging.enable();
        mapInstanceRef.current.doubleClickZoom.enable();
        mapInstanceRef.current.invalidateSize({ pan: false });
        if (location?.lat && location?.lon) {
          mapInstanceRef.current.panTo([location.lat, location.lon], { animate: false });
        }
      }
    };

    invalidateAndCenter();
    const t1 = setTimeout(invalidateAndCenter, 60);
    const t2 = setTimeout(invalidateAndCenter, 200);
    const t3 = setTimeout(invalidateAndCenter, 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isFullscreen, location]);

  // Disable page scrolling when full screen is active
  useEffect(() => {
    if (isFullscreen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      const mainLayout = document.querySelector('.app-main-layout');
      const originalMainOverflow = mainLayout ? mainLayout.style.overflow : '';
      if (mainLayout) mainLayout.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        if (mainLayout) mainLayout.style.overflow = originalMainOverflow;
      };
    }
  }, [isFullscreen]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!location?.lat || !location?.lon) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        if (!mapContainerRef.current || !isMounted) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize map with clean light Carto Voyager style
        const map = L.map(mapContainerRef.current, {
          center: [location.lat, location.lon],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true, // Smooth mouse wheel zoom enabled!
          doubleClickZoom: true,
          dragging: true,
          tap: true,
          touchZoom: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
          maxZoom: 18,
          subdomains: 'abcd',
        }).addTo(map);

        const centerLat = location.lat;
        const centerLon = location.lon;

        // Realistic ward locations matching the uploaded design
        const wardSpots = [
          {
            id: 'w1',
            lat: centerLat,
            lon: centerLon,
            name: 'Ward 1 · Central Commercial & Transit Hub',
            shortName: 'Ward 1 · Central Commercial',
            type: 'Dense Concrete / Urban Heat Island',
            categoryTag: 'HIGH',
            tagBg: '#fff7ed',
            tagColor: '#ea580c',
            population: '95,000',
            wbgt: 30.2,
            airTemp: 29.4,
            heatIndex: 32.8,
            mortalityRisk: 35,
            color: '#f97316',
          },
          {
            id: 'w2',
            lat: centerLat + 0.016,
            lon: centerLon - 0.014,
            name: 'Ward 2 · North Industrial & Labour Colony',
            shortName: 'Ward 2 · North Labour Colony',
            type: 'Industrial Tin-Sheds & High Exposure',
            categoryTag: 'VERY HIGH',
            tagBg: '#fff1f2',
            tagColor: '#dc2626',
            population: '140,000',
            wbgt: 34.6,
            airTemp: 33.8,
            heatIndex: 38.2,
            mortalityRisk: 68,
            color: '#ea580c',
          },
          {
            id: 'w3',
            lat: centerLat - 0.018,
            lon: centerLon + 0.018,
            name: 'Ward 3 · East Residential & Slum Cluster',
            shortName: 'Ward 3 · East Slum Cluster',
            type: 'Informal Settlements / Low Green Cover',
            categoryTag: 'EXTREME',
            tagBg: '#fff1f2',
            tagColor: '#991b1b',
            population: '110,000',
            wbgt: 37.8,
            airTemp: 36.2,
            heatIndex: 44.5,
            mortalityRisk: 82,
            color: '#991b1b',
          },
          {
            id: 'w4',
            lat: centerLat - 0.024,
            lon: centerLon - 0.022,
            name: 'Ward 4 · South Green Institutional Area',
            shortName: 'Ward 4 · South Green Area',
            type: 'High Canopy & Parkland Buffer',
            categoryTag: 'LOW',
            tagBg: '#f0fdf4',
            tagColor: '#16a34a',
            population: '60,000',
            wbgt: 24.8,
            airTemp: 25.1,
            heatIndex: 26.2,
            mortalityRisk: 12,
            color: '#22c55e',
          },
          {
            id: 'w5',
            lat: centerLat + 0.022,
            lon: centerLon + 0.025,
            name: 'Ward 5 · West High-Density Old City',
            shortName: 'Ward 5 · Old City',
            type: 'Narrow Lanes & Trapped Heat',
            categoryTag: 'MODERATE',
            tagBg: '#fefce8',
            tagColor: '#ca8a04',
            population: '175,000',
            wbgt: 28.6,
            airTemp: 28.0,
            heatIndex: 30.4,
            mortalityRisk: 28,
            color: '#eab308',
          },
        ];

        // Add circle heat zones + Pin with Location Name directly below it
        wardSpots.forEach((spot) => {
          // Heat zone background glow
          L.circle([spot.lat, spot.lon], {
            radius: 800,
            color: spot.color,
            weight: 1,
            fillColor: spot.color,
            fillOpacity: 0.22,
          }).addTo(map);

          const formattedWbgt = formatTemp(spot.wbgt, tempUnit);
          const formattedAirTemp = formatTemp(spot.airTemp, tempUnit);
          const formattedHeatIndex = formatTemp(spot.heatIndex, tempUnit);

          // Custom DivIcon matching exact reference image:
          // Pin circle with WBGT + Location Name directly below the marked spot
          const customMarkerHtml = `
            <div class="ward-spot-marker-container">
              <div class="ward-pin-circle" style="border-color: ${spot.color};">
                <span class="ward-pin-temp">${formattedWbgt}&deg;</span>
                <span class="ward-pin-unit">WBGT</span>
              </div>
              <div class="ward-spot-name-below" style="border-color: ${spot.color}44;">
                ${spot.shortName}
              </div>
            </div>
          `;

          const spotIcon = L.divIcon({
            html: customMarkerHtml,
            className: '',
            iconSize: [120, 64],
            iconAnchor: [60, 20],
            popupAnchor: [0, -22],
          });

          // Exact Popup styled like the user's uploaded reference image
          const popupHtml = `
            <div class="uploaded-style-popup">
              <div class="popup-top-tag-row">
                <span class="popup-cat-badge" style="background: ${spot.tagBg}; color: ${spot.tagColor}; border: 1px solid ${spot.tagColor}44;">
                  ${spot.categoryTag}
                </span>
                <span class="popup-pop-info">Pop: ${spot.population}</span>
              </div>
              <div class="popup-spot-title">${spot.name}</div>
              <div class="popup-spot-microclimate">${spot.type}</div>
              <div class="popup-metrics-grid-card">
                <div class="pm-cell">
                  <div class="pm-label">WBGT</div>
                  <div class="pm-value" style="color: ${spot.color};">${formattedWbgt}&deg;${tempUnit}</div>
                </div>
                <div class="pm-cell">
                  <div class="pm-label">Air Temp</div>
                  <div class="pm-value text-dark">${formattedAirTemp}&deg;${tempUnit}</div>
                </div>
                <div class="pm-cell">
                  <div class="pm-label">Heat Index</div>
                  <div class="pm-value" style="color: ${spot.color};">${formattedHeatIndex}&deg;${tempUnit}</div>
                </div>
                <div class="pm-cell">
                  <div class="pm-label">Mortality Risk</div>
                  <div class="pm-value" style="color: ${spot.color};">${spot.mortalityRisk}%</div>
                </div>
              </div>
            </div>
          `;

          L.marker([spot.lat, spot.lon], { icon: spotIcon })
            .addTo(map)
            .bindPopup(popupHtml, {
              className: 'uploaded-map-popup-wrapper',
              closeButton: true,
              autoPan: true,
              maxWidth: 290,
            });
        });

        // Add Google Maps Style User Location Blue Dot Marker
        const centerUserIcon = L.divIcon({
          html: `<div class="gmaps-user-location-wrap">
            <div class="gmaps-user-location-halo"></div>
            <div class="gmaps-user-location-dot"></div>
          </div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        L.marker([centerLat, centerLon], { icon: centerUserIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`
            <div class="uploaded-style-popup" style="padding: 12px; text-align: center;">
              <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">${location.name}</div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">Your Selected Station Position</div>
            </div>
          `);

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Map init error:', err);
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
  }, [location, tempUnit]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <>
      {/* Fullscreen Backdrop when expanded */}
      {isFullscreen && (
        <div
          className="map-fullscreen-backdrop"
          onClick={() => setIsFullscreen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`card ward-map-card ${isFullscreen ? 'fullscreen' : ''}`} id="ward-level-risk-map">
        {/* Top Header Row with Title, Explainer Tooltip & Filter Dropdown */}
        <div className="ward-map-header">
          <div className="ward-title-group">
            <h3 className="card-heading">
              Ward Level Risk Map
              <button
                className="info-tooltip-wrap explainer-btn"
                onClick={() => setActiveCategoryModal(true)}
                title="Click to view what the Risk Index (0-100) signifies"
                aria-label="View Risk Index Details"
              >
                <InfoIcon size={14} />
              </button>
            </h3>
          </div>

          <div className="ward-header-actions">
            <div className="risk-filter-dropdown-wrap">
              <button
                className="risk-filter-btn"
                onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              >
                <span>{selectedFilter}</span>
                <ChevronDownIcon size={13} color="#64748b" />
              </button>

              {isFilterDropdownOpen && (
                <div className="risk-filter-menu">
                  {['Risk Index', 'WBGT Thermal Load', 'Population Exposure', 'Cooling Shelters'].map((opt) => (
                    <button
                      key={opt}
                      className={`risk-filter-opt ${selectedFilter === opt ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedFilter(opt);
                        setIsFilterDropdownOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isFullscreen && (
              <button className="exit-fullscreen-btn" onClick={() => setIsFullscreen(false)}>
                <XIcon size={14} />
                <span>Exit Fullscreen</span>
              </button>
            )}
          </div>
        </div>

        {/* Map Canvas Area */}
        <div className="ward-map-canvas-wrapper">
          <div ref={mapContainerRef} className="ward-leaflet-map" />

          {/* Top-Left Map Zoom & Fullscreen Controls */}
          <div className="map-custom-controls">
            <button className="map-ctrl-btn" onClick={handleZoomIn} aria-label="Zoom In">
              <PlusIcon size={13} color="#334155" />
            </button>
            <button className="map-ctrl-btn" onClick={handleZoomOut} aria-label="Zoom Out">
              <MinusIcon size={13} color="#334155" />
            </button>
            <button
              className="map-ctrl-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Fullscreen View'}
            >
              {isFullscreen ? <XIcon size={13} color="#334155" /> : <MaximizeIcon size={13} color="#334155" />}
            </button>
          </div>

          {/* Sleek, Reduced-Size Mini Risk Scale Legend on Bottom Left */}
          <div className="ward-floating-mini-legend">
            <div className="mini-legend-title">Risk Scale (0-100)</div>
            <div className="mini-legend-rows">
              {RISK_CATEGORIES.map((item) => (
                <div key={item.id} className="mini-legend-item">
                  <span className="mini-color-dot" style={{ background: item.color }} />
                  <span className="mini-label">{item.shortLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Category Guide Modal */}
        {activeCategoryModal && (
          <div className="modal-backdrop-light" onClick={() => setActiveCategoryModal(false)}>
            <div className="category-guide-modal card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-group">
                  <ShieldAlertIcon size={20} color="#dc2626" />
                  <div>
                    <h3 className="modal-title">Ward Risk Index Guide (0–100)</h3>
                    <p className="modal-sub">Significance &amp; Public Health Directives for Each Heat Level</p>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setActiveCategoryModal(false)}>
                  <XIcon size={18} />
                </button>
              </div>

              <div className="guide-content-body scroll-area">
                <div className="category-explanation-grid">
                  {RISK_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="cat-explain-card" style={{ borderLeftColor: cat.color }}>
                      <div className="cat-header-row">
                        <span className="cat-pill" style={{ background: `${cat.color}18`, color: cat.color }}>
                          {cat.label}
                        </span>
                        <strong className="cat-title-text">{cat.title}</strong>
                      </div>
                      <div className="cat-desc-line"><strong>Significance:</strong> {cat.significance}</div>
                      <div className="cat-action-line"><strong>Heat Action Plan:</strong> {cat.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveCategoryModal(false)}>
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default WardRiskMapCard;
