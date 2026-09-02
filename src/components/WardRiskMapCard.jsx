import React, { useEffect, useRef, useState } from 'react';
import {
  InfoIcon,
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  MaximizeIcon,
  XIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  FlameIcon,
  ShieldAlertIcon,
} from './icons';
import { formatTemp } from '../services/weatherService';
import './WardRiskMapCard.css';

const RISK_CATEGORIES = [
  { id: 'low', label: 'Safe (0-20)', shortLabel: '0-20 Safe', range: '0–20', color: '#10b981', iconName: 'safe', title: 'Normal Summer', significance: 'Tolerable heat load. Routine hydration advised.', action: 'Standard advisory' },
  { id: 'moderate', label: 'Caution (20-40)', shortLabel: '20-40 Caution', range: '20–40', color: '#eab308', iconName: 'caution', title: 'Elevated Caution', significance: 'Increased hydration required; caution for infants & seniors.', action: 'Shaded rest spots' },
  { id: 'high', label: 'High Alert (40-60)', shortLabel: '40-60 Alert', range: '40–60', color: '#f97316', iconName: 'alert', title: 'Severe Heat Burden', significance: 'High risk of heat illness. 45m work / 15m rest cycles.', action: 'Enforce rest cycles' },
  { id: 'danger', label: 'Danger (60-100)', shortLabel: '60-100 Danger', range: '60–100', color: '#ef4444', iconName: 'danger', title: 'Dangerous Heatwave', significance: 'Halt outdoor manual labor 12:00 PM - 4:00 PM.', action: 'Cooling shelters open' },
];

