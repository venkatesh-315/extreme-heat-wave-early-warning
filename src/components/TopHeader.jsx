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
  Building2Icon,
  UsersIcon
} from './icons';
import { searchLocations, reverseGeocode, CURATED_INDIAN_LOCATIONS } from '../services/geocodingService';
import './TopHeader.css';

function TopHeader({
  selectedLocation,
  onSelectLocation,
  onToggleSidebar,
  isSidebarOpen = false,
  onOpenAlerts,
  isLive = true,
  autoRefreshInterval = '1m',
  currentUser,
  onLogout
}) {
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  // Keep the previous location name in the input field
  const [searchQuery, setSearchQuery] = useState(selectedLocation?.name || 'Hyderabad');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const locationMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
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
            className="location-pill-btn"
            onClick={toggleLocationMenu}
            aria-expanded={isLocationMenuOpen}
          >
            <UserLocationPin size={16} color="#475569" />
            <span className="location-name">{displayName}</span>
            <ChevronDownIcon size={14} color="#64748b" className={`chevron ${isLocationMenuOpen ? 'up' : ''}`} />
          </button>

          {/* Location Dropdown Menu */}
          {isLocationMenuOpen && (
            <div className="location-dropdown-menu">
              <div className="location-search-box">
                <SearchIcon size={16} color="#94a3b8" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search city or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    <XIcon size={14} />
                  </button>
                )}
              </div>

              {/* GPS Locate Action */}
              <button className="gps-locate-item" onClick={handleGpsLocate}>
                <CrosshairIcon size={15} color="#2563eb" />
                <span>Use Current Live GPS Location</span>
              </button>

              <div className="location-list scroll-area">
                {isSearching && (
                  <div className="loc-searching-state">Searching meteorology network...</div>
                )}

                {/* Show Search Results if user searched */}
                {searchResults.length > 0 && (
                  <div className="loc-group">
                    <div className="loc-group-title">Search Results</div>
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
                    <div className="loc-group-title">Monitored Indian Hotspots</div>
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
                        {loc.isHotspot && <span className="hotspot-badge">Heat Hotspot</span>}
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
          <span className="refresh-label">
            <RefreshCwIcon size={12} color="#64748b" />
            <span>{refreshLabel}</span>
          </span>
          <span className="live-status-pill">
            <span className="live-dot" />
            <span>Live</span>
          </span>
        </div>
      </div>

      {/* Right Header Section: Notification & Clock */}
      <div className="top-header-right">
        {/* Notification Bell */}
        <div className="notif-wrapper" ref={notifMenuRef}>
          <button
            className="notif-bell-btn"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            aria-label="View Active Alerts"
          >
            <BellIcon size={18} color="#475569" />
            <span className="notif-badge">3</span>
          </button>

          {isNotificationsOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span className="notif-title">Active Emergency Alerts</span>
                <span className="notif-count">3 New</span>
              </div>
              <div className="notif-list">
                <div className="notif-item red">
                  <div className="notif-indicator" />
                  <div className="notif-text">
                    <strong>Extreme Heatwave Alert (Red)</strong>
                    <p>WBGT exceeding dangerous thresholds in central urban zone.</p>
                    <span className="notif-time">10 mins ago</span>
                  </div>
                </div>
                <div className="notif-item orange">
                  <div className="notif-indicator" />
                  <div className="notif-text">
                    <strong>Outdoor Work Restriction Enforced</strong>
                    <p>Mandatory suspension for construction from 12 PM - 4 PM.</p>
                    <span className="notif-time">25 mins ago</span>
                  </div>
                </div>
                <div className="notif-item blue">
                  <div className="notif-indicator" />
                  <div className="notif-text">
                    <strong>Cooling Centers Activated</strong>
                    <p>12 municipal shelters and water distribution points operational.</p>
                    <span className="notif-time">1 hour ago</span>
                  </div>
                </div>
              </div>
              <button
                className="notif-view-all"
                onClick={() => {
                  setIsNotificationsOpen(false);
                  if (onOpenAlerts) onOpenAlerts();
                }}
              >
                Open Full Alerts Center &rarr;
              </button>
            </div>
          )}
        </div>

        {/* User Profile Pill directly beside left of Time */}
        <div className="header-user-profile-pill">
          <div className="header-user-avatar">
            <span>{currentUser?.avatar || (currentUser?.role === 'citizen' ? 'PU' : 'OF')}</span>
            <span className="user-online-dot" />
          </div>
          <div className="header-user-details">
            <span className="header-user-fullname">
              {currentUser?.name || (currentUser?.role === 'citizen' ? 'Public User #8204' : 'Officer #4102')}
            </span>
            <span className="header-user-sub">
              {currentUser?.department || (currentUser?.role === 'citizen' ? 'Civic Safety Network' : 'Disaster Control Desk')}
            </span>
          </div>
          {onLogout && (
            <button
              type="button"
              className="header-logout-quick-btn"
              onClick={onLogout}
              title="Switch Account / Sign Out"
              aria-label="Switch Account / Sign Out"
            >
              <LogOutIcon size={13} color="#64748b" />
            </button>
          )}
        </div>

        {/* Current Date & Time Display */}
        <div className="datetime-display">
          <div className="time-text">{currentTime || '10:24 AM'}</div>
          <div className="date-text">{currentDate || '26 Aug 2025'}</div>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
