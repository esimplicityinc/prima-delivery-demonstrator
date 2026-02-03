import React, { useState } from 'react';
import type { BDDFile, BDDScenario } from '../types/bdd';
import SearchBDD from './SearchBDD';

interface BDDViewerProps {
  tests: BDDFile[];
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  matchedCount: number;
  totalCount: number;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function highlightText(text: string, query: string): JSX.Element {
  if (!query) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bdd-highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function ScenarioAccordion({ 
  scenario, 
  query,
  isOpen,
  onToggle
}: { 
  scenario: BDDScenario; 
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [showError, setShowError] = useState(false);

  const statusEmoji = {
    passed: '✓',
    failed: '✗',
    pending: '○'
  }[scenario.status];

  const statusClass = `status-${scenario.status}`;

  const matchesQuery = query && (
    scenario.name.toLowerCase().includes(query.toLowerCase()) ||
    scenario.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className={`bdd-scenario ${matchesQuery ? 'bdd-scenario-matched' : ''}`}>
      <button 
        className="bdd-scenario-header"
        onClick={onToggle}
      >
        <span className="bdd-scenario-toggle">{isOpen ? '▼' : '▶'}</span>
        <span className={`bdd-scenario-status ${statusClass}`}>
          {statusEmoji}
        </span>
        <span className="bdd-scenario-name">
          {highlightText(scenario.name, query)}
        </span>
        {scenario.duration && (
          <span className="bdd-scenario-duration">{scenario.duration}</span>
        )}
      </button>

      {isOpen && (
        <div className="bdd-scenario-content">
          {scenario.tags.length > 0 && (
            <div className="bdd-scenario-tags">
              {scenario.tags.map(tag => (
                <span key={tag} className="bdd-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="bdd-steps">
            {scenario.steps.map((step, idx) => (
              <div key={idx} className={`bdd-step ${step.keyword.toLowerCase().trim()}`}>
                <span className="bdd-step-keyword">{step.keyword}</span>
                <span className="bdd-step-text">{step.text}</span>
              </div>
            ))}
          </div>

          {scenario.error && (
            <div className="bdd-error">
              <button 
                className="bdd-error-toggle"
                onClick={() => setShowError(!showError)}
              >
                {showError ? '▼' : '▶'} Error Details
              </button>
              {showError && (
                <pre className="bdd-error-message">{scenario.error}</pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BDDViewer({
  tests,
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  matchedCount,
  totalCount
}: BDDViewerProps): JSX.Element | null {
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleScenario = (scenarioId: string) => {
    setExpandedScenarios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scenarioId)) {
        newSet.delete(scenarioId);
      } else {
        newSet.add(scenarioId);
      }
      return newSet;
    });
  };

  // Calculate totals
  const totalScenarios = tests.reduce((sum, t) => sum + t.scenarios.length, 0);
  const totalPassed = tests.reduce((sum, t) => sum + t.summary.passed, 0);
  const totalFailed = tests.reduce((sum, t) => sum + t.summary.failed, 0);
  const totalPending = tests.reduce((sum, t) => sum + t.summary.pending, 0);

  // Get latest run time
  const lastRun = tests.length > 0 
    ? tests.reduce((latest, t) => 
        new Date(t.lastRun) > new Date(latest) ? t.lastRun : latest,
        tests[0].lastRun
      )
    : null;

  return (
    <div className="bdd-viewer-overlay" onClick={onClose}>
      <div className="bdd-viewer-modal" onClick={e => e.stopPropagation()}>
        <div className="bdd-viewer-header">
          <h2>BDD Tests</h2>
          <button className="bdd-viewer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="bdd-viewer-search">
          <SearchBDD
            value={searchQuery}
            onChange={onSearchChange}
            matchedCount={matchedCount}
            totalCount={totalCount}
          />
        </div>

        <div className="bdd-viewer-summary">
          <span className="bdd-summary-item">
            {totalScenarios} scenarios
          </span>
          <span className="bdd-summary-item passed">
            {totalPassed} passed
          </span>
          <span className="bdd-summary-item failed">
            {totalFailed} failed
          </span>
          <span className="bdd-summary-item pending">
            {totalPending} pending
          </span>
          {lastRun && (
            <span className="bdd-summary-item">
              Last run: {formatDate(lastRun)}
            </span>
          )}
        </div>

        <div className="bdd-viewer-content">
          {tests.length === 0 ? (
            <div className="bdd-empty">
              <p>No BDD tests found for this roadmap item.</p>
            </div>
          ) : (
            tests.map((test, testIdx) => (
              <div key={testIdx} className="bdd-file">
                <div className="bdd-file-header">
                  <h3>{test.feature}</h3>
                  <code className="bdd-file-path">{test.file}</code>
                  {test.tags.length > 0 && (
                    <div className="bdd-file-tags">
                      {test.tags.map(tag => (
                        <span key={tag} className="bdd-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {test.description && (
                  <p className="bdd-file-description">{test.description}</p>
                )}

                <div className="bdd-scenarios">
                  {test.scenarios.map((scenario, scenarioIdx) => {
                    const scenarioId = `${testIdx}-${scenarioIdx}`;
                    return (
                      <ScenarioAccordion
                        key={scenarioId}
                        scenario={scenario}
                        query={searchQuery}
                        isOpen={expandedScenarios.has(scenarioId)}
                        onToggle={() => toggleScenario(scenarioId)}
                      />
                    );
                  })}
                </div>

                <div className="bdd-file-summary">
                  {test.summary.passed} passed, {test.summary.failed} failed, {test.summary.pending} pending
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
