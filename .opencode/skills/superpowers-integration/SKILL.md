---
name: superpowers-integration
description: Integration guide for combining Superpowers development methodology with ClawMarket's custom domain agents. Use for ALL feature development to ensure consistent TDD/BDD workflow.
triggers:
  - superpowers
  - methodology
  - development workflow
  - feature implementation
  - planning
  - brainstorm
  - TDD
  - BDD
  - code-writer
  - bdd-writer
---

# Superpowers + Domain Agents Integration

This skill bridges **Superpowers development methodology** with **ClawMarket's specialized domain agents**.

## The Dual-Loop System

### Outer Loop: Superpowers Methodology
Provides structure, planning, and quality gates.

### Inner Loop: Domain Specialists
Provide deep expertise in DDD, architecture, and BDD testing.

```
SUPERPOWERS (Methodology Layer)
├── /superpowers:brainstorm → Design refinement with BDD/TDD mindset
├── /superpowers:write-plan → Break into tasks, assign to domain agents
└── /superpowers:execute-plan → Orchestrate with checkpoints

        ↓

DOMAIN AGENTS (Implementation Layer)
├── bdd-writer → Create BDD scenarios (RED phase)
├── code-writer → Implement features (GREEN phase)
├── architecture-inspector → Verify hexagonal compliance
├── ddd-aligner → Check domain alignment
├── bdd-runner → Execute tests (REFACTOR phase)
└── ci-runner → Full quality check
```

## When to Use This Integration

**ALWAYS use for:**
- New roadmap items (ROAD-XXX)
- Feature implementation
- Refactoring existing code
- Adding new bounded contexts
- Complex bug fixes

**MANDATORY - NEVER SKIP:**
- The brainstorm phase (catches design issues early)
- BDD scenario creation before implementation
- **Architecture review after domain layer implementation - NO EXCEPTIONS**
- **Architecture review after full implementation - NO EXCEPTIONS**
- **@architecture-inspector MUST PASS before proceeding to next phase**
- CI checks before completion

## Architecture Rules - NO BYPASS ALLOWED

### 🚫 ABSOLUTE PROHIBITIONS

**These are HARD STOPS - If violated, the workflow CANNOT proceed:**

1. **Domain Layer Purity**
   - Domain layer MUST NOT import infrastructure (Convex, database, external APIs)
   - Domain layer MUST NOT have direct I/O operations
   - Domain layer MUST be 100% pure TypeScript/JavaScript
   - **VIOLATION = STOP. Fix before proceeding.**

2. **Dependency Direction**
   - Dependencies can ONLY flow inward: UI → Application → Domain
   - Domain layer has NO dependencies on outer layers
   - Application layer has NO dependencies on infrastructure
   - **VIOLATION = STOP. Refactor before proceeding.**

3. **Required Architecture Review**
   - @architecture-inspector MUST be invoked after domain layer
   - @architecture-inspector MUST be invoked after full implementation
   - If inspector finds violations, workflow STOPS until fixed
   - **NEVER "just move on" with architecture violations**

4. **Mandatory Ports & Adapters**
   - All external interactions MUST go through ports (interfaces)
   - Infrastructure MUST implement adapter pattern
   - Direct calls to Convex/database from application/domain are FORBIDDEN
   - **VIOLATION = STOP. Create proper ports before proceeding.**

### ✅ Architecture Checklist (MUST ALL PASS)

Before proceeding past any checkpoint:

- [ ] Domain layer has zero infrastructure imports
- [ ] All dependencies point inward only
- [ ] Repository interfaces (ports) defined in domain/application
- [ ] Infrastructure implements repository adapters
- [ ] No circular dependencies between layers
- [ ] Domain entities have no ORM/database annotations
- [ ] Value objects are immutable
- [ ] Aggregate roots enforce invariants

**If any item is unchecked → STOP. Fix before proceeding.**

## The Complete Workflow

### Phase 1: Design & Planning (Superpowers)

#### Step 1: Brainstorm
```
Command: /superpowers:brainstorm
```

**What happens:**
- Interactive design refinement
- Explores alternatives
- Validates assumptions
- Considers BDD scenarios

**Agent behavior:**
- Main agent engages in Socratic questioning
- References AGENT.md for project constraints
- Thinks about testability from the start
- Considers domain boundaries

