# RFC 001: Moneywork MVP — Financial Behavior Tracker

**Status:** Draft  
**Owner:** Product / Solo Builder / Coding Agent  
**Date:** 2026-03-17  
**Target platform:** iPhone-first (Expo / React Native)  
**Stack:** Expo + React Native + TypeScript + Expo Router + Expo SQLite  

---

## AI/Agent Note

This RFC is intentionally implementation-facing.

The coding agent should:
- implement only the scope defined here;
- avoid expanding into bank sync, cloud sync, social, AI coach, or advanced analytics;
- prefer low-abstraction, local-first solutions;
- keep the repository simple enough for one person to maintain;
- treat any undefined behavior as a prompt to choose the simplest option consistent with this RFC.

If a decision is not explicitly specified here, the agent should prefer:
1. fewer dependencies;
2. local persistence over remote services;
3. explicit code over framework-heavy abstractions;
4. clear UX over feature density.

---

## 1. Summary

Build a lightweight personal finance app that combines:
- fast daily transaction capture;
- simple bucket-based planning;
- reserve and joy-fund allocation;
- goal tracking with visual artifacts;
- behavior loops based on 14/21/30-day practice cycles;
- weekly review as the main reflection and correction ritual.

This is **not** a full budgeting platform and **not** a digital version of the full course.

The app is a **financial behavior tracker**: a practical daily operating layer for money awareness, allocation, and habit reinforcement.

---

## 2. Problem Statement

The current problem is not a lack of financial information. The problem is that day-to-day money behavior tends to break down between intention and repetition.

Users often fail in one or more of these ways:
- they do not capture transactions consistently;
- they do not assign money to specific jobs after income arrives;
- they underfund safety buffers;
- they build overly strict systems that become emotionally unsustainable;
- they do not review the week and therefore repeat the same mistakes.

Existing tools usually optimize for accounting depth, collaboration, automation, or analytics. This project instead optimizes for:
- daily usability;
- behavior reinforcement;
- emotional sustainability;
- solo local-first operation.

---

## 3. Goals

### 3.1 Product goals

The MVP must let a single user:
- record income and expenses in seconds;
- organize spending into simple buckets/categories;
- assign money to jobs after income is recorded;
- maintain a reserve bucket and a joy fund bucket;
- track one or more goals;
- attach a visual artifact to a goal;
- run a 14/21/30-day practice cycle;
- complete a weekly review;
- view simple progress and summary reports.

### 3.2 UX goals

The product should feel:
- simple enough to use daily;
- emotionally supportive rather than punitive;
- more actionable than a spreadsheet;
- lighter than a full budgeting system.

### 3.3 Technical goals

The MVP must be:
- single-user;
- local-first;
- fully usable offline;
- free of backend and auth requirements;
- migration-safe for future schema evolution;
- structured so it can later evolve into a more complete app.

---

## 4. Non-Goals

The MVP will **not** include:
- bank sync;
- multi-user or household budgets;
- cloud sync;
- authentication;
- AI coaching or conversational features;
- social or competitive mechanics;
- investment portfolio tracking;
- debt optimization systems beyond simple categories/goals;
- receipt OCR;
- complex forecasting;
- heavy BI-style analytics;
- full course content delivery.

---

## 5. Target User

### 5.1 Primary user

A solo user who wants a daily financial control system with behavior reinforcement, but does not want the complexity of a full finance suite.

### 5.2 User job

> “Help me stay aware of my money every day, assign it intentionally, keep building safety and joy, and reinforce the financial behaviors I actually want to live by.”

---

## 6. User-Facing Product Behavior

When the user installs the app, they should be able to:

1. create basic accounts;
2. record transactions quickly;
3. see what money is available and what is still unassigned;
4. assign money to reserve, joy fund, and goals;
5. check off daily or weekly practices;
6. see their current streak and active cycle progress;
7. complete a weekly review;
8. view simple financial summaries;
9. export their data locally.

In practical terms, the user experience should look like this:
- **daily:** open app → add expense/income → optionally assign money → confirm progress;
- **weekly:** open review → inspect results → note issue → update next focus;
- **monthly:** refresh plan → check reserve/goals/step progression → start next cycle.

---

## 7. Product Principles

