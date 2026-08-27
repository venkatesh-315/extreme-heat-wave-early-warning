import React from 'react';
import {
  ThermoGuardLogo,
  DashboardIcon,
  MapIcon,
  CalendarIcon,
  HeartPulseIcon,
  BellIcon,
  ActionCenterIcon,
  ReportsIcon,
  SettingsIcon,
  XIcon
} from './icons';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'heatmap', label: 'Heat Map', icon: MapIcon },
  { id: 'forecast', label: 'Forecast', icon: CalendarIcon },
  { id: 'health', label: 'Health Impact', icon: HeartPulseIcon },
  { id: 'alerts', label: 'Alerts', icon: BellIcon, badge: '3' },
  { id: 'action', label: 'Action Center', icon: ActionCenterIcon },
  { id: 'reports', label: 'Reports', icon: ReportsIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function Sidebar({ activeTab = 'dashboard', onSelectTab, isOpen = false, onClose }) {
  return (
    <>
      {/* Backdrop for Mobile Drawer */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Brand Logo & Title */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-wrap">
              <ThermoGuardLogo size={32} />
            </div>
            <div className="sidebar-brand-text">
              <div className="brand-title">THERMOGUARD</div>
              <div className="brand-tagline">Heatwave Early Warning System</div>
            </div>
          </div>

          {/* Close button for mobile */}
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <XIcon size={20} />
          </button>
        </div>

        {/* Navigation Menu List */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
              >
                <span className="nav-item-icon">
                  <Icon size={18} color={isActive ? '#e11d48' : '#64748b'} />
                </span>
                <span className="nav-item-label">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="nav-badge-pill">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Status */}
        <div className="sidebar-footer">
          {/* System Status Card */}
          <div className="system-status-card">
            <div className="status-dot-pulse" />
            <div className="status-info">
              <div className="status-title">System Status</div>
              <div className="status-desc">All Systems Operational</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