const getWardRiskSvg = (risk, color = '#ffffff', size = 12) => {
  if (risk >= 55) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }
  if (risk >= 40) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
  }
  if (risk >= 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`;
};

function WardRiskMapCard({ location, wards = [], tempUnit = 'C' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const controlsRef = useRef(null);
  const legendRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState('Risk Index');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategoryModal, setActiveCategoryModal] = useState(false);

  // Disable click/touch/drag propagation on custom controls and legend
  useEffect(() => {
    const disablePropagation = async () => {
      try {
        const L = await import('leaflet');
        if (controlsRef.current) {
          L.DomEvent.disableClickPropagation(controlsRef.current);
          L.DomEvent.disableScrollPropagation(controlsRef.current);
        }
        if (legendRef.current) {
          L.DomEvent.disableClickPropagation(legendRef.current);
          L.DomEvent.disableScrollPropagation(legendRef.current);
        }
      } catch {
        // ignore
      }
    };
    disablePropagation();
  }, []);

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

  // Disable page background scrolling completely when full screen is active
  useEffect(() => {
    if (isFullscreen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyTouch = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'none';

      const appRoot = document.querySelector('.thermoguard-app');
      const originalAppOverflow = appRoot ? appRoot.style.overflow : '';
      if (appRoot) {
        appRoot.style.overflow = 'hidden';
      }

      const mainLayout = document.querySelector('.app-main-layout');
      const originalMainOverflow = mainLayout ? mainLayout.style.overflow : '';
      if (mainLayout) {
        mainLayout.style.overflow = 'hidden';
      }

      const scrollBody = document.querySelector('.dashboard-scroll-body');
      const originalScrollOverflow = scrollBody ? scrollBody.style.overflow : '';
      if (scrollBody) {
        scrollBody.style.overflow = 'hidden';
      }

      const preventBackgroundScroll = (e) => {
        const modal = document.querySelector('.ward-map-card.fullscreen');
        if (modal && !modal.contains(e.target)) {
          e.preventDefault();
        }
      };

      window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
      window.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalBodyTouch;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.documentElement.style.touchAction = '';
        if (appRoot) appRoot.style.overflow = originalAppOverflow;
        if (mainLayout) mainLayout.style.overflow = originalMainOverflow;
        if (scrollBody) scrollBody.style.overflow = originalScrollOverflow;
        window.removeEventListener('wheel', preventBackgroundScroll);
        window.removeEventListener('touchmove', preventBackgroundScroll);
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

        const isStateView = Boolean(location?.isState);
        const initialZoom = isStateView ? 6.5 : 13;

        // Initialize map with OpenStreetMap tiles
        const map = L.map(mapContainerRef.current, {
          center: [location.lat, location.lon],
          zoom: initialZoom,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true, // Smooth mouse wheel zoom enabled!
          doubleClickZoom: true,
          dragging: true,
          tap: true,
          touchZoom: true,
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const centerLat = location.lat;
        const centerLon = location.lon;

        // Use live dynamic wards calculated for selected location coordinates & live weather
        const wardSpots = (wards && wards.length > 0) ? wards : [];

        // Add circle heat zones + Pin with Location Name directly below it
        wardSpots.forEach((spot) => {
          const spotColor = spot.color || spot.tagColor || '#f97316';
          const radiusVal = isStateView || spot.isStateDistrict ? 22000 : 800;
          const riskSvg = getWardRiskSvg(spot.mortalityRisk, spotColor, 13);
          
          // Heat zone background glow
          L.circle([spot.lat, spot.lon], {
            radius: radiusVal,
            color: spotColor,
            weight: 2.5,
            fillColor: spotColor,
            fillOpacity: isStateView ? 0.20 : 0.16,
          }).addTo(map);

          const formattedWbgt = formatTemp(spot.wbgt, tempUnit);
          const formattedAirTemp = formatTemp(spot.airTemp || spot.temperature, tempUnit);
          const formattedHeatIndex = formatTemp(spot.heatIndex, tempUnit);

          // Custom DivIcon: Floating White Pin Card with bold glowing ring & universal SVG icon
          const customMarkerHtml = `
            <div class="ward-spot-marker-container">
              <div class="ward-pin-circle" style="border-color: ${spotColor};">
                <span class="ward-pin-icon-svg">${riskSvg}</span>
                <span class="ward-pin-temp">${formattedWbgt}&deg;</span>
              </div>
              <div class="ward-spot-name-below" style="border-color: ${spotColor};">
                ${spot.shortName || spot.name}
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

          // Exact Popup styled like reference design with live telemetry
          const popupHtml = `
            <div class="uploaded-style-popup">
              <div class="popup-top-tag-row">
                <span class="popup-cat-badge" style="background: ${spot.tagBg || '#fff7ed'}; color: ${spotColor}; border: 1.5px solid ${spotColor}; display: inline-flex; align-items: center; gap: 4px;">
                  ${riskSvg} <span>${spot.categoryTag || 'LIVE'}</span>
                </span>
                <span class="popup-pop-info">Pop: ${spot.population}</span>
              </div>
              <div class="popup-spot-title">${spot.name}</div>
              <div class="popup-spot-microclimate">${spot.microclimateType || spot.type}</div>
              <div class="popup-metrics-grid-card">
                <div class="pm-cell">
                  <div class="pm-label">WBGT</div>
                  <div class="pm-value" style="color: ${spotColor};">${formattedWbgt}&deg;${tempUnit}</div>
                </div>
                <div class="pm-cell">
                  <div class="pm-label">Air Temp</div>
                  <div class="pm-value text-dark">${formattedAirTemp}&deg;${tempUnit}</div>
                </div>
                <div class="pm-cell">
                  <div class="pm-label">Heat Index</div>
                  <div class="pm-value" style="color: ${spotColor};">${formattedHeatIndex}&deg;${tempUnit}</div>
                </div>
                <div class="pm-cell">
                  <div class="pm-label">Mortality Risk</div>
                  <div class="pm-value" style="color: ${spotColor};">${spot.mortalityRisk}%</div>
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
          <div ref={controlsRef} className="map-custom-controls">
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

          {/* Prominent Floating 'X' Close Button in Fullscreen Mode */}
          {isFullscreen && (
            <button
              type="button"
              className="fullscreen-floating-close-btn"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close Fullscreen Map"
              title="Close Fullscreen (Esc)"
            >
              <XIcon size={18} color="#ffffff" />
            </button>
          )}

          {/* Sleek, Compact Mini Risk Scale Legend along bottom edge */}
          <div ref={legendRef} className="ward-floating-mini-legend">
            <span className="mini-legend-title">Risk Scale:</span>
            <div className="mini-legend-rows">
              {RISK_CATEGORIES.map((item) => (
                <div key={item.id} className="mini-legend-item">
                  <span className="mini-color-dot" style={{ background: item.color }} />
                  {item.iconName === 'safe' && <ShieldCheckIcon size={12} color={item.color} />}
                  {item.iconName === 'caution' && <AlertTriangleIcon size={12} color={item.color} />}
                  {item.iconName === 'alert' && <FlameIcon size={12} color={item.color} />}
                  {item.iconName === 'danger' && <ShieldAlertIcon size={12} color={item.color} />}
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
