import React from 'react';
import {
  UsersIcon,
  HeartPulseIcon,
  InfoIcon
} from './icons';
import './AtRiskPopulationCard.css';

function formatIndianNumber(num) {
  if (!num || isNaN(num)) return '1.20 Lakh';
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} Lakh`;
  }
  return num.toLocaleString('en-IN');
}

function AtRiskPopulationCard({ location }) {
  const pop = location?.population || 2500000;

  const groups = [
    {
      id: 'elderly',
      icon: UsersIcon,
      bgColor: '#fef2f2',
      iconColor: '#ef4444',
      count: formatIndianNumber(Math.round(pop * 0.115)), // ~11.5% elderly
      label: 'Elderly (60+)',
    },
    {
      id: 'workers',
      icon: UsersIcon,
      bgColor: '#fff7ed',
      iconColor: '#f97316',
      count: formatIndianNumber(Math.round(pop * 0.142)), // ~14.2% outdoor labour
      label: 'Outdoor Workers',
    },
    {
      id: 'children',
      icon: UsersIcon,
      bgColor: '#f0fdf4',
      iconColor: '#22c55e',
      count: formatIndianNumber(Math.round(pop * 0.082)), // ~8.2% young children
      label: 'Children (<5 yrs)',
    },
    {
      id: 'chronic',
      icon: HeartPulseIcon,
      bgColor: '#faf5ff',
      iconColor: '#a855f7',
      count: formatIndianNumber(Math.round(pop * 0.128)), // ~12.8% chronic comorbidities
      label: 'Chronic Illness',
    },
  ];

  return (
    <div className="card at-risk-card" id="at-risk-population-overview">
      <div className="at-risk-top">
        <h3 className="card-heading">
          At-Risk Population Overview
          <span className="info-tooltip-wrap" title="High-vulnerability demographic segments requiring priority shelter and hydration assistance">
            <InfoIcon size={14} />
          </span>
        </h3>
      </div>

      <div className="at-risk-grid">
        {groups.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="at-risk-pill-card" style={{ background: item.bgColor }}>
              <div className="at-risk-icon-wrap" style={{ color: item.iconColor }}>
                <Icon size={18} />
              </div>
              <div className="at-risk-text-block">
                <div className="at-risk-count">{item.count}</div>
                <div className="at-risk-label">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AtRiskPopulationCard;
