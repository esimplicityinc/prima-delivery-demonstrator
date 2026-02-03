# Implementation Plan: ROAD-009 Escrow System

## Overview
Implement the Escrow aggregate and supporting infrastructure for the promise marketplace. Escrows secure tokens during promise execution and handle payment distribution based on verification results.

## Architecture
- **Domain**: Escrow aggregate with state machine, value objects, domain events
- **Application**: Use cases for escrow lifecycle operations
- **Infrastructure**: Convex mutations, queries, and table schema

---

## Task Breakdown

### Task 1: Create BDD Scenarios (bdd-writer) ⏱️ 5 min
**Agent**: @bdd-writer
**Goal**: Define acceptance criteria via Gherkin scenarios

**Deliverables**:
- `bdd/features/escrow/escrow-creation.feature`
  - Scenario: Create escrow when promise is accepted
  - Scenario: Fail to create escrow with insufficient consumer funds
  - Scenario: Fail to create escrow with insufficient provider stake
  
- `bdd/features/escrow/escrow-lifecycle.feature`
  - Scenario: Start escrow execution
  - Scenario: Complete escrow execution with proof
  - Scenario: Release escrow to provider on successful verification
  - Scenario: Return escrow to consumer on failed verification
  - Scenario: Handle escrow disputes

- `bdd/features/escrow/escrow-queries.feature`
  - Scenario: Query escrow by ID
  - Scenario: Query escrow by promise ID
  - Scenario: List escrows by bot

**Checkpoint**: Human review of scenarios

---

### Task 2: Domain Layer - Value Objects (code-writer) ⏱️ 5 min
**Agent**: @code-writer
**Goal**: Create immutable value objects for escrow domain

**Deliverables**:
- `src/domain/escrow/value-objects/EscrowId.ts`
  - UUID v4 generation
  - validation method
  - equals() method

- `src/domain/escrow/value-objects/EscrowState.ts`
  - States: CREATED, EXECUTING, COMPLETED, FAILED, DISPUTED, RELEASING, RETURNING, CLOSED
  - State transition validation
  - canTransitionTo() method

- `src/domain/escrow/value-objects/LockedFunds.ts`
  - Amount (positive integer)
  - Currency type
  - validate() method

- `src/domain/escrow/value-objects/StakeLock.ts`
  - Amount locked from provider
  - Reference to stake record

**Verification**: No external dependencies, pure domain logic

---

### Task 3: Domain Layer - Escrow Aggregate (code-writer) ⏱️ 10 min
**Agent**: @code-writer
**Goal**: Implement Escrow aggregate root with business rules

**Deliverables**:
- `src/domain/escrow/aggregates/Escrow.ts`
  - Properties: id, promiseId, consumerId, providerId, state, lockedFunds, stakeLock, createdAt, updatedAt
  - Constructor with validation
  - State transition methods:
    - startExecution() → EXECUTING
    - completeExecution(proof) → COMPLETED
    - markFailed(reason) → FAILED
    - release() → RELEASING
    - return() → RETURNING
    - close() → CLOSED
    - raiseDispute() → DISPUTED
  - Domain event emission

- `src/domain/escrow/events/EscrowCreated.ts`
- `src/domain/escrow/events/TokensLocked.ts`
- `src/domain/escrow/events/ExecutionStarted.ts`
- `src/domain/escrow/events/ExecutionCompleted.ts`
- `src/domain/escrow/events/EscrowReleased.ts`
- `src/domain/escrow/events/EscrowReturned.ts`
- `src/domain/escrow/events/EscrowDisputed.ts`

**Business Rules**:
1. Escrow can only be created with valid promise reference
2. Consumer must have sufficient wallet balance
3. Provider must have sufficient available stake
4. State transitions must follow valid paths
5. Only authorized actors can trigger transitions

**Verification**: Unit tests for all state transitions

---

### Task 4: Application Layer - Use Cases (code-writer) ⏱️ 10 min
**Agent**: @code-writer
**Goal**: Create application services coordinating escrow operations

**Deliverables**:
- `src/application/escrow/CreateEscrowUseCase.ts`
  - Input: promiseId, consumerId, providerId, amount, currency
  - Output: EscrowCreated event
  - Validation: Check wallet balance, check available stake
  - Coordination: Lock funds, lock stake, create escrow

- `src/application/escrow/StartExecutionUseCase.ts`
  - Input: escrowId, providerId
  - Validation: Only provider can start, state must be CREATED

- `src/application/escrow/CompleteExecutionUseCase.ts`
  - Input: escrowId, executionProof
  - Validation: State must be EXECUTING

- `src/application/escrow/ReleaseEscrowUseCase.ts`
  - Input: escrowId
  - Coordination: Transfer funds to provider, release stake, close escrow

- `src/application/escrow/ReturnEscrowUseCase.ts`
  - Input: escrowId, reason
  - Coordination: Return funds to consumer, slash stake, close escrow

