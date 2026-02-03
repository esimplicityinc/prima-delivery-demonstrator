import React, { useState, useEffect } from 'react';

interface SearchBDDProps {
  value: string;
  onChange: (value: string) => void;
  matchedCount: number;
  totalCount: number;
  placeholder?: string;
}

export default function SearchBDD({
  value,
  onChange,
  matchedCount,
  totalCount,
  placeholder = "Search scenarios..."
}: SearchBDDProps): JSX.Element {
  const [isSearching, setIsSearching] = useState(false);

  // Show searching indicator during debounce
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="bdd-search">
      <div className="bdd-search-input-wrapper">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bdd-search-input"
        />
        {value && (
          <button
            onClick={handleClear}
            className="bdd-search-clear"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="bdd-search-stats">
        {isSearching ? (
          <span className="bdd-search-loading">Searching...</span>
        ) : value ? (
          <span className="bdd-search-matches">
            {matchedCount} of {totalCount} scenarios
          </span>
        ) : (
          <span className="bdd-search-total">
            {totalCount} scenarios
          </span>
        )}
      </div>
    </div>
  );
}
