# Documentation Hub

Use this file as the repo map for agents. Keep it short and specific.

## Start Here
- **Technical spec:** `docs/RFC-001.md`
- Testing rules: `docs/testing.md`

## Core Philosophy: "80% Psychology / 20% Mechanics"
The app is based on the "Master of Money" course principles. While traditional finance tools focus on deep accounting and automation, Moneywork focuses on:
- **Awareness**: Capturing every transaction manually to stay "awake" to money movement.
- **Intentionality**: Giving every dollar a job (The Bucket System).
- **Safety & Joy**: Prioritizing the Reserve (safety) and the Joy Fund (motivation) as first-class citizens.
- **Integration**: Closing the loop through Weekly Reviews and Practice Cycles to turn actions into permanent habits.

## The Behavioral OS (Core Loops)
- **Daily Loop**: Capture transactions, assign jobs, and check-in on practices.
- **Weekly Loop**: Fact check vs. plan, identify leaks, and adjust for next week.
- **Monthly Loop**: Strategic planning and "Step-Up" evaluations.

## Glossary of Terms
| Term | Description |
| :--- | :--- |
| **Capture** | The act of manually recording a transaction. |
| **Bucket** | A category with a specific "job" assigned to its balance. |
| **Reserve** | A system bucket for security and emergency savings. |
| **Joy Fund** | A system bucket for guilt-free spending on personal happiness. |
| **Artifact** | A visual or text-based emotional reminder attached to a Goal. |
| **Cycle** | A time-bound period (14-30 days) focused on habit reinforcement. |
| **Weekly Review** | The ritual of reflecting on the past week and planning the next. |

## Fast Commands
- `make smoke` — fastest verification loop (structural + tests)
- `make agent-smoke` — smoke + optional black-box checks (if wired)
- `make preflight` — broader verification loop (structural + lint + typecheck + tests)

## Project Status
- [x] **EPIC-001: Foundation & Core Capture** — 100% complete.
- [x] **EPIC-002: Planning & Financial Review** — 100% complete.
- [/] **EPIC-003: Behavior & Integration** — 65% complete.

## Code Map
- **Entrypoints:** `app/` (Expo Router screens)
- **Data Access:** `src/db/repositories/` (repositories for each domain entity)
- **Feature Logic:** `src/hooks/` (hooks connecting repositories to UI)
- **Core domain logic:** `src/domain/` (pure calculators and business rules)
- **Boundaries / DTOs / config:** `src/types/` (TypeScript types)
- **Adapters (I/O):** `src/db/` (SQLite client, migrations, seeds)

## Documentation & Epics
- **Technical Spec:** `docs/RFC-001.md`
- **History:** `docs/archive/epics/`

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
    calculators.ts            # Shared calculation logic
    __tests__/                # Domain logic tests
  hooks/                      # Feature hooks (useGoals, useData, etc.)
  components/                 # Reusable UI components
  theme/                      # Design system (colors, typography)
  types/                      # Domain and DTO types
  features/                   # Feature-specific hooks and view models
  components/                 # Reusable UI components
  lib/                        # Utilities
  hooks/                      # Shared hooks
  theme/                      # Theming
  types/                      # TypeScript types
```
