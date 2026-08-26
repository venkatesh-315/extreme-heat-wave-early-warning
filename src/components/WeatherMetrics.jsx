import React from 'react';
import {
  ThermometerIcon,
  FlameIcon,
  WaterIcon,
  SunIcon,
  WindIcon,
  ActivityIcon,
  SatelliteIcon,
  ShieldAlertIcon
} from './icons';
import './WeatherMetrics.css';

const MetricCard = ({ id, icon: IconComponent, label, value, unit, subValue, color, iconColor }) => (
  <div className="metric-card card" id={id}>
    <div className="metric-header">
      <div className="metric-icon-box" style={{ background: `${iconColor || '#2563eb'}12` }}>
        <IconComponent size={18} color={iconColor || '#2563eb'} />
      </div>
      <span className="metric-label">{label}</span>
    </div>
    <div className="metric-body">
      <span className="metric-value" style={{ color: color || 'var(--text-primary)' }}>
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </span>
    </div>
    {subValue && <div className="metric-sub">{subValue}</div>}
  </div>
);

function WeatherMetrics({ weather, location, thermalMetrics, sourceInfo }) {
  if (!weather || !location) return null;

  const imdAlert = thermalMetrics?.imdAlert || {
    title: 'ORANGE ALERT',
    description: 'Heatwave conditions active',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
  };

  return (
    <div className="weather-metrics-section">
      {/* Executive Location & Alert Strip */}
      <div className="location-summary-card card">
        <div className="loc-main-info">
          <div className="loc-icon-flag">
            <ShieldAlertIcon size={24} color="#1e40af" />
          </div>
          <div className="loc-text-block">
            <div className="loc-name-row">
              <h2 className="loc-heading">{location.name}</h2>
              <span className="loc-state-tag">{location.state || 'India'}</span>
              <span className="loc-source-badge">
                <SatelliteIcon size={12} color="#1e40af" />
                <span>{sourceInfo || 'Live IMD Feed'}</span>
              </span>
            </div>
            <p className="loc-coords-text">
              Coordinates: {location.lat?.toFixed(4)}&deg;N, {location.lon?.toFixed(4)}&deg;E &middot; Population: {(location.population ? (location.population / 1e6).toFixed(2) + 'M' : 'Metropolitan Zone')}
            </p>
          </div>
        </div>

        <div className="loc-alert-box" style={{ background: imdAlert.bgColor, borderColor: imdAlert.borderColor }}>
          <div className="alert-box-top">
            <span className="alert-dot-pulse" style={{ background: imdAlert.color }} />
            <span className="alert-box-title" style={{ color: imdAlert.color }}>{imdAlert.title}</span>
          </div>
          <p className="alert-box-desc">{imdAlert.description}</p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          id="metric-temp"
          icon={ThermometerIcon}
          iconColor="#ea580c"
          label="Dry Bulb Air Temperature"
          value={weather.temperature}
          unit="°C"
          color={weather.temperature >= 44 ? '#dc2626' : weather.temperature >= 40 ? '#ea580c' : '#ca8a04'}
          subValue={`Feels Like: ${weather.feelsLike}°C (Dew Point ${weather.dewPoint}°C)`}
        />

        <MetricCard
          id="metric-wbgt"
          icon={FlameIcon}
          iconColor="#dc2626"
          label="Outdoor WBGT Index"
          value={thermalMetrics?.wbgt}
          unit="°C"
          color={thermalMetrics?.wbgt >= 32 ? '#dc2626' : thermalMetrics?.wbgt >= 28 ? '#ea580c' : '#ca8a04'}
          subValue="ISO 7933 Occupational Heat Limit"
        />

        <MetricCard
          id="metric-humidity"
          icon={WaterIcon}
          iconColor="#0284c7"
          label="Relative Humidity"
          value={weather.humidity}
          unit="%"
          color={weather.humidity >= 70 ? '#0284c7' : '#0369a1'}
          subValue={weather.humidity >= 65 ? 'High Sweatbox Compound Stress' : 'Dry Desert Loo Conditions'}
        />

        <MetricCard
          id="metric-solar"
          icon={SunIcon}
          iconColor="#d97706"
          label="Direct Solar Irradiance"
          value={weather.solarRadiation}
          unit=" W/m²"
          color="#d97706"
          subValue={`UV Index: ${weather.uvIndex} (Very High)`}
        />

        <MetricCard
          id="metric-wind"
          icon={WindIcon}
          iconColor="#7c3aed"
          label="Wind Speed (10m)"
          value={weather.windSpeed}
          unit=" km/h"
          color="#7c3aed"
          subValue={`Direction: ${weather.windDirection || 270}° (Western Loo)`}
        />

        <MetricCard
          id="metric-pressure"
          icon={ActivityIcon}
          iconColor="#059669"
          label="Atmospheric Pressure"
          value={weather.pressure}
          unit=" hPa"
          color="#059669"
          subValue={`Cloud Cover: ${weather.cloudCover}% · Visibility ${weather.visibility || 7.5} km`}
        />
      </div>
    </div>
  );
}

export default WeatherMetrics;
