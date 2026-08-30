import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityIcon, AlertTriangleIcon } from './icons';
import './HourlyChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip-light">
      <p className="tooltip-time">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="tooltip-row" style={{ color: entry.color }}>
          <span>{entry.name}:</span>
          <strong>{entry.value}{entry.name.includes('Temp') || entry.name.includes('WBGT') || entry.name.includes('Index') ? '°C' : '%'}</strong>
        </div>
      ))}
    </div>
  );
};

function HourlyChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  const displayData = data.filter((_, i) => i % 2 === 0);

  return (
    <div className="hourly-chart-card card" id="hourly-thermal-chart">
      <div className="chart-header">
        <div>
          <h3 className="section-title">
            <ActivityIcon size={18} color="#1e40af" />
            <span>24-Hour Diurnal Thermal Profile</span>
          </h3>
          <p className="section-desc">Hourly dry bulb temperature, WBGT, Heat Index, and humidity trajectory</p>
        </div>
        <div className="chart-legend-row">
          <span className="legend-item"><span className="dot" style={{ background: '#ea580c' }} /> Air Temp</span>
          <span className="legend-item"><span className="dot" style={{ background: '#dc2626' }} /> Heat Index</span>
          <span className="legend-item"><span className="dot" style={{ background: '#7c3aed' }} /> WBGT</span>
          <span className="legend-item"><span className="dot" style={{ background: '#0284c7' }} /> Humidity %</span>
        </div>
      </div>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="lightGradTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="lightGradHI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="lightGradWBGT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="temperature" name="Air Temp" stroke="#ea580c" strokeWidth={2} fill="url(#lightGradTemp)" dot={false} />
            <Area type="monotone" dataKey="heatIndex" name="Heat Index" stroke="#dc2626" strokeWidth={2} fill="url(#lightGradHI)" dot={false} />
            <Area type="monotone" dataKey="wbgt" name="WBGT" stroke="#7c3aed" strokeWidth={2} fill="url(#lightGradWBGT)" dot={false} />
            <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#0284c7" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer-strip">
        <span className="danger-window-tag">
          <AlertTriangleIcon size={14} color="#c2410c" />
          <span><strong>Peak Heat Vulnerability Window:</strong> 11:00 AM – 4:30 PM IST (Direct Solar Irradiance peak &gt;900 W/m²)</span>
        </span>
      </div>
    </div>
  );
}

export default HourlyChart;
