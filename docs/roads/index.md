---
title: Roadmap Items
---

# Roadmap Items

All roadmap items with tracking and governance.

## Organization

Roadmap items are organized by phase or category:

- **Phase 0**: Foundation
- **Phase 1**: Core Features
- **Phase 2**: Advanced Features
- **Phase 3**: Future Enhancements

## Item Format

Each roadmap item follows a structured format with governance tracking:

```yaml
---
id: ROAD-XXX
title: "Feature Title"
status: proposed  # See status workflow below
phase: 1
priority: high  # high | medium | low
governance:
  adrs:
    validated: false
  bdd:
    status: draft  # draft | approved
  nfrs:
    applicable: []
    status: pending
---
```

## Status Workflow

Roadmap items progress through a governance-driven workflow:

```
proposed → adr_validated → bdd_pending → bdd_complete → implementing → nfr_validating → complete
                                                                     ↘ nfr_blocked
```

| Status | Description | Next Step |
|--------|-------------|-----------|
| `proposed` | Requirements being defined | Get ADR approval |
| `adr_validated` | Architecture approved | Write BDD scenarios |
| `bdd_pending` | BDD scenarios written | Get BDD approval |
| `bdd_complete` | BDD approved | Start implementation |
| `implementing` | Active development | Complete and validate NFRs |
| `nfr_validating` | Validating performance, security, accessibility | Pass all NFRs |
| `nfr_blocked` | NFR validation failed | Fix issues, re-validate |
| `complete` | All checks passed | Done! |

## Governance

Each road item includes governance checkpoints:

- **ADRs** - Architecture decisions must be validated before implementation begins
- **BDD Scenarios** - Test scenarios must be written and approved before coding
- **NFRs** - Non-functional requirements (performance, security, accessibility) validated after implementation

### Agent Responsibilities

| Agent | Role |
|-------|------|
| `@architecture-inspector` | Validates ADR compliance |
| `@bdd-writer` | Authors BDD scenarios |
| `@bdd-runner` | Executes and validates tests |
| `@code-writer` | Implements the feature |
| `@ci-runner` | Runs CI checks |
| `@ux-ui-inspector` | Reviews accessibility |

Browse road items by phase in the sidebar navigation.
