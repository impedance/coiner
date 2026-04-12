# Testing Guide

## Goals
- Keep default checks fast enough for agent iteration.
- Prefer offline-by-default verification; gate real external calls behind an explicit opt-in (e.g. `INTEGRATION=1`).
- Support Expo/React Native testing conventions.

## Harness Details
- **Harness version:** 0.6
- **Detected stacks:** TypeScript, Expo, React Native

## Implementation Milestones
1. **Milestone 1 — Foundation and Capture:** SQLite, accounts, categories, transactions, Today screen
2. **Milestone 2 — Planning and Goals:** Buckets, goals, contributions, artifacts
3. **Milestone 3 — Behavior Layer:** Cycles, practices, check-ins, streaks
4. **Milestone 4 — Review, Reports, and Data Portability:** Weekly review, reports, export/import

## Default commands
- `make smoke` — fastest verification loop (structural + lint + test)
- `make agent-smoke` — optional black-box checks (if wired)
- `make preflight` — broader verification loop (structural + lint + typecheck + test)

## Testing Layers

### Unit Tests
Pure function tests for domain logic:
- Transaction calculators
- Bucket allocation logic
- Goal progress calculations
- Cycle/streak logic
- Weekly review aggregations

Location: `src/domain/**/__tests__/` or `__tests__/` alongside source

### Integration Tests
SQLite repository tests with in-memory or temp database:
- Repository CRUD operations
- Migration tests
- Seed data idempotency

Location: `src/db/__tests__/`

### Component Tests
React Native component tests (when wired):
- Screen rendering
- User interaction flows

Location: `src/components/__tests__/`, `src/features/**/__tests__/`

## Notes
- Optional flags:
  - `QUIET=1` — reduce successful tool output to one-line summaries (full output on failure).
  - `FAIL_FAST=1` — (Python/pytest) stop after the first failure (`--maxfail=1`).
- Put CI/debug output in `artifacts/`.
- If host-mode is supported, document it here.

## Expo/React Native Test Commands (when wired)
```bash
# Jest-based unit tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```
