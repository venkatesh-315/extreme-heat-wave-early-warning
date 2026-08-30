import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import MobileNav from './components/MobileNav';
import HumanThermalStressCard from './components/HumanThermalStressCard';
import KeyWeatherParamsCard from './components/KeyWeatherParamsCard';
import ActiveAlertCard from './components/ActiveAlertCard';
import WardRiskMapCard from './components/WardRiskMapCard';
import HealthImpactForecastCard from './components/HealthImpactForecastCard';
import RecommendedActionsCard from './components/RecommendedActionsCard';
import AtRiskPopulationCard from './components/AtRiskPopulationCard';
import ModelConfidenceCard from './components/ModelConfidenceCard';

// Detailed view components for other sidebar sections
import GISMap from './components/GISMap';
import RiskForecast from './components/RiskForecast';
import MortalityTrend from './components/MortalityTrend';
import HourlyChart from './components/HourlyChart';
import Recommendations from './components/Recommendations';
import AlertBanner from './components/AlertBanner';
import Loader from './components/Loader';

import { CURATED_INDIAN_LOCATIONS } from './services/geocodingService';
import {
  fetchLiveWeatherData,
  getUserSettings,
  saveUserSettings
} from './services/weatherService';
import { fetchEmergencyResources } from './services/emergencyService';
import { generateWardData, generateRecommendations } from './data/mockData';
import {
  SettingsIcon,
  CheckCircleIcon,
  SatelliteIcon,
  ThermometerIcon,
  RefreshCwIcon,
  ShieldAlertIcon
} from './components/icons';

import './App.css';

