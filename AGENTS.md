# Agent Architecture

This document describes the agent architecture for the Prima Delivery Demonstrator project.

## Overview

Agents are specialized AI assistants configured to handle specific aspects of the development workflow. They work together through an orchestration pattern, where high-level orchestrators delegate tasks to specialized subagents.

## Agent Categories

### Orchestration Agents

| Agent | Purpose | Mode |
|-------|---------|------|
| `superpowers-orchestrator` | Master workflow orchestrator - manages complete development cycle | Primary |
| `agent-manager` | Manages agent creation, editing, and analysis | Primary |

### Development Agents

| Agent | Purpose | Mode |
|-------|---------|------|
| `code-writer` | Writes code following DDD and Hexagonal Architecture | Subagent |
| `bdd-writer` | Creates Gherkin feature files for BDD scenarios | Subagent |
| `bdd-runner` | Executes BDD tests and reports results | Subagent |

### Quality Agents

| Agent | Purpose | Mode |
|-------|---------|------|
| `architecture-inspector` | Verifies hexagonal architecture compliance | Subagent |
| `ddd-aligner` | Ensures DDD compliance and ubiquitous language | Subagent |
| `ci-runner` | Runs CI checks (lint, typecheck, tests) | Subagent |
| `ux-ui-inspector` | Reviews UI for accessibility and UX best practices | Subagent |

### Operations Agents

| Agent | Purpose | Mode |
|-------|---------|------|
| `site-keeper` | Manages development servers and troubleshoots | Subagent |
| `change-manager` | Creates and manages CHANGE entries with compliance tracking | Subagent |
| `roadmap-addition` | Adds new roadmap items with proper formatting | Primary |

### Meta Agents

| Agent | Purpose | Mode |
|-------|---------|------|
| `agent-creator` | Guides creation of new agents via questionnaire | Subagent |
| `agent-editor` | Helps edit existing agents | Subagent |
| `agent-analyzer` | Analyzes session files for improvement opportunities | Subagent |

## Agent Modes

- **Primary**: Can be invoked directly by users (e.g., `@superpowers-orchestrator start`)
- **Subagent**: Invoked by other agents via the `task` tool

## File Locations

| Type | Location |
|------|----------|
| Agent definitions | `.opencode/agents/*.md` |
| Agent configuration | `opencode.json` → `agent` section |
| Skills | `.opencode/skills/*/SKILL.md` |
| Execution logs | `.opencode/logs/*.md` |

## Naming Conventions

### Agent Files
- Use kebab-case: `my-agent-name.md`
- Match the key in `opencode.json`

### Agent IDs
- Use kebab-case in `opencode.json` keys
- Reference with `@agent-name` in prompts

### Skill Files
- Directory name is the skill ID
- Must contain `SKILL.md` file
- Additional references in `references/` subdirectory

## Delegation Rules

1. **Orchestrators MUST delegate** - They coordinate but don't implement
2. **Subagents are specialists** - Each has a focused responsibility
3. **Logging is mandatory** - All orchestration runs create execution logs

## Quality Gates

Every feature must pass through:
1. Architecture review (`@architecture-inspector`)
2. DDD alignment (`@ddd-aligner`)
3. BDD test execution (`@bdd-runner`)
4. CI validation (`@ci-runner`)

See `agentspec.md` for detailed workflow specifications.
