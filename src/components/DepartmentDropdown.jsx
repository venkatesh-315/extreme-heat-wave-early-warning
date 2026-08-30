import React, { useState, useRef, useEffect } from 'react';
import { Building2Icon, ChevronDownIcon, CheckIcon } from './icons';
import './DepartmentDropdown.css';

export default function DepartmentDropdown({
  options = [],
  value,
  onChange,
  id = 'auth-department',
  icon = <Building2Icon size={17} color="#64748b" />,
  accentColor = 'authority', // 'authority' | 'citizen'
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Set initial highlighted index on open
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => opt === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, options, value]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.custom-select-option');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (option) => {
    if (onChange) {
      onChange(option);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < options.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : options.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && options[highlightedIndex]) {
        handleSelect(options[highlightedIndex]);
      }
    }
  };

  return (
    <div
      className={`custom-select-container ${accentColor} ${isOpen ? 'is-open' : ''} ${
        disabled ? 'is-disabled' : ''
      }`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Box matching input style */}
      <button
        id={id}
        type="button"
        className="custom-select-trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="custom-select-icon">{icon}</span>
        <span className="custom-select-value">{value || 'Select option...'}</span>
        <span className={`custom-select-arrow ${isOpen ? 'rotated' : ''}`}>
          <ChevronDownIcon size={16} />
        </span>
      </button>

      {/* Clean Dropdown Popover */}
      {isOpen && (
        <div className="custom-select-dropdown animate-fade-in" role="listbox" ref={listRef}>
          {options.map((option, index) => {
            const isSelected = option === value;
            const isHighlighted = highlightedIndex === index;

            return (
              <div
                key={option}
                className={`custom-select-option ${isSelected ? 'selected' : ''} ${
                  isHighlighted ? 'highlighted' : ''
                }`}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
                aria-selected={isSelected}
              >
                <span className="option-text">{option}</span>
                {isSelected && (
                  <span className="option-check">
                    <CheckIcon size={15} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
