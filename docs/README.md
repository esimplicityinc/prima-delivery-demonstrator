# Project Documentation Framework

A governance-driven documentation framework built with Docusaurus 3.x supporting DDD, BDD, and agent-based development workflows.

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server
bun start

# Run validation
bun run validate

# Build for production
bun run build
```

Dev server: http://localhost:3000

## Documentation Sections

| Section | Path | Description |
|---------|------|-------------|
| **DDD** | `/ddd/` | Domain-Driven Design documentation |
| **BDD** | `/bdd/` | Behavior-Driven Development guides |
| **ADRs** | `/adr/` | Architecture Decision Records |
| **Roadmap** | `/roads/` | Project roadmap with governance |
| **NFRs** | `/nfr/` | Non-Functional Requirements |
| **Changes** | `/changes/` | Change history with audit trail |
| **Plans** | `/plans/` | Implementation plans |
| **Agents** | `/agents/` | Agent documentation |

## Governance Workflow

Features progress through 8 states:

```
proposed → adr_validated → bdd_pending → bdd_complete → implementing → nfr_validating → complete
```

See [SETUP.md](./SETUP.md) for detailed workflow documentation.

## Agent Responsibilities

| Agent | Role |
|-------|------|
| `@architecture-inspector` | ADR validation |
| `@ddd-aligner` | DDD compliance |
| `@bdd-writer` | BDD authoring |
| `@bdd-runner` | Test validation |
| `@code-writer` | Implementation |
| `@ci-runner` | CI validation |
| `@ux-ui-inspector` | Accessibility review |

## Templates

Use these templates when adding documentation:

| Template | Location | Use For |
|----------|----------|---------|
| ADR Template | `adr/ADR-TEMPLATE.md` | Architecture decisions |
| ROAD Template | `roads/ROAD-TEMPLATE.md` | Roadmap items |
| NFR Template | `nfr/NFR-TEMPLATE.md` | Non-functional requirements |
| CHANGE Template | `changes/TEMPLATE.md` | Change history entries |

## Validation

```bash
# Quick validation (runs before build)
bun run validate

# Comprehensive CI validation
bun run validate:ci

# Individual validators
node scripts/governance-linter.js --all-roads
node scripts/governance-linter.js --adrs
node scripts/validate-changes.js
node scripts/validate-bdd-tags.js
```

## Key Files

| File | Purpose |
|------|---------|
| `docusaurus.config.ts` | Site configuration |
| `sidebars.ts` | Navigation structure |
| `src/types/roadmap.ts` | TypeScript types for roadmap |
| `plugins/roadmap-data-plugin.js` | Generates roadmap JSON |
| `plugins/bdd-data-plugin.js` | Generates BDD data JSON |

## Customization

1. Update branding in `docusaurus.config.ts`
2. Replace `static/img/logo.svg` and `favicon.ico`
3. Modify `sidebars.ts` for navigation changes

## Further Reading

- [SETUP.md](./SETUP.md) - Comprehensive setup and workflow guide
- [VALIDATION.md](./VALIDATION.md) - Validation system details
- [scripts/README.md](./scripts/README.md) - Validation script documentation
