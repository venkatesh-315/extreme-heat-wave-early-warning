import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { InfoIcon } from './icons';
import './HealthImpactForecastCard.css';

const CustomForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="forecast-chart-tooltip">
      <div className="tooltip-day-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="tooltip-stat-line" style={{ color: entry.color }}>
          <span>{entry.name}:</span>
          <strong>+{entry.value}%</strong>
        </div>
      ))}
    </div>
  );
};

function HealthImpactForecastCard({ forecast }) {
  // Chart data exactly representing the 5 days in the screenshot
  const chartData = [
    { day: 'Today', date: '26 Aug', mortality: 14, hospitalization: 7 },
    { day: 'Wed', date: '27 Aug', mortality: 19, hospitalization: 11 },
    { day: 'Thu', date: '28 Aug', mortality: 22, hospitalization: 12 },
    { day: 'Fri', date: '29 Aug', mortality: 27, hospitalization: 19 },
    { day: 'Sat', date: '30 Aug', mortality: 23, hospitalization: 16 },
  ];

  return (
    <div className="card health-forecast-card" id="five-day-health-impact-forecast">
      <div className="forecast-card-top">
        <h3 className="card-heading">
          5-Day Health Impact Forecast
          <span className="info-tooltip-wrap" title="Projected mortality and hospital admission surge based on thermal index trajectories">
            <InfoIcon size={14} />
          </span>
        </h3>

        {/* Legend */}
        <div className="forecast-chart-legend">
          <div className="legend-entry">
            <span className="legend-line red" />
            <span>Mortality Risk (%)</span>
          </div>
          <div className="legend-entry">
            <span className="legend-line purple" />
            <span>Hospitalization Risk (%)</span>
          </div>
        </div>
      </div>

      {/* Dual Line Chart */}
      <div className="forecast-chart-wrap">
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={chartData} margin={{ top: 12, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#f1f5f9' }}
              tick={({ x, y, payload, index }) => {
                const item = chartData[index];
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={10} dy={4} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="600">
                      {item.day}
                    </text>
                    <text x={0} y={22} dy={4} textAnchor="middle" fill="#94a3b8" fontSize="9">
                      {item.date}
                    </text>
                  </g>
                );
              }}
              height={36}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              ticks={[0, 10, 20, 30]}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 35]}
            />
            <Tooltip content={<CustomForecastTooltip />} />
            <Line
              type="monotone"
              dataKey="mortality"
              name="Mortality Risk"
              stroke="#ef4444"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#ef4444', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 5, fill: '#ef4444' }}
            />
            <Line
              type="monotone"
              dataKey="hospitalization"
              name="Hospitalization Risk"
              stroke="#8b5cf6"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#8b5cf6', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 5, fill: '#8b5cf6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Highlight Summary Stat Cards */}
      <div className="forecast-stat-boxes">
        <div className="highlight-stat-box red">
          <div className="stat-box-label">Peak Mortality Risk</div>
          <div className="stat-box-val">+12%</div>
          <div className="stat-box-date">On 29 Aug 2025</div>
        </div>

        <div className="highlight-stat-box purple">
          <div className="stat-box-label">Peak Hospitalization Risk</div>
          <div className="stat-box-val">+19%</div>
          <div className="stat-box-date">On 29 Aug 2025</div>
        </div>
      </div>
    </div>
  );
}

export default HealthImpactForecastCard;