1. **Capture first.** If daily capture fails, the whole system fails.
2. **Behavior over accounting depth.** The app is a behavior layer, not a bookkeeping suite.
3. **Real-world rewards only.** Progress should map to real actions and real money movement.
4. **Local-first by default.** The app must remain useful without any network dependency.
5. **No-shame UX.** Missing a day should not make the product feel hostile.
6. **Simple planning.** Give money a job, but do not build a complicated envelope engine.
7. **Weekly review is mandatory to the system.** It is a first-class workflow, not a secondary report.

---

## 8. Proposed Solution Overview

The app has five core layers:

1. **Transactions layer**  
   Capture income, expenses, transfers, and adjustments.

2. **Planning layer**  
   Assign money into categories and system buckets.

3. **Goal layer**  
   Track reserve, joy fund, and custom goals; attach artifacts.

4. **Behavior layer**  
   Support practice cycles, check-ins, streaks, and minimum/optimum/maximum execution.

5. **Review layer**  
   Weekly review and simple reports connect money facts with behavior correction.

---

## 9. Scope: Screens and Functional Requirements

The MVP includes eight primary screens/areas.

### 9.1 Today / Dashboard

Purpose: main daily entry point.

Must show:
- total balance across active accounts;
- unassigned money amount;
- reserve progress;
- joy fund progress;
- active goal progress;
- active cycle progress;
- next required action, such as “weekly review due”;
- quick actions for add expense, add income, mark practice.

Must support:
- navigating to add transaction;
- navigating to weekly review;
- navigating to cycle details;
- showing status without requiring deep drilling.

### 9.2 Add Transaction

Purpose: fastest possible capture flow.

Must support transaction types:
- expense;
- income;
- transfer;
- adjustment.

Minimum fields:
- type;
- amount;
- account;
- category for income/expense;
- date/time;
- note (optional).

Optional links:
- goal;
- money step.

Success criteria:
- common expense entry should be completable in one short flow with minimal taps;
- app should return to a useful state after save.

### 9.3 Plan / Buckets

Purpose: assign money a job in a lightweight form.

Must include:
- category/bucket list;
- planned amount for current month;
- assigned amount;
- spent amount;
- available amount;
- system buckets for reserve and joy fund;
- explicit unassigned amount indicator.

Must support:
- allocating new income;
- editing monthly planned amounts;
- carrying balances forward at the data level where relevant.

### 9.4 Goals & Artifacts

Purpose: give saving and behavior a visible purpose.

Must support:
- create/edit/archive goal;
- goal types: reserve, purchase, freedom, custom;
- target amount;
- current amount;
- due date optional;
- artifact attachment with title, note, image;
- goal progress visualization.

Artifact behavior:
- image stored locally;
- artifact can be shown before completion;
- unlock states can be represented if desired, but the simplest valid behavior is to mark when a goal is achieved.

### 9.5 Cycles & Practices

Purpose: track behavioral repetitions over 14/21/30 days.

Must support:
- create one active cycle at a time in v1;
- choose cycle duration: 14, 21, or 30 days;
- choose cycle mode: soft or classic reset;
- define included practices from a system list;
- check in daily;
- show streak and completion state;
- show execution level: minimum / optimum / maximum.

System practice list for v1:
- capture_all;
- review_today_or_stay_current;
- reserve_action;
- joy_action;
- weekly_review_done;
- money_step_action;
- no_spend_window (optional system preset).

### 9.6 Weekly Review

Purpose: convert raw money data into correction.

Must show:
- weekly income total;
- weekly expense total;
- major overspent categories;
- reserve movement;
- joy fund movement;
- goal movement;
- cycle completion status.

Must support:
- short reflection text;
- next focus text;
- completion marker for the week.

This screen is part planning ritual, part reflection ritual.

### 9.7 Reports

Purpose: simple summaries, not deep analytics.

Must include:
- spending by category;
- income vs expense by week/month;
- reserve trend;
- joy fund trend;
- goal progress summary;
- cycle completion summary.

Do not include:
- forecasting engine;
- advanced filters;
- cashflow projections beyond very simple summaries.

### 9.8 Settings / Data

Must support:
- currency selection;
- week start preference;
- default cycle mode;
- category management;
- export JSON backup;
- export CSV transactions;
- import JSON backup;
- reset local data with confirmation.

---

## 10. Information Architecture and Routing

