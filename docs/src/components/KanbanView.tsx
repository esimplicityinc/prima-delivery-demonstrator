import React from 'react';
import RoadmapCard from './RoadmapCard';
import type { RoadmapItem } from '../types/roadmap';
import styles from './KanbanView.module.css';

interface KanbanViewProps {
  items: RoadmapItem[];
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
}

const columns = [
  { 
    key: 'proposed', 
    title: 'Proposed', 
    statuses: ['proposed'],
    style: styles.columnProposed
  },
  { 
    key: 'in_progress', 
    title: 'In Progress', 
    statuses: ['adr_validated', 'bdd_pending', 'bdd_complete', 'implementing', 'nfr_validating'],
    style: styles.columnProgress
  },
  { 
    key: 'blocked', 
    title: 'Blocked', 
    statuses: ['nfr_blocked'],
    style: styles.columnBlocked
  },
  { 
    key: 'complete', 
    title: 'Complete', 
    statuses: ['complete'],
    style: styles.columnComplete
  },
];

export default function KanbanView({ items, expandedItems, onToggleExpand }: KanbanViewProps): JSX.Element {
  return (
    <div className={styles.kanbanView}>
      {columns.map(column => {
        const columnItems = items.filter(item => column.statuses.includes(item.status));
        
        return (
          <div key={column.key} className={`${styles.kanbanColumn} ${column.style}`}>
            <div className={styles.columnHeader}>
              <h3>{column.title}</h3>
              <span className={styles.countBadge}>{columnItems.length}</span>
            </div>
            <div className={styles.columnContent}>
              {columnItems.length === 0 ? (
                <div className={styles.emptyState}>No items</div>
              ) : (
                columnItems.map(item => (
                  <RoadmapCard
                    key={item.id}
                    item={item}
                    isExpanded={expandedItems.has(item.id)}
                    onToggle={() => onToggleExpand(item.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
