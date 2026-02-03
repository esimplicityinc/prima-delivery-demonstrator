# Documentation Validation Scripts

This directory contains validation scripts for the documentation framework.

## Prerequisites

Install dependencies before running:

```bash
cd docs
bun install
# or
npm install
```

## Available Scripts

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

Validates ROAD and ADR frontmatter.

```bash
# Validate all roadmap items
node scripts/governance-linter.js --all-roads

# Validate all ADRs
node scripts/governance-linter.js --adrs

# Full CI validation
node scripts/governance-linter.js --ci
```

**Checks for ROAD files:**
- Required fields: `id`, `title`, `status`, `phase`
- Valid status values (8-state workflow)
- Valid priority values
- Governance structure
- Date formats

**Checks for ADR files:**
- Required fields: `id`, `title`, `status`
- Valid status values: `proposed`, `accepted`, `deprecated`, `superseded`
- Valid category values

### validate-changes.js

Validates CHANGE file frontmatter and compliance data.

```bash
# Standard validation
node scripts/validate-changes.js

# Strict mode (warnings become errors)
node scripts/validate-changes.js --strict
```

**Checks:**
- Required fields: `id`, `road_id`, `title`, `date`, `status`
- Valid status: `draft`, `published`
- Compliance structure (adr_check, bdd_check, nfr_checks)
- Agent signatures structure
- Published status requirements

### validate-bdd-tags.js

Validates BDD feature file structure and tags.

```bash
# Standard validation
node scripts/validate-bdd-tags.js

# Strict mode
node scripts/validate-bdd-tags.js --strict
```

**Checks:**
- Feature-level tags (`@capability`, `@context`)
- Scenario structure (Given/When/Then)
- Non-empty scenario names

**Searched locations:**
- `stack-tests/features/**/*.feature`
- `tests/features/**/*.feature`
- `features/**/*.feature`
- `e2e/**/*.feature`
- `bdd/**/*.feature`

## npm Scripts

```bash
npm run validate        # Quick validation
npm run validate:ci     # Comprehensive validation
npm run validate:quick  # Skip optional checks
```

## Build Integration

Validation runs automatically:

- `npm run build` - Runs `validate:quick` first via prebuild hook
- `npm run build:ci` - Runs `validate:ci` then builds

## Exit Codes

- `0` - All validations passed
- `1` - One or more validations failed (stops the build)

## Output Format

```
╔════════════════════════════════════════╗
║   Documentation Validation Suite      ║
╚════════════════════════════════════════╝

Running in standard mode

═══ Roadmap Items ═══

▶ Validating all roadmap items
  ✓ ROAD-001.md
  ✓ ROAD-002.md
  ✓ Passed

═══ Architecture Decisions ═══

▶ Validating architecture decision records
  No ADRs found (this is OK for a new project)
  ✓ Passed

════════════════════════════════════════
Total: 2 | Passed: 2 | Failed: 0
```

## Dependencies

These packages are required (in `docs/package.json`):

- `gray-matter` - YAML frontmatter parsing
- `glob` - File pattern matching

## Adding New Validators

1. Create a new script in this directory
2. Follow the pattern of existing validators
3. Add to `validate-docs.js`:

```javascript
results.push(runScript(
  'my-validator.js',
  ['--args'],
  'Description of what this validates'
));
```

4. Update this README
