---
name: test-driven-development
description: >
  Test-Driven Development (TDD) discipline and methodology. Covers the RED-GREEN-REFACTOR
  cycle, test-first development, writing effective tests, and TDD best practices.
  Use when implementing features, fixing bugs, or ensuring code quality through tests.
triggers:
  - TDD
  - test-driven
  - test first
  - red green refactor
  - failing test
  - unit test
  - write tests
  - test coverage
  - testing strategy
---

# Test-Driven Development (TDD)

TDD is a software development discipline where tests are written before the production code. It produces clean, well-designed code through rapid feedback cycles.

## The Three Laws of TDD

1. **You may not write production code until you have written a failing unit test.**
2. **You may not write more of a unit test than is sufficient to fail, and not compiling is failing.**
3. **You may not write more production code than is sufficient to pass the currently failing test.**

## The RED-GREEN-REFACTOR Cycle

```
    ┌─────────────────────────────────────────┐
    │                                         │
    ▼                                         │
┌───────┐      ┌───────┐      ┌───────────┐  │
│  RED  │ ───▶ │ GREEN │ ───▶ │ REFACTOR  │──┘
└───────┘      └───────┘      └───────────┘
 Write a        Write the      Improve the
 failing        minimum        code while
 test           code to        keeping tests
                pass           green
```

### RED Phase: Write a Failing Test

**Goal:** Define the expected behavior before implementation.

**Rules:**
- Write the test FIRST
- Test should fail for the right reason (not syntax errors)
- Test exactly ONE behavior
- Use descriptive test names that explain intent

**Example:**
```typescript
// RED: Test what we want, not what we have
describe('AdvertisementBot', () => {
  it('should send advertisement to specified channel', async () => {
    const bot = AdvertisementBot.create({
      name: 'TestBot',
      ownerId: 'user-123',
    });

    const result = bot.sendAdvertisement({
      channel: 'discord',
      message: 'Check out our marketplace!',
    });

    expect(result.isSuccess()).toBe(true);
    expect(bot.lastActivity).toBeDefined();
  });
});
```