function App() {
  const [userSettings, setUserSettings] = useState(() => getUserSettings());
  const [selectedLocation, setSelectedLocation] = useState(CURATED_INDIAN_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [thermalMetrics, setThermalMetrics] = useState(null);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlForecast, setMlForecast] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [emergencyResources, setEmergencyResources] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('10:20 AM');
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState(() => getUserSettings());
  const [settingsSaveAlert, setSettingsSaveAlert] = useState(false);

  // Load weather, ML predictions & biometeorological data for selected location
  const handleLocationSelect = useCallback(async (location, silent = false) => {
    if (!location) return;
    if (!silent) setIsCalculating(true);
    setErrorMessage(null);

    try {
      // 1. Fetch live meteorological weather & ML predictions via backend overview
      const weatherResult = await fetchLiveWeatherData(location.lat, location.lon, location.id);

      // 2. Fetch emergency shelters, hospitals and drinking water kiosks
      const emergencyList = await fetchEmergencyResources(location.lat, location.lon, location.name);

      // 3. Generate or use backend microclimate ward zones
      const wards = (weatherResult.wardData && weatherResult.wardData.length > 0)
        ? weatherResult.wardData
        : generateWardData(
            location.lat,
            location.lon,
            weatherResult.weather?.temperature || 42.0,
            weatherResult.weather?.humidity || 35
          );

      // 4. Generate NDMA Heat Action Plan recommendations
      const recs = (weatherResult.recommendations && weatherResult.recommendations.length > 0)
        ? weatherResult.recommendations
        : generateRecommendations(
            weatherResult.thermalMetrics?.wbgt || 32.0,
            weatherResult.thermalMetrics?.mortalityRisk || 45,
            location.population || 1500000,
            weatherResult.weather?.temperature || 42.0
          );

      setSelectedLocation(location);
      setWeatherData(weatherResult.weather);
      setThermalMetrics(weatherResult.thermalMetrics);
      setMlPrediction(weatherResult.mlPrediction || null);
      setMlForecast(weatherResult.mlForecast || []);
      setForecast(weatherResult.forecast || []);
      setWardData(wards);
      setEmergencyResources(weatherResult.emergencyResources?.length > 0 ? weatherResult.emergencyResources : emergencyList);
      setHourlyData(weatherResult.hourlyData || []);
      setRecommendations(recs);
      setLastUpdatedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setHasData(true);
    } catch (err) {
      console.error('Data loading error:', err);
      setErrorMessage(`Unable to fetch live telemetry: ${err.message}`);
    } finally {
      if (!silent) setIsCalculating(false);
    }
  }, []);

  // Initial load: Default to curated Indian location
  useEffect(() => {
    const defaultLocation = CURATED_INDIAN_LOCATIONS.find((l) => l.name.toLowerCase().includes('hyderabad')) || CURATED_INDIAN_LOCATIONS[0];
    let isMounted = true;

    if (isMounted) {
      handleLocationSelect(defaultLocation);
    }

    return () => {
      isMounted = false;
    };
  }, [handleLocationSelect]);

  // Auto-Refresh Timer Handler
  useEffect(() => {
    if (!userSettings.autoRefreshInterval || userSettings.autoRefreshInterval === 'off') {
      return;
    }

    const intervalMap = {
      '30s': 30 * 1000,
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
    };

    const intervalMs = intervalMap[userSettings.autoRefreshInterval] || 60000;

    const timer = setInterval(() => {
      if (selectedLocation) {
        handleLocationSelect(selectedLocation, true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [userSettings.autoRefreshInterval, selectedLocation, handleLocationSelect]);

  // Tab Selection
  const handleTabSelect = (tabId) => {
    setIsSidebarOpen(false);
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveUserSettings(settingsForm);
    setUserSettings({ ...settingsForm });
    setSettingsSaveAlert(true);
    if (selectedLocation) {
      handleLocationSelect(selectedLocation, true);
    }
    setTimeout(() => setSettingsSaveAlert(false), 3000);
  };

  const tempUnit = userSettings.tempUnit || 'C';

  return (
    <div className="thermoguard-app">
      {/* Full-Screen Animated Loader during computation */}
      {isCalculating && <Loader fullScreen={true} />}

      {/* Left Sticky Sidebar for Desktop & Tablet Drawer */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-layout">
        <TopHeader
          selectedLocation={selectedLocation}
          onSelectLocation={handleLocationSelect}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenAlerts={() => handleTabSelect('alerts')}
          isLive={true}
          autoRefreshInterval={userSettings.autoRefreshInterval}
        />

        <main className="dashboard-scroll-body">
          {/* Error Banner if API or Network Failure */}
          {errorMessage && (
            <div style={{ margin: '16px 24px 0', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <ShieldAlertIcon size={18} color="#dc2626" />
                <span>{errorMessage}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleLocationSelect(selectedLocation)}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State when no data */}
          {!hasData && !isCalculating && (
            <div className="tab-view-container animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <SatelliteIcon size={48} color="#94a3b8" />
              <h3 style={{ marginTop: '16px', color: '#0f172a' }}>No Telemetry Available</h3>
              <p style={{ color: '#64748b', maxWidth: '420px', margin: '8px auto 20px' }}>
                Please select a location from the search bar above to generate the biometeorological risk assessment.
              </p>
              <button className="btn btn-primary" onClick={() => handleLocationSelect(CURATED_INDIAN_LOCATIONS[0])}>
                Load New Delhi Dashboard
              </button>
            </div>
          )}

          {/* 1. PRIMARY DASHBOARD VIEW */}
          {activeTab === 'dashboard' && hasData && (
            <div className="dashboard-grid-container animate-fade-in">
              {/* ROW 1: Human Thermal Stress Index, Key Weather Parameters, Active Alert */}
              <div className="dashboard-row row-1">
                <div className="grid-col col-stress">
                  <HumanThermalStressCard
                    thermalMetrics={thermalMetrics}
                    mlPrediction={mlPrediction}
                    weather={weatherData}
                    lastUpdated={lastUpdatedTime}
                    tempUnit={tempUnit}
                  />
                </div>
                <div className="grid-col col-weather">
                  <KeyWeatherParamsCard
                    weather={weatherData}
                    tempUnit={tempUnit}
                  />
                </div>
                <div className="grid-col col-alert">
                  <ActiveAlertCard
                    thermalMetrics={thermalMetrics}
                    location={selectedLocation}
                    onViewAllAlerts={() => handleTabSelect('alerts')}
                  />
                </div>
              </div>

              {/* ROW 2: Ward Level Risk Map, 3-5 Day Health Impact Forecast, Recommended Actions */}
              <div className="dashboard-row row-2">
                <div className="grid-col col-map">
                  <WardRiskMapCard
                    location={selectedLocation}
                    wards={wardData}
                    tempUnit={tempUnit}
                  />
                </div>
                <div className="grid-col col-forecast">
                  <HealthImpactForecastCard
                    mlForecast={mlForecast}
                    forecast={forecast}
                  />
                </div>
                <div className="grid-col col-actions">
                  <RecommendedActionsCard
                    onViewActionCenter={() => handleTabSelect('action')}
                  />
                </div>
              </div>

              {/* ROW 3: At-Risk Population Overview, Model Confidence */}
              <div className="dashboard-row row-3">
                <div className="grid-col col-population">
                  <AtRiskPopulationCard
                    location={selectedLocation}
                  />
                </div>
                <div className="grid-col col-confidence">
                  <ModelConfidenceCard
                    confidence={94}
                    lastUpdated={lastUpdatedTime}
                  />
                </div>
              </div>

              {/* Bottom Footer Text Note */}
              <footer className="dashboard-bottom-footer">
                <p>ThermoGuard utilizes dual-target XGBoost ML inference and real-time biometeorological observations to compute human thermal stress and public health risk.</p>
              </footer>
            </div>
          )}

          {/* 2. HEAT MAP TAB (GIS Interactive Full Map View) */}
          {activeTab === 'heatmap' && hasData && (
            <div className="tab-view-container animate-fade-in">
              <GISMap
                location={selectedLocation}
                wards={wardData}
                emergencyResources={emergencyResources}
              />
            </div>
          )}

          {/* 3. FORECAST TAB (3-5 Day Detailed ML Outlook) */}
          {activeTab === 'forecast' && hasData && (
            <div className="tab-view-container animate-fade-in">
              <RiskForecast
                forecast={forecast}
                mlForecast={mlForecast}
                location={selectedLocation}
              />
            </div>
          )}

          {/* 4. HEALTH IMPACT TAB */}
          {activeTab === 'health' && hasData && (
            <div className="tab-view-container animate-fade-in">
              <MortalityTrend mortalityRisk={mlPrediction?.mortality_risk ?? thermalMetrics?.mortalityRisk} />
              <div style={{ marginTop: '20px' }}>
                <HourlyChart data={hourlyData} />
              </div>
            </div>
          )}

          {/* 5. ALERTS TAB */}
          {activeTab === 'alerts' && hasData && (
            <div className="tab-view-container animate-fade-in">
              <AlertBanner
                location={selectedLocation}
                stressCategory={thermalMetrics?.stressCategory}
                mortalityRisk={mlPrediction?.mortality_risk ?? thermalMetrics?.mortalityRisk}
                imdAlert={thermalMetrics?.imdAlert}
              />
              <div style={{ marginTop: '20px' }}>
                <Recommendations recommendations={recommendations} location={selectedLocation} />
              </div>
            </div>
          )}

          {/* 6. ACTION CENTER TAB */}
          {activeTab === 'action' && hasData && (
            <div className="tab-view-container animate-fade-in">
              <Recommendations recommendations={recommendations} location={selectedLocation} />
            </div>
          )}

          {/* 7. REPORTS TAB */}
          {activeTab === 'reports' && hasData && (
            <div className="tab-view-container animate-fade-in">
              <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
                <h3 className="section-title" style={{ justifyContent: 'center', marginBottom: '8px' }}>
                  Municipal Heatwave Comprehensive Report
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto 20px' }}>
                  Biometeorological synthesis and emergency resource deployment report generated for {selectedLocation.name}, {selectedLocation.state}.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => window.print()}>
                    Download Official PDF Report
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTabSelect('dashboard')}>
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 8. SETTINGS PAGE VIEW */}
          {activeTab === 'settings' && (
            <div className="tab-view-container animate-fade-in">
              <div className="card settings-page-card" style={{ padding: '28px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
                <div className="settings-page-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SettingsIcon size={22} color="#1d4ed8" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Display &amp; System Preferences
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                      Configure Temperature Units &amp; Auto-Refresh Intervals
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Temperature Format Setting */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <ThermometerIcon size={18} color="#ea580c" />
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Temperature Display Unit</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 12px' }}>
                      Choose your preferred temperature format across WBGT, UTCI, Air Temp &amp; forecasts.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        className={`btn ${settingsForm.tempUnit === 'C' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, padding: '10px 16px', fontSize: '0.85rem' }}
                        onClick={() => setSettingsForm({ ...settingsForm, tempUnit: 'C' })}
                      >
                        Celsius (&deg;C)
                      </button>
                      <button
                        type="button"
                        className={`btn ${settingsForm.tempUnit === 'F' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, padding: '10px 16px', fontSize: '0.85rem' }}
                        onClick={() => setSettingsForm({ ...settingsForm, tempUnit: 'F' })}
                      >
                        Fahrenheit (&deg;F)
                      </button>
                    </div>
                  </div>

                  {/* Auto-Refresh Timer Setting */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <RefreshCwIcon size={18} color="#2563eb" />
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Auto-Refresh Sync Timer</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 12px' }}>
                      Set how frequently live weather telemetry and ward heat indices are automatically updated.
                    </p>
                    <select
                      className="form-select"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      value={settingsForm.autoRefreshInterval}
                      onChange={(e) => setSettingsForm({ ...settingsForm, autoRefreshInterval: e.target.value })}
                    >
                      <option value="off">Off / Manual Refresh Only</option>
                      <option value="30s">Every 30 Seconds (Ultra-Fast)</option>
                      <option value="1m">Every 1 Minute (Recommended)</option>
                      <option value="5m">Every 5 Minutes</option>
                      <option value="15m">Every 15 Minutes</option>
                    </select>
                  </div>

                  {/* Meteorological Engine Info Box */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <SatelliteIcon size={16} color="#16a34a" />
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Biometeorology &amp; Climate Model Engine</strong>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Live telemetry streams high-resolution 0.1&deg; Indian meteorological grid data, automatically calculating ISO 7933 Outdoor WBGT, UTCI human thermoregulation, and XGBoost dual-target mortality &amp; hospitalization risks without exposing private endpoints or credentials.
                    </p>
                  </div>

                  {settingsSaveAlert && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <CheckCircleIcon size={18} color="#15803d" />
                      <strong>Preferences saved! Temperature format and auto-refresh timer updated live.</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => handleTabSelect('dashboard')}>
                      Return to Dashboard
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for One-Thumb Phone Access */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
      />
    </div>
  );
}

export default App;