**Output:**
- Design document saved
- Clear acceptance criteria
- BDD scenario outline
- Domain boundaries identified

**When complete:**
→ Proceed to Write Plan

#### Step 2: Write Implementation Plan
```
Command: /superpowers:write-plan
```

**What happens:**
- Breaks work into 2-5 minute tasks
- Assigns tasks to domain agents
- Defines verification steps
- Includes exact file paths

**Task assignment strategy:**

| Task Type | Assigned Agent | Order | Blocking? |
|-----------|---------------|-------|-----------|
| BDD Scenarios | bdd-writer | 1st (always) | Yes - must pass before coding |
| Domain Layer | code-writer | 2nd | Yes - must pass arch review |
| **Architecture Review** | **architecture-inspector** | **2a** | **🚫 HARD STOP if violations** |
| Application Layer | code-writer | 3rd | Yes - must pass arch review |
| **Architecture Review** | **architecture-inspector** | **3a** | **🚫 HARD STOP if violations** |
| Infrastructure | code-writer | 4th | Yes - must pass arch review |
| **Architecture Review** | **architecture-inspector** | **4a** | **🚫 HARD STOP if violations** |
| Domain Alignment | ddd-aligner | 5th | Yes |
| Test Execution | bdd-runner | 6th | Yes |
| CI Checks | ci-runner | 7th | Yes |

**Note:** Architecture Review runs MULTIPLE times (after each layer) and is **ALWAYS a blocking checkpoint**. If violations are found, the workflow **STOPs** until fixed.

**Output:**
- Detailed implementation plan
- Task-to-agent mapping
- Verification checkpoints

**When complete:**
→ Proceed to Execute Plan

### Phase 2: Implementation (Domain Agents)

#### Step 3: Execute Plan with Superpowers
```
Command: /superpowers:execute-plan
```

**What happens:**
- Executes tasks in batches
- Coordinates domain agents
- Human checkpoints at key stages
- TDD/BDD enforcement

**The Inner Loop (Per Task):**

```
For each task in plan:
    1. Dispatch relevant domain agent
    2. Agent performs work
    3. Two-stage review (spec + code quality)
    4. ARCHITECTURE REVIEW (MANDATORY for code tasks)
       - @architecture-inspector checks hexagonal compliance
       - If violations found → STOP, fix violations
       - NO EXCEPTIONS, NO BYPASSING
    5. Checkpoint: Human approval to continue?
    6. If yes → next task
    7. If no → revise and retry
```

**CRITICAL: Architecture Inspection is NOT Optional**

After EVERY domain layer task and EVERY infrastructure task:
1. @architecture-inspector MUST run
2. All architecture rules MUST pass
3. If violations exist, workflow STOPS
4. @code-writer fixes violations
5. @architecture-inspector re-verifies
6. Only then can workflow continue

**Specific Agent Invocation:**

**BDD Scenarios (Task 1 - ALWAYS FIRST):**
```
@bdd-writer create BDD scenarios for [feature] based on design document
```
- Creates `.feature` files
- Defines Gherkin scenarios
- Asks permission before creating

**Domain Implementation (Tasks 2-4):**
```
@code-writer implement [feature] following DDD/Hexagonal patterns
- Start with domain layer
- Create/update aggregates
- Add value objects if needed
- Then application services
- Finally infrastructure (Convex)
```

**Architecture Review (Task 5) - MANDATORY BLOCKING CHECKPOINT:**
```
@architecture-inspector verify hexagonal compliance for [feature]
- Check ports & adapters
- Verify dependency direction
- Ensure domain purity
- **MUST PASS before proceeding to Task 6**
- **NO BYPASS ALLOWED - If violations found, STOP and fix**
```

**If @architecture-inspector finds violations:**
1. Workflow STOPS immediately
2. Violations are reported to user
3. @code-writer fixes the violations
4. @architecture-inspector re-verifies
5. Only continue after ALL violations resolved

**Domain Alignment (Task 6):**
```
@ddd-aligner check domain model alignment for [feature]
- Verify ubiquitous language
- Check aggregate boundaries
- Validate domain events
```

**Test Execution (Task 7):**
```
@bdd-runner run BDD tests for [feature]
- Execute all scenarios
- Report failures
- Coordinate fixes if needed
```

