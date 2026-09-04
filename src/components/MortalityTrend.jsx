import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import { HISTORICAL_MORTALITY } from '../data/mockData';
import { BarChartIcon, ThermometerIcon, UsersIcon, ShieldAlertIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';
import './MortalityTrend.css';

function MortalityTrend({ mortalityRisk = 45, currentTemp = null }) {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const projectedDeaths = Math.max(750, Math.round(1600 + (mortalityRisk - 25) * 24));
  const currentMaxTemp = currentTemp ? parseFloat(Number(currentTemp).toFixed(1)) : 36.5;

  const data = [
    ...HISTORICAL_MORTALITY.filter((d) => d.year < currentYear),
    { year: currentYear, deaths: projectedDeaths, avgMaxTemp: currentMaxTemp, projected: true },
  ];

  return (
    <div className="mortality-trend-card card" id="mortality-trend-chart">
      <div className="trend-header">
        <div>
          <div className="trend-badge">
            <BarChartIcon size={13} color="#1e40af" />
            <span>{t('mort_analytics_badge', 'Climatological Vulnerability Analytics')}</span>
          </div>
          <h3 className="section-title">
            {t('mort_title', 'Historical Heat Mortality & Real-Time Projections (India)')}
          </h3>
          <p className="section-desc">
            {t('mort_desc', `National annual excess heat-induced fatalities and real-time vulnerability index (2019–${currentYear})`)}
          </p>
        </div>
        <div className="proj-pill">
          <span className="proj-dot" />
          <span>{t('mort_proj_prefix', 'Real-Time Projected:')} <strong>{projectedDeaths.toLocaleString()}</strong> {t('mort_casualties', 'casualties')}</span>
        </div>
      </div>

      <div className="chart-canvas-wrap">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              labelStyle={{ color: '#0f172a', fontWeight: 700 }}
              formatter={(v, _name, props) => [`${v.toLocaleString()} casualties`, props.payload.projected ? `${currentYear} Real-Time Projection` : 'Recorded Excess Casualties']}
            />
            <ReferenceLine y={2000} stroke="#dc2626" strokeDasharray="4 3" label={{ value: 'National Severe Threshold (2,000)', fill: '#dc2626', fontSize: 10, position: 'top' }} />
            <Bar dataKey="deaths" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.projected ? '#dc2626' : entry.deaths >= 2000 ? '#ea580c' : '#f97316'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mortality-insights-grid">
        <div className="insight-card">
          <div className="ins-icon-box" style={{ background: '#fef2f2' }}>
            <ThermometerIcon size={18} color="#dc2626" />
          </div>
          <div className="ins-texts">
            <span className="ins-lbl">Severe Spells Trend</span>
            <strong className="ins-val" style={{ color: '#dc2626' }}>Active Season ({currentYear})</strong>
            <span className="ins-sub">Real-time IMD alert monitoring</span>
          </div>
        </div>

        <div className="insight-card">
          <div className="ins-icon-box" style={{ background: '#fff7ed' }}>
            <UsersIcon size={18} color="#ea580c" />
          </div>
          <div className="ins-texts">
            <span className="ins-lbl">Highest Risk Demographic</span>
            <strong className="ins-val" style={{ color: '#ea580c' }}>Informal Workers &amp; Elderly</strong>
            <span className="ins-sub">Construction, agriculture, delivery riders</span>
          </div>
        </div>

        <div className="insight-card">
          <div className="ins-icon-box" style={{ background: '#f0fdf4' }}>
            <ShieldAlertIcon size={18} color="#16a34a" />
          </div>
          <div className="ins-texts">
            <span className="ins-lbl">Heat Action Plan Efficacy</span>
            <strong className="ins-val" style={{ color: '#16a34a' }}>-35% Mortality Reduction</strong>
            <span className="ins-sub">When cooling shelters &amp; advisories are active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MortalityTrend;