Recommended bottom-tab structure:
- Today
- Plan
- Goals
- Review
- More

Inside More:
- Reports
- Cycles
- Settings

Recommended Expo Router shape:

```text
app/
  (tabs)/
    index.tsx              # Today
    plan.tsx               # Plan / Buckets
    goals.tsx              # Goals
    review.tsx             # Weekly Review
    more.tsx               # Menu
  transaction/
    new.tsx
    [id].tsx
  goal/
    new.tsx
    [id].tsx
    [id]/artifact.tsx
  cycle/
    index.tsx
    new.tsx
    [id].tsx
  report/
    index.tsx
  settings/
    index.tsx
```

The agent may adjust exact route names, but the navigation behavior must remain consistent with this RFC.

---

## 11. User Flows

### 11.1 First Launch Flow

1. User opens app.
2. User selects currency.
3. User creates at least one account.
4. App seeds default categories and system buckets.
5. User optionally creates first goal.
6. User optionally selects default cycle duration.
7. User lands on Today screen.

### 11.2 Expense Capture Flow

1. User taps Add Expense.
2. User enters amount.
3. User selects account.
4. User selects category.
5. User saves transaction.
6. Dashboard updates immediately.

### 11.3 Income Allocation Flow

1. User adds income transaction.
2. App returns success state and prompts or routes to allocation.
3. User assigns money into categories/buckets.
4. Unassigned amount updates until zero or partial allocation is accepted.

### 11.4 Weekly Review Flow

1. User opens Weekly Review.
2. App computes weekly summary.
3. User reads results.
4. User writes short reflection.
5. User sets next focus.
6. User marks review complete.

### 11.5 Cycle Check-in Flow

1. User opens cycle screen.
2. User sees today’s required practices.
3. User marks done/missed for relevant practices.
4. App updates streak and cycle progress.

### 11.6 Goal Artifact Flow

1. User creates or edits goal.
2. User attaches image artifact and note.
3. User contributes money over time.
4. App updates progress.
5. Goal reaches target and is marked achieved.

---

## 12. Core Domain Model

The MVP domain includes the following entities:

- `Account`
- `Category`
- `Transaction`
- `MonthlyBucketPlan`
- `Goal`
- `Artifact`
- `GoalContribution`
- `MoneyStep`
- `PracticeDefinition`
- `Cycle`
- `CyclePractice`
- `PracticeCheckin`
- `WeeklyReview`
- `AppSetting`

### 12.1 Entity summaries

#### Account
Represents a money container such as cash, card, or savings.

#### Category
Represents an income or expense classification. Some categories are system categories/buckets.

#### Transaction
Represents a single money event.

#### MonthlyBucketPlan
Stores monthly planned and assigned amounts per category.

#### Goal
Represents a target amount to save toward.

#### Artifact
Represents the visual and emotional anchor attached to a goal.

#### GoalContribution
Represents explicit money movement toward a goal.

#### MoneyStep
Represents a lifestyle/behavior improvement step. This may be lightweight in v1.

#### PracticeDefinition
Represents a system-defined practice that can be checked off.

#### Cycle
Represents a 14/21/30-day behavior cycle.

#### CyclePractice
Connects practices to a cycle.

#### PracticeCheckin
Represents daily/weekly completion state for a practice.

#### WeeklyReview
Stores the completed review record for a week.

#### AppSetting
Stores small key-value preferences.

---

## 13. Data and Storage Design

### 13.1 Storage approach

Use SQLite via Expo SQLite as the primary source of truth.

The app must not depend on a remote API.

All important state must survive app restarts. Derived values such as totals may be computed from source data, optionally with memoized selectors.

### 13.2 Data rules

- all amounts stored as integer cents;
- all IDs stored as string UUIDs;
- all timestamps stored as ISO strings;
- local timezone semantics are acceptable for v1;
- soft deletes may be represented as archive flags instead of destructive deletion where useful.

### 13.3 Schema ownership

The agent should implement:
- startup database initialization;
- versioned migrations;
- deterministic seed data for system categories/practices;
- idempotent re-runs for seed logic.

### 13.4 Reference schema

The following schema is the baseline contract and may be extended carefully if implementation requires it.

