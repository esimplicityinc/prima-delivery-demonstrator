---
title: Architecture Decision Records (ADRs)
description: All architectural decisions for your project
---

# Architecture Decision Records

This directory contains all architectural decisions for your project.

## Format

Each ADR is a separate Markdown file with YAML front matter:

```yaml
---
id: ADR-XXX
title: [Short Title]
status: accepted  # proposed | accepted | deprecated | superseded
category: [architecture | infrastructure | security | performance]
scope: project-wide
created: YYYY-MM-DD
---
```

## Categories

- **Architecture**: High-level design patterns (DDD, Hexagonal, etc.)
- **Infrastructure**: Deployment, runtime, database choices
- **Security**: Authentication, authorization, data protection
- **Performance**: Caching, optimization strategies

## How to Create an ADR

1. Copy `ADR-TEMPLATE.md` to a new file with the next sequential number
2. Fill in all sections with relevant information
3. Update the front matter with appropriate metadata
4. Submit for review and approval

## Index

All ADRs are listed in the sidebar navigation organized by category.
