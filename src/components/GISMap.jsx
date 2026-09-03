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
  ShieldCheckIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
} from './icons';
import { useLanguage } from '../context/LanguageContext';
import './GISMap.css';

const getRiskColor = (risk) => {
  if (risk >= 55) return '#ef4444'; // Level 4: Danger (Bright Coral Red)
  if (risk >= 40) return '#f97316'; // Level 3: Alert (Electric Saffron Orange)
  if (risk >= 20) return '#eab308'; // Level 2: Caution (Bright Sun Gold)
  return '#10b981';                 // Level 1: Safe (Vivid Emerald Green)
};

const getRiskLabel = (risk) => {
  if (risk >= 55) return 'DANGER';
  if (risk >= 40) return 'ALERT';
  if (risk >= 20) return 'CAUTION';
  return 'SAFE';
};

// Pure SVG vector markup for Leaflet map HTML pins and popups
const getRiskSvgIcon = (risk, color = '#ffffff', size = 14) => {
  if (risk >= 55) {
    // Danger: Shield Alert
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }
  if (risk >= 40) {
    // Alert: Flame
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
  }
  if (risk >= 20) {
    // Caution: Alert Triangle
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }
  // Safe: Shield Check
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`;
};

function GISMap({ location, wards = [], emergencyResources = [], focusedResource = null }) {
  const { t } = useLanguage();
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
        const detailBanner = document.querySelector('.gis-detail-banner');
        if (detailBanner && detailBanner.contains(e.target)) {
          // Allow internal scrolling inside the detail information section
          return;
        }
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
      const flyZoom = item.isStateDistrict ? 10 : (location?.isState ? 9 : 16);
      mapInstanceRef.current.flyTo([item.lat, item.lon], flyZoom, {
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
  }, [ensureLayerVisible, location]);

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

        const initialZoom = location?.isState ? 6.5 : 13;

        // Initialize new map with Light Positron/Voyager Tiles
        const map = L.map(mapRef.current, {
          center: [location.lat, location.lon],
          zoom: initialZoom,
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
              <div class="popup-sub">${location.state || 'India'} &middot; ${location?.isState ? 'State Center Point' : 'Your Selected Location'}</div>
            </div>
          `);

        // Layer Groups
        const heatGroup = L.layerGroup();
        const hospitalGroup = L.layerGroup();
        const shelterGroup = L.layerGroup();
        const waterGroup = L.layerGroup();

        // 1. Plot Heat Zones / Wards / State Districts
        wards.forEach((ward) => {
          const color = getRiskColor(ward.mortalityRisk);
          const riskLabel = getRiskLabel(ward.mortalityRisk);
          const riskSvg = getRiskSvgIcon(ward.mortalityRisk, color, 14);
          const isStateMode = Boolean(location?.isState || ward.isStateDistrict);
          const circleRadius = (35 + ward.mortalityRisk * 0.7) * (isStateMode ? 350 : 60);

          L.circle([ward.lat, ward.lon], {
            radius: circleRadius,
            color: color,
            fillColor: color,
            fillOpacity: isStateMode ? 0.20 : 0.16, // Luminous, avoids muddy dark basemap overlap
            weight: 2.5,                            // Bold, distinct glowing boundary
            opacity: 0.95,
          }).addTo(heatGroup);

          const wardIcon = L.divIcon({
            html: `
              <div class="ward-accessible-pin" style="--pin-ring-color: ${color};">
                <div class="ward-pin-card-top">
                  <span class="ward-card-icon-svg">${riskSvg}</span>
                  <span class="ward-card-temp">${ward.wbgt}&deg;</span>
                </div>
                <div class="ward-pin-card-bot">
                  <span class="ward-card-label">${riskLabel}</span>
                </div>
              </div>
            `,
            className: '',
            iconSize: [68, 44],
            iconAnchor: [34, 22],
            popupAnchor: [0, -24],
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
                  <span class="popup-badge" style="background: ${color}20; color: ${color}; border: 1.5px solid ${color}; display: inline-flex; align-items: center; gap: 4px;">
                    ${riskSvg} <span>${riskLabel}</span>
                  </span>
                  <span class="popup-pop">Pop: ${ward.population || 'N/A'}</span>
                </div>
                <div class="popup-title">${ward.name}</div>
                <div class="popup-type">${ward.microclimateType || 'Thermal Stress Zone'}</div>
                <div class="popup-grid">
                  <div class="pg-item"><span>WBGT</span><strong style="color:${color}">${ward.wbgt}&deg;C</strong></div>
                  <div class="pg-item"><span>Air Temp</span><strong>${ward.temperature}&deg;C</strong></div>
                  <div class="pg-item"><span>Heat Index</span><strong style="color:#f97316">${ward.heatIndex}&deg;C</strong></div>
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
            svgInner = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M6 12h12"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>';
          } else if (res.type === 'shelter') {
            targetGroup = shelterGroup;
            pinClass = 'shelter';
            svgInner = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/></svg>';
          } else {
            targetGroup = waterGroup;
            pinClass = 'water';
            svgInner = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
          }

          const resIcon = L.divIcon({
            html: `<div class="res-svg-pin ${pinClass}">${svgInner}</div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const resMarker = L.marker([res.lat, res.lon], { icon: resIcon })
            .addTo(targetGroup)
            .on('click', () => {
              setSelectedResource(res);
              setSelectedWard(null);
            })
            .bindPopup(`
              <div class="map-light-popup">
                <div class="popup-header-row">
                  <span class="popup-badge res-badge ${pinClass}">${res.categoryLabel || res.type}</span>
                  <span class="popup-pop">${res.distanceKm} km away</span>
                </div>
                <div class="popup-title">${res.name}</div>
                <div class="popup-address">${res.address || 'Address available on map'}</div>
                ${res.phone && res.phone !== 'N/A' ? `<div class="popup-phone"><strong>Helpline:</strong> ${res.phone}</div>` : ''}
                ${res.coolingAmenity ? `<div class="popup-amenity"><strong>Amenity:</strong> ${res.coolingAmenity}</div>` : ''}
                <div class="popup-actions">
                  <a href="${res.mapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-dir-btn popup-gps-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                    <span>Get Directions</span>
                  </a>
                  ${res.searchMapsUrl ? `
                    <a href="${res.searchMapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-dir-btn popup-verify-btn popup-search-link" title="Verify location details on Google Maps">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <span>Verify on Maps</span>
                    </a>
                  ` : ''}
                </div>
              </div>
            `);

          markersMapRef.current[res.id] = resMarker;
        });

        // Add Active Layer Groups to Map
        if (activeLayers.heatZones) heatGroup.addTo(map);
        if (activeLayers.hospitals) hospitalGroup.addTo(map);
        if (activeLayers.shelters) shelterGroup.addTo(map);
        if (activeLayers.water) waterGroup.addTo(map);

        layerGroupsRef.current = {
          heatZones: heatGroup,
          hospitals: hospitalGroup,
          shelters: shelterGroup,
          water: waterGroup,
        };

        mapInstanceRef.current = map;
        setMapError(false);
      } catch (err) {
        console.error('Leaflet Map initialization failed:', err);
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
  }, [location, wards, emergencyResources, focusOnItem, activeLayers.heatZones, activeLayers.hospitals, activeLayers.shelters, activeLayers.water]);

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
            {location?.isState
              ? `Displaying state-wide district thermal stress zones, apex hospitals, relief shelters, and water stations for ${location?.name}. Click any district or facility to inspect.`
              : `Displaying microclimates, hospitals, cooling centers, and drinking water stations for ${location?.name}. Click any facility or heat zone to view on map.`
            }
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
            <span>{location?.isState ? t('gis_layer_heat', 'Districts') : t('gis_layer_heat', 'Heat Zones')}</span>
          </button>
          <button
            type="button"
            className={`layer-toggle-btn ${activeLayers.hospitals ? 'active hospital' : ''}`}
            onClick={() => toggleLayer('hospitals')}
            title="Toggle Emergency Hospitals"
          >
            <HospitalIcon size={14} />
            <span>{t('gis_layer_hospitals', 'Hospitals')} ({hospitalsCount})</span>
          </button>
          <button
            type="button"
            className={`layer-toggle-btn ${activeLayers.shelters ? 'active shelter' : ''}`}
            onClick={() => toggleLayer('shelters')}
            title="Toggle Cooling Shelters"
          >
            <ShelterIcon size={14} />
            <span>{t('gis_layer_shelters', 'Shelters')} ({sheltersCount})</span>
          </button>
          <button
            type="button"
            className={`layer-toggle-btn ${activeLayers.water ? 'active water' : ''}`}
            onClick={() => toggleLayer('water')}
            title="Toggle Water Stations"
          >
            <WaterIcon size={14} />
            <span>{t('gis_layer_water', 'Water')} ({waterCount})</span>
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
            <span className="legend-head">{t('gis_risk_classification', 'Risk Scale')}:</span>
            <div className="legend-items">
              <span className="leg-dot safe" style={{ background: '#10b981', color: '#ffffff' }}>
                <ShieldCheckIcon size={12} color="#ffffff" />
                <span>&lt;26&deg; {t('status_safe', 'Safe')}</span>
              </span>
              <span className="leg-dot caution" style={{ background: '#eab308', color: '#0f172a' }}>
                <AlertTriangleIcon size={12} color="#0f172a" />
                <span>26-28&deg; {t('status_caution', 'Caution')}</span>
              </span>
              <span className="leg-dot alert" style={{ background: '#f97316', color: '#ffffff' }}>
                <FlameIcon size={12} color="#ffffff" />
                <span>28-32&deg; {t('status_danger', 'Alert')}</span>
              </span>
              <span className="leg-dot danger" style={{ background: '#ef4444', color: '#ffffff' }}>
                <ShieldAlertIcon size={12} color="#ffffff" />
                <span>&gt;32&deg; {t('status_extreme_danger', 'Danger')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Facilities & Emergency Points Sidebar */}
        <div className="gis-sidebar">
          <div className="sidebar-header">
            <h4>{location?.isState ? 'Districts & Facilities' : 'Facilities & Heat Zones'}</h4>
            <span className="sidebar-count">{emergencyResources.length} facilities &middot; {wards.length} {location?.isState ? 'districts' : 'wards'}</span>
          </div>

          <div className="sidebar-items-list scroll-area">
            <div className="sidebar-group-label">
              {location?.isState ? 'State District Heat Zones' : 'Microclimate Wards'}
            </div>
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
                    {ward.mortalityRisk >= 55 ? <ShieldAlertIcon size={12} color={color} /> : ward.mortalityRisk >= 40 ? <FlameIcon size={12} color={color} /> : ward.mortalityRisk >= 20 ? <AlertTriangleIcon size={12} color={color} /> : <ShieldCheckIcon size={12} color={color} />}
                    <span>{ward.mortalityRisk}% Risk</span>
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
        <div
          className="gis-detail-banner ward animate-fade-in"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="detail-banner-header">
            <div className="detail-title-group">
              <span className="detail-badge" style={{ background: getRiskColor(selectedWard.mortalityRisk), color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                {selectedWard.mortalityRisk >= 55 ? <ShieldAlertIcon size={14} color="#ffffff" /> : selectedWard.mortalityRisk >= 40 ? <FlameIcon size={14} color="#ffffff" /> : selectedWard.mortalityRisk >= 20 ? <AlertTriangleIcon size={14} color="#ffffff" /> : <ShieldCheckIcon size={14} color="#ffffff" />}
                <span>{getRiskLabel(selectedWard.mortalityRisk)} RISK</span>
              </span>
              <h4>{selectedWard.name}</h4>
              <span className="detail-pop">Pop: {selectedWard.population}</span>
            </div>
            <button className="detail-close-btn" onClick={() => setSelectedWard(null)} aria-label="Close">
              <XIcon size={16} />
            </button>
          </div>
          <div className="detail-grid-metrics">
            <div className="detail-stat"><span>WBGT</span><strong>{selectedWard.wbgt}&deg;C</strong></div>
            <div className="detail-stat"><span>{t('gis_air_temp', 'Dry Air Temp')}</span><strong>{selectedWard.temperature}&deg;C</strong></div>
            <div className="detail-stat"><span>{t('hourly_heat_index', 'Heat Index')}</span><strong>{selectedWard.heatIndex}&deg;C</strong></div>
            <div className="detail-stat"><span>{t('gis_rel_humidity', 'Relative Humidity')}</span><strong>{selectedWard.humidity}%</strong></div>
            <div className="detail-stat"><span>{t('card_mortality_risk', 'Mortality Vulnerability')}</span><strong style={{ color: getRiskColor(selectedWard.mortalityRisk) }}>{selectedWard.mortalityRisk}%</strong></div>
            <div className="detail-stat"><span>{t('gis_cooling_centers', 'Cooling Centers')}</span><strong>{selectedWard.coolingCenters} {t('active', 'Active')}</strong></div>
          </div>
        </div>
      )}

      {selectedResource && (
        <div
          className="gis-detail-banner resource animate-fade-in"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
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
