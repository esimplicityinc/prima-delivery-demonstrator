import React from 'react';
import type { RoadmapItem } from '../types/roadmap';
import styles from './RoadmapStats.module.css';

interface RoadmapStatsProps {
  items: RoadmapItem[];
}

export default function RoadmapStats({ items }: RoadmapStatsProps): JSX.Element {
  const total = items.length;
  const complete = items.filter(i => i.status === 'complete').length;
  const inProgress = items.filter(i => 
    ['implementing', 'nfr_validating', 'bdd_pending', 'bdd_complete'].includes(i.status)
  ).length;
  const blocked = items.filter(i => i.status === 'nfr_blocked').length;
  const proposed = items.filter(i => i.status === 'proposed').length;
  
  const progress = total > 0 ? Math.round((complete / total) * 100) : 0;

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statItem}>
        <span className={styles.statValue}>{total}</span>
        <span className={styles.statLabel}>Total</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statValue} style={{ color: '#10b981' }}>{complete}</span>
        <span className={styles.statLabel}>Complete</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statValue} style={{ color: '#f59e0b' }}>{inProgress}</span>
        <span className={styles.statLabel}>In Progress</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statValue} style={{ color: '#ef4444' }}>{blocked}</span>
        <span className={styles.statLabel}>Blocked</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statValue} style={{ color: '#6b7280' }}>{proposed}</span>
        <span className={styles.statLabel}>Proposed</span>
      </div>
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressText}>{progress}% Complete</span>
      </div>
    </div>
  );
}
