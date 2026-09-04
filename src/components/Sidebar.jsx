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
  XIcon,
  LogOutIcon
} from './icons';
import { useLanguage } from '../context/LanguageContext';
import './Sidebar.css';

const NAV_ITEM_DEFS = [
  { id: 'dashboard', key: 'tab_dashboard', defaultLabel: 'Dashboard', icon: DashboardIcon },
  { id: 'heatmap', key: 'tab_heatmap', defaultLabel: 'Heat Map', icon: MapIcon },
  { id: 'forecast', key: 'tab_forecast', defaultLabel: 'Forecast', icon: CalendarIcon },
  { id: 'health', key: 'tab_health', defaultLabel: 'Health Impact', icon: HeartPulseIcon },
  { id: 'alerts', key: 'tab_alerts', defaultLabel: 'Alerts', icon: BellIcon },
  { id: 'action', key: 'tab_action', defaultLabel: 'Action Plan', icon: ActionCenterIcon },
  { id: 'reports', key: 'tab_reports', defaultLabel: 'Reports', icon: ReportsIcon },
  { id: 'settings', key: 'tab_settings', defaultLabel: 'Settings', icon: SettingsIcon },
];

function Sidebar({ activeTab = 'dashboard', onSelectTab, isOpen = false, onClose, _currentUser, onLogout, alertCount = 0 }) {
  const { t } = useLanguage();

  return (
    <>
      {/* Backdrop for Mobile Drawer */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Brand Logo & Title */}
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-brand"
            onClick={() => {
              onSelectTab('dashboard');
              if (onClose) onClose();
            }}
            title={t('goToDashboard', 'Go to Dashboard')}
            aria-label={t('goToDashboard', 'ThermoGuard - Return to Dashboard')}
          >
            <div className="sidebar-logo-wrap">
              <ThermoGuardLogo size={32} />
            </div>
            <div className="sidebar-brand-text">
              <div className="brand-title">{t('appName', 'THERMOGUARD')}</div>
              <div className="brand-tagline">{t('appTagline', 'Heatwave Early Warning System')}</div>
            </div>
          </button>

          {/* Close button for mobile */}
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <XIcon size={20} />
          </button>
        </div>

        {/* Navigation Menu List */}
        <nav className="sidebar-nav">
          {NAV_ITEM_DEFS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeValue = item.id === 'alerts' && alertCount > 0 ? String(alertCount) : null;
            const translatedLabel = t(item.key, item.defaultLabel);

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
                <span className="nav-item-label">{translatedLabel}</span>
                {badgeValue && !isActive && (
                  <span className="nav-badge-pill">{badgeValue}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Footer */}
        <div className="sidebar-footer">
          {/* Switch Role / Sign Out Button */}
          {onLogout && (
            <button
              className="sidebar-logout-btn"
              onClick={onLogout}
              title="Sign Out / Switch Role Portal"
            >
              <LogOutIcon size={16} />
              <span>{t('logout', 'Switch / Sign Out')}</span>
            </button>
          )}

          {/* System Status Card */}
          <div className="system-status-card">
            <div className="status-dot-pulse" />
            <div className="status-info">
              <div className="status-title">{t('emergencyOps', 'System Status')}</div>
              <div className="status-desc">{t('opsLive', 'All Systems Operational')}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
