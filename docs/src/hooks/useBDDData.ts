import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BDDFile, BDDScenario } from '../types/bdd';

interface UseBDDDataReturn {
  tests: BDDFile[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: BDDScenario[];
  totalResults: number;
  matchedCount: number;
  getTestsByRoadId: (roadId: string) => BDDFile[];
}

export function useBDDData(): UseBDDDataReturn {
  const [tests, setTests] = useState<BDDFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.toLowerCase());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load BDD data
  useEffect(() => {
    async function loadBDDData() {
      try {
        const response = await fetch('/bdd-data.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setTests(data.tests || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load BDD data');
        setLoading(false);
      }
    }

    loadBDDData();
  }, []);

  // Search scenarios
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];

    const results: BDDScenario[] = [];
    
    for (const test of tests) {
      for (const scenario of test.scenarios) {
        const searchableText = `${scenario.name} ${scenario.tags.join(' ')}`.toLowerCase();
        if (searchableText.includes(debouncedQuery)) {
          results.push({
            ...scenario,
            // Add parent file info for context
            _parentFile: test.file,
            _parentFeature: test.feature
          } as BDDScenario & { _parentFile: string; _parentFeature: string });
        }
      }
    }

    return results;
  }, [debouncedQuery, tests]);

  // Get total scenarios count
  const totalResults = useMemo(() => {
    return tests.reduce((total, test) => total + test.scenarios.length, 0);
  }, [tests]);

  // Get matched count
  const matchedCount = debouncedQuery ? searchResults.length : totalResults;

  // Get tests by ROAD ID
  const getTestsByRoadId = useCallback((roadId: string): BDDFile[] => {
    return tests.filter(test => 
      test.tags.some(tag => tag.toLowerCase() === `@${roadId.toLowerCase()}`)
    );
  }, [tests]);

  return {
    tests,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults: debouncedQuery ? searchResults : [],
    totalResults,
    matchedCount,
    getTestsByRoadId
  };
}
