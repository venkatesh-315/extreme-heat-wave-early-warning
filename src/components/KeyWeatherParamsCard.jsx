import React from 'react';
import {
  ThermometerIcon,
  WaterIcon,
  WindIcon,
  SunIcon
} from './icons';
import { formatTemp } from '../services/weatherService';
import { useLanguage } from '../context/LanguageContext';
import './KeyWeatherParamsCard.css';

function KeyWeatherParamsCard({ weather, tempUnit = 'C' }) {
  const { t } = useLanguage();
  const temp = weather?.temperature ?? 42.1;
  const humidity = weather?.humidity ?? 68;
  const windSpeed = weather?.windSpeed ?? 12.6;
  const solarRadiation = weather?.solarRadiation ?? 620;

  const formattedTempVal = formatTemp(temp, tempUnit);

  const params = [
    {
      id: 'temp',
      icon: ThermometerIcon,
      iconColor: '#ea580c',
      label: t('param_temperature', 'Temperature'),
      value: `${formattedTempVal} °${tempUnit}`,
    },
    {
      id: 'humidity',
      icon: WaterIcon,
      iconColor: '#0284c7',
      label: t('param_humidity', 'Humidity'),
      value: `${humidity} %`,
    },
    {
      id: 'wind',
      icon: WindIcon,
      iconColor: '#6366f1',
      label: t('param_wind', 'Wind Speed'),
      value: `${windSpeed.toFixed(1)} km/h`,
    },
    {
      id: 'solar',
      icon: SunIcon,
      iconColor: '#eab308',
      label: t('param_solar', 'Solar Radiation'),
      value: `${solarRadiation} W/m²`,
    },
  ];

  return (
    <div className="card weather-params-card" id="key-weather-parameters-card">
      <div className="card-top-title">
        <h3 className="card-heading">{t('card_weather_title', 'Key Weather Parameters')}</h3>
      </div>

      <div className="weather-params-list">
        {params.map((item) => {
          const ItemIcon = item.icon;
          return (
            <div key={item.id} className="weather-param-row">
              <div className="param-left">
                <div className="param-icon-box" style={{ color: item.iconColor }}>
                  <ItemIcon size={16} />
                </div>
                <span className="param-label">{item.label}</span>
              </div>
              <div className="param-value">{item.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KeyWeatherParamsCard;
