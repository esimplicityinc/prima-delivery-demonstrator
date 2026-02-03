import React from 'react';
import RoadmapCard from './RoadmapCard';
import type { RoadmapItem } from '../types/roadmap';

interface TimelineViewProps {
  items: RoadmapItem[];
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
}

export default function TimelineView({ items, expandedItems, onToggleExpand }: TimelineViewProps): JSX.Element {
  // Group items by phase
  const phaseMap = new Map<number, RoadmapItem[]>();
  
  items.forEach(item => {
    const phase = item.phase || 1;
    if (!phaseMap.has(phase)) {
      phaseMap.set(phase, []);
    }
    phaseMap.get(phase)!.push(item);
  });
  
  // Sort phases
  const sortedPhases = Array.from(phaseMap.entries()).sort((a, b) => a[0] - b[0]);
  
  const phaseNames: Record<number, string> = {
    0: 'Phase 0: Foundation',
    1: 'Phase 1: Bot Identity & Authentication',
    2: 'Phase 2: Promise Market',
    3: 'Phase 3: Settlement & Verification',
  };

  return (
    <div className="timeline-view">
      {sortedPhases.map(([phase, phaseItems]) => {
        const complete = phaseItems.filter(i => i.status === 'complete').length;
        const progress = phaseItems.length > 0 ? Math.round((complete / phaseItems.length) * 100) : 0;
        
        return (
          <div key={phase} className="timeline-phase">
            <div className="timeline-phase-header">
              <h3>{phaseNames[phase] || `Phase ${phase}`}</h3>
              <div className="timeline-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span>{progress}%</span>
              </div>
            </div>
            <div className="timeline-phase-content">
              {phaseItems.map(item => (
                <RoadmapCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedItems.has(item.id)}
                  onToggle={() => onToggleExpand(item.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
