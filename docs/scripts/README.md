# Documentation Validation Scripts

Comprehensive validation and reporting scripts for the documentation framework.

## Prerequisites

Install dependencies before running:

```bash
cd docs
bun install
# or
npm install
```

## Core Validation Scripts

### validate-docs.js

Main validation runner that orchestrates all checks.

```bash
# Standard validation
node scripts/validate-docs.js

# CI mode (comprehensive)
node scripts/validate-docs.js --ci

# Quick mode (skip optional checks)
node scripts/validate-docs.js --skip-optional
```

### governance-linter.js

Comprehensive governance validation for ROAD items, ADRs, capabilities, user stories, and personas.

```bash
# Validate all roadmap items
node scripts/governance-linter.js --all-roads

# Validate all ADRs
node scripts/governance-linter.js --adrs

# Validate specific ROAD item
node scripts/governance-linter.js ROAD-001

# Full CI validation
node scripts/governance-linter.js --ci

# Validate capabilities
node scripts/governance-linter.js --capabilities

# Validate user stories
node scripts/governance-linter.js --user-stories

# Validate personas
node scripts/governance-linter.js --personas

# JSON output
node scripts/governance-linter.js --format=json ROAD-001
```

**Validates:**
- ROAD frontmatter (id, title, status, governance structure)
- State machine transitions (proposed → adr_validated → bdd_pending → etc.)
- Gate requirements (ADR before BDD, BDD before implementing, etc.)
- ADR frontmatter
- Capability references
- User story structure
- Persona definitions

### validate-changes.js

Validates CHANGE file frontmatter and compliance data.

```bash
# Validate all CHANGE files
node scripts/validate-changes.js

# Validate specific CHANGE file
node scripts/validate-changes.js CHANGE-001
```

**Validates:**
- Required fields (id, road_id, title, date, version, status)
- Compliance structure (adr_check, bdd_check, nfr_checks)
- Agent signatures for published changes
- References to existing ROAD items

### validate-bdd-tags.js

Validates BDD feature file tags and structure.

```bash
# Standard validation
node scripts/validate-bdd-tags.js

# Strict mode (warnings become errors)
node scripts/validate-bdd-tags.js --strict
```

**Validates:**
- @CAP-XXX capability tags reference existing capabilities
- Feature file structure
- Tag consistency

**Note:** Gracefully skips if `stack-tests/features/` doesn't exist yet.

## Coverage Reports

### capability-coverage-report.js

Generates test coverage report by capability.

```bash
# Human-readable output
node scripts/capability-coverage-report.js

# JSON output
node scripts/capability-coverage-report.js --format=json
```

**Note:** Gracefully skips if `stack-tests/features/` doesn't exist yet.

### persona-coverage-report.js

Generates user story coverage report by persona.

```bash
# Human-readable output
node scripts/persona-coverage-report.js

# JSON output
node scripts/persona-coverage-report.js --format=json
```

**Note:** Gracefully skips if `personas/` or `user-stories/` directories don't exist yet.

## Utility Scripts

### update-bdd-results.js

Updates CHANGE files with BDD test results from Cucumber reports.

```bash
# Update all CHANGE files with test results
node scripts/update-bdd-results.js

# Update specific ROAD item's CHANGE file
node scripts/update-bdd-results.js ROAD-001
```

**Requires:** `stack-tests/cucumber-report/report.json` from test run.

### migrate-changes.js

Migrates entries from a single CHANGELOG.md to individual CHANGE files.

```bash
node scripts/migrate-changes.js
```

### monitor-sessions.sh

Shell script for monitoring OpenCode sessions.

```bash
./scripts/monitor-sessions.sh
```

## npm Scripts

```bash
npm run validate        # Quick validation
npm run validate:ci     # Comprehensive validation
npm run validate:quick  # Skip optional checks
```

## Build Integration

Validation runs automatically before builds:

- `npm run build` - Runs `validate:quick` first via prebuild hook
- `npm run build:ci` - Runs `validate:ci` then builds

## Directory Structure Expected

Scripts expect these directories (gracefully skip if missing):

```
docs/
├── roads/              # ROAD-XXX.md files
├── adr/                # ADR-XXX.md files  
├── changes/            # CHANGE-XXX.md files
├── nfr/                # NFR-XXX.md files
├── capabilities/       # CAP-XXX.md files (optional)
├── user-stories/       # US-XXX.md files (optional)
├── personas/           # PER-XXX.md files (optional)
└── stack-tests/        # BDD tests (optional)
    ├── features/       # .feature files
    └── cucumber-report/  # Test reports
```

## Exit Codes

- `0` - All validations passed (or gracefully skipped)
- `1` - One or more validations failed

## Dependencies

Required packages (in `docs/package.json`):

- `gray-matter` - YAML frontmatter parsing
- `glob` - File pattern matching
- `js-yaml` - YAML parsing

## Governance Workflow

These scripts enforce the 8-state governance workflow:

```
proposed → adr_validated → bdd_pending → bdd_complete → implementing → nfr_validating → complete
                                                                     ↘ nfr_blocked
```

See [SETUP.md](../SETUP.md) for detailed workflow documentation.
