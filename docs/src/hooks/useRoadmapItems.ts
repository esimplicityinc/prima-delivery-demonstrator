import { useState, useEffect, useMemo } from 'react';
import type { RoadmapItem } from '../types/roadmap';

export function useRoadmapItems(): {
  items: RoadmapItem[];
  loading: boolean;
  error: string | null;
} {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoadmapData() {
      try {
        // Fetch the generated JSON file
        const response = await fetch('/roadmap-data.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setItems(data.items || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error loading roadmap data');
        setLoading(false);
      }
    }

    loadRoadmapData();
  }, []);

  return { items, loading, error };
}

export function useFilteredItems(
  items: RoadmapItem[],
  filters: {
    search: string;
    status: string;
    phase: string;
    governanceFilter: string;
  }
): RoadmapItem[] {
  return useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          item.id.toLowerCase().includes(searchLower) ||
          item.title.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      // Phase filter
      if (filters.phase !== 'all' && item.phase !== parseInt(filters.phase)) {
        return false;
      }

      // Governance filter
      if (filters.governanceFilter !== 'all') {
        switch (filters.governanceFilter) {
          case 'adr_pending':
            if (item.governance?.adrs?.validated) return false;
            break;
          case 'bdd_pending':
            if (item.governance?.bdd?.status === 'approved') return false;
            break;
          case 'nfr_pending':
            if (item.governance?.nfrs?.status === 'pass') return false;
            break;
        }
      }

      return true;
    });
  }, [items, filters]);
}
