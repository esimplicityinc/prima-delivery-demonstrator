import React from 'react';
import Link from '@docusaurus/Link';
import type { RoadmapItem } from '../types/roadmap';
import BDDSummary from './BDDSummary';
import styles from './RoadmapCard.module.css';

interface RoadmapCardProps {
  item: RoadmapItem;
  isExpanded?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  proposed: { label: 'Proposed', color: '#6b7280' },
  adr_validated: { label: 'ADR Validated', color: '#3b82f6' },
  bdd_pending: { label: 'BDD Pending', color: '#8b5cf6' },
  bdd_complete: { label: 'BDD Complete', color: '#10b981' },
  implementing: { label: 'Implementing', color: '#f59e0b' },
  nfr_validating: { label: 'NFR Validating', color: '#f97316' },
  nfr_blocked: { label: 'NFR Blocked', color: '#ef4444' },
  complete: { label: 'Complete', color: '#10b981' },
};

// Status icon SVG components
const StatusDot = ({ color }: { color: string }) => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    <circle cx="6" cy="6" r="5" fill={color} />
  </svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CircleIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default function RoadmapCard({ item, isExpanded, onToggle, isMobile }: RoadmapCardProps): JSX.Element {
  const status = statusConfig[item.status] || statusConfig.proposed;
  
  const getGovernanceIcon = (type: 'adr' | 'bdd' | 'nfr') => {
    const isComplete = type === 'adr' 
      ? item.governance.adrs.validated 
      : type === 'bdd' 
        ? item.governance.bdd.status === 'approved'
        : item.governance.nfrs.status === 'pass';
    
    return isComplete 
      ? <CheckIcon color="#10b981" />
      : <CircleIcon color="#9ca3af" />;
  };

  const getGovernanceColor = (type: 'adr' | 'bdd' | 'nfr') => {
    switch (type) {
      case 'adr':
        return item.governance.adrs.validated ? '#10b981' : '#9ca3af';
      case 'bdd':
        return item.governance.bdd.status === 'approved' ? '#10b981' : '#9ca3af';
      case 'nfr':
        return item.governance.nfrs.status === 'pass' ? '#10b981' : '#9ca3af';
    }
  };

  const planUrl = `/docs/${item.filePath.replace('.md', '')}`;

  if (isMobile) {
    return (
      <div className={styles.roadmapCardMobile} style={{ borderLeft: `4px solid ${status.color}` }}>
        <div className={styles.mobileHeader} onClick={onToggle}>
          <div className={styles.statusIcon} style={{ backgroundColor: `${status.color}20` }}>
            <StatusDot color={status.color} />
          </div>
          <div className={styles.mobileTitleGroup}>
            <div className={styles.mobileId}>{item.id}</div>
            <div className={styles.mobileTitle}>{item.title}</div>
          </div>
          <span className={styles.toggleIcon}>{isExpanded ? '▼' : '▶'}</span>
        </div>
        
        {isExpanded && (
          <div className={styles.mobileDetails}>
            <div className={styles.mobileStatus} style={{ color: status.color }}>
              {status.label}
            </div>
            
            <div className={styles.mobileGovernance}>
              <span style={{ color: getGovernanceColor('adr'), display: 'flex', alignItems: 'center', gap: '4px' }}>
                ADR {getGovernanceIcon('adr')}
              </span>
              <span style={{ color: getGovernanceColor('bdd'), display: 'flex', alignItems: 'center', gap: '4px' }}>
                BDD {getGovernanceIcon('bdd')}
              </span>
              <span style={{ color: getGovernanceColor('nfr'), display: 'flex', alignItems: 'center', gap: '4px' }}>
                NFR {getGovernanceIcon('nfr')}
              </span>
            </div>
            
            {(item.blocked_by && item.blocked_by.length > 0) && (
              <div className={styles.mobileBlocked}>
                <strong>Blocked by:</strong> {item.blocked_by.join(', ')}
              </div>
            )}

            <BDDSummary roadId={item.id} />
            
            <Link to={planUrl} className={styles.viewLink}>
              View Plan →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.roadmapCard} style={{ borderLeft: `4px solid ${status.color}` }}>
      <div className={styles.roadmapCardHeader}>
        <div className={styles.statusIcon} style={{ backgroundColor: `${status.color}20` }}>
          <StatusDot color={status.color} />
        </div>
        <div className={styles.roadmapCardContent}>
          <div className={styles.roadmapCardId}>{item.id}</div>
          <Link to={planUrl} className={styles.roadmapCardTitleLink}>
            <div className={styles.roadmapCardTitle}>{item.title}</div>
          </Link>
          
          <div className={styles.roadmapCardMeta}>
            <span className={styles.statusBadge} style={{ color: status.color, backgroundColor: `${status.color}15` }}>
              {status.label}
            </span>
            
            <div className={styles.governanceBadges}>
              <span 
                className={styles.governanceBadge}
                style={{ color: getGovernanceColor('adr') }}
                title="ADR Validation"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ADR {getGovernanceIcon('adr')}
                </span>
              </span>
              <span 
                className={styles.governanceBadge}
                style={{ color: getGovernanceColor('bdd') }}
                title="BDD Approval"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  BDD {getGovernanceIcon('bdd')}
                </span>
              </span>
              <span 
                className={styles.governanceBadge}
                style={{ color: getGovernanceColor('nfr') }}
                title="NFR Status"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  NFR {getGovernanceIcon('nfr')}
                </span>
              </span>
            </div>
          </div>
          
          {(item.blocked_by && item.blocked_by.length > 0) && (
            <div className={styles.blockedSection}>
              <span className={styles.blockedLabel}>Blocked by:</span>
              {item.blocked_by.map(blocker => (
                <span key={blocker} className={styles.blockedItem}>{blocker}</span>
              ))}
            </div>
          )}
          
          {(item.blocks && item.blocks.length > 0) && (
            <div className={styles.blocksSection}>
              <span className={styles.blocksLabel}>Blocks:</span>
              {item.blocks.map(blocked => (
                <span key={blocked} className={styles.blocksItem}>{blocked}</span>
              ))}
            </div>
          )}

          <BDDSummary roadId={item.id} />
        </div>
      </div>
    </div>
  );
}
