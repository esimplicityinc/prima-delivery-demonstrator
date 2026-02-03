import React from 'react';
import type { FilterState } from '../types/roadmap';
import styles from './RoadmapFilter.module.css';

interface RoadmapFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isMobile?: boolean;
}

const statuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'adr_validated', label: 'ADR Validated' },
  { value: 'bdd_pending', label: 'BDD Pending' },
  { value: 'bdd_complete', label: 'BDD Complete' },
  { value: 'implementing', label: 'Implementing' },
  { value: 'nfr_validating', label: 'NFR Validating' },
  { value: 'nfr_blocked', label: 'NFR Blocked' },
  { value: 'complete', label: 'Complete' },
];

const phases = [
  { value: 'all', label: 'All Phases' },
  { value: '0', label: 'Phase 0: Foundation' },
  { value: '1', label: 'Phase 1: Bot Identity' },
  { value: '2', label: 'Phase 2: Promise Market' },
  { value: '3', label: 'Phase 3: Settlement' },
];

const governanceFilters = [
  { value: 'all', label: 'All Items' },
  { value: 'adr_pending', label: 'ADR Pending' },
  { value: 'bdd_pending', label: 'BDD Pending' },
  { value: 'nfr_pending', label: 'NFR Pending' },
];

// Search icon SVG
const SearchIcon = () => (
  <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export default function RoadmapFilter({ filters, onFilterChange, isMobile }: RoadmapFilterProps): JSX.Element {
  const handleChange = (field: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleClear = () => {
    onFilterChange({
      search: '',
      status: 'all',
      phase: 'all',
      governanceFilter: 'all',
    });
  };

  if (isMobile) {
    return (
      <div className={styles.mobileFilter}>
        <div className={styles.mobileSearch}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className={styles.mobileSelect}
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.phase}
          onChange={(e) => handleChange('phase', e.target.value)}
          className={styles.mobileSelect}
        >
          {phases.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={styles.filterContainer}>
      <div className={styles.searchWrapper}>
        <SearchIcon />
        <input
          type="text"
          placeholder="Search by ID or title..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.filterGroup}>
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className={styles.filterSelect}
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      
      <div className={styles.filterGroup}>
        <select
          value={filters.phase}
          onChange={(e) => handleChange('phase', e.target.value)}
          className={styles.filterSelect}
        >
          {phases.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      
      <div className={styles.filterGroup}>
        <select
          value={filters.governanceFilter}
          onChange={(e) => handleChange('governanceFilter', e.target.value)}
          className={styles.filterSelect}
        >
          {governanceFilters.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>
      
      <button onClick={handleClear} className="button button--sm button--secondary">
        Clear Filters
      </button>
    </div>
  );
}
