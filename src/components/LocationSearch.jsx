import React, { useState, useRef, useEffect } from 'react';
import './LocationSearch.css';

function LocationSearch({ cities, onSelect, isCalculating, selectedCity }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = cities.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q)
    ).slice(0, 6);
    setSuggestions(filtered);
    setHighlighted(-1);
  }, [query, cities]);

  const handleSelect = (city) => {
    setQuery(city.name);
    setSuggestions([]);
    setFocused(false);
    onSelect(city);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      handleSelect(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  return (
    <div className="search-container">
      <div className={`search-box ${focused ? 'focused' : ''} ${isCalculating ? 'calculating' : ''}`}>
        <span className="search-icon">📍</span>
        <input
          ref={inputRef}
          id="city-search-input"
          type="text"
          placeholder="Search city / district (e.g. Delhi, Nagpur, Ahmedabad...)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]); }, 200)}
          onKeyDown={handleKeyDown}
          disabled={isCalculating}
          autoComplete="off"
        />
        {isCalculating && <div className="search-spinner" />}
        {!isCalculating && query && (
          <button className="search-clear" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}>✕</button>
        )}
      </div>

      {suggestions.length > 0 && focused && (
        <div className="search-dropdown">
          <div className="dropdown-header">Select a city</div>
          {suggestions.map((city, i) => (
            <button
              key={city.id}
              id={`city-option-${city.id}`}
              className={`dropdown-item ${highlighted === i ? 'highlighted' : ''}`}
              onClick={() => handleSelect(city)}
            >
              <div className="dropdown-city-info">
                <span className="dropdown-city-icon">🏙️</span>
                <div>
                  <span className="dropdown-city-name">{city.name}</span>
                  <span className="dropdown-city-state">{city.state}</span>
                </div>
              </div>
              <span className="dropdown-city-pop">
                {(city.population / 1e6).toFixed(1)}M
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick city chips */}
      <div className="quick-cities">
        <span className="quick-label">Quick select:</span>
        {cities.slice(0, 5).map(city => (
          <button
            key={city.id}
            id={`quick-city-${city.id}`}
            className={`city-chip ${selectedCity?.id === city.id ? 'active' : ''}`}
            onClick={() => handleSelect(city)}
            disabled={isCalculating}
          >
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocationSearch;
