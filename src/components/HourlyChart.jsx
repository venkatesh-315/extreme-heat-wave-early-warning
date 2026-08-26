import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './HourlyChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-time">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="tooltip-row" style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value}{entry.name.includes('Temp') || entry.name.includes('Index') || entry.name.includes('WBGT') ? '°C' : '%'}</strong>
        </p>
      ))}
    </div>
  );
};

function HourlyChart({ data }) {
  if (!data?.length) return null;
  // Show every other hour for readability
  const displayData = data.filter((_, i) => i % 2 === 0);

  return (
    <div className="hourly-chart-card card" id="hourly-chart">
      <div className="chart-header">
        <h3 className="chart-title">📊 Today's Hourly Thermal Profile</h3>
        <div className="chart-legend">
          <span className="legend-dot" style={{ background: '#ff6b00' }} /> Temperature
          <span className="legend-dot" style={{ background: '#ef4444' }} /> Heat Index
          <span className="legend-dot" style={{ background: '#a855f7' }} /> WBGT
          <span className="legend-dot" style={{ background: '#3b82f6' }} /> Humidity %
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={displayData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradHI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWBGT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" tick={{ fill: '#5a5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5a5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="temperature" name="Temperature" stroke="#ff6b00" strokeWidth={2} fill="url(#gradTemp)" dot={false} />
            <Area type="monotone" dataKey="heatIndex" name="Heat Index" stroke="#ef4444" strokeWidth={2} fill="url(#gradHI)" dot={false} />
            <Area type="monotone" dataKey="wbgt" name="WBGT" stroke="#a855f7" strokeWidth={2} fill="url(#gradWBGT)" dot={false} />
            <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#3b82f6" strokeWidth={1.5} fill="url(#gradHum)" dot={false} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <span className="danger-zone-label">⚠️ Peak heat stress window: 11:00 AM – 4:00 PM IST</span>
      </div>
    </div>
  );
}

export default HourlyChart;
