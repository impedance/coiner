# EPIC 001: Foundation & Core Capture

## Context
Launch the base of the Moneywork MVP. We need a solid local-first foundation using Expo and SQLite.
**Reference:** [RFC-001](../../RFC-001-financial-behavior-tracker-mvp.md)

## Technical Requirements
- **Stack:** Expo + React Native + TypeScript + Expo Router + `expo-sqlite`.
- **Local-first:** No backend, no auth, 100% offline.
- **Data Standards:** 
  - All amounts in **integer cents** (to avoid float issues).
  - All IDs as **UUID v4** strings.
  - All timestamps as **ISO 8601 strings**.
  - No abbreviations: avoid `acc`, use `account`.

## Data Schema (Epic 1 Scope)
```sql
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
  kind TEXT NOT NULL, -- 'expense' | 'income'
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
  type TEXT NOT NULL, -- 'expense' | 'income' | 'transfer' | 'adjustment'
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
```

## Tasks

### 1. Infrastructure
- [ ] Initialize Expo project in `./` with TypeScript.
- [ ] Setup `app/` folder structure (tabs: Today, Plan, Goals, Review, More).
- [ ] Configure `expo-sqlite` with a base client.
- [ ] Implement a migration manager (e.g., versioned SQL scripts).

### 2. Database Schema (Core)
- [ ] Create `accounts` table.
- [ ] Create `categories` table (must include system seed: Reserve, Joy Fund).
- [ ] Create `transactions` table.
- [ ] Setup basic repository/DSO layer in `src/db/repositories/`.

### 3. Core UI
- [ ] **Today Screen**: Show total balance across accounts and "Unassigned" amount.
- [ ] **Quick Actions**: "Add Expense" and "Add Income" buttons.
- [ ] **Add Transaction Screen**: Minimal 3-step flow (Amount -> Account -> Category).

## Definition of Done
- App runs on iOS/Android simulator.
- Transactions are saved to SQLite and survive app restart.
- Today screen reflects real balance and transaction history.
