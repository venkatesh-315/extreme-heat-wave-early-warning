import React, { useState, useEffect, useRef } from 'react';
import {
  UserLocationPin,
  ChevronDownIcon,
  BellIcon,
  RefreshCwIcon,
  SearchIcon,
  CrosshairIcon,
  XIcon,
  LogOutIcon,
  CheckCircleIcon,
  LanguagesIcon
} from './icons';
import { searchLocations, reverseGeocode, CURATED_INDIAN_LOCATIONS } from '../services/geocodingService';
import { useLanguage } from '../context/LanguageContext';
import './TopHeader.css';

function TopHeader({
  selectedLocation,
  onSelectLocation,
  onToggleSidebar,
  isSidebarOpen = false,
  onOpenAlerts,
  autoRefreshInterval = '1m',
  currentUser,
  onLogout,
  alertCount = 0,
  activeAlerts = [],
  onRefresh,
  isRefreshing = false,
}) {
  const { currentLang, currentLanguageObj, setLanguage, languages, t } = useLanguage();
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  // Keep the previous location name in the input field
  const [searchQuery, setSearchQuery] = useState(selectedLocation?.name || 'Hyderabad');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const locationMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const langMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const inputRef = useRef(null);

  // Synchronize searchQuery with selectedLocation whenever selectedLocation changes
  useEffect(() => {
    if (selectedLocation?.name) {
      setSearchQuery(selectedLocation.name);
    }
  }, [selectedLocation]);

  // Real-time clock formatted like the screenshot: "10:24 AM" and "26 Aug 2025"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const dateStr = now.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Search Input (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        if (isMounted) setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationMenuRef.current && !locationMenuRef.current.contains(e.target)) {
        setIsLocationMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLocationMenu = () => {
    setIsLocationMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        if (!searchQuery && selectedLocation?.name) {
          setSearchQuery(selectedLocation.name);
        }
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 100);
      }
      return next;
    });
  };

  const handleGpsLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const loc = await reverseGeocode(latitude, longitude);
          onSelectLocation(loc);
          setSearchQuery(loc.name);
          setIsLocationMenuOpen(false);
        },
        () => {
          onSelectLocation(CURATED_INDIAN_LOCATIONS[0]);
          setSearchQuery(CURATED_INDIAN_LOCATIONS[0].name);
          setIsLocationMenuOpen(false);
        }
      );
    }
  };

  const displayName = selectedLocation
    ? `${selectedLocation.name}${selectedLocation.state ? `, ${selectedLocation.state}` : ''}`
    : 'Hyderabad, Telangana';

  const refreshLabel = autoRefreshInterval === 'off' ? 'Manual Sync' : `Auto Refresh (${autoRefreshInterval})`;

  return (
    <header className="top-header">
      <div className="top-header-left">
        {/* Animated Mobile 3-Line Hamburger Toggle */}
        <button
          className={`mobile-menu-toggle ${isSidebarOpen ? 'is-open' : ''}`}
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={isSidebarOpen}
        >
          <span className="hamburger-box">
            <span className="hamburger-line line-1" />
            <span className="hamburger-line line-2" />
            <span className="hamburger-line line-3" />
          </span>
        </button>

        {/* Location Dropdown Pill */}
        <div className="location-picker-wrapper" ref={locationMenuRef}>
          <button
            className={`location-pill-btn ${isLocationMenuOpen ? 'active' : ''}`}
            onClick={toggleLocationMenu}
            aria-expanded={isLocationMenuOpen}
            aria-label="Select Monitored Location"
          >
            <UserLocationPin size={16} color="#e11d48" />
            <span className="location-name">{displayName}</span>
            <ChevronDownIcon size={14} color="#64748b" className={`chevron ${isLocationMenuOpen ? 'up' : ''}`} />
          </button>

          {/* Location Dropdown Menu */}
          {isLocationMenuOpen && (
            <div className="location-dropdown-menu animate-fade-in">
              <div className="location-search-box">
                <SearchIcon size={18} color="#2563eb" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t('searchPlaceholder', 'Search city, ward, or coordinates...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search city or district"
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => {
                      setSearchQuery('');
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    title="Clear search text"
                  >
                    <XIcon size={15} />
                  </button>
                )}
              </div>

              {/* GPS Locate Action */}
              <button className="gps-locate-item" onClick={handleGpsLocate}>
                <CrosshairIcon size={16} color="#2563eb" />
                <span>{t('gps_locate', 'Use Current Live GPS Location')}</span>
              </button>

              <div className="location-list scroll-area">
                {isSearching && (
                  <div className="loc-searching-state">{t('searching_network', 'Searching meteorology network...')}</div>
                )}

                {/* Show Search Results if user searched */}
                {searchResults.length > 0 && (
                  <div className="loc-group">
                    <div className="loc-group-title">{t('search_results_title', 'Search Results')}</div>
                    {searchResults.map((loc) => (
                      <button
                        key={loc.id}
                        className="loc-item"
                        onClick={() => {
                          onSelectLocation(loc);
                          setSearchQuery(loc.name);
                          setIsLocationMenuOpen(false);
                        }}
                      >
                        <UserLocationPin size={14} color="#64748b" />
                        <div className="loc-item-info">
                          <span className="loc-item-name">{loc.name}</span>
                          <span className="loc-item-sub">{loc.state || 'India'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Curated Hotspots */}
                {searchResults.length === 0 && !isSearching && (
                  <div className="loc-group">
                    <div className="loc-group-title">{t('card_ward_title', 'Monitored Indian Hotspots')}</div>
                    {CURATED_INDIAN_LOCATIONS.map((loc) => (
                      <button
                        key={loc.id}
                        className={`loc-item ${selectedLocation?.id === loc.id ? 'active' : ''}`}
                        onClick={() => {
                          onSelectLocation(loc);
                          setSearchQuery(loc.name);
                          setIsLocationMenuOpen(false);
                        }}
                      >
                        <UserLocationPin size={14} color={selectedLocation?.id === loc.id ? '#e11d48' : '#94a3b8'} />
                        <div className="loc-item-info">
                          <span className="loc-item-name">{loc.name}</span>
                          <span className="loc-item-sub">{loc.state}</span>
                        </div>
                        {loc.isHotspot && <span className="hotspot-badge">{t('status_danger', 'Heat Hotspot')}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Sync Status with Auto Refresh Setting */}
        <div className="header-status-strip">
          <button
            type="button"
            className={`refresh-btn-pill ${isRefreshing ? 'refreshing' : ''}`}
            onClick={onRefresh}
            disabled={isRefreshing}
            title={isRefreshing ? 'Syncing live telemetry data...' : `Click to refresh live telemetry now (${refreshLabel})`}
            aria-label={`Refresh live telemetry (${refreshLabel})`}
          >
            <RefreshCwIcon
              size={12}
              color={isRefreshing ? '#2563eb' : '#475569'}
              className={`refresh-icon ${isRefreshing ? 'spin-icon' : ''}`}
            />
            <span className="refresh-btn-label">
              {isRefreshing ? t('refreshing', 'Refreshing...') : refreshLabel}
            </span>
          </button>
          <span className="live-status-pill">
            <span className="live-dot" />
            <span>{t('live', 'Live')}</span>
          </span>
        </div>
      </div>

      <div className="top-header-right">
        {/* Language Selector Dropdown beside Notification Bell with SVG Icon */}
        <div className="header-lang-wrapper" ref={langMenuRef}>
          <button
            type="button"
            className={`header-lang-btn ${isLangOpen ? 'active' : ''}`}
            onClick={() => setIsLangOpen((prev) => !prev)}
            aria-label="Select Portal Language"
            aria-expanded={isLangOpen}
            title={`Select Language / भाषा चुनें (${currentLanguageObj?.name || 'English'})`}
          >
            <LanguagesIcon size={18} className="header-lang-svg" />
            <span className="header-lang-pill">
              <span className="header-lang-flag">{currentLanguageObj?.flag || '🌐'}</span>
              <span className="header-lang-code">{currentLang.toUpperCase()}</span>
            </span>
            <ChevronDownIcon size={12} className={`header-lang-chevron ${isLangOpen ? 'open' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="header-lang-dropdown animate-fade-in" role="menu">
              <div className="header-lang-dropdown-header">
                <div className="header-lang-dropdown-title">
                  <LanguagesIcon size={16} color="#2563eb" />
                  <span>{t('chooseLanguage', 'Choose Language / भाषा चुनें')}</span>
                </div>
                <span className="header-lang-dropdown-count">8 Regional Languages</span>
              </div>

              <div className="header-lang-list">
                {languages.map((lang) => {
                  const isSelected = currentLang === lang.lang;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="menuitem"
                      className={`header-lang-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setLanguage(lang.lang);
                        setIsLangOpen(false);
                      }}
                    >
                      <span className="lang-opt-flag">{lang.flag}</span>
                      <div className="lang-opt-text">
                        <span className="lang-opt-native">{lang.nativeName}</span>
                        <span className="lang-opt-name">{lang.name}</span>
                      </div>
                      {isSelected && (
                        <span className="lang-opt-check">
                          <CheckCircleIcon size={16} color="#2563eb" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Existing Notification Bell Icon */}
        <div className="notif-wrapper" ref={notifMenuRef}>
          <button
            className="notif-bell-btn"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            aria-label="View Active Alerts"
          >
            <BellIcon size={18} color="#475569" />
            {alertCount > 0 && <span className="notif-badge">{alertCount}</span>}
          </button>

          {isNotificationsOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span className="notif-title">{t('activeAlerts', 'Active Emergency Alerts')}</span>
                <span className={`notif-count ${alertCount > 0 ? 'active' : 'safe'}`}>
                  {alertCount > 0 ? `${alertCount} ${t('active', 'Active')}` : `0 ${t('active', 'Active')}`}
                </span>
              </div>

              <div className="notif-list">
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((alert) => (
                    <div key={alert.id} className={`notif-item ${alert.severity || 'orange'}`}>
                      <div className="notif-indicator" />
                      <div className="notif-text">
                        <div className="notif-item-top">
                          <strong>{alert.title}</strong>
                          {alert.tag && <span className="notif-tag-pill">{alert.tag}</span>}
                        </div>
                        <p>{alert.description}</p>
                        <span className="notif-time">{alert.time || t('telemetrySync', 'Live Telemetry')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notif-empty-state">
                    <CheckCircleIcon size={26} color="#16a34a" />
                    <div className="notif-empty-title">{t('allSafe', 'All Parameters Safe')}</div>
                    <p className="notif-empty-text">
                      {t('safeBaseline', `Thermal stress indices for ${selectedLocation?.name || 'this location'} are within normal baseline thresholds. No mandatory emergency alert active.`)}
                    </p>
                  </div>
                )}
              </div>
              <button
                className="notif-view-all"
                onClick={() => {
                  setIsNotificationsOpen(false);
                  if (onOpenAlerts) onOpenAlerts();
                }}
              >
                {t('viewAllAlerts', 'Open Full Alerts & Heat Action Center →')}
              </button>
            </div>
          )}
        </div>

        {/* User Circular Avatar Button with Dropdown (displays only circle, reveals Logout on click) */}
        <div className="header-user-menu-wrap" ref={userMenuRef}>
          <button
            type="button"
            className={`header-avatar-btn ${isUserMenuOpen ? 'active' : ''}`}
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-label="User Account Menu"
            aria-expanded={isUserMenuOpen}
            title={currentUser?.name || 'User Account'}
          >
            <span className="header-user-avatar">
              <span>{currentUser?.avatar || (currentUser?.role === 'citizen' ? 'PU' : 'OF')}</span>
              <span className="user-online-dot" />
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="header-user-dropdown animate-fade-in">
              <div className="user-dropdown-header">
                <div className="user-dropdown-avatar">
                  <span>{currentUser?.avatar || (currentUser?.role === 'citizen' ? 'PU' : 'OF')}</span>
                </div>
                <div className="user-dropdown-info">
                  <span className="user-dropdown-name">
                    {currentUser?.name || (currentUser?.role === 'citizen' ? 'Public User #8204' : 'Officer #4102')}
                  </span>
                  <span className="user-dropdown-sub">
                    {currentUser?.role === 'citizen' ? t('userCitizen', 'Civic Safety Network') : t('emergencyOps', 'Disaster Control Desk')}
                  </span>
                  <span className="user-dropdown-email">
                    {currentUser?.email || (currentUser?.role === 'citizen' ? 'user8204@thermoguard.in' : 'officer4102@gov.in')}
                  </span>
                </div>
              </div>

              <div className="user-dropdown-badge-row">
                <span className={`user-role-badge ${currentUser?.role || 'authority'}`}>
                  {currentUser?.role === 'citizen' ? t('userCitizen', 'Citizen Verified Access') : t('userOfficer', 'Authorized Duty Officer')}
                </span>
              </div>

              {onLogout && (
                <button
                  type="button"
                  className="user-dropdown-logout-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOutIcon size={16} color="#dc2626" />
                  <span>{t('logout', 'Log Out')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Current Date & Time Display (Live Present Date & Time) */}
        <div className="datetime-display">
          <div className="time-text">{currentTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
          <div className="date-text">{currentDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
