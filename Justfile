# Prima Delivery Demonstrator - Task Runner
# https://github.com/casey/just

# Default recipe - show available commands
default:
    @just --list

# ============================================
# Documentation Validation
# ============================================

# Run all documentation validation
validate-docs:
    cd docs && node scripts/validate-docs.js

# Run governance linter (CI mode - all checks)
governance-lint:
    cd docs && node scripts/governance-linter.js --ci

# Lint specific ROAD item
lint-road ROAD:
    cd docs && node scripts/governance-linter.js {{ROAD}}

# Validate all ROAD items
lint-roads:
    cd docs && node scripts/governance-linter.js --all-roads

# Validate all ADRs
lint-adrs:
    cd docs && node scripts/governance-linter.js --adrs

# Validate CHANGE files
validate-changes:
    cd docs && node scripts/validate-changes.js

# Validate BDD tags
validate-bdd-tags:
    cd docs && node scripts/validate-bdd-tags.js

# Generate capability coverage report
capability-coverage:
    cd docs && node scripts/capability-coverage-report.js

# Generate persona coverage report  
persona-coverage:
    cd docs && node scripts/persona-coverage-report.js

# ============================================
# Docusaurus (Documentation Site)
# ============================================

# Install docs dependencies
docs-install:
    cd docs && bun install

# Start docs dev server
docs-dev:
    cd docs && bun run start

# Build docs for production
docs-build:
    cd docs && bun run build

# Serve built docs locally
docs-serve:
    cd docs && bun run serve

# ============================================
# BDD Testing (Placeholder - update when stack-tests exists)
# ============================================

# Run all BDD tests
bdd-test:
    @echo "BDD tests not yet configured. Add stack-tests/ directory first."
    @echo "Expected: cd stack-tests && npx playwright test"

# Run API BDD tests
bdd-api:
    @echo "BDD API tests not yet configured."

# Run UI BDD tests
bdd-ui:
    @echo "BDD UI tests not yet configured."

# Run hybrid/E2E tests
bdd-hybrid:
    @echo "BDD hybrid tests not yet configured."

# Run BDD tests by tag
bdd-tag TAG:
    @echo "BDD tag tests not yet configured."
    @echo "Would run: cd stack-tests && npx playwright test --grep '{{TAG}}'"

# Run BDD tests for specific ROAD item
bdd-roadmap ROAD:
    @echo "BDD roadmap tests not yet configured."
    @echo "Would run: cd stack-tests && npx playwright test --grep '@{{ROAD}}'"

# Generate BDD test report
bdd-report:
    @echo "BDD reports not yet configured."

# Validate capability tags in BDD
bdd-validate-cap-tags:
    cd docs && node scripts/validate-bdd-tags.js

# Install BDD test dependencies
bdd-install:
    @echo "BDD dependencies not yet configured."
    @echo "Would run: cd stack-tests && npm install && npx playwright install"

# Run BDD tests with visible browser
bdd-headed:
    @echo "Headed BDD tests not yet configured."

# ============================================
# Development (Placeholder - update when app exists)
# ============================================

# Start all development servers
dev-all:
    @echo "Development servers not yet configured."
    @echo "Add your dev server commands here."

# Run all CI checks
check:
    @echo "Running documentation validation..."
    just governance-lint
    just validate-changes
    @echo "CI checks complete (code checks not yet configured)."

# Fix linting issues
lint-fix:
    @echo "Lint fix not yet configured for code."
    @echo "Documentation validation doesn't auto-fix."

# TypeScript type checking
typecheck:
    @echo "TypeScript not yet configured. Add tsconfig.json first."

# Run unit tests
test:
    @echo "Unit tests not yet configured."

# ============================================
# Utilities
# ============================================

# Monitor OpenCode sessions
monitor-sessions:
    cd docs && ./scripts/monitor-sessions.sh

# Migrate changelog to CHANGE files
migrate-changes:
    cd docs && node scripts/migrate-changes.js

# Update BDD results in CHANGE files
update-bdd-results:
    cd docs && node scripts/update-bdd-results.js
