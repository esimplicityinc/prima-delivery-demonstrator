# Agent Workflow Specification

This document defines how agents collaborate to deliver features in the Prima Delivery Demonstrator project.

## Governance State Machine

All roadmap items follow this state progression:

```
proposed → adr_validated → bdd_pending → bdd_complete → implementing → nfr_validating → complete
                                                                     ↘ nfr_blocked
```

### State Definitions

| State | Description | Next States |
|-------|-------------|-------------|
| `proposed` | Initial state, awaiting ADR review | `adr_validated` |
| `adr_validated` | Architecture decision approved | `bdd_pending` |
| `bdd_pending` | Awaiting BDD scenario creation | `bdd_complete` |
| `bdd_complete` | BDD scenarios written and approved | `implementing` |
| `implementing` | Code being written | `nfr_validating` |
| `nfr_validating` | Non-functional requirements being checked | `complete`, `nfr_blocked` |
| `nfr_blocked` | NFR check failed, needs fixes | `nfr_validating` |
| `complete` | All gates passed, feature done | - |

## Orchestration Workflow

### Phase 1: Discovery
```
@superpowers-orchestrator
  └─ Reads docs/roads/ROAD-*.md
  └─ Identifies items by status
  └─ Presents options to user
```

### Phase 2: BDD First
```
@superpowers-orchestrator
  └─ Checks for existing scenarios in stack-tests/features/
  └─ If missing: delegates to @bdd-writer
      └─ @bdd-writer creates .feature files
      └─ Returns scenario summary
```

### Phase 3: Implementation
```
@superpowers-orchestrator
  └─ Delegates to @code-writer
      └─ @code-writer implements domain layer
      └─ @code-writer implements application layer
      └─ @code-writer implements infrastructure layer
  └─ Delegates to @bdd-runner for verification
      └─ @bdd-runner executes tests
      └─ Returns pass/fail results
```

### Phase 4: Quality Gates
```
@superpowers-orchestrator
  ├─ @architecture-inspector (hexagonal compliance)
  ├─ @ddd-aligner (domain model alignment)
  ├─ @ci-runner (lint, typecheck, unit tests)
  └─ @ux-ui-inspector (if UI changes)
```

### Phase 5: Completion
```
@superpowers-orchestrator
  └─ Updates ROAD item status
  └─ Delegates to @change-manager
      └─ Creates CHANGE-XXX.md entry
  └─ Creates execution log
```

## Agent Communication Protocol

### Delegation Format
```
@{agent-name} {task-description}

Context:
- ROAD: ROAD-XXX
- Phase: {current-phase}
- Previous: {what-was-done}

Requirements:
- {requirement-1}
- {requirement-2}

Expected Output:
- {what-to-return}
```

### Response Format
```
@{agent-name} completed:

Status: success|partial|failed

Results:
- {result-1}
- {result-2}

Issues (if any):
- {issue-1}

Next Steps:
- {recommendation}
```

## Validation Commands

All validation scripts are in `docs/scripts/`:

| Command | Script | Purpose |
|---------|--------|---------|
| `just validate-docs` | `validate-docs.js` | Run all validation |
| `just governance-lint` | `governance-linter.js --ci` | Lint all governance files |
| `just validate-changes` | `validate-changes.js` | Validate CHANGE files |
| `just validate-bdd-tags` | `validate-bdd-tags.js` | Validate BDD tags |

## File Structure

```
prima-delivery-demonstrator/
├── .opencode/
│   ├── agents/           # Agent definitions
│   ├── skills/           # Skill definitions
│   ├── logs/             # Execution logs
│   └── plans/            # Implementation plans
├── docs/
│   ├── roads/            # ROAD-XXX.md files
│   ├── adr/              # Architecture decisions
│   ├── changes/          # CHANGE-XXX.md files
│   ├── bdd/              # BDD documentation
│   ├── nfr/              # Non-functional requirements
│   ├── ddd/              # Domain-driven design docs
│   └── scripts/          # Validation scripts
├── stack-tests/
│   └── features/         # BDD feature files
├── AGENTS.md             # Agent architecture overview
├── agentspec.md          # This file
├── opencode.json         # OpenCode configuration
└── Justfile              # Task runner recipes
```

## Execution Logging

Every orchestration run MUST create a log file:

**Location**: `.opencode/logs/YYYY-MM-DD-HHMMSS-ROAD-XXX.md`

**Required Front Matter**:
```yaml
---
date: YYYY-MM-DD
roadmap_item: ROAD-XXX
model: {model_name}
agent: superpowers-orchestrator
started_at: HH:MM:SS
completed_at: HH:MM:SS
status: success|failed|partial
tools_used: [list]
subagents: [list]
---
```

## Quality Gate Requirements

### Architecture Review (@architecture-inspector)
- Hexagonal architecture compliance
- Dependency direction (inward only)
- Port/adapter separation
- Domain purity (no framework dependencies)

### DDD Alignment (@ddd-aligner)
- Ubiquitous language usage
- Aggregate boundaries
- Value object immutability
- Domain event patterns

### CI Validation (@ci-runner)
- TypeScript compilation (0 errors)
- ESLint (0 errors)
- Prettier formatting
- Unit test pass rate (100%)

### BDD Verification (@bdd-runner)
- All scenarios execute
- Pass rate threshold (100% for new features)
- No flaky tests

## Anti-Patterns

### Orchestrator Direct Implementation
**Wrong**: Orchestrator writes domain code directly
**Right**: Orchestrator delegates to @code-writer

### Skipping Quality Gates
**Wrong**: Mark complete without running all gates
**Right**: All gates must pass or have documented exceptions

### Missing Execution Logs
**Wrong**: Complete work without logging
**Right**: Every run creates a detailed log file

### Self-Assessment
**Wrong**: Agent marks its own work as "passed"
**Right**: Different agent validates (e.g., @architecture-inspector reviews @code-writer's work)
