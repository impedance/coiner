# Documentation Hub

Use this file as the repo map for agents. Keep it short and specific.

## Start Here
- **Product spec:** `RFC-001-financial-behavior-tracker-mvp.md`
- Testing rules: `docs/testing.md`
- Harness plan (discovery): `docs/harness_plan.md`

## Fast Commands
- `make smoke` — fastest verification loop
- `make agent-smoke` — smoke + optional black-box checks (if wired)
- `make preflight` — broader verification loop

## Code Map
- **Entrypoints:** `app/` (Expo Router screens), `src/features/`
- **Core domain logic:** `src/domain/` (calculators, business rules, pure functions)
- **Boundaries / DTOs / config:** `src/types/` (TypeScript types), `src/lib/` (utilities)
- **Adapters (I/O):** `src/db/` (SQLite repositories, migrations, seeds)

## Typing Surfaces
- **Config boundary:** `src/types/` — domain entity types, transaction types, cycle types
- **Service boundary:** `src/domain/` — calculator interfaces, repository interfaces
- **External I/O boundary:** `src/db/repositories/` — SQLite access layer

## Test Map
- **Smoke path:** `make smoke` — structural checks + lint + test
- **Black-box path (optional):** `make agent-smoke` — not wired yet
- **Full path:** `make preflight` — structural + lint + typecheck + test
- **Integration path (opt-in):** future Expo e2e tests

## Project Structure

```text
app/                          # Expo Router screens
  (tabs)/                     # Main tab navigation
  transaction/                # Transaction flows
  goal/                       # Goal flows
  cycle/                      # Cycle flows
  report/                     # Reports
  settings/                   # Settings
src/
  db/
    client/                   # SQLite client setup
    migrations/               # Versioned schema migrations
    seeds/                    # Seed data (categories, practices)
    repositories/             # Data access layer
  domain/
    accounts/                 # Account business logic
    categories/               # Category business logic
    transactions/             # Transaction logic, calculators
    plans/                    # Bucket planning logic
    goals/                    # Goal logic, contributions
    cycles/                   # Cycle and practice logic
    reviews/                  # Weekly review logic
    reports/                  # Report calculators
  features/                   # Feature-specific hooks and view models
  components/                 # Reusable UI components
  lib/                        # Utilities
  hooks/                      # Shared hooks
  theme/                      # Theming
  types/                      # TypeScript types
```
