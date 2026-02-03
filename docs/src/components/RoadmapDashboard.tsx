import React, { useState, useEffect } from 'react';
import { useRoadmapItems, useFilteredItems } from '../hooks/useRoadmapItems';
import RoadmapFilter from './RoadmapFilter';
import RoadmapStats from './RoadmapStats';
import KanbanView from './KanbanView';
import TimelineView from './TimelineView';
import DependencyView from './DependencyView';
import MobileListView from './MobileListView';
import type { ViewMode, FilterState } from '../types/roadmap';
import styles from './RoadmapDashboard.module.css';

// Dashboard icon SVG
const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

export default function RoadmapDashboard(): JSX.Element {
  const { items, loading, error } = useRoadmapItems();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    phase: 'all',
    governanceFilter: 'all',
  });

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredItems = useFilteredItems(items, filters);

  const handleToggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>Loading roadmap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorMessage}>
          <h3>Error loading roadmap</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (isMobile) {
      return (
        <MobileListView
          items={filteredItems}
          expandedItems={expandedItems}
          onToggleExpand={handleToggleExpand}
        />
      );
    }

    switch (viewMode) {
      case 'kanban':
        return (
          <KanbanView
            items={filteredItems}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            items={filteredItems}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
          />
        );
      case 'dependencies':
        return <DependencyView items={filteredItems} />;
      default:
        return (
          <KanbanView
            items={filteredItems}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
          />
        );
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h2>
          <DashboardIcon />
          Roadmap Dashboard
        </h2>
        
        {!isMobile && (
          <div className={styles.viewTabs}>
            <button
              className={`${styles.viewTab} ${viewMode === 'kanban' ? styles.viewTabActive : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
            <button
              className={`${styles.viewTab} ${viewMode === 'timeline' ? styles.viewTabActive : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </button>
            <button
              className={`${styles.viewTab} ${viewMode === 'dependencies' ? styles.viewTabActive : ''}`}
              onClick={() => setViewMode('dependencies')}
            >
              Dependencies
            </button>
          </div>
        )}
      </div>

      <RoadmapStats items={filteredItems} />
      
      <RoadmapFilter
        filters={filters}
        onFilterChange={setFilters}
        isMobile={isMobile}
      />

      <div className={styles.content}>
        {renderView()}
      </div>

      <div className={styles.footer}>
        <p>
          Showing {filteredItems.length} of {items.length} roadmap items
        </p>
      </div>
    </div>
  );
}
