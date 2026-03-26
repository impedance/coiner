# EPIC 003: Behavior & Integration

## Context
Add the "Master of Money" course mechanics. This turns a budgeting app into a behavior tracker with practice cycles and emotional visual rewards.
**Reference:** [RFC-001](../../RFC-001-financial-behavior-tracker-mvp.md) section 9.5 and PRD.

## Data Schema (Epic 3 Scope)
```sql
CREATE TABLE practice_definitions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  scope TEXT NOT NULL, -- 'daily' | 'weekly'
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

CREATE TABLE practice_checkins (
  id TEXT PRIMARY KEY,
  cycle_id TEXT,
  practice_definition_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  status TEXT NOT NULL, -- 'done' | 'missed'
  note TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (cycle_id, practice_definition_id, checkin_date),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (practice_definition_id) REFERENCES practice_definitions(id)
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  goal_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_uri TEXT,
  unlock_rule_type TEXT NOT NULL, -- 'goal_reached'
  unlock_amount_cents INTEGER,
  unlocked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id)
);

CREATE TABLE money_steps (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TEXT NOT NULL,
  achieved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## Behavior Logic
- **Streaks**: In 'Classic' mode, a single 'missed' day resets the streak. In 'Soft' mode, it just records the miss.
- **Level of execution**: Minimum (basic tracking), Optimum (savings), Maximum (advanced steps).

## Tasks

### 1. Behavior Layer (Cycles)
- [x] Create `cycles` and `practice_checkins` tables.
- [x] Implement system `practice_definitions` (Capture All, Review Today, etc.).
- [x] **Cycles Screen**: `app/(tabs)/behavior.tsx` implements 14/21/30 day cycles, show streaks and check-ins.

### 2. Premium UI & Visuals
- [x] **Artifacts**: Local storage for goal-related images. Show "emotional anchor" on Goal screen.
- [x] **Reports**: Simple HSL-themed charts (Spending by category, Reserve trend) in `app/report/index.tsx`.
- [ ] **Money Steps**: Progress tracker for lifestyle upgrades in `app/more/money-steps.tsx`.
- [ ] **Artifact Creation Flow**: Integration for `expo-image-picker` to save photos to artifacts.

### 3. Settings & Portability
- [ ] **AppData Enrichment**: UI for Currency selection and Week start preference.
- [ ] **Data Management**: JSON Export/Import and CSV Export (hook `useExport` already implements the logic).

## Definition of Done
- [x] Cycles correctly handle streaks (Soft vs Classic mode).
- [ ] Images for artifacts are correctly stored and retrieved from the phone's gallery.
- [ ] JSON Export/Import works correctly (Full state recovery).
- [ ] Money steps are visible and manageable within the app.
