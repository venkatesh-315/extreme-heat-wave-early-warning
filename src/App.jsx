import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import LocationSearch from './components/LocationSearch';
import WeatherMetrics from './components/WeatherMetrics';
import ThermalStressPanel from './components/ThermalStressPanel';
import RiskForecast from './components/RiskForecast';
import GISMap from './components/GISMap';
import EmergencyDirectory from './components/EmergencyDirectory';
import Recommendations from './components/Recommendations';
import AlertBanner from './components/AlertBanner';
import HourlyChart from './components/HourlyChart';
import MortalityTrend from './components/MortalityTrend';
import ImdApiModal from './components/ImdApiModal';
import Footer from './components/Footer';
import SplitText from './components/SplitText';

import {
  UserLocationPin,
  MapIcon,
  ThermometerIcon,
  HospitalIcon,
  CalendarIcon,
  ShieldAlertIcon,
  BarChartIcon,
  BuildingIcon,
  MessageSquareIcon,
  SatelliteIcon,
  FlameIcon
} from './components/icons';

import { CURATED_INDIAN_LOCATIONS } from './services/geocodingService';
import { fetchLiveWeatherData } from './services/weatherService';
import { fetchEmergencyResources } from './services/emergencyService';
import { generateWardData, generateRecommendations, SUMMER_2026_METEOROLOGY } from './data/mockData';

