# EPIC 003: Behavior & Integration

## Context
Add the "Master of Money" course mechanics. This turns a budgeting app into a behavior tracker with practice cycles and emotional visual rewards.
**Reference:** [RFC-001](../../RFC-001-financial-behavior-tracker-mvp.md) section 9.5 and PRD.

## Data Schema (Epic 3 Scope)
```sql
CREATE TABLE practice_definitions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- e.g., 'capture_all', 'reserve_action'
  title TEXT NOT NULL,
  scope TEXT NOT NULL, -- 'daily' | 'weekly'
  is_system INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE cycles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration_days INTEGER NOT NULL, -- 14, 21, 30
  mode TEXT NOT NULL DEFAULT 'soft', -- 'soft' | 'classic'
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  target_level TEXT NOT NULL DEFAULT 'minimum', -- 'minimum' | 'optimum' | 'maximum'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE practice_checkins (
  id TEXT PRIMARY KEY,
  cycle_id TEXT,
  practice_definition_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL, -- 'YYYY-MM-DD'
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
```

## Behavior Logic
- **Streaks**: In 'Classic' mode, a single 'missed' day resets the streak. In 'Soft' mode, it just records the miss.
- **Level of execution**: Minimum (basic tracking), Optimum (savings), Maximum (advanced steps).

## Tasks

### 1. Behavior Layer (Cycles)
- [ ] Create `cycles` and `practice_checkins` tables.
- [ ] Implement system `practice_definitions` (Capture All, Review Today, etc.).
- [ ] **Cycles Screen**: Track 14/21/30 day cycles, show streaks and check-ins.

### 2. Premium UI & Visuals
- [ ] **Artifacts**: Local storage for goal-related images. Show "emotional anchor" on Goal screen.
- [ ] **Money Steps**: Progress tracker for lifestyle upgrades.
- [ ] **Reports**: Simple HSL-themed charts (Spending by category, Reserve trend).

### 3. Data Portability
- [ ] **Export/Import**: JSON backup to local filesystem.
- [ ] **CSV Export**: Transaction list for external analysis.

## Definition of Done
- Cycles correctly handle streaks (Soft vs Classic mode).
- Images for artifacts are correctly stored and retrieved.
- JSON Export/Import works correctly (Full state recovery).