**CI Validation (Task 8):**
```
@ci-runner run full CI suite
- Lint check
- TypeScript typecheck
- All tests
- Format verification
```

**When complete:**
→ Feature is fully implemented and tested

### Phase 3: Completion

#### Step 4: Finish Branch
```
Command: /superpowers:finish-branch
```

**What happens:**
- Verifies all tests pass
- Presents merge options (merge/PR/keep/discard)
- Cleans up worktree
- Updates documentation

**Agent responsibilities:**
- Main agent coordinates final checks
- ci-runner confirms everything passes
- site-keeper ensures servers stable

**Documentation updates:**
- Update ROADMAP.md status
- Add CHANGELOG.md entry
- Update relevant DDD docs

## Workflow Examples

### Example 1: Implement ROAD-035 (Advertisement Bot)

**Step 1: Brainstorm**
```
/superpowers:brainstorm

Discussion points:
- What channels should the bot support? (Discord, Twitter, forums)
- How to avoid spam detection?
- What metrics to track?
- Integration with ROAD-036 tracker?
- Authentication for bot accounts?
```

**Step 2: Write Plan**
```
/superpowers:write-plan

Plan output:
Task 1: Create BDD scenarios for advertisement bot
  → @bdd-writer
  
Task 2: Design AdvertisementBot aggregate
  → @code-writer (domain layer)
  
Task 3: Create application service for bot operations
  → @code-writer (application layer)
  
Task 4: Implement Convex infrastructure
  → @code-writer (infrastructure layer)
  
Task 5: Create UI components for bot management
  → @code-writer (UI layer)
  
Task 6: Verify hexagonal architecture
  → @architecture-inspector
  
Task 7: Check domain alignment
  → @ddd-aligner
  
Task 8: Run BDD tests
  → @bdd-runner
  
Task 9: Run CI checks
  → @ci-runner
```

**Step 3: Execute**
```
/superpowers:execute-plan

Checkpoint 1: After BDD scenarios (human approves?)
Checkpoint 2: After domain layer (human approves?)
Checkpoint 3: After full implementation (human approves?)
Checkpoint 4: After all reviews pass (human approves?)
```

**Step 4: Finish**
```
/superpowers:finish-branch

Options:
- Merge to main
- Create PR
- Keep branch
- Discard
```

### Example 2: Bug Fix with BDD

**Scenario:** Test failure in promise settlement

**Step 1: Investigate (No brainstorm needed for bugs)**
```
@bdd-runner identify failing test
```

**Step 2: Plan**
```
/superpowers:write-plan

Task 1: Analyze test failure root cause
  → Main agent
  
Task 2: Fix domain logic
  → @code-writer
  
Task 3: Fix infrastructure if needed
  → @code-writer
  
Task 4: Verify architecture still valid
  → @architecture-inspector
  
Task 5: Re-run tests
  → @bdd-runner
  
Task 6: Run CI
  → @ci-runner
```

**Step 3: Execute**
```
/superpowers:execute-plan
```

### Example 3: Quick UI Enhancement

**Scenario:** Add loading spinner to button

**Decision:** Skip Superpowers (too small)

**Direct execution:**
```
@code-writer add loading spinner to BotRegistrationButton
- Add isLoading prop
- Show spinner when loading
- Disable button during loading
- Update tests
```

**When to skip Superpowers:**
- Pure UI changes (no business logic)
- Single file modifications
- Documentation updates
- Configuration changes
- < 10 minutes of work

## Decision Trees

### When to Use Full Superpowers Workflow?

```
Is this a new feature?
├── YES → Use Superpowers
│   └── Does it touch domain logic?
│       ├── YES → Definitely use Superpowers
│       └── NO (pure UI) → Can skip brainstorm
│
└── NO (bug fix/enhancement)
    ├── Does it require BDD scenario changes?
    │   ├── YES → Use Superpowers
    │   └── NO
    │       └── Is it complex (>30 min)?
    │           ├── YES → Use Superpowers
    │           └── NO → Direct agent execution
    │
    └── Is it a hotfix?
        └── YES → Fast track (bdd-runner → code-writer → ci-runner)
```

### Which Agent for Which Task?

