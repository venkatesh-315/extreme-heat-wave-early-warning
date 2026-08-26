import React from 'react';
import './ThermalStressPanel.css';

const GaugeArc = ({ value, max, color, label, sublabel, unit = '°C' }) => {
  const pct = Math.min(1, Math.max(0, value / max));
  const angle = pct * 180;
  const r = 60;
  const cx = 80;
  const cy = 75;
  const startAngle = -180;
  const endAngle = startAngle + angle;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 160 90" className="gauge-svg">
        {/* Background Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value Arc */}
        {pct > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
        )}
        {/* Value text */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="#0f172a"
          fontSize="22"
          fontFamily="Outfit, sans-serif"
          fontWeight="800"
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
          <tspan fontSize="12" fill="#64748b" fontWeight="600">{unit}</tspan>
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill="#64748b"
          fontSize="9"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
        >
          {label}
        </text>
      </svg>
      <div className="gauge-sublabel">{sublabel}</div>
    </div>
  );
};

const MortalityGauge = ({ risk }) => {
  const color = risk >= 70 ? '#dc2626' : risk >= 50 ? '#ea580c' : risk >= 30 ? '#ca8a04' : '#16a34a';
  const label = risk >= 70 ? 'CRITICAL' : risk >= 50 ? 'HIGH' : risk >= 30 ? 'MODERATE' : 'LOW';

  return (
    <div className="mortality-gauge-light" id="mortality-risk-gauge">
      <div className="mortality-ring-wrap">
        <svg viewBox="0 0 120 120" className="mortality-svg">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${risk * 3.14} 314`}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="mortality-center">
          <span className="mortality-value" style={{ color }}>{risk}%</span>
          <span className="mortality-label">Mortality Risk</span>
        </div>
      </div>

      <div className="mortality-info-box">
        <div className="mortality-badge-row">
          <span className="mortality-badge" style={{ background: `${color}18`, border: `1px solid ${color}44`, color }}>
            {label} HEAT MORTALITY RISK
          </span>
        </div>
        <p className="mortality-desc">
          {risk >= 70
            ? 'Severe, imminent threat to life. Rapid onset of heat exhaustion and heat stroke among outdoor workers, infants, and seniors without active cooling.'
            : risk >= 50
            ? 'Significant risk of heat-related emergencies. Pre-position medical triage, hydration booths, and restrict manual outdoor work.'
            : risk >= 30
            ? 'Elevated thermal stress for vulnerable citizens. Preventive cooling and scheduled hydration breaks required.'
            : 'Low mortality risk under current atmospheric conditions. Standard summer hydration advisory.'}
        </p>
      </div>
    </div>
  );
};

function ThermalStressPanel({ thermalMetrics }) {
  if (!thermalMetrics) return null;
  const { hi, wbgt, utci, mortalityRisk, stressCategory } = thermalMetrics;

  return (
    <div className="thermal-panel card" id="thermal-stress-panel">
      <div className="panel-header">
        <div>
          <h3 className="section-title">🔥 Human Thermal Stress &amp; Biometeorology Indices</h3>
          <p className="section-desc">Multi-parameter physiological heat burden evaluated for Summer 2026</p>
        </div>
        <div
          className="stress-category-tag"
          style={{ background: stressCategory.bg, border: `1px solid ${stressCategory.border}`, color: stressCategory.color }}
        >
          ● {stressCategory.label} Thermal Stress ({stressCategory.text})
        </div>
      </div>

      <div className="thermal-content">
        {/* Three Primary Gauges */}
        <div className="gauges-grid">
          <div className="gauge-card card" id="gauge-wbgt">
            <GaugeArc value={wbgt} max={45} color="#ea580c" label="WBGT OUTDOOR" sublabel="Wet-Bulb Globe Temperature" />
            <div className="gauge-scale-legend">
              <span style={{ color: '#16a34a' }}>● &lt;26° Safe</span>
              <span style={{ color: '#ca8a04' }}>● 28-30° Caution</span>
              <span style={{ color: '#dc2626' }}>● &gt;32° Danger</span>
            </div>
          </div>

          <div className="gauge-card card" id="gauge-utci">
            <GaugeArc value={utci} max={60} color="#7c3aed" label="UTCI INDEX" sublabel="Universal Thermal Climate Index" />
            <div className="gauge-scale-legend">
              <span style={{ color: '#16a34a' }}>● &lt;26° No Stress</span>
              <span style={{ color: '#ea580c' }}>● 32-38° Strong</span>
              <span style={{ color: '#991b1b' }}>● &gt;46° Extreme</span>
            </div>
          </div>

          <div className="gauge-card card" id="gauge-hi">
            <GaugeArc value={hi} max={70} color="#dc2626" label="HEAT INDEX" sublabel="NOAA Rothfusz Apparent Temp" />
            <div className="gauge-scale-legend">
              <span style={{ color: '#16a34a' }}>● &lt;32° Normal</span>
              <span style={{ color: '#ea580c' }}>● 41-54° Danger</span>
              <span style={{ color: '#dc2626' }}>● &gt;54° Extreme</span>
            </div>
          </div>
        </div>

        {/* Mortality Risk Circular Gauge */}
        <div className="mortality-card card">
          <MortalityGauge risk={mortalityRisk} />
        </div>

        {/* Scientific Methodology Explanation */}
        <div className="methodology-card card">
          <h4 className="meth-title">📐 Biometeorological Calculation Standards</h4>
          <div className="meth-grid">
            <div className="meth-item">
              <span className="meth-name">WBGT (Outdoor ISO 7933)</span>
              <span className="meth-formula">0.7·Tw + 0.2·Tg + 0.1·Ta</span>
              <p className="meth-desc">Combines evaporative cooling capacity (Tw), direct solar radiation flux (Tg), and air temperature (Ta). Standard for occupational heat regulation.</p>
            </div>

            <div className="meth-item">
              <span className="meth-name">UTCI (ISO 11079)</span>
              <span className="meth-formula">6th-Order Fiala Model</span>
              <p className="meth-desc">Accounts for human body thermoregulation, dynamic clothing insulation, wind speed at 10m, and mean radiant temperature.</p>
            </div>

            <div className="meth-item">
              <span className="meth-name">Heat Index (NOAA / NWS)</span>
              <span className="meth-formula">Rothfusz Regression</span>
              <p className="meth-desc">Estimates how hot it feels when relative humidity is factored with dry air temperature. Standard public advisory metric.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThermalStressPanel;
