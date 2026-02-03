---
title: BDD Methodology
---

# Behavior-Driven Development Methodology

This document explains how BDD integrates with the governance workflow and how to work with feature files.

## Overview

BDD (Behavior-Driven Development) is a core part of our governance workflow. Every feature must have BDD scenarios written and approved before implementation begins.

## Workflow Integration

### Where BDD Fits

```
proposed → adr_validated → bdd_pending → bdd_complete → implementing → ...
                           ^^^^^^^^^^^   ^^^^^^^^^^^^
                           Write tests   Tests approved
```

1. **After ADR validation** - Architecture is approved
2. **bdd_pending** - `@bdd-writer` creates feature files
3. **bdd_complete** - `@bdd-runner` approves scenarios
4. **Then implementation** - `@code-writer` can start coding

### Agent Responsibilities

| Agent | BDD Role |
|-------|----------|
| `@bdd-writer` | Authors Gherkin scenarios from requirements |
| `@bdd-runner` | Reviews, approves, and executes tests |

## Feature File Organization

### Directory Structure

Feature files should be organized by bounded context:

```
stack-tests/
└── features/
    ├── marketplace/           # Marketplace context
    │   ├── listings.feature
    │   └── search.feature
    ├── trading/               # Trading context
    │   ├── orders.feature
    │   └── settlements.feature
    └── identity/              # Identity context
        ├── authentication.feature
        └── authorization.feature
```

### Required Tags

Every feature file should include:

```gherkin
@capability:user-management
@context:identity
@road:ROAD-001
Feature: User Registration
  ...
```

| Tag | Purpose | Example |
|-----|---------|---------|
| `@capability` | Links to a capability/feature | `@capability:user-auth` |
| `@context` | Bounded context | `@context:identity` |
| `@road` | Links to roadmap item | `@road:ROAD-001` |

## Writing Good Scenarios

### Gherkin Structure

```gherkin
Feature: Feature Name
  As a [role]
  I want to [action]
  So that [benefit]

  Background:
    Given common setup steps

  Scenario: Happy path scenario
    Given [context/precondition]
    When [action taken]
    Then [expected outcome]
    And [additional outcome]

  Scenario Outline: Parameterized scenario
    Given a user with role "<role>"
    When they attempt to "<action>"
    Then they should see "<result>"

    Examples:
      | role  | action | result  |
      | admin | delete | success |
      | user  | delete | denied  |
```

### Best Practices

1. **Use domain language** - Match the ubiquitous language from DDD docs
2. **One behavior per scenario** - Keep scenarios focused
3. **Avoid implementation details** - Describe what, not how
4. **Use Background** - For common setup across scenarios
5. **Tag appropriately** - Enable filtering and reporting

## Linking to CHANGE Files

When a feature is complete, test results are recorded in the CHANGE file:

### In Feature Files

```gherkin
@road:ROAD-001
Feature: User Authentication
```

### In CHANGE Files

```yaml
compliance:
  bdd_check:
    status: pass
    scenarios: 15
    passed: 15
    coverage: "100%"

test_results:
  bdd:
    total: 15
    passed: 15
    failed: 0
    features:
      - name: "User Authentication"
        file: "stack-tests/features/identity/authentication.feature"
        scenarios: 8
        passed: 8
```

## BDD Data Plugin

The `bdd-data-plugin.js` extracts test results from CHANGE files to generate dashboard data:

```javascript
// plugins/bdd-data-plugin.js extracts:
// - test_results.bdd from CHANGE files
// - compliance.bdd_check data
// Outputs to: static/bdd-data.json
```

This enables the BDD dashboard components to display:
- Test result summaries
- Feature coverage
- Scenario pass/fail rates

## Validation

The `validate-bdd-tags.js` script checks:

1. Feature files have required tags (`@capability`, `@context`)
2. Scenarios have proper Given/When/Then structure
3. No empty scenario names

Run validation:

```bash
node scripts/validate-bdd-tags.js
node scripts/validate-bdd-tags.js --strict  # Warnings become errors
```

## Example Feature File

```gherkin
@capability:authentication
@context:identity
@road:ROAD-001
Feature: User Login
  As a registered user
  I want to log into my account
  So that I can access protected features

  Background:
    Given the authentication service is running
    And a user exists with email "test@example.com"

  @happy-path
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter email "test@example.com"
    And I enter password "validPassword123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @error-handling
  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter email "test@example.com"
    And I enter password "wrongPassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  @security
  Scenario: Account lockout after failed attempts
    Given I am on the login page
    And I have failed to login 4 times
    When I attempt to login with invalid credentials
    Then my account should be locked
    And I should see "Account locked. Try again in 15 minutes"
```

## Next Steps

- Read [Gherkin Syntax](./gherkin-syntax.md) for complete syntax reference
- Check [Feature Index](./feature-index.md) for all feature files
- See [SETUP.md](../SETUP.md) for the full governance workflow
