import React from 'react';
import {
  DashboardIcon,
  MapIcon,
  CalendarIcon,
  BellIcon,
  ActionCenterIcon,
  SettingsIcon
} from './icons';
import './MobileNav.css';

function MobileNav({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'heatmap', label: 'Heat Map', icon: MapIcon },
    { id: 'forecast', label: 'Forecast', icon: CalendarIcon },
    { id: 'alerts', label: 'Alerts', icon: BellIcon, badge: '3' },
    { id: 'action', label: 'Actions', icon: ActionCenterIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`mobile-tab-${tab.id}`}
            className={`mobile-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            aria-selected={isActive}
            role="tab"
          >
            <div className="mobile-tab-icon-wrap">
              <Icon size={19} color={isActive ? '#e11d48' : '#64748b'} />
              {tab.badge && !isActive && <span className="mobile-tab-badge">{tab.badge}</span>}
            </div>
            <span className="mobile-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileNav;
