---
title: $(echo $file | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1')
---

# Behavior-Driven Development Template

This is a template file. Add your BDD documentation here.

## Structure

Follow Gherkin syntax for scenarios:

```gherkin
Feature: Feature Name
  As a [role]
  I want to [action]
  So that [benefit]

  Scenario: Scenario Name
    Given [context]
    When [action]
    Then [outcome]
```