import './App.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [thermalMetrics, setThermalMetrics] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [emergencyResources, setEmergencyResources] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sourceInfo, setSourceInfo] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [activeSection, setActiveSection] = useState('map'); // Defaults to map or switches on select
  const [isImdModalOpen, setIsImdModalOpen] = useState(false);

  // Load weather and emergency data for a given location
  const handleLocationSelect = useCallback(async (location, shouldAutoSwitchToMap = true) => {
    setIsCalculating(true);
    setHasData(false);

    // Automatically display the map of user's location
    if (shouldAutoSwitchToMap) {
      setActiveSection('map');
    }

    try {
      // 1. Fetch live meteorological weather & thermal indices
      const weatherResult = await fetchLiveWeatherData(location.lat, location.lon, location.id);

      // 2. Fetch emergency shelters, hospitals and drinking water kiosks
      const emergencyList = await fetchEmergencyResources(location.lat, location.lon, location.name);

      // 3. Generate microclimate ward zones
      const wards = generateWardData(
        location.lat,
        location.lon,
        weatherResult.weather.temperature,
        weatherResult.weather.humidity
      );

      // 4. Generate NDMA Heat Action Plan recommendations
      const recs = generateRecommendations(
        weatherResult.thermalMetrics.wbgt,
        weatherResult.thermalMetrics.mortalityRisk,
        location.population || 1500000,
        weatherResult.weather.temperature
      );

      setSelectedLocation(location);
      setWeatherData(weatherResult.weather);
      setThermalMetrics(weatherResult.thermalMetrics);
      setForecast(weatherResult.forecast);
      setWardData(wards);
      setEmergencyResources(emergencyList);
      setHourlyData(weatherResult.hourlyData);
      setRecommendations(recs);
      setSourceInfo(weatherResult.source);
      setHasData(true);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Initial load: New Delhi default
  useEffect(() => {
    const defaultCity = CURATED_INDIAN_LOCATIONS[0];
    let isMounted = true;

    (async () => {
      if (isMounted) {
        await handleLocationSelect(defaultCity, true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [handleLocationSelect]);

  return (
    <div className="app-root">
      <Navbar
        onOpenImdModal={() => setIsImdModalOpen(true)}
        isLive={true}
      />

      <main className="app-main">
        {/* HERO / SEARCH WIDGET */}
        <section id="home" className="hero-section">
          <div className="hero-header-row">
            <div className="hero-titles">
              <div className="hero-badge-row">
                <span className="season-badge">
                  <span className="animate-pulse">●</span> {SUMMER_2026_METEOROLOGY.seasonTitle}
                </span>
                <span className="portal-code-badge">
                  <ShieldAlertIcon size={12} color="#1e40af" />
                  <span>MoES &amp; NDMA &middot; National Civic Biometeorology</span>
                </span>
              </div>

              {/* Animated Head Text with GSAP SplitText */}
              <div className="hero-title-container">
                <SplitText
                  text="National Extreme Heatwave Early Warning & Response System"
                  className="hero-main-title"
                  tag="h1"
                  delay={35}
                  duration={1.1}
                  ease="power3.out"
                />
              </div>

              <p className="hero-subtitle">
                Operational civic biometeorology combining Outdoor WBGT, UTCI, and Heat Index with real-time geocoding, hospital heat-stroke ICUs, and cooling shelters across India.
              </p>
            </div>

            <div className="hero-actions-right">
              <button
                className="api-status-btn"
                onClick={() => setIsImdModalOpen(true)}
              >
                <SatelliteIcon size={14} color="#15803d" />
                <span>IMD &amp; Open-Meteo Gateway: <strong>Operational</strong></span>
              </button>
            </div>
          </div>

          <LocationSearch
            onSelect={(loc) => handleLocationSelect(loc, true)}
            isCalculating={isCalculating}
            selectedLocation={selectedLocation}
          />
        </section>

        {/* ACTIVE LOCATION STRIP & SEVERITY ALERT BANNER */}
        {hasData && selectedLocation && thermalMetrics && (
          <>
            {thermalMetrics.stressCategory?.level >= 3 && (
              <AlertBanner
                location={selectedLocation}
                stressCategory={thermalMetrics.stressCategory}
                mortalityRisk={thermalMetrics.mortalityRisk}
                imdAlert={thermalMetrics.imdAlert}
              />
            )}

            <div className="active-location-banner card">
              <div className="active-loc-left">
                <div className="loc-pin-icon-wrap">
                  <UserLocationPin size={28} color="#0f172a" />
                </div>
                <div>
                  <h2 className="loc-title-h2">{selectedLocation.name}</h2>
                  <div className="loc-meta-text">
                    <span>{selectedLocation.state || 'India'}</span>
                    <span>&middot;</span>
                    <span>{selectedLocation.lat?.toFixed(4)}&deg;N, {selectedLocation.lon?.toFixed(4)}&deg;E</span>
                    <span>&middot;</span>
                    <span>Source: {sourceInfo}</span>
                  </div>
                </div>
              </div>

              <div className="active-loc-metrics">
                <div className="loc-metric-pill">
                  <span className="loc-metric-label">Air Temp</span>
                  <span className="loc-metric-val" style={{ color: '#ea580c' }}>
                    {weatherData?.temperature}&deg;C
                  </span>
                </div>
                <div className="loc-metric-pill">
                  <span className="loc-metric-label">WBGT Stress</span>
                  <span className="loc-metric-val" style={{ color: '#dc2626' }}>
                    {thermalMetrics?.wbgt}&deg;C
                  </span>
                </div>
                <div className="loc-metric-pill">
                  <span className="loc-metric-label">Relative Humidity</span>
                  <span className="loc-metric-val" style={{ color: '#0284c7' }}>
                    {weatherData?.humidity}%
                  </span>
                </div>
                <div className="loc-metric-pill">
                  <span className="loc-metric-label">Mortality Risk</span>
                  <span className="loc-metric-val" style={{ color: thermalMetrics?.stressCategory?.color }}>
                    {thermalMetrics?.mortalityRisk}%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* LOADING STATE */}
        {isCalculating && (
          <div className="loading-overlay animate-fade-in">
            <div className="loading-card card">
              <div className="loading-spinner animate-spin" />
              <h3 className="loading-title">Computing Meteorological Heat Indices</h3>
              <p className="loading-sub">Solving WBGT, UTCI, Solar Irradiance &amp; Locating Facilities for {selectedLocation?.name || 'Selected Location'}...</p>
              <div className="loading-steps">
                {[
                  'Connecting to IMD / Open-Meteo High-Res India feed...',
                  'Calculating Stull Wet-Bulb & Globe Temperature (ISO 7933)...',
                  'Evaluating Universal Thermal Climate Index (UTCI 6th Order)...',
                  'Querying emergency hospitals & cooling centers within municipal radius...',
                ].map((step, i) => (
                  <div key={i} className="loading-step">
                    <span className="step-dot" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD TABS & CONTENT */}
        {hasData && !isCalculating && (
          <div className="dashboard-root animate-fade-in">
            {/* Nav Tabs with Pure SVG Icons */}
            <nav className="dashboard-nav" role="tablist">
              {[
                { id: 'map', label: 'GIS Heat & Resource Map', icon: MapIcon, badge: `${wardData.length} Wards` },
                { id: 'metrics', label: 'Weather & Thermal Stress', icon: ThermometerIcon },
                { id: 'emergency', label: 'Emergency Shelters & Hospitals', icon: HospitalIcon, badge: `${emergencyResources.length} Facilities` },
                { id: 'forecast', label: '7-Day IMD Forecast', icon: CalendarIcon },
                { id: 'advisories', label: 'Heat Action Plan (HAP)', icon: ShieldAlertIcon },
                { id: 'analytics', label: 'Summer 2026 Climate Analytics', icon: BarChartIcon },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    className={`nav-tab ${activeSection === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(tab.id)}
                    role="tab"
                    aria-selected={activeSection === tab.id}
                  >
                    <TabIcon size={15} color={activeSection === tab.id ? '#1e40af' : '#64748b'} />
                    <span>{tab.label}</span>
                    {tab.badge && <span className="tab-badge">{tab.badge}</span>}
                  </button>
                );
              })}
            </nav>

            {/* TAB CONTENT SECTIONS */}
            <div className="dashboard-content-area">
              {/* 1. GIS MAP (Prominently displayed) */}
              {activeSection === 'map' && (
                <div className="section-fade">
                  <GISMap
                    location={selectedLocation}
                    wards={wardData}
                    emergencyResources={emergencyResources}
                  />
                </div>
              )}

              {/* 2. WEATHER & THERMAL STRESS */}
              {activeSection === 'metrics' && (
                <div className="section-fade">
                  <WeatherMetrics
                    weather={weatherData}
                    location={selectedLocation}
                    thermalMetrics={thermalMetrics}
                    sourceInfo={sourceInfo}
                  />
                  <ThermalStressPanel
                    thermalMetrics={thermalMetrics}
                  />
                  <HourlyChart data={hourlyData} />
                </div>
              )}

              {/* 3. EMERGENCY SHELTERS & HOSPITALS */}
              {activeSection === 'emergency' && (
                <div className="section-fade">
                  <EmergencyDirectory
                    resources={emergencyResources}
                    locationName={selectedLocation?.name}
                    onFocusOnMap={() => {
                      setActiveSection('map');
                    }}
                  />
                </div>
              )}

              {/* 4. 7-DAY FORECAST */}
              {activeSection === 'forecast' && (
                <div className="section-fade">
                  <RiskForecast
                    forecast={forecast}
                    location={selectedLocation}
                  />
                </div>
              )}

              {/* 5. HEAT ACTION PLAN & ADVISORIES */}
              {activeSection === 'advisories' && (
                <div className="section-fade">
                  <Recommendations
                    recommendations={recommendations}
                    location={selectedLocation}
                    thermalMetrics={thermalMetrics}
                  />
                </div>
              )}

              {/* 6. CLIMATE ANALYTICS */}
              {activeSection === 'analytics' && (
                <div className="section-fade">
                  <MortalityTrend mortalityRisk={thermalMetrics.mortalityRisk} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUMMER 2026 OVERVIEW STATS (When not calculating) */}
        {!isCalculating && (
          <div className="stats-overview">
            <div className="stats-grid">
              <div className="overview-stat-card card">
                <div className="overview-icon-wrap" style={{ background: '#fff7ed' }}>
                  <ThermometerIcon size={22} color="#ea580c" />
                </div>
                <div>
                  <div className="overview-val">+2.4&deg;C</div>
                  <div className="overview-lbl">Summer 2026 Temperature Anomaly</div>
                  <div className="overview-sub">Above Long-Period Average (LPA)</div>
                </div>
              </div>

              <div className="overview-stat-card card">
                <div className="overview-icon-wrap" style={{ background: '#eff6ff' }}>
                  <BuildingIcon size={22} color="#2563eb" />
                </div>
                <div>
                  <div className="overview-val">100+</div>
                  <div className="overview-lbl">Heatwave Prone Districts Monitored</div>
                  <div className="overview-sub">Phalodi, Nagpur, Banda, Titlagarh...</div>
                </div>
              </div>

              <div className="overview-stat-card card">
                <div className="overview-icon-wrap" style={{ background: '#fef2f2' }}>
                  <HospitalIcon size={22} color="#dc2626" />
                </div>
                <div>
                  <div className="overview-val">2,400+</div>
                  <div className="overview-lbl">Cooling Shelters &amp; Heat ICUs Mapped</div>
                  <div className="overview-sub">Connected via National ERSS 108/1077</div>
                </div>
              </div>

              <div className="overview-stat-card card">
                <div className="overview-icon-wrap" style={{ background: '#f0fdf4' }}>
                  <MessageSquareIcon size={22} color="#16a34a" />
                </div>
                <div>
                  <div className="overview-val">120s</div>
                  <div className="overview-lbl">Emergency Broadcast SLA</div>
                  <div className="overview-sub">Multi-lingual SMS &amp; WhatsApp Alert</div>
                </div>
              </div>
            </div>

            <div className="summer-2026-advisory-card card">
              <div className="advisory-header">
                <div className="advisory-title-group">
                  <SatelliteIcon size={18} color="#ea580c" />
                  <span className="advisory-title">
                    India Meteorological Department (IMD) &mdash; Summer 2026 Heatwave Outlook
                  </span>
                </div>
                <span className="badge badge-orange">Operational Alert</span>
              </div>
              <p className="advisory-text">
                During April to June 2026, above-normal maximum temperatures are forecasted across most parts of Central, Northwest, and Peninsular India. Prolonged heatwave spells of 8 to 15 days are anticipated over Rajasthan, Vidarbha, Telangana, Gangetic West Bengal, and Odisha. District administrations are advised to implement Heat Action Plans (HAP) and activate municipal cooling shelters.
              </p>
              <div className="hotspot-tags">
                <span className="hotspot-tag">
                  <FlameIcon size={12} color="#c2410c" />
                  <span>West Rajasthan (Phalodi, Barmer)</span>
                </span>
                <span className="hotspot-tag">
                  <FlameIcon size={12} color="#c2410c" />
                  <span>Vidarbha (Nagpur, Chandrapur)</span>
                </span>
                <span className="hotspot-tag">
                  <FlameIcon size={12} color="#c2410c" />
                  <span>Delhi-NCR &amp; Haryana</span>
                </span>
                <span className="hotspot-tag">
                  <FlameIcon size={12} color="#c2410c" />
                  <span>Gangetic WB &amp; Odisha</span>
                </span>
                <span className="hotspot-tag">
                  <FlameIcon size={12} color="#c2410c" />
                  <span>Telangana &amp; Rayalaseema</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <ImdApiModal
        isOpen={isImdModalOpen}
        onClose={() => setIsImdModalOpen(false)}
        onConfigSaved={() => {
          if (selectedLocation) {
            handleLocationSelect(selectedLocation, false);
          }
        }}
      />

      <Footer />
    </div>
  );
}

export default App;