**Dependencies**: Wallet service (for balance checks), Stake service (for stake operations)

---

### Task 5: Infrastructure - Convex Schema (code-writer) ⏱️ 5 min
**Agent**: @code-writer
**Goal**: Define Convex table schema for escrows

**Deliverables**:
- Update `convex/schema.ts`
  ```typescript
  escrows: defineTable({
    promiseId: v.id("promises"),
    consumerId: v.id("botAccounts"),
    providerId: v.id("botAccounts"),
    state: v.union(
      v.literal("CREATED"),
      v.literal("EXECUTING"),
      v.literal("COMPLETED"),
      v.literal("FAILED"),
      v.literal("DISPUTED"),
      v.literal("RELEASING"),
      v.literal("RETURNING"),
      v.literal("CLOSED")
    ),
    lockedAmount: v.number(),
    lockedCurrency: v.string(),
    stakeLockId: v.optional(v.id("stakeLocks")),
    executionProof: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
  })
  .index("by_promise", ["promiseId"])
  .index("by_consumer", ["consumerId"])
  .index("by_provider", ["providerId"])
  .index("by_state", ["state"])
  ```

- New table `stakeLocks` (if not exists)

---

### Task 6: Infrastructure - Convex Mutations (code-writer) ⏱️ 10 min
**Agent**: @code-writer
**Goal**: Implement Convex mutations for escrow operations

**Deliverables**:
- `convex/escrow/mutations.ts`
  - `createEscrow(args)` - Create escrow on promise acceptance
  - `startExecution(args)` - Provider starts work
  - `completeExecution(args)` - Submit execution proof
  - `releaseEscrow(args)` - Release funds to provider
  - `returnEscrow(args)` - Return funds to consumer
  - `raiseDispute(args)` - Raise dispute on escrow

**Validation**:
- Check caller permissions (bot ownership)
- Validate state transitions
- Ensure wallet/stake availability
- Emit domain events to event store

---

### Task 7: Infrastructure - Convex Queries (code-writer) ⏱️ 5 min
**Agent**: @code-writer
**Goal**: Implement Convex queries for escrow data access

**Deliverables**:
- `convex/escrow/queries.ts`
  - `getEscrow(args)` - Get escrow by ID
  - `getEscrowByPromise(args)` - Get escrow for a promise
  - `getEscrowsByConsumer(args)` - List consumer's escrows
  - `getEscrowsByProvider(args)` - List provider's escrows
  - `getEscrowsByState(args)` - Filter by state

---

### Task 8: Architecture Review (architecture-inspector) ⏱️ 5 min
**Agent**: @architecture-inspector
**Goal**: Verify hexagonal architecture compliance

**Checks**:
- Domain layer has no Convex imports ✓
- Application layer depends only on domain ✓
- Infrastructure layer implements domain interfaces ✓
- State machine properly encapsulated ✓
- Domain events properly structured ✓

---

### Task 9: Domain Alignment (ddd-aligner) ⏱️ 5 min
**Agent**: @ddd-aligner
**Goal**: Check domain model alignment

**Checks**:
- Ubiquitous language consistent with glossary ✓
- Escrow aggregate boundaries correct ✓
- Domain event naming matches glossary ✓
- Relationship with Promise aggregate appropriate ✓

---

### Task 10: BDD Test Execution (bdd-runner) ⏱️ 10 min
**Agent**: @bdd-runner
**Goal**: Run all BDD scenarios

**Scenarios to test**:
- All escrow creation scenarios
- All escrow lifecycle scenarios
- All escrow query scenarios

**Success Criteria**: 100% pass rate

---

### Task 11: CI Validation (ci-runner) ⏱️ 5 min
**Agent**: @ci-runner
**Goal**: Run full CI suite

**Checks**:
- Lint: No errors
- TypeScript: No type errors
- Format: All files formatted
- Tests: All pass

---

## Verification Checkpoints

1. **After BDD Scenarios**: Review with user ✋
2. **After Domain Layer**: Architecture inspection ✋
3. **After Application Layer**: Unit tests pass ✋
4. **After Infrastructure**: Integration tests pass ✋
5. **Before Merge**: All CI checks green ✋

## Dependencies

**Blocked by**:
- Promise aggregate (ROAD-012) - Need PromiseId reference
- Wallet system (ROAD-008) - Need to lock/unlock funds
- Stake system (ROAD-010) - Need to lock provider stake

**Blocks**:
- Promise Acceptance (ROAD-016) - Creates escrows
- Settlement Process (ROAD-019) - Uses escrow release
- Dispute Resolution (ROAD-020) - Uses escrow dispute

## Notes

- For MVP, manual fund deposits by admin (no crypto bridge yet)
- Stake system can be simplified for MVP (manual stake management)
- Promise aggregate can be stubbed if not yet implemented
- Focus on core escrow logic first, UI later
