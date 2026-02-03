import React, { useState } from 'react';
import { useBDDData } from '../hooks/useBDDData';
import BDDViewer from './BDDViewer';
import type { RoadmapItem } from '../types/roadmap';

interface BDDSummaryProps {
  roadId: string;
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function BDDSummary({ roadId }: BDDSummaryProps): JSX.Element {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const {
    tests,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    matchedCount,
    totalResults,
    getTestsByRoadId
  } = useBDDData();

  const roadTests = getTestsByRoadId(roadId);

  if (loading) {
    return (
      <div className="bdd-summary loading">
        <span>Loading BDD tests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bdd-summary error">
        <span>⚠️ Error loading tests</span>
      </div>
    );
  }

  if (roadTests.length === 0) {
    return (
      <div className="bdd-summary empty">
        <div className="bdd-summary-header">
          <span className="bdd-summary-icon">🧪</span>
          <span className="bdd-summary-title">BDD Tests</span>
        </div>
        <p className="bdd-summary-not-tested">Not tested</p>
        <p className="bdd-summary-hint">Run BDD tests to see results</p>
      </div>
    );
  }

  // Calculate totals across all BDD files for this ROAD item
  const totalScenarios = roadTests.reduce((sum, t) => sum + t.scenarios.length, 0);
  const totalPassed = roadTests.reduce((sum, t) => sum + t.summary.passed, 0);
  const totalFailed = roadTests.reduce((sum, t) => sum + t.summary.failed, 0);
  const totalPending = roadTests.reduce((sum, t) => sum + t.summary.pending, 0);

  // Get latest run time
  const lastRun = roadTests.reduce((latest, t) => 
    new Date(t.lastRun) > new Date(latest) ? t.lastRun : latest,
    roadTests[0].lastRun
  );

  return (
    <>
      <div className="bdd-summary">
        <div className="bdd-summary-header">
          <span className="bdd-summary-icon">🧪</span>
          <span className="bdd-summary-title">BDD Tests</span>
        </div>

        <div className="bdd-summary-files">
          {roadTests.map((test, idx) => (
            <div key={idx} className="bdd-summary-file">
              <code className="bdd-summary-filename">
                {test.file.split('/').pop()}
              </code>
            </div>
          ))}
        </div>

        <div className="bdd-summary-stats">
          <span className="bdd-stat-total">{totalScenarios} scenarios</span>
          {totalPassed > 0 && (
            <span className="bdd-stat-passed">{totalPassed}✓</span>
          )}
          {totalFailed > 0 && (
            <span className="bdd-stat-failed">{totalFailed}✗</span>
          )}
          {totalPending > 0 && (
            <span className="bdd-stat-pending">{totalPending}○</span>
          )}
        </div>

        <div className="bdd-summary-meta">
          <span className="bdd-summary-last-run">
            Last run: {formatRelativeTime(lastRun)}
          </span>
        </div>

        <button 
          className="bdd-summary-button"
          onClick={() => setIsViewerOpen(true)}
        >
          View Test Details
        </button>
      </div>

      <BDDViewer
        tests={roadTests}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        matchedCount={matchedCount}
        totalCount={totalResults}
      />
    </>
  );
}