```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL,
  opening_balance_cents INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  bucket_type TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  account_id TEXT NOT NULL,
  to_account_id TEXT,
  category_id TEXT,
  amount_cents INTEGER NOT NULL,
  happened_at TEXT NOT NULL,
  note TEXT,
  goal_id TEXT,
  money_step_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE monthly_bucket_plans (
  id TEXT PRIMARY KEY,
  month_key TEXT NOT NULL,
  category_id TEXT NOT NULL,
  planned_cents INTEGER NOT NULL DEFAULT 0,
  assigned_cents INTEGER NOT NULL DEFAULT 0,
  carryover_mode TEXT NOT NULL DEFAULT 'carry',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (month_key, category_id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  target_cents INTEGER NOT NULL,
  current_cents INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  goal_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_uri TEXT,
  unlock_rule_type TEXT NOT NULL,
  unlock_amount_cents INTEGER,
  unlocked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id)
);

CREATE TABLE goal_contributions (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  transaction_id TEXT,
  amount_cents INTEGER NOT NULL,
  happened_at TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE money_steps (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL,
  target_frequency TEXT,
  target_value INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TEXT NOT NULL,
  achieved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE practice_definitions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  scope TEXT NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE cycles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'soft',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  target_level TEXT NOT NULL DEFAULT 'minimum',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE cycle_practices (
  id TEXT PRIMARY KEY,
  cycle_id TEXT NOT NULL,
  practice_definition_id TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 1,
  UNIQUE (cycle_id, practice_definition_id),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (practice_definition_id) REFERENCES practice_definitions(id)
);

CREATE TABLE practice_checkins (
  id TEXT PRIMARY KEY,
  cycle_id TEXT,
  practice_definition_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (cycle_id, practice_definition_id, checkin_date),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (practice_definition_id) REFERENCES practice_definitions(id)
);

CREATE TABLE weekly_reviews (
  id TEXT PRIMARY KEY,
  week_key TEXT NOT NULL UNIQUE,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  income_cents INTEGER NOT NULL DEFAULT 0,
  expense_cents INTEGER NOT NULL DEFAULT 0,
  reserve_delta_cents INTEGER NOT NULL DEFAULT 0,
  joy_delta_cents INTEGER NOT NULL DEFAULT 0,
  reflection TEXT,
  next_focus TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 13.5 Indexing requirements

The implementation must add indexes at minimum for:
- transactions by date;
- transactions by category;
- transactions by account;
- plans by month;
- practice checkins by date;
- weekly reviews by week key.

---

## 14. Business Rules

1. Every transaction must belong to an account.
2. Income and expense transactions must use a category.
3. Transfer transactions move money between accounts and must not count as income/expense in reports.
4. System buckets must exist by default:
   - reserve;
   - joy fund.
5. The app must allow unassigned money, but should always show it clearly.
6. Weekly review is at most one record per week key.
7. v1 supports one active cycle at a time.
8. Practice completion must never be fabricated from assumptions; only explicit check-ins count.
9. Goal completion must be based on actual contribution totals or explicit user confirmation where needed.
10. Archived entities must not appear in primary selection UIs unless explicitly requested.

---

## 15. Application Architecture

### 15.1 Architecture style

Use a straightforward layered architecture:

- **UI layer**: screens, components, navigation
- **Feature layer**: hooks, view models, user actions per feature
- **Domain layer**: types, calculators, business rules
- **Persistence layer**: SQLite access, repositories, migrations, seeds

### 15.2 Recommended source layout

```text
src/
  db/
    client/
    migrations/
    seeds/
    repositories/
  domain/
    accounts/
    categories/
    transactions/
    plans/
    goals/
    cycles/
    reviews/
    reports/
  features/
    dashboard/
    transactions/
    plan/
    goals/
    cycles/
    review/
    reports/
    settings/
  components/
  lib/
  hooks/
  theme/
  types/
