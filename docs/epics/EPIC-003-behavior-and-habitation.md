# EPIC 003: Behavior & Habitation

## Context
Implement the behavioral operating system of Moneywork. This epic bridges the gap between daily money movement and permanent habit change through practice cycles and emotional anchors.
**Reference:** [RFC-001](../../RFC-001-financial-behavior-tracker-mvp.md) section 9.4, 9.5.

## Data Schema (Epic 3 Scope)
```sql
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
  status TEXT NOT NULL, -- 'done' | 'missed'
  note TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (cycle_id, practice_definition_id, checkin_date),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (practice_definition_id) REFERENCES practice_definitions(id)
);
```

## Tasks

### 1. Emotional Anchors (Artifacts)
- [ ] Create `artifacts` table.
- [ ] **Goal Details**: Implement a screen to view goal progress and attached artifacts.
- [ ] **Artifact Creation**: Add flow to attach images/notes to a goal.

### 2. Practice Cycles
- [ ] Create `practice_definitions`, `cycles`, `cycle_practices`, and `practice_checkins` tables.
- [ ] **Seed Data**: Populate system practices (Capture All, Reserve First, etc.).
- [ ] **Cycle Dashboard**: UI to see current cycle progress, streak, and execution level.
- [ ] **Daily Check-in**: UI to mark practices as done for the day.

### 3. App Settings (Persistence)
- [ ] Create `app_settings` table.
- [ ] **Settings Screen**: Currency selection, week start, and cycle defaults.

## Definition of Done
- User can attach a photo/note to a goal.
- User can start a 14/21/30 day cycle.
- Daily habits can be checked off and tracked via streaks.
- App settings (Currency/Cycle defaults) survive restart.