```
Task involves...
├── Writing BDD scenarios
│   └── @bdd-writer
│
├── Implementing domain logic
│   ├── Domain layer (aggregates, value objects)
│   ├── Application layer (services)
│   ├── Infrastructure (Convex functions)
│   └── UI components (React)
│   └── @code-writer
│
├── Verifying architecture
│   ├── Hexagonal compliance
│   ├── Dependency direction
│   └── Ports & adapters
│   └── @architecture-inspector
│
├── Checking domain model
│   ├── Ubiquitous language
│   ├── Aggregate boundaries
│   └── Domain events
│   └── @ddd-aligner
│
├── Running tests
│   ├── BDD tests
│   ├── Unit tests
│   └── Test reports
│   └── @bdd-runner
│
└── CI/Quality checks
    ├── Lint
    ├── Typecheck
    ├── Format
    └── @ci-runner
```

## TDD/BDD Alignment

### The RED-GREEN-REFACTOR Cycle

**SUPERPOWERS enforces:**
1. **RED** - Write failing test first (bdd-writer)
2. **GREEN** - Write minimal code to pass (code-writer)
3. **REFACTOR** - Improve while keeping tests green (code-writer + inspectors)

**Agent coordination:**

**RED Phase:**
```
@bdd-writer create scenario:
  Scenario: Bot sends advertisement
    Given a registered advertisement bot
    When the bot sends an advertisement to "discord"
    Then the advertisement is recorded
    And the bot's last activity timestamp is updated
```

**GREEN Phase:**
```
@code-writer implement:
  1. Create AdvertisementSent event
  2. Add sendAdvertisement method to AdvertisementBot aggregate
  3. Implement AdvertisementService
  4. Create Convex mutation
  5. Minimal code to make test pass
```

**REFACTOR Phase:**
```
@architecture-inspector:
  - "Domain layer has no Convex imports ✓"
  - "Ports properly defined ✓"
  - "Dependency direction correct ✓"

@ddd-aligner:
  - "Ubiquitous language consistent ✓"
  - "AdvertisementBot aggregate boundaries correct ✓"
  - "Domain event naming matches glossary ✓"

@code-writer:
  - Extract helper methods
  - Improve naming
  - Add JSDoc comments
  - Keep tests passing
```

### BDD Scenario Quality

**bdd-writer should create scenarios that are:**
- **Independent** - Each scenario can run alone
- **Repeatable** - Same result every time
- **Readable** - Clear Given/When/Then structure
- **Focused** - Tests one thing per scenario
- **Domain-aligned** - Uses ubiquitous language

**Before implementation starts:**
- All scenarios should fail (RED)
- Feature file reviewed and approved
- Edge cases identified

## Quality Gates

### Mandatory Checkpoints - NO BYPASS

**🚫 HARD RULE: If a checkpoint fails, workflow STOPS until resolved.**

1. **After BDD Scenarios**
   - [ ] Scenarios reviewed by human?
   - [ ] Ubiquitous language correct?
   - [ ] Edge cases covered?
   - **Must pass before writing domain code**

2. **After Domain Layer - ARCHITECTURE BLOCKING CHECKPOINT**
   - [ ] Aggregates enforce invariants?
   - [ ] Value objects immutable?
   - [ ] **Domain layer has NO infrastructure imports?**
   - [ ] **Dependencies point inward only?**
   - [ ] **@architecture-inspector approved?**
   - **🚫 STOP HERE if any unchecked. NO EXCEPTIONS.**
   - **Must pass before application layer work**

3. **After Application Layer**
   - [ ] Services use repository ports (not implementations)?
   - [ ] No direct infrastructure calls?
   - [ ] **@architecture-inspector re-approved?**
   - **🚫 STOP HERE if any unchecked.**
   - **Must pass before infrastructure layer work**

4. **After Infrastructure Layer - FINAL ARCHITECTURE CHECK**
   - [ ] All external calls go through adapters?
   - [ ] Repository implementations properly isolated?
   - [ ] **@architecture-inspector final approval?**
   - **🚫 STOP HERE if any unchecked.**
   - **Must pass before testing**

5. **After Full Implementation**
   - [ ] All scenarios pass?
   - [ ] @ddd-aligner verified?
   - [ ] Code review complete?

6. **Before Merge**
   - [ ] All tests pass?
   - [ ] CI green?
   - [ ] Documentation updated?
   - [ ] Changelog entry added?

### Architecture Violation Consequences