```

### 15.3 State management

Prefer simple local state and feature hooks first.

Global/shared app state may be limited to:
- database readiness;
- current month/week selection;
- active settings;
- lightweight refresh or invalidation mechanism.

Do not introduce Redux.

A lightweight state library is optional, not mandatory. The simplest viable implementation is preferred.

### 15.4 Calculations

Derived calculations should live in pure functions whenever possible. Examples:
- account balance rollups;
- category totals;
- unassigned money;
- reserve/joy deltas;
- weekly summary generation;
- cycle progress and streak logic.

These should be independently testable.

---

## 16. Dependency Policy

Required runtime stack:
- expo
- react-native
- typescript
- expo-router
- expo-sqlite

Allowed additional Expo-native dependencies where needed:
- expo-image-picker (artifact image attachment)
- expo-file-system (backup/export/import support)
- expo-sharing (share exported backups)
- expo-document-picker (import backup file)

Optional utility dependencies are acceptable only if they materially reduce complexity. Do not add heavy state, analytics, or backend-oriented libraries.

---

## 17. Implementation Milestones

### Milestone 1 — Foundation and Capture

Deliver:
- Expo app scaffold;
- routing skeleton;
- SQLite setup with migrations and seeds;
- accounts;
- categories;
- transaction creation;
- Today screen basic summary;
- initial settings.

Definition of done:
- app runs locally on iPhone simulator/device;
- user can add accounts and transactions;
- relaunch preserves data;
- default categories exist;
- Today screen reflects stored data.

### Milestone 2 — Planning and Goals

Deliver:
- Plan / Buckets screen;
- monthly bucket plan storage;
- unassigned amount calculation;
- reserve and joy-fund support;
- goals CRUD;
- goal contributions;
- artifact attachment.

Definition of done:
- user can allocate money to system buckets and goals;
- goal progress updates correctly;
- artifact image persists locally.

### Milestone 3 — Behavior Layer

Deliver:
- cycle creation;
- practice definitions seed;
- daily check-ins;
- streak logic;
- minimum/optimum/maximum display;
- cycle progress UI.

Definition of done:
- one active cycle can be created and used;
- check-ins affect progress predictably;
- cycle survives app relaunch.

### Milestone 4 — Review, Reports, and Data Portability

Deliver:
- Weekly Review screen and persistence;
- reports;
- JSON export/import;
- CSV export of transactions;
- UX polish and empty states.

Definition of done:
- weekly review can be completed and re-opened;
- reports show correct aggregates;
- exported data can be restored successfully.

---

## 18. Acceptance Criteria

### 18.1 Functional acceptance

The MVP is acceptable when all of the following are true:

1. A new user can complete onboarding and create at least one account.
2. The user can add income, expense, transfer, and adjustment transactions.
3. Transactions persist across app restarts.
4. The app shows balances and summary values derived from stored transactions.
5. Reserve and joy fund are available as first-class buckets.
6. The user can create and update monthly plan amounts.
7. The user can create a goal and record contributions toward it.
8. The user can attach a local image artifact to a goal.
9. The user can create one active 14/21/30-day cycle.
10. The user can check off daily practices.
11. The user can complete one weekly review per week.
12. The user can export a JSON backup and restore it.
13. The user can export transactions to CSV.

### 18.2 UX acceptance

1. Common expense entry should feel fast and low-friction.
2. Main dashboard should surface the next meaningful action.
3. The app should remain understandable without reading documentation.
4. Missing a day should not irreversibly break the product experience.

### 18.3 Technical acceptance

1. TypeScript compilation passes in strict mode.
2. Lint passes.
3. Migrations run from a clean install.
4. Seed data is idempotent.
5. Key pure logic has automated tests.

---

## 19. Non-Functional Requirements

### 19.1 Performance

- app launch should feel fast on a modern iPhone;
- transaction save should be near-instant;
- primary dashboards and reports should remain responsive with at least 12 months of typical personal-use data.

### 19.2 Reliability

- writes must not silently fail;
- migrations must be versioned and recoverable;
- duplicate writes from accidental repeated taps should be prevented where practical.

### 19.3 Offline behavior

- all primary flows must work offline;
- no screen should require a network request to be useful.

### 19.4 Accessibility

- support Dynamic Type where practical;
- tap targets should be mobile-safe;
- primary actions must remain visible and discoverable.

### 19.5 Security and privacy

- data remains local in v1;
- no hidden network sync;
- no auth promises;
- optional local app lock may be deferred beyond MVP.

---

## 20. Testing Strategy

### 20.1 Automated tests required

At minimum, test pure logic for:
- transaction rollups;
- unassigned money calculation;
- reserve/joy totals;
- goal contribution aggregation;
- weekly summary generation;
- cycle streak/progress calculations;
- migration version behavior if feasible.

### 20.2 Manual QA checklist required

Manual verification must cover:
- clean install onboarding;
- add/edit/delete/archive flows;
- app relaunch persistence;
- export/import restore;
- changing currency and week start;
- creating a cycle and checking in over multiple days;
- weekly review completion;
- empty states and no-data screens.

---

## 21. Repository Requirements for Agent Work

The implementation repository should include:

- `README.md` with local run instructions;
- `AGENTS.md` with project-specific coding instructions;
- `CLAUDE.md` with equivalent or complementary project instructions;
- `docs/` for architecture notes if needed;
- `rfc/` folder containing this RFC.

### 21.1 Required package scripts

The repository must expose at minimum:

```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Equivalent script names are acceptable if clearly documented.

