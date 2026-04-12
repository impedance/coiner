# EPIC 002: Planning & Financial Review

## Context
Implement the "Give money a job" logic. This epic connects income to buckets (categories), tracks savings goals, and implements the reflection ritual.
**Reference:** [RFC-001](../../RFC-001-financial-behavior-tracker-mvp.md) section 9.3, 9.4, 9.6.

## Data Schema (Epic 2 Scope)
```sql
CREATE TABLE monthly_bucket_plans (
  id TEXT PRIMARY KEY,
  month_key TEXT NOT NULL, -- 'YYYY-MM'
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

CREATE TABLE weekly_reviews (
  id TEXT PRIMARY KEY,
  week_key TEXT NOT NULL UNIQUE, -- 'YYYY-WW'
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

## Logic Requirements
- **Give money a job**: When a user adds "Income", the amount goes into "Unassigned". User MUST move it to categories/goals until Unassigned is zero.
- **Buckets**: Categories like "Reserve" and "Joy Fund" are special system buckets that reflect goal progress.

## Tasks

### 1. Planning Layer (Buckets)
- [x] Create `monthly_bucket_plans` table/logic.
- [x] **Plan Screen**: List buckets with Available / Assigned / Spent columns.
- [x] **Income Allocation Flow**: When income is added, prompt to distribute to Reserve, Joy Fund, or Goals.

### 2. Goals & Artifacts (v1)
- [x] Create `goals` and `goal_contributions` tables.
- [x] **Goals Screen**: CRUD for goals (Reserve, Purchase, Freedom).
- [x] **Integration**: Allow linking a transaction or allocation to a specific goal.

### 3. Weekly Review Ritual
- [x] Create `weekly_reviews` table.
- [x] **Review Screen**:
  - [x] Show weekly totals (Income vs Expense).
  - [x] List top 3 overspent categories.
  - [x] Input for "Reflection" and "Next Focus".
  - [x] "Complete Review" button.

## Definition of Done
- User can assign every dollar to a bucket.
- Goals show progress based on contributions.
- Weekly review can be saved and viewed in history.
