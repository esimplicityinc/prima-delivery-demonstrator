---
id: ROAD-XXX
title: "Feature Title"
status: proposed  # proposed | adr_validated | bdd_pending | bdd_complete | implementing | nfr_validating | nfr_blocked | complete
phase: 1
priority: high  # high | medium | low
created: YYYY-MM-DD
updated: YYYY-MM-DD
started: ""      # Date when status changed to implementing
completed: ""    # Date when status changed to complete
depends_on: []   # List of ROAD-XXX IDs this item depends on
blocked_by: []   # List of ROAD-XXX IDs currently blocking this item
blocks: []       # List of ROAD-XXX IDs this item blocks
governance:
  adrs:
    validated: false
    validated_by: ""
    validated_at: ""
    compliance_check: []  # Array of {adr: "ADR-XXX", compliant: boolean, notes: ""}
  bdd:
    status: draft  # draft | approved
    approved_by: []  # Array of {agent: "@bdd-writer", timestamp: ""}
    test_results:
      total: 0
      passed: 0
      failed: 0
      coverage: "0%"
  nfrs:
    applicable: []  # List of NFR-XXX IDs that apply to this feature
    status: pending  # pending | validating | pass | fail
    results: {}  # Map of NFR-ID to {status, evidence, validated_by, timestamp}
---

# ROAD-XXX: Feature Title

## Overview

Brief description of what this roadmap item accomplishes.

## Status

**Status**: Proposed  
**Phase**: 1  
**Priority**: High  
**Created**: YYYY-MM-DD

### Status Workflow

```
proposed → adr_validated → bdd_pending → bdd_complete → implementing → nfr_validating → complete
                                                                     ↘ nfr_blocked (if NFR fails)
```

| Status | Description |
|--------|-------------|
| `proposed` | Initial state, requirements being defined |
| `adr_validated` | Architecture decisions reviewed and approved |
| `bdd_pending` | BDD scenarios written, awaiting approval |
| `bdd_complete` | BDD scenarios approved, ready for implementation |
| `implementing` | Active development in progress |
| `nfr_validating` | Implementation complete, validating NFRs |
| `nfr_blocked` | NFR validation failed, needs remediation |
| `complete` | All checks passed, feature delivered |

## Goals

- Goal 1
- Goal 2
- Goal 3

## Requirements

### Functional Requirements

1. Requirement 1
2. Requirement 2

### Non-Functional Requirements

- Performance: Response time < 200ms
- Security: Authentication required
- Accessibility: WCAG 2.1 AA compliant

## Dependencies

**Requires:**
- ROAD-YYY

**Enables:**
- ROAD-ZZZ

## Implementation Plan

1. Step 1
2. Step 2
3. Step 3

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Notes

Additional context, decisions, or considerations.