**Run the test.** It should fail. If it passes, either:
- The behavior already exists (don't write duplicate code)
- The test is wrong (fix it)

### GREEN Phase: Make It Pass

**Goal:** Write the minimum code to make the test pass.

**Rules:**
- Do the simplest thing that works
- It's OK to hardcode values initially
- Don't add functionality the test doesn't require
- Avoid over-engineering

**Example:**
```typescript
// GREEN: Minimum code to pass
class AdvertisementBot {
  private _lastActivity?: Date;

  get lastActivity() {
    return this._lastActivity;
  }

  static create(props: { name: string; ownerId: string }) {
    return new AdvertisementBot();
  }

  sendAdvertisement(props: { channel: string; message: string }) {
    this._lastActivity = new Date();
    return { isSuccess: () => true };
  }
}
```

**Run the test.** It should pass. If it doesn't, you have a bug—fix it.

### REFACTOR Phase: Clean Up

**Goal:** Improve code quality without changing behavior.

**Rules:**
- Tests must stay green throughout refactoring
- Remove duplication
- Improve naming
- Extract methods/classes as needed
- Apply design patterns where appropriate

**What to refactor:**
- Duplicate code
- Long methods
- Poor naming
- Missing abstractions
- Hardcoded values from GREEN phase

**Example:**
```typescript
// REFACTOR: Proper domain model
class AdvertisementBot extends AggregateRoot<BotId> {
  private readonly name: BotName;
  private readonly ownerId: UserId;
  private lastActivity?: Timestamp;

  private constructor(props: AdvertisementBotProps) {
    super(props.id);
    this.name = props.name;
    this.ownerId = props.ownerId;
  }

  static create(props: CreateBotProps): Result<AdvertisementBot> {
    const nameResult = BotName.create(props.name);
    if (nameResult.isFailure()) {
      return Result.fail(nameResult.error);
    }

    return Result.ok(new AdvertisementBot({
      id: BotId.generate(),
      name: nameResult.value,
      ownerId: UserId.from(props.ownerId),
    }));
  }

  sendAdvertisement(command: SendAdvertisementCommand): Result<void> {
    // Validate channel
    const channelResult = Channel.create(command.channel);
    if (channelResult.isFailure()) {
      return Result.fail(channelResult.error);
    }

    // Record activity
    this.lastActivity = Timestamp.now();

    // Raise domain event
    this.addDomainEvent(new AdvertisementSent({
      botId: this.id,
      channel: channelResult.value,
      sentAt: this.lastActivity,
    }));

    return Result.ok();
  }
}
```

**Run all tests.** They must still pass.

## TDD Cycle Timing

| Phase | Time | Focus |
|-------|------|-------|
| RED | 1-2 min | Define behavior |
| GREEN | 1-5 min | Make it work |
| REFACTOR | 2-10 min | Make it right |

**Target:** Complete a full cycle in 10-15 minutes max.

If a cycle takes longer:
- The test is too big (split it)
- You're implementing too much (smaller steps)
- You're refactoring too much (defer some to later cycles)

## Test Qualities (F.I.R.S.T.)

Good tests are:

| Quality | Meaning | Why It Matters |
|---------|---------|----------------|
| **F**ast | Tests run quickly (<100ms each) | Fast feedback enables rapid iteration |
| **I**ndependent | Tests don't depend on each other | Can run in any order, parallelize |
| **R**epeatable | Same result every time | No flaky tests, deterministic |
| **S**elf-validating | Pass/fail without manual checking | Automation requires binary results |
| **T**imely | Written before production code | TDD discipline, design feedback |

## Test Naming Conventions

Use descriptive names that explain the scenario:

```typescript
// PATTERN: should_[expected]_when_[condition]
'should reject registration when name is empty'
'should calculate discount when order exceeds threshold'
'should emit event when status changes'

// PATTERN: [method]_[scenario]_[expected]
'register_withEmptyName_throwsValidationError'
'calculateDiscount_orderAboveThreshold_applies10Percent'

// PATTERN: Given_When_Then (BDD style)
'given valid bot credentials, when registering, then bot is created'
```

## Test Structure (Arrange-Act-Assert)

Every test follows this pattern:

```typescript
it('should calculate total with tax', () => {
  // ARRANGE: Set up the test scenario
  const order = Order.create({
    items: [{ price: 100, quantity: 2 }],
    taxRate: 0.1,
  });

  // ACT: Execute the behavior under test
  const total = order.calculateTotal();

  // ASSERT: Verify the expected outcome
  expect(total).toBe(220); // 200 + 10% tax
});
```

**Keep each section focused:**
- ARRANGE: Only what's needed for this test
- ACT: Single operation being tested
- ASSERT: Single logical assertion (may be multiple `expect` calls)

## What to Test

### DO Test:
- Public behavior (methods, functions)
- Edge cases and boundaries
- Error conditions
- State transitions
- Domain invariants

### DON'T Test:
- Private methods directly (test through public interface)
- External libraries (they have their own tests)
- Trivial getters/setters (unless they have logic)
- Implementation details (refactoring will break tests)

## TDD Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Test After** | Writing tests after code | Stop. Write the test first. |
| **Too Big Steps** | Testing complex behavior in one go | Smaller, incremental tests |
| **Liar Tests** | Tests that pass but don't verify anything | Assert meaningful behavior |
| **Fragile Tests** | Tests break when implementation changes | Test behavior, not implementation |
| **Slow Tests** | Tests take too long to run | Mock external deps, optimize setup |
| **Test Duplication** | Same behavior tested multiple times | Remove duplicates, use parameterized tests |
| **Insufficient Assertions** | Test passes but behavior is wrong | Assert all relevant outcomes |
| **Setup Heavy** | 50 lines of setup, 1 line of test | Extract test helpers, simplify domain |

## TDD with BDD

TDD and BDD work together:

```
BDD (Outer Loop)              TDD (Inner Loop)
┌────────────────┐            ┌────────────────┐
│ Feature file   │ ──────────▶│ Unit tests     │
│ (Gherkin)      │            │ (TDD cycle)    │
│                │            │                │
│ Given/When/Then│ ──────────▶│ RED            │
│                │            │ GREEN          │
│                │            │ REFACTOR       │
└────────────────┘            └────────────────┘
```

**BDD defines WHAT** the system should do (acceptance criteria).
**TDD defines HOW** the code implements it (unit-level behavior).

### Integration with Domain Agents

```
@bdd-writer → Creates BDD scenarios (acceptance tests)
     ↓
@code-writer → Implements using TDD (unit tests)
     ↓
@bdd-runner → Verifies BDD scenarios pass
```

## TDD Decision Tree

```
Starting new feature?
├─ Yes → Write failing acceptance test (BDD)
│        └─ Then TDD the implementation
│
└─ No, fixing a bug?
   ├─ Yes → Write failing test that reproduces bug
   │        └─ Then fix using TDD (test fails → passes)
   │
   └─ No, refactoring?
      └─ Ensure tests exist
         └─ If not, write characterization tests first
            └─ Then refactor with safety net
```

## Test Doubles

Use test doubles to isolate the unit under test:

| Type | Purpose | Example |
|------|---------|---------|
| **Stub** | Provide canned responses | `stub.getUser = () => testUser` |
| **Spy** | Record calls for verification | `expect(spy).toHaveBeenCalledWith(...)` |
| **Mock** | Stub + Spy + expectations | Pre-programmed expectations |
| **Fake** | Working implementation (simplified) | In-memory database |
| **Dummy** | Placeholder, never used | Required param but not relevant |

**Prefer:**
1. Real objects (when fast and deterministic)
2. Fakes (for external dependencies)
3. Stubs (for simple canned responses)
4. Mocks (sparingly, for interaction testing)

## When NOT to Use TDD

TDD may not be ideal for:

- **Exploratory/spike code**: Throw-away prototypes
- **UI layouts**: Visual design is iterative
- **Trivial code**: Simple getters, configuration
- **External integrations**: Test at integration level instead

**But even then:** Write tests after to prevent regression.

## TDD Workflow Commands

| Phase | Command | Agent |
|-------|---------|-------|
| Define acceptance | Write .feature files | @bdd-writer |
| RED | Write failing unit test | @code-writer |
| GREEN | Implement minimum code | @code-writer |
| REFACTOR | Clean up code | @code-writer |
| Verify | Run all tests | @bdd-runner |
| Quality | Check architecture | @architecture-inspector |

## Quick Reference

### Starting TDD Cycle
```
1. Pick smallest behavior to implement
2. Write test that fails
3. Run test, see it fail (RED)
4. Write simplest code to pass
5. Run test, see it pass (GREEN)
6. Clean up code and tests
7. Run all tests (REFACTOR)
8. Repeat
```

### Test File Organization
```
src/
├── domain/bot/
│   └── AdvertisementBot.ts
└── __tests__/domain/bot/
    └── AdvertisementBot.test.ts
```

### Checklist Before Commit
- [ ] All tests pass
- [ ] Each test has clear intent (readable name)
- [ ] No skipped tests
- [ ] No console.log in tests
- [ ] Tests run in isolation
- [ ] Tests run fast (<5s for unit suite)

## Sources

- [Test-Driven Development by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530) — Kent Beck (2002)
- [The Three Laws of TDD](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html) — Robert C. Martin
- [TDD is Dead. Long Live Testing.](https://dhh.dk/2014/tdd-is-dead-long-live-testing.html) — DHH (counter-perspective)
- [Is TDD Dead?](https://martinfowler.com/articles/is-tdd-dead/) — Fowler, Beck, DHH (discussion series)
- [Growing Object-Oriented Software, Guided by Tests](http://www.growing-object-oriented-software.com/) — Freeman & Pryce

---

**Version**: 1.0.0
**Last Updated**: 2026-01-31
**Compatible With**: All domain agents
