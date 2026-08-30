import React from 'react';
import {
  UsersIcon,
  HeartPulseIcon,
  InfoIcon
} from './icons';
import './AtRiskPopulationCard.css';

function AtRiskPopulationCard({ location }) {
  const groups = [
    {
      id: 'elderly',
      icon: UsersIcon,
      bgColor: '#fef2f2',
      iconColor: '#ef4444',
      count: '2.41 Lakh',
      label: 'Elderly (60+)',
    },
    {
      id: 'workers',
      icon: UsersIcon,
      bgColor: '#fff7ed',
      iconColor: '#f97316',
      count: '1.87 Lakh',
      label: 'Outdoor Workers',
    },
    {
      id: 'children',
      icon: UsersIcon,
      bgColor: '#f0fdf4',
      iconColor: '#22c55e',
      count: '1.32 Lakh',
      label: 'Children (<5 yrs)',
    },
    {
      id: 'chronic',
      icon: HeartPulseIcon,
      bgColor: '#faf5ff',
      iconColor: '#a855f7',
      count: '4.65 Lakh',
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
