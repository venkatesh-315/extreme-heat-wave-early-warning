import React, { useEffect, useRef, useState } from 'react';
import './GISMap.css';

// Risk color mapping
const getRiskColor = (risk) => {
  if (risk >= 70) return '#7f1d1d';
  if (risk >= 55) return '#dc2626';
  if (risk >= 40) return '#ef4444';
  if (risk >= 25) return '#f97316';
  if (risk >= 15) return '#eab308';
  return '#22c55e';
};

const getRiskLabel = (risk) => {
  if (risk >= 70) return 'CATASTROPHIC';
  if (risk >= 55) return 'EXTREME';
  if (risk >= 40) return 'VERY HIGH';
  if (risk >= 25) return 'HIGH';
  if (risk >= 15) return 'MODERATE';
  return 'LOW';
};

function GISMap({ city, wards }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [mapError, setMapError] = useState(false);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!city || !wards?.length) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        // Cleanup previous map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        markersRef.current = [];

        if (!mapRef.current) return;

        const map = L.map(mapRef.current, {
          center: [city.lat, city.lon],
          zoom: 11,
          zoomControl: true,
          attributionControl: false,
        });

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '©OpenStreetMap ©CartoDB',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        // City center marker
        const cityIcon = L.divIcon({
          html: `<div class="city-center-marker">
            <div class="city-marker-ring"></div>
            <div class="city-marker-dot">🏙️</div>
          </div>`,
          className: '',
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        L.marker([city.lat, city.lon], { icon: cityIcon })
          .addTo(map)
          .bindPopup(`<div class="map-popup"><strong>${city.name}</strong><br/><span style="color:#9494b8">${city.state}</span></div>`);

        // Ward markers
        wards.forEach((ward, i) => {
          const color = getRiskColor(ward.mortalityRisk);
          const riskLabel = getRiskLabel(ward.mortalityRisk);
          const radius = 30 + ward.mortalityRisk * 0.6;

          // Circle for heat zone
          const circle = L.circle([ward.lat, ward.lon], {
            radius: radius * 80,
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            weight: 1.5,
            opacity: 0.6,
          }).addTo(map);

          // Custom div marker
          const wardIcon = L.divIcon({
            html: `<div class="ward-marker" style="--risk-color: ${color}; --risk-pct: ${ward.mortalityRisk}%">
              <div class="ward-marker-inner">
                <span class="ward-risk-value" style="color:${color}">${ward.mortalityRisk}%</span>
              </div>
              <div class="ward-pulse" style="background: ${color}"></div>
            </div>`,
            className: '',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });

          const marker = L.marker([ward.lat, ward.lon], { icon: wardIcon })
            .addTo(map)
            .on('click', () => setSelectedWard(ward))
            .bindPopup(`
              <div class="map-popup">
                <div class="popup-ward-name">${ward.name}</div>
                <div class="popup-row"><span>WBGT</span><strong style="color:${color}">${ward.wbgt}°C</strong></div>
                <div class="popup-row"><span>Heat Index</span><strong style="color:#ef4444">${ward.heatIndex}°C</strong></div>
                <div class="popup-row"><span>Mortality Risk</span><strong style="color:${color}">${ward.mortalityRisk}%</strong></div>
                <div class="popup-row"><span>Status</span><strong style="color:${color}">${riskLabel}</strong></div>
                <div class="popup-row"><span>Elderly Density</span><strong>${ward.elderlyDensity}%</strong></div>
                <div class="popup-row"><span>Outdoor Workers</span><strong>${ward.outdoorWorkers}%</strong></div>
                <div class="popup-row"><span>Cooling Centers</span><strong style="color:#22c55e">${ward.coolingCenters}</strong></div>
              </div>
            `);

          markersRef.current.push(marker);
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Map init error:', err);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city, wards]);

  return (
    <div className="gis-section" id="gis-map-section">
      <div className="gis-header">
        <div>
          <h3 className="section-title">🗺️ Ward-Level Heat Risk GIS Map — {city?.name}</h3>
          <p className="gis-desc">Hyper-local WBGT-based thermal stress zones. Click markers for ward details.</p>
        </div>
        <div className="map-legend">
          {[
            { color: '#22c55e', label: 'Low' },
            { color: '#eab308', label: 'Moderate' },
            { color: '#f97316', label: 'High' },
            { color: '#ef4444', label: 'Very High' },
            { color: '#dc2626', label: 'Extreme' },
            { color: '#7f1d1d', label: 'Catastrophic' },
          ].map(item => (
            <div key={item.label} className="legend-item">
              <div className="legend-color-dot" style={{ background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="gis-content">
        <div className="map-container">
          {mapError ? (
            <div className="map-error">
              <span>🗺️</span>
              <p>Map unavailable. Showing ward data in table format.</p>
            </div>
          ) : (
            <div ref={mapRef} className="map-el" id="leaflet-map" />
          )}
        </div>

        {/* Ward list sidebar */}
        <div className="ward-sidebar">
          <h4 className="sidebar-title">Zone Risk Summary</h4>
          <div className="ward-list scroll-area">
            {wards.map((ward, i) => {
              const color = getRiskColor(ward.mortalityRisk);
              return (
                <button
                  key={i}
                  id={`ward-item-${i}`}
                  className={`ward-item ${selectedWard?.id === ward.id ? 'selected' : ''}`}
                  onClick={() => setSelectedWard(ward)}
                  style={{ '--ward-color': color }}
                >
                  <div className="ward-color-bar" style={{ background: color }} />
                  <div className="ward-info">
                    <span className="ward-name">{ward.name}</span>
                    <div className="ward-stats">
                      <span>🌡️ {ward.wbgt}°C WBGT</span>
                      <span>💧 {ward.humidity}%</span>
                    </div>
                  </div>
                  <div className="ward-risk">
                    <span className="ward-risk-pct" style={{ color }}>{ward.mortalityRisk}%</span>
                    <span className="ward-risk-label" style={{ color }}>{getRiskLabel(ward.mortalityRisk)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected ward detail */}
      {selectedWard && (
        <div className="ward-detail-panel card animate-fade-in">
          <div className="ward-detail-header">
            <h4 className="ward-detail-name">{selectedWard.name}</h4>
            <button className="ward-detail-close" onClick={() => setSelectedWard(null)}>✕</button>
          </div>
          <div className="ward-detail-grid">
            {[
              { icon: '🌡️', label: 'Temperature', value: `${selectedWard.temperature}°C` },
              { icon: '🔥', label: 'WBGT', value: `${selectedWard.wbgt}°C` },
              { icon: '♨️', label: 'Heat Index', value: `${selectedWard.heatIndex}°C` },
              { icon: '⚠️', label: 'Mortality Risk', value: `${selectedWard.mortalityRisk}%` },
              { icon: '👴', label: 'Elderly Density', value: `${selectedWard.elderlyDensity}%` },
              { icon: '👷', label: 'Outdoor Workers', value: `${selectedWard.outdoorWorkers}%` },
              { icon: '❄️', label: 'Cooling Centers', value: selectedWard.coolingCenters },
              { icon: '🏥', label: 'Hospitals', value: selectedWard.hospitals },
            ].map((item, i) => (
              <div key={i} className="ward-detail-item">
                <span className="wd-icon">{item.icon}</span>
                <span className="wd-label">{item.label}</span>
                <span className="wd-value" style={{ color: item.label === 'Mortality Risk' ? getRiskColor(selectedWard.mortalityRisk) : undefined }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GISMap;
