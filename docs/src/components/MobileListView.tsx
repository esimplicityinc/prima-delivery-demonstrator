import React from 'react';
import RoadmapCard from './RoadmapCard';
import type { RoadmapItem } from '../types/roadmap';

interface MobileListViewProps {
  items: RoadmapItem[];
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
}

export default function MobileListView({ items, expandedItems, onToggleExpand }: MobileListViewProps): JSX.Element {
  if (items.length === 0) {
    return (
      <div className="mobile-list-empty">
        No roadmap items match your filters.
      </div>
    );
  }

  return (
    <div className="mobile-list-view">
      {items.map(item => (
        <RoadmapCard
          key={item.id}
          item={item}
          isExpanded={expandedItems.has(item.id)}
          onToggle={() => onToggleExpand(item.id)}
          isMobile={true}
        />
      ))}
    </div>
  );
}