**If @architecture-inspector finds violations:**
- Workflow immediately halts
- User is notified of all violations
- @code-writer must refactor to fix violations
- @architecture-inspector must re-verify and PASS
- Only then can workflow continue

**Common violations that trigger STOP:**
- Domain layer imports from `convex/` or database modules
- Application layer creates database connections directly
- Infrastructure layer is accessed without adapter pattern
- Dependencies flow outward (Domain → Application is forbidden)
- Missing repository ports in domain/application layers

### Automation

**Superpowers automatically:**
- Creates worktrees for isolation
- Runs tests between tasks
- Checks for regressions
- Manages checkpoints

**Domain agents ensure:**
- DDD principles followed
- Architecture compliant
- Tests comprehensive
- Code quality high

## Common Patterns

### Pattern 1: Multi-Context Feature

**Example:** Advertisement bot needs both `bot-identity` and new `advertising` context.

**Workflow:**
```
/superpowers:brainstorm
  ↓
Identify two bounded contexts needed
  ↓
/superpowers:write-plan
  ↓
Task 1: Define advertising context boundaries (@ddd-aligner)
Task 2: Create shared kernel if needed (@code-writer)
Task 3: Implement bot-identity changes (@code-writer)
Task 4: Implement advertising context (@code-writer)
Task 5: Create anti-corruption layer (@code-writer)
Task 6: Write cross-context BDD (@bdd-writer)
...
```

### Pattern 2: Breaking Change

**Example:** Changing aggregate structure

**Workflow:**
```
/superpowers:brainstorm
  ↓
Migration strategy discussion
  ↓
/superpowers:write-plan
  ↓
Task 1: Create migration BDD (@bdd-writer)
Task 2: Implement new aggregate (@code-writer)
Task 3: Add migration script (@code-writer)
Task 4: Verify backwards compatibility (@bdd-runner)
Task 5: Data migration test (@bdd-runner)
...
```

### Pattern 3: Spike/Prototype

**Example:** Exploring new technology

**Workflow:**
```
/superpowers:brainstorm
  ↓
Quick exploration (1-2 hours max)
  ↓
Decision: Keep or discard?
  ↓
If keep → Full workflow
If discard → /superpowers:finish-branch → discard
```

## Troubleshooting

### Agent Not Responding

**Check:**
1. Is agent defined in `opencode.json`?
2. Is `.opencode/agents/{name}.md` present?
3. Correct @mention syntax?

### Superpowers Commands Not Working

**Check:**
1. Superpowers installed? (`ls ~/.config/opencode/superpowers`)
2. Plugin symlinked? (`ls -l ~/.config/opencode/plugins/`)
3. Skills symlinked? (`ls -l ~/.config/opencode/skills/`)
4. Restarted OpenCode?

### Tests Failing Unexpectedly

**Debug flow:**
```
@bdd-runner report failures
  ↓
Main agent analyzes
  ↓
If domain issue → @code-writer fix
If test issue → @bdd-writer fix
If server issue → @site-keeper fix
  ↓
@bdd-runner re-run
  ↓
@ci-runner final check
```

### Architecture Violations - STOP AND FIX

**⚠️ CRITICAL: Architecture violations are HARD STOPS. You cannot bypass them.**

**Common violations that STOP the workflow:**
- Domain layer importing infrastructure (convex, database, external APIs)
- Missing repository ports (interfaces)
- Direct database calls in domain or application layers
- Dependencies pointing outward (violating hexagonal architecture)
- Infrastructure leaking into domain logic

**Mandatory Fix Flow - NO EXCEPTIONS:**
```
@architecture-inspector identify violations
  ↓
🚫 WORKFLOW STOPS - Cannot proceed with violations
  ↓
User reviews violations
  ↓
@code-writer MUST refactor to fix ALL violations
  ↓
Move logic to proper layer
Create missing ports
Extract adapters
Remove infrastructure imports from domain
  ↓
@architecture-inspector re-verify
  ↓
✅ ALL violations must be resolved before continuing
```

**NEVER:**
- "Just skip the architecture review this once"
- "We'll fix it later"
- "It's just a small violation"
- "It works, so it's fine"

**ALWAYS:**
- Fix violations immediately when found
- Verify with @architecture-inspector after fixes
- Only proceed after explicit approval

## Best Practices

### 1. Always Start with BDD

**Why:** Tests define the contract and behavior upfront.

