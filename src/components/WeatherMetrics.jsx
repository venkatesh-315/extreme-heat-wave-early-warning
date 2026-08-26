import React from 'react';
import './WeatherMetrics.css';

const MetricCard = ({ id, icon, label, value, unit, subValue, color, trend }) => (
  <div className="metric-card card" id={id}>
    <div className="metric-header">
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      {trend && <span className={`metric-trend ${trend > 0 ? 'up' : 'down'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}
      </span>}
    </div>
    <div className="metric-body">
      <span className="metric-value" style={{ color }}>
        {value}<span className="metric-unit">{unit}</span>
      </span>
    </div>
    {subValue && <div className="metric-sub">{subValue}</div>}
  </div>
);

function WeatherMetrics({ weather, city, thermalMetrics }) {
  if (!weather || !city) return null;
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="weather-metrics-section">
      {/* City header */}
      <div className="city-header card">
        <div className="city-info">
          <div className="city-flag">🇮🇳</div>
          <div>
            <h2 className="city-name">{city.name}</h2>
            <p className="city-meta">{city.state} · {city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°E</p>
          </div>
        </div>
        <div className="city-right">
          <div className="city-condition">
            <span className="weather-icon-big">☀️</span>
            <div>
              <span className="condition-text">{weather.weatherCondition}</span>
              <span className="update-time">Updated: {now}</span>
            </div>
          </div>
          <div className="feels-like">
            Feels like <strong>{weather.feelsLike}°C</strong>
          </div>
        </div>
      </div>

      {/* Primary metrics grid */}
      <div className="metrics-grid">
        <MetricCard
          id="metric-temperature"
          icon="🌡️"
          label="Dry Bulb Temp"
          value={weather.temperature}
          unit="°C"
          color={weather.temperature > 42 ? '#ff2d2d' : weather.temperature > 38 ? '#ff6b00' : '#ffd700'}
          subValue={`Dew Point: ${weather.dewPoint}°C`}
        />
        <MetricCard
          id="metric-humidity"
          icon="💧"
          label="Relative Humidity"
          value={weather.humidity}
          unit="%"
          color={weather.humidity > 70 ? '#3b82f6' : weather.humidity > 50 ? '#60a5fa' : '#93c5fd'}
          subValue="Critical for heat stress"
        />
        <MetricCard
          id="metric-wind"
          icon="💨"
          label="Wind Speed"
          value={weather.windSpeed}
          unit=" km/h"
          color="#a855f7"
          subValue="Affects WBGT cooling"
        />
        <MetricCard
          id="metric-solar"
          icon="☀️"
          label="Solar Radiation"
          value={weather.solarRadiation}
          unit=" W/m²"
          color="#ffd700"
          subValue={`UV Index: ${weather.uvIndex}`}
        />
        <MetricCard
          id="metric-pressure"
          icon="🌐"
          label="Atm. Pressure"
          value={weather.pressure}
          unit=" hPa"
          color="#22c55e"
          subValue={`Visibility: ${weather.visibility} km`}
        />
        <MetricCard
          id="metric-cloud"
          icon="☁️"
          label="Cloud Cover"
          value={weather.cloudCover}
          unit="%"
          color="#9ca3af"
          subValue="Affects radiation"
        />
      </div>
    </div>
  );
}

export default WeatherMetrics;
