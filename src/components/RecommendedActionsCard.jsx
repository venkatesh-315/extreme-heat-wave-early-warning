import React from 'react';
import {
  BuildingIcon,
  UsersIcon,
  WaterIcon,
  ZapIcon,
  InfoIcon,
  ArrowRightIcon
} from './icons';
import './RecommendedActionsCard.css';

function RecommendedActionsCard({ onViewActionCenter }) {
  const actions = [
    {
      id: 'cooling',
      icon: BuildingIcon,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      title: 'Open Cooling Centres',
      desc: 'High priority for vulnerable wards',
    },
    {
      id: 'labour',
      icon: UsersIcon,
      iconBg: '#fff7ed',
      iconColor: '#f97316',
      title: 'Restrict Outdoor Work',
      desc: '12:00 PM - 04:00 PM',
    },
    {
      id: 'water',
      icon: WaterIcon,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      title: 'Hydration & Awareness',
      desc: 'Increase public announcements',
    },
    {
      id: 'grid',
      icon: ZapIcon,
      iconBg: '#faf5ff',
      iconColor: '#7c3aed',
      title: 'Power Grid Preparedness',
      desc: 'High load expected',
    },
  ];

  return (
    <div className="card rec-actions-card" id="recommended-actions-card">
      <div className="rec-actions-top">
        <h3 className="card-heading">
          Recommended Actions
          <span className="info-tooltip-wrap" title="Heat Action Plan Directives">
            <InfoIcon size={14} />
          </span>
        </h3>
      </div>

      <div className="rec-actions-list">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="rec-action-item">
              <div className="action-icon-box" style={{ background: act.iconBg, color: act.iconColor }}>
                <Icon size={16} />
              </div>
              <div className="action-item-text">
                <div className="action-item-title">{act.title}</div>
                <div className="action-item-desc">{act.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="view-action-center-btn" onClick={onViewActionCenter}>
        <span>View Action Center</span>
        <ArrowRightIcon size={14} color="#64748b" />
      </button>
    </div>
  );
}

export default RecommendedActionsCard;
