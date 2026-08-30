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
  CrosshairIcon
} from './icons';
import './GISMap.css';

const getRiskColor = (risk) => {
  if (risk >= 80) return '#991b1b';
  if (risk >= 60) return '#dc2626';
  if (risk >= 40) return '#ea580c';
  if (risk >= 20) return '#ca8a04';
  return '#16a34a';
};

const getRiskLabel = (risk) => {
  if (risk >= 80) return 'EXTREME';
  if (risk >= 60) return 'HIGH';
  if (risk >= 40) return 'MODERATE';
  if (risk >= 20) return 'LOW';
  return 'VERY LOW';
};

function GISMap({ location, wards = [], emergencyResources = [], focusedResource = null }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
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
  const [mapError, setMapError] = useState(false);

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

    if (item.type && item.type !== 'Urban Mixed Zone' && !item.microclimateType) {
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
      mapInstanceRef.current.flyTo([item.lat, item.lon], 15, {
        animate: true,
        duration: 0.8,
      });

      setTimeout(() => {
        const marker = markersMapRef.current[item.id];
        if (marker) {
          marker.openPopup();
        }
      }, 350);
    }
  }, [ensureLayerVisible]);

  // Handle external focusedResource prop
  useEffect(() => {
    if (focusedResource) {
      focusOnItem(focusedResource);
    }
  }, [focusedResource, focusOnItem]);

  // Initialize Leaflet Map and Plot Vectors
  useEffect(() => {
    if (!location?.lat || !location?.lon) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        if (!mapRef.current || !isMounted) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapRef.current, {
          center: [location.lat, location.lon],
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        markersMapRef.current = {};

        const heatGroup = L.layerGroup();
        const hospitalGroup = L.layerGroup();
        const shelterGroup = L.layerGroup();
        const waterGroup = L.layerGroup();

        // 1. Plot Heat Zones / Wards with ML Predictions
        wards.forEach((ward) => {
          const mRisk = ward.mortalityRisk || 40;
          const hRisk = ward.hospitalizationRisk || Math.round(mRisk * 1.15);
          const tStress = ward.thermalStress || Math.round(mRisk * 1.1);
          const rCategory = ward.riskCategory || getRiskLabel(mRisk);
          const color = getRiskColor(mRisk);
          const modelVer = ward.modelVersion || 'v1.0.0';

          // Circle Zone
          L.circle([ward.lat, ward.lon], {
            radius: ward.radius || 950,
            color,
            weight: 1.5,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.22,
          }).addTo(heatGroup);

          // Custom Ward Pin Marker
          const wardIcon = L.divIcon({
            html: `
              <div class="ward-gis-pin" style="background-color: ${color}; color: #ffffff;">
                <span class="ward-pin-val">${mRisk}%</span>
              </div>
            `,
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
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
                    ${rCategory} RISK
                  </span>
                  <span class="popup-pop">Pop: ${ward.population || 'N/A'}</span>
                </div>
                <div class="popup-title">${ward.name}</div>
                <div class="popup-type">${ward.microclimateType || 'Urban Microclimate'} &middot; Model: ${modelVer}</div>
                <div class="popup-grid">
                  <div class="pg-item"><span>Thermal Stress</span><strong style="color:#ea580c">${tStress}/100</strong></div>
                  <div class="pg-item"><span>Mortality Risk</span><strong style="color:${color}">${mRisk}%</strong></div>
                  <div class="pg-item"><span>Hospitalization</span><strong style="color:#7c3aed">${hRisk}%</strong></div>
                  <div class="pg-item"><span>WBGT / Temp</span><strong>${ward.wbgt}&deg; / ${ward.temperature}&deg;C</strong></div>
                </div>
              </div>
            `);

          markersMapRef.current[ward.id] = wardMarker;
        });

        // 2. Plot Emergency Resources
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
    <div className="gis-wrapper card" id="gis-interactive-map">
      <div className="gis-top-bar">
        <div className="gis-header-titles">
          <h3 className="section-title">
            <MapIcon size={20} color="#1e40af" />
            <span>GIS Heat Vulnerability &amp; Emergency Infrastructure Map</span>
          </h3>
          <p className="section-desc">
            Displaying ML microclimate risk tiers, hospitals, cooling centers, and drinking water stations for {location?.name}.
          </p>
        </div>

        {/* Dynamic Layer Switchers */}
        <div className="gis-layer-toggles">
          <button
            className={`layer-toggle-btn ${activeLayers.heatZones ? 'active heat' : ''}`}
            onClick={() => toggleLayer('heatZones')}
            title="Toggle Thermal Stress Zones"
          >
            <FlameIcon size={14} />
            <span>Heat Zones</span>
          </button>
          <button
            className={`layer-toggle-btn ${activeLayers.hospitals ? 'active hospital' : ''}`}
            onClick={() => toggleLayer('hospitals')}
            title="Toggle Emergency Hospitals"
          >
            <HospitalIcon size={14} />
            <span>Hospitals ({hospitalsCount})</span>
          </button>
          <button
            className={`layer-toggle-btn ${activeLayers.shelters ? 'active shelter' : ''}`}
            onClick={() => toggleLayer('shelters')}
            title="Toggle Cooling Shelters"
          >
            <ShelterIcon size={14} />
            <span>Shelters ({sheltersCount})</span>
          </button>
          <button
            className={`layer-toggle-btn ${activeLayers.water ? 'active water' : ''}`}
            onClick={() => toggleLayer('water')}
            title="Toggle Water Stations"
          >
            <WaterIcon size={14} />
            <span>Water ({waterCount})</span>
          </button>
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

          {/* Map Legend */}
          <div className="gis-floating-legend">
            <span className="legend-head">ML Risk Tier:</span>
            <div className="legend-items">
              <span className="leg-dot" style={{ background: '#16a34a' }}>&lt;20% Low</span>
              <span className="leg-dot" style={{ background: '#ca8a04' }}>20-40% Mod</span>
              <span className="leg-dot" style={{ background: '#ea580c' }}>40-60% High</span>
              <span className="leg-dot" style={{ background: '#dc2626' }}>60-80% V.High</span>
              <span className="leg-dot" style={{ background: '#991b1b' }}>&gt;80% Ext</span>
            </div>
          </div>
        </div>

        {/* Interactive Facilities & Emergency Points Sidebar */}
        <div className="gis-sidebar">
          <div className="sidebar-header">
            <h4>Wards &amp; Facilities</h4>
            <span className="sidebar-count">{wards.length} Wards &middot; {emergencyResources.length} Assets</span>
          </div>

          <div className="sidebar-items-list scroll-area">
            <div className="sidebar-group-label">Microclimate Wards</div>
            {wards.map((ward) => {
              const mRisk = ward.mortalityRisk || 40;
              const color = getRiskColor(mRisk);
              return (
                <button
                  key={ward.id}
                  className={`sidebar-item ward-type ${selectedWard?.id === ward.id ? 'selected' : ''}`}
                  onClick={() => focusOnItem(ward)}
                >
                  <div className="item-color-bar" style={{ background: color }} />
                  <div className="item-details">
                    <span className="item-name">{ward.name}</span>
                    <span className="item-meta">WBGT: {ward.wbgt}&deg;C &middot; Stress: {ward.thermalStress || Math.round(mRisk * 1.1)}/100</span>
                  </div>
                  <span className="item-badge" style={{ background: `${color}18`, color, fontWeight: 700 }}>
                    {mRisk}% Risk
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
              <span className="detail-badge" style={{ background: getRiskColor(selectedWard.mortalityRisk || 40), color: '#ffffff', fontWeight: 700 }}>
                {selectedWard.riskCategory || getRiskLabel(selectedWard.mortalityRisk || 40)} RISK
              </span>
              <h4>{selectedWard.name}</h4>
              <span className="detail-pop">Pop: {selectedWard.population}</span>
            </div>
            <button className="detail-close-btn" onClick={() => setSelectedWard(null)} aria-label="Close">
              <XIcon size={16} />
            </button>
          </div>
          <div className="detail-grid-metrics">
            <div className="detail-stat"><span>Thermal Stress</span><strong>{selectedWard.thermalStress || Math.round((selectedWard.mortalityRisk || 40) * 1.1)}/100</strong></div>
            <div className="detail-stat"><span>Mortality Risk</span><strong style={{ color: getRiskColor(selectedWard.mortalityRisk || 40) }}>{selectedWard.mortalityRisk || 40}%</strong></div>
            <div className="detail-stat"><span>Hospitalization Surge</span><strong style={{ color: '#7c3aed' }}>{selectedWard.hospitalizationRisk || Math.round((selectedWard.mortalityRisk || 40) * 1.15)}%</strong></div>
            <div className="detail-stat"><span>WBGT / Temp</span><strong>{selectedWard.wbgt}&deg;C / {selectedWard.temperature}&deg;C</strong></div>
            <div className="detail-stat"><span>Cooling Centers</span><strong>{selectedWard.coolingCenters || 3} Active</strong></div>
            <div className="detail-stat"><span>Model Version</span><strong>{selectedWard.modelVersion || 'v1.0.0'}</strong></div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GISMap;
