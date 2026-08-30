import React, { useEffect, useRef, useState } from 'react';
import {
  InfoIcon,
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  MaximizeIcon,
  XIcon
} from './icons';
import { formatTemp } from '../services/weatherService';
import './WardRiskMapCard.css';

const RISK_CATEGORIES = [
  { id: 'low', label: 'Very Low / Low (0-40)', shortLabel: '0-40 Low', range: '0–40', color: '#22c55e', title: 'Normal Summer', significance: 'Tolerable heat load. Routine hydration advised.', action: 'Standard advisory' },
  { id: 'moderate', label: 'Moderate (40-60)', shortLabel: '40-60 Mod', range: '40–60', color: '#eab308', title: 'Elevated Caution', significance: 'Increased hydration required; caution for infants & seniors.', action: 'Shaded rest spots' },
  { id: 'high', label: 'High (60-80)', shortLabel: '60-80 High', range: '60–80', color: '#ea580c', title: 'Severe Burden', significance: 'High risk of heat illness and surge in hospital admissions.', action: 'Enforce rest cycles' },
  { id: 'extreme', label: 'Extreme (80-100)', shortLabel: '80-100 Ext', range: '80–100', color: '#991b1b', title: 'Critical Threat', significance: 'Life-threatening biometeorology. Emergency ICUs & water tankers.', action: 'Disaster protocol' },
];