**How:**
- Never write code before BDD scenarios
- bdd-writer creates scenarios first
- All scenarios should fail (RED phase)

### 2. Keep Tasks Small

**Why:** Easier to review, faster feedback, less risk.

**Target:** 2-5 minutes per task

**Signs tasks are too big:**
- Takes >15 minutes
- Touches >5 files
- Multiple responsibilities

### 3. Review Early and Often

**Why:** Catches issues before they compound.

**Checkpoints:**
- After BDD (human review)
- After domain layer (architecture review)
- After implementation (domain review)
- Before merge (CI review)

### 4. Document as You Go

**Why:** Keeps docs in sync with code.

**What to update:**
- ROADMAP.md (status changes)
- CHANGELOG.md (every change)
- DDD docs (domain changes)
- AGENT.md (workflow changes)

### 5. Use Skills for Complex Patterns

**Why:** Consistency and expertise.

**When to load skills:**
```
Before implementing complex domain logic:
  use skill tool to load clean-ddd-hexagonal

Before creating new BDD tests:
  use skill tool to load superpowers-integration

Before debugging:
  use skill tool to load systematic-debugging
```

## Command Reference

### Superpowers Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/superpowers:brainstorm` | Interactive design | Starting new feature |
| `/superpowers:write-plan` | Create task plan | After brainstorm |
| `/superpowers:execute-plan` | Execute with checkpoints | After plan approval |
| `/superpowers:finish-branch` | Complete and merge | After all tasks |

### Domain Agent Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `@bdd-writer` | Create BDD scenarios | Always first |
| `@code-writer` | Implement features | After BDD |
| `@architecture-inspector` | Verify architecture | After implementation |
| `@ddd-aligner` | Check domain model | After implementation |
| `@bdd-runner` | Run tests | After code complete |
| `@ci-runner` | Full CI suite | Before merge |
| `@site-keeper` | Manage servers | Server issues |
| `@ux-ui-inspector` | UI review | UI changes |

### Just Commands

| Command | Purpose |
|---------|---------|
| `just dev-all` | Start development |
| `just test` | Run unit tests |
| `just bdd-test` | Run BDD tests |
| `just check` | Lint + typecheck + test |
| `just bdd-roadmap ROAD-XXX` | Test specific feature |

## Migration from Old Workflow

### If You Were Using Direct Agent Calls

**Before:**
```
@code-writer implement feature X
```

**After:**
```
/superpowers:brainstorm
/superpowers:write-plan
/superpowers:execute-plan
```

**Benefits:**
- Better planning
- Consistent TDD/BDD
- Quality gates
- Documentation enforced

### If You Were Using Manual TDD

**Before:**
```
Write tests manually
Write code manually
Refactor manually
```

**After:**
```
@bdd-writer creates tests
@code-writer implements
@architecture-inspector + @ddd-aligner review
```

**Benefits:**
- Agent expertise
- Consistent patterns
- Automated quality checks
- Faster iteration

## Summary

**This integration gives you:**
1. **Structure** - Superpowers methodology
2. **Expertise** - Specialized domain agents
3. **Quality** - TDD/BDD enforcement
4. **Speed** - Parallel agent execution
5. **Safety** - Multiple review checkpoints

**Remember:**
- Superpowers = The "how" (methodology)
- Domain Agents = The "what" (implementation)
- Always use both together for best results
- Never skip BDD scenarios before coding
- **🚫 NEVER bypass architecture checks - they are HARD STOPS**
- **Domain purity is non-negotiable**
- **@architecture-inspector MUST PASS before proceeding**
- Always run full CI before merging

**Architecture Enforcement - ZERO TOLERANCE:**
1. Domain layer imports infrastructure? → **STOP and fix**
2. Missing repository ports? → **STOP and create**
3. Dependencies flow outward? → **STOP and refactor**
4. @architecture-inspector finds violations? → **STOP and resolve ALL**
5. **No exceptions. No bypassing. No "we'll fix it later."

**When in doubt:**
1. Load this skill: `use skill tool to load superpowers-integration`
2. Start with brainstorm: `/superpowers:brainstorm`
3. Follow the workflow
4. Trust the process

---

**Version**: 1.0.0
**Last Updated**: 2026-01-31
**Compatible With**: Superpowers v4.1+, OpenCode latest
