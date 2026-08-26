import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import LocationSearch from './components/LocationSearch';
import WeatherMetrics from './components/WeatherMetrics';
import ThermalStressPanel from './components/ThermalStressPanel';
import RiskForecast from './components/RiskForecast';
import GISMap from './components/GISMap';
import Recommendations from './components/Recommendations';
import AlertBanner from './components/AlertBanner';
import HourlyChart from './components/HourlyChart';
import MortalityTrend from './components/MortalityTrend';
import Footer from './components/Footer';
import {
  INDIAN_CITIES,
  MOCK_WEATHER_DATA,
  generateForecast,
  generateWardData,
  generateHourlyData,
  calculateHeatIndex,
  calculateWBGT,
  calculateUTCI,
  calculateMortalityRisk,
  getStressCategory,
  generateRecommendations,
} from './data/mockData';
import './App.css';

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [thermalMetrics, setThermalMetrics] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleCitySelect = useCallback(async (city) => {
    setIsCalculating(true);
    setHasData(false);

    // Simulate API fetch delay
    await new Promise(r => setTimeout(r, 1200));

    const weather = MOCK_WEATHER_DATA[city.id];
    const hi = calculateHeatIndex(weather.temperature, weather.humidity);
    const wbgt = calculateWBGT(weather.temperature, weather.humidity, weather.windSpeed, weather.solarRadiation);
    const utci = calculateUTCI(weather.temperature, weather.humidity, weather.windSpeed, weather.solarRadiation);
    const mortalityRisk = calculateMortalityRisk(wbgt, utci, hi);
    const stressCategory = getStressCategory(wbgt);

    setSelectedCity(city);
    setWeatherData(weather);
    setThermalMetrics({ hi, wbgt, utci, mortalityRisk, stressCategory });
    setForecast(generateForecast(city.id));
    setWardData(generateWardData(city.id));
    setHourlyData(generateHourlyData(weather.temperature, weather.humidity));
    setRecommendations(generateRecommendations(wbgt, mortalityRisk, city.population));
    setIsCalculating(false);
    setHasData(true);
    setActiveSection('metrics');
  }, []);

  return (
    <div className="app-root">
      {/* Animated background */}
      <div className="app-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />
      </div>

      <Navbar />

      {/* Alert Banner */}
      {hasData && thermalMetrics?.stressCategory?.level >= 4 && (
        <AlertBanner
          city={selectedCity}
          stressCategory={thermalMetrics.stressCategory}
          mortalityRisk={thermalMetrics.mortalityRisk}
        />
      )}

      <main className="app-main">
        {/* HERO / SEARCH */}
        <section id="home" className="hero-section">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <span className="badge-dot animate-blink" />
              SIH 2026 · Problem Code SIH26083
            </div>
            <h1 className="hero-title">
              Extreme <span className="text-gradient">Heatwave</span><br />
              Early Warning System
            </h1>
            <p className="hero-subtitle">
              Beyond temperature — integrating WBGT, UTCI & Heat Index with mortality forecasting
              to deliver hyper-local, ward-level heat action intelligence for India.
            </p>

            <div className="user-flow">
              {['Input Location', 'Calculate Indices', 'Predict Risk', 'Map Zones', 'Recommend', 'Alert'].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flow-step">
                    <span className="flow-num">{i + 1}</span>
                    <span className="flow-label">{step}</span>
                  </div>
                  {i < 5 && <div className="flow-arrow">→</div>}
                </React.Fragment>
              ))}
            </div>

            <LocationSearch
              cities={INDIAN_CITIES}
              onSelect={handleCitySelect}
              isCalculating={isCalculating}
              selectedCity={selectedCity}
            />
          </div>
        </section>

        {/* MAIN DASHBOARD */}
        {hasData && (
          <div className="dashboard animate-fade-in">
            {/* Nav Tabs */}
            <nav className="dashboard-nav">
              {[
                { id: 'metrics', label: '🌡️ Weather & Stress' },
                { id: 'forecast', label: '📅 5-Day Forecast' },
                { id: 'map', label: '🗺️ GIS Map' },
                { id: 'alerts', label: '🚨 Recommendations' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeSection === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(tab.id)}
                  id={`tab-${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="dashboard-content">
              {/* SECTION: Weather Metrics + Thermal Stress */}
              {activeSection === 'metrics' && (
                <div className="section-fade">
                  <WeatherMetrics
                    weather={weatherData}
                    city={selectedCity}
                    thermalMetrics={thermalMetrics}
                  />
                  <ThermalStressPanel thermalMetrics={thermalMetrics} weather={weatherData} />
                  <HourlyChart data={hourlyData} />
                  <MortalityTrend mortalityRisk={thermalMetrics.mortalityRisk} />
                </div>
              )}

              {/* SECTION: Forecast */}
              {activeSection === 'forecast' && (
                <div className="section-fade">
                  <RiskForecast forecast={forecast} city={selectedCity} />
                </div>
              )}

              {/* SECTION: GIS Map */}
              {activeSection === 'map' && (
                <div className="section-fade">
                  <GISMap city={selectedCity} wards={wardData} />
                </div>
              )}

              {/* SECTION: Recommendations + Alerts */}
              {activeSection === 'alerts' && (
                <div className="section-fade">
                  <Recommendations
                    recommendations={recommendations}
                    city={selectedCity}
                    thermalMetrics={thermalMetrics}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {isCalculating && (
          <div className="loading-overlay animate-fade-in">
            <div className="loading-card">
              <div className="loading-spinner">
                <div className="spinner-ring" />
                <span className="loading-icon">🌡️</span>
              </div>
              <p className="loading-title">Computing Thermal Stress Indices</p>
              <p className="loading-sub">WBGT · UTCI · Heat Index · Mortality Risk</p>
              <div className="loading-steps">
                {['Fetching weather data...', 'Computing WBGT...', 'Calculating UTCI...', 'Generating forecast...'].map((step, i) => (
                  <div key={i} className="loading-step" style={{ animationDelay: `${i * 0.3}s` }}>
                    <span className="step-dot" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!hasData && !isCalculating && (
          <div className="stats-row animate-fade-in">
            {[
              { value: '1,248', label: 'Heat Deaths in 2024', icon: '💀', color: '#ff2d2d' },
              { value: '45.1°C', label: 'Peak WBGT Recorded', icon: '🌡️', color: '#ff6b00' },
              { value: '642', label: 'Cities Monitored', icon: '🏙️', color: '#a855f7' },
              { value: '3–5 Days', label: 'Forecast Horizon', icon: '📅', color: '#3b82f6' },
            ].map((stat, i) => (
              <div key={i} className="stat-card card">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