function WardRiskMapCard({ location, wards = [], tempUnit = 'C' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState('Risk Index');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Invalidate Leaflet map size whenever fullscreen or container dimensions change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    invalidate();
    const t1 = setTimeout(invalidate, 80);
    const t2 = setTimeout(invalidate, 250);
    const t3 = setTimeout(invalidate, 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
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
          scrollWheelZoom: false,
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

        // Dynamic wards list with ML predictions
        const wardSpots = Array.isArray(wards) && wards.length > 0
          ? wards.map((w, idx) => {
              const offsets = [
                { lat: 0, lon: 0 },
                { lat: 0.016, lon: -0.014 },
                { lat: -0.018, lon: 0.018 },
                { lat: -0.024, lon: -0.022 },
                { lat: 0.022, lon: 0.025 },
              ];
              const off = offsets[idx % offsets.length];
              const wLat = w.lat || (centerLat + off.lat);
              const wLon = w.lon || (centerLon + off.lon);
              const mRisk = w.mortalityRisk || 40;
              const hRisk = w.hospitalizationRisk || Math.round(mRisk * 1.15);
              const tStress = w.thermalStress || Math.round(mRisk * 1.1);
              const rCat = w.riskCategory || (mRisk >= 80 ? 'EXTREME' : mRisk >= 60 ? 'HIGH' : mRisk >= 40 ? 'MODERATE' : 'LOW');

              let wColor = '#eab308';
              let tagBg = '#fefce8';
              let tagColor = '#ca8a04';
              if (mRisk >= 80) { wColor = '#991b1b'; tagBg = '#fff1f2'; tagColor = '#991b1b'; }
              else if (mRisk >= 60) { wColor = '#ea580c'; tagBg = '#fff7ed'; tagColor = '#ea580c'; }
              else if (mRisk >= 40) { wColor = '#f97316'; tagBg = '#fffaf5'; tagColor = '#f97316'; }
              else { wColor = '#22c55e'; tagBg = '#f0fdf4'; tagColor = '#16a34a'; }

              return {
                id: w.id || `ward-${idx + 1}`,
                lat: wLat,
                lon: wLon,
                name: w.name || `Ward ${idx + 1}`,
                shortName: w.name?.split('·')[0]?.trim() || `Ward ${idx + 1}`,
                type: w.type || 'Urban Mixed Zone',
                categoryTag: rCat,
                tagBg,
                tagColor,
                population: typeof w.population === 'number' ? w.population.toLocaleString('en-IN') : (w.population || '85,000'),
                wbgt: w.wbgt || 32.5,
                airTemp: w.temperature || 42.0,
                heatIndex: w.heatIndex || 46.0,
                mortalityRisk: mRisk,
                hospitalizationRisk: hRisk,
                thermalStress: tStress,
                color: wColor,
                modelVersion: w.modelVersion || 'v1.0.0',
                predictionTimestamp: w.predictionTimestamp || new Date().toISOString(),
              };
            })
          : [
              {
                id: 'w1',
                lat: centerLat,
                lon: centerLon,
                name: 'Ward 1 · Central Commercial Hub',
                shortName: 'Ward 1 · Central Commercial',
                type: 'Dense Concrete / Urban Heat Island',
                categoryTag: 'HIGH',
                tagBg: '#fff7ed',
                tagColor: '#ea580c',
                population: '95,000',
                wbgt: 30.2,
                airTemp: 42.4,
                heatIndex: 46.8,
                mortalityRisk: 65,
                hospitalizationRisk: 72,
                thermalStress: 78,
                color: '#ea580c',
                modelVersion: 'v1.0.0',
                predictionTimestamp: new Date().toISOString(),
              },
              {
                id: 'w2',
                lat: centerLat + 0.016,
                lon: centerLon - 0.014,
                name: 'Ward 2 · North Industrial Colony',
                shortName: 'Ward 2 · North Industrial',
                type: 'Industrial Tin-Sheds & High Exposure',
                categoryTag: 'EXTREME',
                tagBg: '#fff1f2',
                tagColor: '#991b1b',
                population: '140,000',
                wbgt: 34.6,
                airTemp: 44.8,
                heatIndex: 51.2,
                mortalityRisk: 84,
                hospitalizationRisk: 89,
                thermalStress: 92,
                color: '#991b1b',
                modelVersion: 'v1.0.0',
                predictionTimestamp: new Date().toISOString(),
              },
            ];

        // Add circle heat zones + Pin with Location Name
        wardSpots.forEach((spot) => {
          L.circle([spot.lat, spot.lon], {
            radius: 800,
            color: spot.color,
            weight: 1,
            fillColor: spot.color,
            fillOpacity: 0.22,
          }).addTo(map);

          const formattedWbgt = formatTemp(spot.wbgt, tempUnit);
          const formattedAirTemp = formatTemp(spot.airTemp, tempUnit);

          const customIcon = L.divIcon({
            className: 'custom-ward-map-pin',
            html: `
              <div class="pin-wrapper">
                <div class="pin-bubble" style="background-color: ${spot.color};">
                  <span class="pin-bubble-text">${spot.mortalityRisk}%</span>
                </div>
                <div class="pin-pulse" style="border-color: ${spot.color};"></div>
                <div class="pin-label-pill">
                  <span class="pin-ward-name">${spot.shortName}</span>
                </div>
              </div>
            `,
            iconSize: [110, 45],
            iconAnchor: [55, 36],
          });

          const marker = L.marker([spot.lat, spot.lon], { icon: customIcon }).addTo(map);

          const popupContent = `
            <div class="ward-popup-content" style="font-family: Inter, sans-serif; padding: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 0.7rem; font-weight: 700; background: ${spot.tagBg}; color: ${spot.tagColor}; padding: 2px 6px; borderRadius: 4px;">
                  ${spot.categoryTag} RISK
                </span>
                <span style="font-size: 0.68rem; color: #64748b;">XGBoost ${spot.modelVersion}</span>
              </div>
              <h4 style="margin: 0 0 2px 0; font-size: 0.9rem; font-weight: 700; color: #0f172a;">${spot.name}</h4>
              <p style="margin: 0 0 8px 0; font-size: 0.72rem; color: #64748b;">${spot.type} &middot; Pop: ${spot.population}</p>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                <div><span style="font-size: 0.68rem; color: #64748b; display: block;">Thermal Stress</span><strong style="font-size: 0.85rem; color: #ea580c;">${spot.thermalStress}/100</strong></div>
                <div><span style="font-size: 0.68rem; color: #64748b; display: block;">Mortality Risk</span><strong style="font-size: 0.85rem; color: #dc2626;">${spot.mortalityRisk}%</strong></div>
                <div><span style="font-size: 0.68rem; color: #64748b; display: block;">Hospitalization</span><strong style="font-size: 0.85rem; color: #7c3aed;">${spot.hospitalizationRisk}%</strong></div>
                <div><span style="font-size: 0.68rem; color: #64748b; display: block;">WBGT / Temp</span><strong style="font-size: 0.85rem; color: #0f172a;">${formattedWbgt}&deg; / ${formattedAirTemp}&deg;</strong></div>
              </div>
              <div style="font-size: 0.65rem; color: #94a3b8; text-align: right;">
                Inference: ${new Date(spot.predictionTimestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 240,
            className: 'clean-ward-popup',
          });
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Error initializing map:', err);
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
  }, [location, wards, tempUnit]);

  return (
    <div className={`card ward-risk-card ${isFullscreen ? 'fullscreen-mode' : ''}`} id="ward-level-risk-map">
      {/* Card Header matching screenshot */}
      <div className="ward-card-header">
        <div className="ward-header-left">
          <div className="ward-title-row">
            <h3 className="card-heading">Ward-Level Risk Map</h3>
            <span
              className="info-tooltip-wrap clickable-info-btn"
              title="Click to view full Risk Category Breakdown table"
              onClick={() => setActiveCategoryModal(true)}
              tabIndex={0}
              role="button"
              aria-label="Risk Category Breakdown"
            >
              <InfoIcon size={15} />
            </span>
          </div>
          <p className="card-subheading">
            Microclimate vulnerability &amp; multi-target ML projections &mdash; {location?.name}
          </p>
        </div>

        {/* Filter Dropdown & Controls */}
        <div className="ward-header-controls">
          <div className="filter-dropdown-wrap">
            <button
              className="filter-dropdown-btn"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              <span>{selectedFilter}</span>
              <ChevronDownIcon size={14} />
            </button>
            {isFilterDropdownOpen && (
              <div className="filter-menu-dropdown">
                {['Risk Index', 'Thermal Stress (WBGT)', 'Mortality Risk (%)', 'Hospitalization (%)'].map((item) => (
                  <button
                    key={item}
                    className={`filter-item ${selectedFilter === item ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFilter(item);
                      setIsFilterDropdownOpen(false);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="header-icon-btn"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand Map Fullscreen'}
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <XIcon size={16} /> : <MaximizeIcon size={15} />}
          </button>
        </div>
      </div>

      {/* Map Container Area */}
      <div className="ward-map-viewport">
        <div ref={mapContainerRef} className="leaflet-map-canvas" id="ward-leaflet-map-canvas" />

        {/* Floating Zoom Controls */}
        <div className="floating-map-controls">
          <button
            className="map-ctrl-btn"
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomIn()}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <PlusIcon size={14} />
          </button>
          <button
            className="map-ctrl-btn"
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomOut()}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <MinusIcon size={14} />
          </button>
        </div>

        {/* Floating Legend Overlay */}
        <div className="floating-risk-legend">
          <span className="legend-label-main">ML Risk Tier:</span>
          <div className="legend-pills-row">
            {RISK_CATEGORIES.map((cat) => (
              <div key={cat.id} className="legend-pill-item">
                <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                <span className="legend-text">{cat.shortLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WardRiskMapCard;
