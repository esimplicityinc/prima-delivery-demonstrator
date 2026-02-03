# Documentation Validation

The documentation site includes automated validation to ensure all documentation follows governance rules and quality standards.

## Automatic Validation

Validation runs automatically before every build via the `prebuild` script. This ensures documentation is validated before it's deployed.

## Manual Validation

You can run validation manually at any time:

```bash
# Quick validation (essential checks only)
npm run validate

# Or via justfile
just docs-validate

# Comprehensive validation (CI mode - all checks)
npm run validate:ci

# Or via justfile
just docs-validate-ci
```

## What Gets Validated

The validation suite checks:

### 1. Roadmap Items (ROAD-XXX)
- Valid front matter structure
- Required fields present (id, title, status, phase, priority)
- Valid status values
- Proper governance state transitions
- Links to dependencies

### 2. Architecture Decision Records (ADR-XXX)
- Valid front matter structure
- Required fields (id, title, status, category)
- Valid status values (proposed, accepted, deprecated, superseded)
- Valid categories (architecture, infrastructure, security, performance)

### 3. Change Files (CHANGE-XXX)
- Valid YAML front matter
- Required compliance tracking fields
- Agent signature structure
- Links to related ROAD items
- Test results format

### 4. BDD Scenarios (Optional)
- Capability tags present and valid
- Feature file structure
- Gherkin syntax validation

## Build Integration

### Standard Build
```bash
npm run build
# Runs quick validation, then builds
```

### CI Build
```bash
npm run build:ci
# Runs comprehensive validation, then builds
```

### Via Justfile
```bash
# Standard build with validation
just docs-build

# CI build with full validation
just docs-build-ci
```

## Validation Scripts

The validation runner executes these scripts (located in `../scripts/`):

1. **`governance-linter.js`** - Main governance validation
   - Validates ROAD items
   - Validates ADRs
   - Checks governance state machine compliance

2. **`validate-changes.js`** - Change file validation
   - YAML structure validation
   - Required field checking
   - Signature validation

3. **`validate-bdd-tags.js`** - BDD validation (optional)
   - Capability tag validation
   - Feature file structure

## Exit Codes

- `0` - All validations passed
- `1` - One or more validations failed

## Skipping Validation

To build without validation (not recommended):

```bash
# Skip prebuild hook
npm run build --ignore-scripts

# Or call docusaurus directly
npx docusaurus build
```

## CI/CD Integration

For CI/CD pipelines, use the CI mode:

```bash
# In your CI config
npm run build:ci

# Or via justfile
just docs-build-ci
```

This runs comprehensive validation and fails the build if any checks don't pass.

## Troubleshooting

### Validation fails but docs look correct

1. Check the error output for specific validation failures
2. Ensure front matter YAML is valid
3. Verify all required fields are present
4. Check that status values are in the allowed list

### Validation scripts not found

The validation scripts are in the parent `scripts/` directory:
- `../scripts/governance-linter.js`
- `../scripts/validate-changes.js`
- `../scripts/validate-bdd-tags.js`

Ensure they exist and are executable.

### Skipped validations

Some validations may be skipped if:
- Script files don't exist (warning shown)
- No files to validate exist yet
- Running in quick mode (`--skip-optional`)

## Customization

To customize validation behavior, edit:
- `docs/scripts/validate-docs.js` - Main validation runner
- `docs/package.json` - Scripts configuration
- Individual validation scripts in `scripts/`

## Adding New Validations

To add a new validation check:

1. Create or update a validation script in `../scripts/`
2. Add a call to it in `docs/scripts/validate-docs.js`
3. Update this documentation

Example:

```javascript
// In validate-docs.js
results.push(runScript(
  'my-new-validator.js',
  ['--args'],
  'Description of validation'
));
```
