import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { HISTORICAL_MORTALITY } from '../data/mockData';
import './MortalityTrend.css';

function MortalityTrend({ mortalityRisk }) {
  const projectedDeaths = Math.round(350 + mortalityRisk * 8);
  const projectedData = [
    ...HISTORICAL_MORTALITY,
    { year: 2026, deaths: projectedDeaths, projected: true },
  ];

  return (
    <div className="mortality-trend-card card" id="mortality-trend-chart">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">📈 Historical Heat Mortality Trend & 2026 Forecast</h3>
          <p className="chart-subtitle">India — Heat-induced excess deaths per year</p>
        </div>
        <div className="projection-badge">
          <span className="proj-dot" />
          2026 Projected: <strong>{projectedDeaths.toLocaleString()}</strong> deaths
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={projectedData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: '#5a5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#5a5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
            labelStyle={{ color: 'white', fontWeight: 700 }}
            itemStyle={{ color: '#ff8533' }}
            formatter={(v, n) => [`${v} deaths`, 'Heat mortality']}
          />
          <ReferenceLine y={500} stroke="rgba(255,100,0,0.3)" strokeDasharray="4 3" label={{ value: 'Alert threshold', fill: '#ff6b00', fontSize: 10 }} />
          <Bar dataKey="deaths" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {projectedData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.projected
                  ? 'url(#projectedGrad)'
                  : entry.deaths > 500
                  ? '#ef4444'
                  : '#ff6b00'
                }
                opacity={entry.projected ? 0.8 : 1}
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff2d2d" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.5} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      <div className="mortality-insight">
        <div className="insight-item">
          <span className="insight-icon">📊</span>
          <div>
            <span className="insight-label">YoY Growth</span>
            <span className="insight-value" style={{ color: '#ef4444' }}>+18.4%</span>
          </div>
        </div>
        <div className="insight-item">
          <span className="insight-icon">🎯</span>
          <div>
            <span className="insight-label">High Risk Population</span>
            <span className="insight-value" style={{ color: '#f97316' }}>Elderly &amp; Outdoor Workers</span>
          </div>
        </div>
        <div className="insight-item">
          <span className="insight-icon">⏰</span>
          <div>
            <span className="insight-label">Peak Mortality Window</span>
            <span className="insight-value" style={{ color: '#ffd700' }}>May–June, 2–6 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MortalityTrend;
