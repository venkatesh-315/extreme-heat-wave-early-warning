import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapIcon,
  FlameIcon,
  HospitalIcon,
  ShelterIcon,
  WaterIcon,
  NavigationIcon,
  PhoneIcon,
  XIcon,
  CrosshairIcon,
  MaximizeIcon,
  PlusIcon,
  MinusIcon,
  SearchIcon,
} from './icons';
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

function GISMap({ location, wards = [], emergencyResources = [], focusedResource = null }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const controlsRef = useRef(null);
  const legendRef = useRef(null);
  const markersMapRef = useRef({});
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Disable click and touch propagation on custom controls and legend so Leaflet map does not intercept them
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

  // Invalidate Leaflet Map Size, center map view, and re-enable zoom whenever Fullscreen changes
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
        const modal = document.querySelector('.gis-wrapper.fullscreen-mode');
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

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Toggle specific layer
  const toggleLayer = useCallback((layerKey) => {
    setActiveLayers((prev) => {
      const nextState = !prev[layerKey];
      const group = layerGroupsRef.current[layerKey];
      const map = mapInstanceRef.current;

      if (group && map) {
        if (nextState) {
          group.addTo(map);
        } else {
          map.removeLayer(group);
        }
      }
      return { ...prev, [layerKey]: nextState };
    });
  }, []);

  // Ensure a layer is visible
  const ensureLayerVisible = useCallback((layerKey) => {
    setActiveLayers((prev) => {
      if (!prev[layerKey]) {
        const group = layerGroupsRef.current[layerKey];
        const map = mapInstanceRef.current;
        if (group && map) {
          group.addTo(map);
        }
        return { ...prev, [layerKey]: true };
      }
      return prev;
    });
  }, []);

  // Focus on any Ward or Emergency Point and open its popup on the map
  const focusOnItem = useCallback((item) => {
    if (!item || !mapInstanceRef.current) return;

    if (item.type) {
      const layerKey = item.type === 'hospital' ? 'hospitals' : item.type === 'shelter' ? 'shelters' : 'water';
      ensureLayerVisible(layerKey);

      setSelectedResource(item);
      setSelectedWard(null);
    } else {
      ensureLayerVisible('heatZones');
      setSelectedWard(item);
      setSelectedResource(null);
    }

    if (item.lat && item.lon) {
      mapInstanceRef.current.flyTo([item.lat, item.lon], 16, {
        animate: true,
        duration: 0.8,
      });

      // Open marker popup after brief pan animation
      setTimeout(() => {
        const marker = markersMapRef.current[item.id];
        if (marker) {
          marker.openPopup();
        }
      }, 350);
    }
  }, [ensureLayerVisible]);

  // Handle external focusedResource prop (e.g. from Emergency Directory tab)
  useEffect(() => {
    if (focusedResource) {
      const timer = setTimeout(() => {
        focusOnItem(focusedResource);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [focusedResource, focusOnItem]);

  // Initialize Map
  useEffect(() => {
    if (!location?.lat || !location?.lon) return;

    let isMounted = true;
    markersMapRef.current = {};

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        if (!mapRef.current || !isMounted) return;

        // Remove old map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize new map with Light Positron/Voyager Tiles
        const map = L.map(mapRef.current, {
          center: [location.lat, location.lon],
          zoom: 13,
          zoomControl: false, // Custom controls placed below
          attributionControl: true,
          scrollWheelZoom: true, // Smooth mouse wheel zoom enabled!
          doubleClickZoom: true,
          dragging: true,
          touchZoom: true,
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Center Location Marker: Google Maps Style Glowing Blue Dot
        const centerIcon = L.divIcon({
          html: `<div class="gmaps-user-location-wrap">
            <div class="gmaps-user-location-halo"></div>
            <div class="gmaps-user-location-dot"></div>
          </div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        L.marker([location.lat, location.lon], { icon: centerIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`
            <div class="map-light-popup center-popup">
              <div class="popup-title">${location.name}</div>
              <div class="popup-sub">${location.state || 'India'} &middot; Your Selected Location</div>
            </div>
          `);

        // Layer Groups
        const heatGroup = L.layerGroup();
        const hospitalGroup = L.layerGroup();
        const shelterGroup = L.layerGroup();
        const waterGroup = L.layerGroup();

        // 1. Plot Heat Zones / Wards
        wards.forEach((ward) => {
          const color = getRiskColor(ward.mortalityRisk);
          const radius = 35 + ward.mortalityRisk * 0.7;

          L.circle([ward.lat, ward.lon], {
            radius: radius * 60,
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            weight: 1.5,
            opacity: 0.8,
          }).addTo(heatGroup);

          const wardIcon = L.divIcon({
            html: `<div class="ward-light-pin" style="--pin-color: ${color}">
              <span class="ward-pin-temp">${ward.wbgt}&deg;</span>
              <span class="ward-pin-sub">WBGT</span>
            </div>`,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          const wardMarker = L.marker([ward.lat, ward.lon], { icon: wardIcon })
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
                  <div class="pg-item"><span>WBGT</span><strong style="color:${color}">${ward.wbgt}&deg;C</strong></div>
                  <div class="pg-item"><span>Air Temp</span><strong>${ward.temperature}&deg;C</strong></div>
                  <div class="pg-item"><span>Heat Index</span><strong style="color:#ea580c">${ward.heatIndex}&deg;C</strong></div>
                  <div class="pg-item"><span>Mortality Risk</span><strong style="color:${color}">${ward.mortalityRisk}%</strong></div>
                </div>
              </div>
            `);

          markersMapRef.current[ward.id] = wardMarker;
        });

        // 2. Plot Emergency Resources with Clean SVG Markers & Rich Popups
        emergencyResources.forEach((res) => {
          let svgInner = '';
          let targetGroup = hospitalGroup;
          let pinClass = 'hospital';

          if (res.type === 'hospital') {
            targetGroup = hospitalGroup;
            pinClass = 'hospital';
            svgInner = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5"><path d="M12 6v12M6 12h12"/></svg>`;
          } else if (res.type === 'shelter') {
            targetGroup = shelterGroup;
            pinClass = 'shelter';
            svgInner = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
          } else {
            targetGroup = waterGroup;
            pinClass = 'water';
            svgInner = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
          }

          const markerIcon = L.divIcon({
            html: `<div class="res-svg-pin ${pinClass}">${svgInner}</div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const resMarker = L.marker([res.lat, res.lon], { icon: markerIcon })
            .addTo(targetGroup)
            .on('click', () => {
              setSelectedResource(res);
              setSelectedWard(null);
            })
            .bindPopup(`
              <div class="map-light-popup res-popup">
                <div class="popup-badge-row">
                  <span class="popup-res-tag ${res.type}">${res.categoryLabel}</span>
                  <span class="popup-dist">${res.distanceKm} km away</span>
                </div>
                <div class="popup-title">${res.name}</div>
                <div class="popup-address">${res.address}</div>
                <div class="popup-feature">${res.coolingAmenity}</div>
                <div class="popup-capacity">Capacity: <strong>${res.capacity}</strong></div>
                ${res.phone ? `<div class="popup-phone">Tel: <strong>${res.phone}</strong></div>` : ''}
                <div class="popup-actions">
                  <a href="${res.mapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-dir-btn">
                    Get GPS Directions
                  </a>
                  ${res.searchMapsUrl ? `
                    <a href="${res.searchMapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-dir-btn popup-search-link" style="background:#f1f5f9; color:#1e293b; border:1px solid #cbd5e1;">
                      Verify on Maps
                    </a>
                  ` : ''}
                </div>
              </div>
            `);

          markersMapRef.current[res.id] = resMarker;
        });

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

  const hospitalsCount = emergencyResources.filter((r) => r.type === 'hospital').length;
  const sheltersCount = emergencyResources.filter((r) => r.type === 'shelter').length;
  const waterCount = emergencyResources.filter((r) => r.type === 'water').length;

  return (
    <>
      {isFullscreen && (
        <div
          className="map-fullscreen-backdrop"
          onClick={() => setIsFullscreen(false)}
          aria-hidden="true"
        />
      )}
      <div className={`gis-wrapper card ${isFullscreen ? 'fullscreen-mode' : ''}`} id="gis-interactive-map">
      <div className="gis-top-bar">
        <div className="gis-header-titles">
          <h3 className="section-title">
            <MapIcon size={20} color="#1e40af" />
            <span>GIS Heat Vulnerability &amp; Emergency Infrastructure Map</span>
          </h3>
          <p className="section-desc">
            Displaying microclimates, hospitals, cooling centers, and drinking water stations for {location?.name}. Click any facility or heat zone to view on map.
          </p>
        </div>

        {/* Dynamic Layer Switchers */}
        <div className="gis-layer-toggles">
          <button
            type="button"
            className={`layer-toggle-btn ${activeLayers.heatZones ? 'active heat' : ''}`}
            onClick={() => toggleLayer('heatZones')}
            title="Toggle Thermal Stress Zones"
          >
            <FlameIcon size={14} />
            <span>Heat Zones</span>
          </button>
          <button
            type="button"
            className={`layer-toggle-btn ${activeLayers.hospitals ? 'active hospital' : ''}`}
            onClick={() => toggleLayer('hospitals')}
            title="Toggle Emergency Hospitals"
          >
            <HospitalIcon size={14} />
            <span>Hospitals ({hospitalsCount})</span>
          </button>
          <button
            type="button"
            className={`layer-toggle-btn ${activeLayers.shelters ? 'active shelter' : ''}`}
            onClick={() => toggleLayer('shelters')}
            title="Toggle Cooling Shelters"
          >
            <ShelterIcon size={14} />
            <span>Shelters ({sheltersCount})</span>
          </button>
          <button
            type="button"
            className={`layer-toggle-btn ${activeLayers.water ? 'active water' : ''}`}
            onClick={() => toggleLayer('water')}
            title="Toggle Water Stations"
          >
            <WaterIcon size={14} />
            <span>Water ({waterCount})</span>
          </button>

          {isFullscreen && (
            <button
              type="button"
              className="exit-fullscreen-btn"
              onClick={() => setIsFullscreen(false)}
            >
              <XIcon size={14} />
              <span>Exit Fullscreen</span>
            </button>
          )}
        </div>
      </div>

      <div className="gis-main-content">
        {/* Leaflet Map Box */}
        <div className="map-view-box">
          {mapError ? (
            <div className="map-fallback-view">
              <MapIcon size={36} color="#94a3b8" />
              <p>Map view is loading or unavailable. Showing tabular facility listings below.</p>
            </div>
          ) : (
            <div ref={mapRef} className="leaflet-map-element" id="gis-leaflet-canvas" />
          )}

          {/* Top-Left / Map Controls Stack: Zoom In (+), Zoom Out (-), and Fullscreen directly below */}
          <div ref={controlsRef} className="map-custom-controls">
            <button
              type="button"
              className="map-ctrl-btn"
              onClick={handleZoomIn}
              aria-label="Zoom In"
              title="Zoom In (+)"
            >
              <PlusIcon size={14} color="#334155" />
            </button>
            <button
              type="button"
              className="map-ctrl-btn"
              onClick={handleZoomOut}
              aria-label="Zoom Out"
              title="Zoom Out (-)"
            >
              <MinusIcon size={14} color="#334155" />
            </button>
            <button
              type="button"
              className={`map-ctrl-btn ${isFullscreen ? 'active-fullscreen' : ''}`}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Open Full Screen Map'}
            >
              {isFullscreen ? <XIcon size={14} color="#dc2626" /> : <MaximizeIcon size={14} color="#334155" />}
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
              <XIcon size={20} color="#ffffff" />
            </button>
          )}

          {/* Map Legend */}
          <div ref={legendRef} className="gis-floating-legend">
            <span className="legend-head">Risk Scale (WBGT):</span>
            <div className="legend-items">
              <span className="leg-dot" style={{ background: '#16a34a' }}>&lt;26&deg; Safe</span>
              <span className="leg-dot" style={{ background: '#ca8a04' }}>26-28&deg; Caution</span>
              <span className="leg-dot" style={{ background: '#ea580c' }}>28-32&deg; Alert</span>
              <span className="leg-dot" style={{ background: '#dc2626' }}>&gt;32&deg; Danger</span>
            </div>
          </div>
        </div>

        {/* Interactive Facilities & Emergency Points Sidebar */}
        <div className="gis-sidebar">
          <div className="sidebar-header">
            <h4>Facilities &amp; Heat Zones</h4>
            <span className="sidebar-count">{emergencyResources.length} facilities</span>
          </div>

          <div className="sidebar-items-list scroll-area">
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
                    <span className="item-meta">WBGT: {ward.wbgt}&deg;C &middot; Temp: {ward.temperature}&deg;C</span>
                  </div>
                  <span className="item-badge" style={{ background: `${color}18`, color }}>
                    {ward.mortalityRisk}% Risk
                  </span>
                </button>
              );
            })}

            <div className="sidebar-group-label" style={{ marginTop: '12px' }}>
              Emergency Points ({emergencyResources.length})
            </div>
            {emergencyResources.map((res) => (
              <button
                key={res.id}
                className={`sidebar-item res-type ${selectedResource?.id === res.id ? 'selected' : ''}`}
                onClick={() => focusOnItem(res)}
              >
                <span className="item-icon-svg">
                  {res.type === 'hospital' && <HospitalIcon size={16} color="#dc2626" />}
                  {res.type === 'shelter' && <ShelterIcon size={16} color="#2563eb" />}
                  {res.type === 'water' && <WaterIcon size={16} color="#0891b2" />}
                </span>
                <div className="item-details">
                  <span className="item-name">{res.name}</span>
                  <span className="item-meta">{res.categoryLabel} &middot; {res.distanceKm} km</span>
                </div>
                <CrosshairIcon size={14} color="#94a3b8" />
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
            <button className="detail-close-btn" onClick={() => setSelectedWard(null)} aria-label="Close">
              <XIcon size={16} />
            </button>
          </div>
          <div className="detail-grid-metrics">
            <div className="detail-stat"><span>Wet-Bulb Globe (WBGT)</span><strong>{selectedWard.wbgt}&deg;C</strong></div>
            <div className="detail-stat"><span>Dry Air Temp</span><strong>{selectedWard.temperature}&deg;C</strong></div>
            <div className="detail-stat"><span>Heat Index</span><strong>{selectedWard.heatIndex}&deg;C</strong></div>
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
              <span className="res-icon-lg-svg">
                {selectedResource.type === 'hospital' && <HospitalIcon size={20} color="#dc2626" />}
                {selectedResource.type === 'shelter' && <ShelterIcon size={20} color="#2563eb" />}
                {selectedResource.type === 'water' && <WaterIcon size={20} color="#0891b2" />}
              </span>
              <div>
                <span className="res-type-pill">{selectedResource.categoryLabel}</span>
                <h4>{selectedResource.name}</h4>
              </div>
            </div>
            <button className="detail-close-btn" onClick={() => setSelectedResource(null)} aria-label="Close">
              <XIcon size={16} />
            </button>
          </div>
          <div className="res-detail-body">
            <div className="res-info-line"><strong>Address:</strong> {selectedResource.address} ({selectedResource.distanceKm} km away)</div>
            <div className="res-info-line"><strong>Cooling Amenities:</strong> {selectedResource.coolingAmenity}</div>
            <div className="res-info-line"><strong>Capacity:</strong> {selectedResource.capacity}</div>
            <div className="res-actions-row">
              {selectedResource.phone && selectedResource.phone !== 'N/A' && (
                <a href={`tel:${selectedResource.phone.split('/')[0].trim()}`} className="btn btn-secondary btn-sm">
                  <PhoneIcon size={13} />
                  <span>Call ({selectedResource.phone})</span>
                </a>
              )}
              <a href={selectedResource.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                <NavigationIcon size={13} />
                <span>Get Directions</span>
              </a>
              {selectedResource.searchMapsUrl && (
                <a href={selectedResource.searchMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" title="Verify location on Google Maps">
                  <SearchIcon size={13} />
                  <span>View on Maps</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default GISMap;
