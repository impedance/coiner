import { getDatabase } from './sqlite';

const MIGRATIONS = [
  // Version 1: Initial Schema
  `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    currency TEXT NOT NULL,
    opening_balance_cents INTEGER NOT NULL DEFAULT 0,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
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

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    account_id TEXT NOT NULL,
    to_account_id TEXT,
    category_id TEXT,
    amount_cents INTEGER NOT NULL,
    happened_at TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS migration_version (
    version INTEGER PRIMARY KEY
  );
  `,
  // Version 2: Epic 2 - Planning, Goals, Reviews
  `
  CREATE TABLE IF NOT EXISTS monthly_bucket_plans (
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

  CREATE TABLE IF NOT EXISTS goals (
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

  CREATE TABLE IF NOT EXISTS goal_contributions (
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

  CREATE TABLE IF NOT EXISTS weekly_reviews (
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
  `,
  // Version 3: Epic 3 - Behavior & Habitation
  `
  CREATE TABLE IF NOT EXISTS artifacts (
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

  CREATE TABLE IF NOT EXISTS practice_definitions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    scope TEXT NOT NULL,
    is_system INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cycles (
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

  CREATE TABLE IF NOT EXISTS cycle_practices (
    id TEXT PRIMARY KEY,
    cycle_id TEXT NOT NULL,
    practice_definition_id TEXT NOT NULL,
    required INTEGER NOT NULL DEFAULT 1,
    UNIQUE (cycle_id, practice_definition_id),
    FOREIGN KEY (cycle_id) REFERENCES cycles(id),
    FOREIGN KEY (practice_definition_id) REFERENCES practice_definitions(id)
  );

  CREATE TABLE IF NOT EXISTS practice_checkins (
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

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
  // Version 4: Money Steps
  `
  CREATE TABLE IF NOT EXISTS money_steps (
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
  `,
];

export async function migrate() {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migration_version (version INTEGER PRIMARY KEY);
  `);

  const result = await db.getFirstAsync<{ version: number }>('SELECT MAX(version) as version FROM migration_version');
  const currentVersion = result?.version ?? 0;

  for (let i = currentVersion; i < MIGRATIONS.length; i++) {
    const version = i + 1;
    console.log(`Applying migration version ${version}...`);
    await db.execAsync(MIGRATIONS[i]);
    await db.runAsync('INSERT INTO migration_version (version) VALUES (?)', version);
  }
}
