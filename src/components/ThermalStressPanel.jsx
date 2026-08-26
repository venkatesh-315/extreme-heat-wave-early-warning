import React from 'react';
import { getUTCICategory } from '../data/mockData';
import './ThermalStressPanel.css';

const GaugeArc = ({ value, max, color, label, sublabel }) => {
  const pct = Math.min(1, value / max);
  const angle = pct * 180;
  // SVG arc path
  const r = 60;
  const cx = 80;
  const cy = 75;
  const startAngle = -180;
  const endAngle = startAngle + angle;
  const toRad = deg => deg * Math.PI / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 160 90" className="gauge-svg">
        {/* Background track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
        {/* Value text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="20" fontFamily="Outfit" fontWeight="800">
          {value.toFixed(1)}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter">
          {label}
        </text>
      </svg>
      <div className="gauge-sublabel">{sublabel}</div>
    </div>
  );
};

const MortalityGauge = ({ risk }) => {
  const color = risk >= 70 ? '#ff2d2d' : risk >= 50 ? '#ef4444' : risk >= 30 ? '#f97316' : '#eab308';
  const label = risk >= 70 ? 'CRITICAL' : risk >= 50 ? 'HIGH' : risk >= 30 ? 'MODERATE' : 'LOW';

  return (
    <div className="mortality-gauge" id="mortality-risk-gauge">
      <div className="mortality-ring-wrap">
        <svg viewBox="0 0 120 120" className="mortality-svg">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${risk * 3.14} 314`}
            transform="rotate(-90 60 60)"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1.5s ease' }}
          />
        </svg>
        <div className="mortality-center">
          <span className="mortality-value" style={{ color }}>{risk}%</span>
          <span className="mortality-label">Risk</span>
        </div>
      </div>
      <div className="mortality-info">
        <span className="mortality-badge" style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}>
          {label} MORTALITY RISK
        </span>
        <p className="mortality-desc">
          {risk >= 70
            ? 'Imminent threat to life. Elderly, children, and outdoor workers at extreme risk.'
            : risk >= 50
            ? 'Significant risk of heat-related illness and mortality. Immediate action required.'
            : risk >= 30
            ? 'Elevated risk for vulnerable populations. Preventive measures essential.'
            : 'Low mortality risk under current conditions. Stay hydrated.'}
        </p>
      </div>
    </div>
  );
};

function ThermalStressPanel({ thermalMetrics, weather }) {
  if (!thermalMetrics) return null;
  const { hi, wbgt, utci, mortalityRisk, stressCategory } = thermalMetrics;
  const utciCat = getUTCICategory(utci);

  return (
    <div className="thermal-panel card" id="thermal-stress-panel">
      <div className="panel-header">
        <h3 className="panel-title">🔥 Human Thermal Stress Indices</h3>
        <div className="stress-badge" style={{ background: stressCategory.bgColor, border: `1px solid ${stressCategory.color}55`, color: stressCategory.color }}>
          {stressCategory.label} STRESS
        </div>
      </div>

      <div className="thermal-content">
        {/* Gauges row */}
        <div className="gauges-row">
          <div className="gauge-card" id="gauge-wbgt">
            <GaugeArc value={wbgt} max={45} color="#ff6b00" label="°C WBGT" sublabel="Wet-Bulb Globe Temp" />
            <div className="gauge-threshold">
              <div className="threshold-item">
                <span style={{ color: '#22c55e' }}>●</span> &lt;26°C Safe
              </div>
              <div className="threshold-item">
                <span style={{ color: '#ffd700' }}>●</span> 28–30°C Caution
              </div>
              <div className="threshold-item">
                <span style={{ color: '#ff2d2d' }}>●</span> &gt;32°C Danger
              </div>
            </div>
          </div>

          <div className="gauge-card" id="gauge-utci">
            <GaugeArc value={utci} max={60} color="#a855f7" label="°C UTCI" sublabel="Universal Thermal Climate Index" />
            <div className="utci-category" style={{ color: utciCat.color }}>
              {utciCat.label}
            </div>
          </div>

          <div className="gauge-card" id="gauge-hi">
            <GaugeArc value={hi} max={70} color="#ef4444" label="°C HI" sublabel="Heat Index (Rothfusz)" />
            <div className="gauge-threshold">
              <div className="threshold-item">
                <span style={{ color: '#22c55e' }}>●</span> &lt;32°C Normal
              </div>
              <div className="threshold-item">
                <span style={{ color: '#ffd700' }}>●</span> 41–54°C Extreme
              </div>
              <div className="threshold-item">
                <span style={{ color: '#ff2d2d' }}>●</span> &gt;54°C Danger
              </div>
            </div>
          </div>
        </div>

        {/* Mortality gauge + info */}
        <MortalityGauge risk={mortalityRisk} />

        {/* Algorithm explanation */}
        <div className="algo-info">
          <h4 className="algo-title">📐 Calculation Methodology</h4>
          <div className="algo-grid">
            <div className="algo-card">
              <span className="algo-name">WBGT (Outdoor)</span>
              <span className="algo-formula">0.7·Tw + 0.2·Tg + 0.1·T</span>
              <span className="algo-desc">ISO 7933 standard. Integrates wet-bulb, globe & dry temp. Used by NIOSH & military.</span>
            </div>
            <div className="algo-card">
              <span className="algo-name">UTCI</span>
              <span className="algo-formula">Polynomial (6th order)</span>
              <span className="algo-desc">ISO 11079. Accounts for metabolic rate, clothing, radiation, wind. Most comprehensive index.</span>
            </div>
            <div className="algo-card">
              <span className="algo-name">Heat Index (HI)</span>
              <span className="algo-formula">Rothfusz Regression</span>
              <span className="algo-desc">NOAA standard. Uses T and RH to estimate perceived temperature. Valid for T &gt;27°C, RH &gt;40%.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThermalStressPanel;