### 21.2 Required AGENTS.md guidance

At minimum, the repo guidance file should tell an agent:
- do not add backend/auth/cloud features;
- do not widen scope beyond this RFC;
- run lint + typecheck + tests before marking work complete;
- prefer small, reviewable changes;
- preserve migration safety.

---

## 22. Suggested AGENTS.md Starter

```md
# AGENTS.md

## Project Scope
- This repository implements a local-first iPhone-first financial behavior tracker.
- Follow RFC 001 as the source of truth for scope.
- Do not add backend, auth, bank sync, cloud sync, AI coach, or social features.

## Working Rules
- Prefer simple solutions over abstractions.
- Preserve SQLite migration safety.
- Keep runtime dependencies minimal.
- Write or update tests for pure logic when behavior changes.
- Run lint, typecheck, and tests before finalizing changes.

## Product Priorities
1. Fast daily transaction capture
2. Clear plan/bucket behavior
3. Weekly review
4. Cycle check-ins and streak logic
5. Goal tracking with local artifacts
```

---

## 23. Risks and Mitigations

### Risk 1: Scope drift into “small YNAB clone”
Mitigation:
- keep reports simple;
- avoid complex budgeting rules;
- treat planning as lightweight assignment, not full envelope accounting.

### Risk 2: Scope drift into “course app”
Mitigation:
- implement behavioral mechanics only;
- do not embed long lessons, content trees, or teaching flows in MVP.

### Risk 3: Over-engineered architecture
Mitigation:
- use local-first SQLite;
- avoid backend abstractions;
- avoid complex state solutions unless necessary.

### Risk 4: Habit mechanics becoming punitive
Mitigation:
- default to soft cycle mode;
- use no-shame language;
- present missed actions as recoverable.

### Risk 5: Export/import fragility
Mitigation:
- define stable backup format early;
- test round-trip restore before calling MVP complete.

---

## 24. Open Questions

These do not block initial implementation but should be resolved during build if needed:

1. Should the default dashboard emphasize “unassigned money” or “today’s action” more strongly?
2. Should money steps ship in MVP as full objects or as a light progress marker attached to goals/cycles?
3. Should goal contributions be inferred from category assignment, explicit user action, or both?
4. Should the first release allow multiple goals immediately or encourage one primary goal in onboarding?

The agent should choose the simplest implementation path consistent with this RFC if these remain unresolved.

---

## 25. Rollout Recommendation

Recommended release order:

1. Internal/dev build with transaction capture and persistence.
2. Add planning/goals and validate daily usability.
3. Add cycles and weekly review.
4. Add export/import and reports.
5. Cut MVP release.

This should be built as a single-user tool first, with no preparation for multi-user or remote sync beyond keeping code modular.

---

## 26. Definition of MVP Complete

The MVP is complete when:
- the app can be installed and used locally on iPhone;
- a user can capture, plan, save, review, and track habits without any backend;
- reserve and joy fund are built in;
- goals and artifacts work end-to-end;
- one active cycle works end-to-end;
- weekly review works end-to-end;
- exports/imports work end-to-end;
- the codebase is structured, typed, tested, and maintainable enough for the next RFC.

---

## 27. Explicit Out-of-Scope Reminder for the Agent

The following are not accidental omissions. They are intentionally excluded from MVP:
- bank integrations;
- Plaid or similar providers;
- user accounts;
- cloud backups;
- push-based coaching chat;
- recommendation engines;
- shared budgeting;
- premium paywalls;
- web admin panels;
- advanced forecasting.

Do not implement any of these unless a future RFC explicitly adds them.

