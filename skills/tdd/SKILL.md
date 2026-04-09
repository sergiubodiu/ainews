---
name: tdd
description: Strict Test-Driven Development with clear progression levels, recommended katas, common pitfalls, and strong discipline enforcement. Tests first. No production code without a failing test.
---

# TDD Mastery

**Mode:** TDD MODE ACTIVATED

## The Iron Law (Never Break This)
**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

- Write any production code before the test? → Delete it immediately. Start over.
- Test passes on the first run? → Your test is too weak. Make it fail properly.

## Red-Green-Refactor Cycle (The Only Way)
1. **RED** — Write the *smallest* possible failing test for the next tiny behavior.
2. **GREEN** — Write the *minimal* code to make it pass (ugly is allowed).
3. **REFACTOR** — Improve both production code **and** test code while keeping all tests green.
4. **REPEAT**

Run the full test suite after every Green and every Refactor step.

## Progression Levels

### Level 1: Beginner – Build Muscle Memory
- Keep steps tiny (max 5–10 lines of code in Green phase)
- One small behavior per cycle
- **Katas:** FizzBuzz, Leap Year, Roman Numerals (simple)

**Success:** Complete a kata without ever writing production code first.

### Level 2: Intermediate – Let Tests Drive Design
- Focus on clean architecture and SOLID principles emerging from tests
- Write descriptive test names
- Introduce test doubles when appropriate
- **Katas:** Bowling Game, Tennis Scoring, Shopping Cart

**Success:** Final design feels simpler and more maintainable than if written upfront.

### Level 3: Advanced – Real-World TDD
- Outside-in TDD (acceptance tests → unit tests)
- Handle complex domains and legacy code
- **Katas:** Mars Rover, Gilded Rose, Yatzy, Monty Hall

**Success:** TDD a non-trivial feature confidently in under 2 hours.

## Common Pitfalls & Fixes

- **Writing big tests with multiple assertions**  
  → One behavior = one test. One clear assertion per test. If you need "and", split the test.

- **Skipping the Red phase ("I know it will fail")**  
  → Always run the test and read the failure message. It's your living specification.

- **Skipping Refactor (or doing it half-heartedly)**  
  → Force yourself every cycle. Bad code now = pain later. Refactor both production and test code.

- **Over-engineering in the Green phase**  
  → Ask: "What's the stupidest thing that could possibly work right now?"

- **Useless or "liar" tests** (tests that assert nothing useful or always pass)  
  → Delete them immediately. Chasing coverage is cancer.

- **Bad test names** (`test1()`, `shouldWork()`)  
  → Use behavior-focused names: `should_return_fizz_when_input_divisible_by_3`

- **Tests tightly coupled to implementation**  
  → Test observable behavior and outcomes, not internals, private methods, or exact order.

- **Slow or fragile tests**  
  → Unit tests must stay fast (< 1 second total). No real databases, networks, or I/O in unit tests.

- **Treating test code as second-class citizen**  
  → Refactor tests aggressively. Duplication and poor naming in tests hurt readability badly.

## Deliberate Practice Routine (Do This Weekly)

1. Pick a kata.
2. Solve it **once without TDD** (your normal style — baseline).
3. Solve it again **strictly with TDD** — record every cycle.
4. Compare the two versions:
   - Design quality & simplicity
   - Confidence when changing the code
   - Ease of adding new requirements
5. Repeat the **same kata** 3–5 times over several days until the TDD version feels clearly superior and natural.

**Pro tip:** Time-box each cycle (5–10 minutes max). Break the rules? Delete and restart.

## Recommended Tools & Platforms

- **Cyber-Dojo** — Best for tracking Red-Green rhythm and enforcing discipline.
- **kata-log.rocks** — Excellent kata catalog with TDD-friendly examples.
- **Exercism** — Great tracks with mentoring (many encourage test-first).

## TDD Session Output Format (Use This for Review)
