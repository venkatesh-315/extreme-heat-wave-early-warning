import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchLocations, reverseGeocode, CURATED_INDIAN_LOCATIONS } from '../services/geocodingService';
import './LocationSearch.css';

function LocationSearch({ onSelect, isCalculating, selectedLocation }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [gpsError, setGpsError] = useState(null);

  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced real-world geocoding search
  const performSearch = useCallback(async (text) => {
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocations(text);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setGpsError(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(val);
      }, 280);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (location) => {
    setQuery(location.formattedAddress || location.name);
    setSuggestions([]);
    setIsOpen(false);
    setHighlighted(-1);
    onSelect(location);
  };

  // GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const loc = await reverseGeocode(latitude, longitude);
          handleSelectLocation(loc);
        } catch {
          setGpsError('Unable to reverse geocode GPS location.');
        } finally {
          setIsLocatingGps(false);
        }
      },
      () => {
        setIsLocatingGps(false);
        setGpsError('Location permission denied or unavailable. Please search manually.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && suggestions[highlighted]) {
        handleSelectLocation(suggestions[highlighted]);
      } else if (suggestions.length > 0) {
        handleSelectLocation(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Top Summer 2026 Hotspots for instant 1-click test
  const quickHotspots = CURATED_INDIAN_LOCATIONS.filter((l) => l.isHotspot).slice(0, 6);

  return (
    <div className="search-widget" ref={containerRef}>
      <div className="search-main-row">
        <div className={`search-input-wrapper ${isOpen ? 'dropdown-open' : ''} ${isCalculating ? 'calculating' : ''}`}>
          <span className="search-icon-left">📍</span>

          <input
            ref={inputRef}
            id="location-search-input"
            type="text"
            className="search-input"
            placeholder="Search any Indian city, district, town, or locality (e.g. Rohini Delhi, Phalodi, Nagpur, Hyderabad...)"
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            disabled={isCalculating || isLocatingGps}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
          />

          {isSearching && <div className="search-spinner animate-spin" />}

          {!isSearching && query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}

          <button
            type="button"
            className={`locate-me-btn ${isLocatingGps ? 'locating' : ''}`}
            onClick={handleLocateMe}
            disabled={isCalculating || isLocatingGps}
            title="Use current GPS location"
          >
            {isLocatingGps ? (
              <>
                <span className="mini-spin animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>Locate Me</span>
              </>
            )}
          </button>
        </div>

        {/* Auto-suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="suggestions-dropdown card">
            <div className="dropdown-meta-header">
              <span>Matching Locations in India</span>
              <span>{suggestions.length} results</span>
            </div>

            <ul className="suggestions-list" role="listbox">
              {suggestions.map((item, index) => (
                <li
                  key={item.id || index}
                  id={`suggestion-item-${index}`}
                  role="option"
                  aria-selected={highlighted === index}
                  className={`suggestion-item ${highlighted === index ? 'active' : ''}`}
                  onClick={() => handleSelectLocation(item)}
                >
                  <div className="suggestion-icon-wrap">
                    <span>{item.isLiveOsm ? '🗺️' : '🏙️'}</span>
                  </div>
                  <div className="suggestion-details">
                    <span className="suggestion-name">{item.name}</span>
                    <span className="suggestion-address">{item.formattedAddress || `${item.district}, ${item.state}`}</span>
                  </div>
                  <div className="suggestion-coords">
                    <span>{item.lat.toFixed(3)}°N, {item.lon.toFixed(3)}°E</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {gpsError && (
        <div className="gps-error-alert">
          ⚠️ {gpsError}
        </div>
      )}

      {/* Quick Select Hotspot Chips */}
      <div className="hotspots-strip">
        <span className="hotspots-title">Summer 2026 Heatwave Hotspots:</span>
        <div className="hotspots-pills">
          {quickHotspots.map((city) => (
            <button
              key={city.id}
              id={`quick-hotspot-${city.id}`}
              className={`hotspot-pill ${selectedLocation?.id === city.id ? 'active' : ''}`}
              onClick={() => handleSelectLocation(city)}
              disabled={isCalculating}
            >
              <span className="pill-dot" />
              <span>{city.name}</span>
              <span className="pill-state">({city.state})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LocationSearch;
