# Bucket Dashboard Redesign Plan

## Goal

Redesign the main screen to be a bucket-first dashboard showing all bucket balances, distribution status, and spending room — with dark theme as the default. All existing app mechanics are preserved; only the UI layer changes.

---

## What Is Preserved (Zero Mechanics Changes)

| Layer | Files | Status |
|---|---|---|
| SQLite schema & migrations | `src/db/client/migrations.ts` | unchanged |
| All repositories | `src/db/repositories/*.ts` | unchanged |
| Domain calculators | `src/domain/calculators.ts` | unchanged |
| `usePlanning` hook | `src/hooks/usePlanning.ts` | unchanged |
| `useDataSelection` hook | `src/hooks/useData.ts` | unchanged |
| All other screens | Goals, Review, Behavior, Transaction flows | unchanged |
| Seeds & system categories | `src/db/seeds/system.ts` | unchanged |

---

## Key Financial Mechanics (How Numbers Work)

Understanding these ensures nothing breaks during the redesign.

```
unassigned = (sum of account opening_balance_cents) + (sum of income tx amount_cents) − (sum of all assigned_cents across all monthly_bucket_plans)

available (per bucket) = assigned_cents − spent_cents
spent_cents = sum of expense tx amount_cents WHERE category_id = bucket AND happened_at starts with monthKey

move between buckets = assignMoney(sourceId, source.assigned − delta) + assignMoney(targetId, target.assigned + delta)
```

`unassigned` is the pool of money not yet given a job. Assigning reduces this pool.
`available` is how much the user can spend from a specific bucket today.

---

## Changes Required

### 1. Dark Theme — `src/theme/colors.ts`

Replace the light palette with a dark one. No other files reference raw hex — everything goes through `Colors.*`.

```
background:      hsla(222, 20%, 9%, 1)      ← deep navy-black
card:            hsla(222, 20%, 14%, 0.95)  ← dark card surface
text:            hsla(0, 0%, 94%, 1)         ← near-white
textSecondary:   hsla(0, 0%, 55%, 1)         ← muted
border:          hsla(222, 15%, 22%, 1)
glassBorder:     hsla(0, 0%, 100%, 0.08)
glassShadow:     hsla(0, 0%, 0%, 0.3)
```

Accent colors (primary, income, expense, reserve, joy) stay the same — they already read well on dark.

### 2. Typography text colors — `src/theme/typography.ts`

All `color` values in `Typography.*` are currently hardcoded to `hsla(0, 0%, 10%, 1)` (almost black). Change to `Colors.text` / `Colors.textSecondary` so they pick up the dark theme automatically.

Concretely:
- `h1`, `h2`, `h3`, `body`, `bodyMedium`, `bodyBold` → `color: Colors.text`
- `label`, `small` → `color: Colors.textSecondary`

`typography.ts` must import `Colors` from `./colors` after this change.

### 3. Remove `plan` Tab — `app/(tabs)/_layout.tsx`

Delete the `<Tabs.Screen name="plan" .../>` entry. Reorder remaining tabs:

| Order | Name | Icon | Title |
|---|---|---|---|
| 1 | index | `wallet` | Buckets |
| 2 | goals | `trophy` | Goals |
| 3 | review | `checkmark-circle` | Review |
| 4 | behavior | `fitness` | Behavior |

### 4. Redesign Main Screen — `app/(tabs)/index.tsx`

The new screen absorbs all functionality from the old `plan.tsx` and becomes the bucket command center.

#### Data sources (same hooks, no new ones)

```ts
const monthKey = useMemo(...)   // current YYYY-MM
const { unassignedMoney, plans, categories, categoryGroups, loading, assignMoney } = usePlanning(monthKey)
const { transactions } = useDataSelection()
```

`getSpentForCategory(categoryId)` — same pure function already in `plan.tsx`, moved inline.

#### Screen layout (top → bottom)

```
┌──────────────────────────────────────────┐
│  April 2026                         ⚙️   │  ← header row
├──────────────────────────────────────────┤
│  Total Balance                            │
│  12 450 ₽                                │
│  ─────────────────────────────────────   │
│  Unassigned  1 200 ₽  [Distribute →]    │  ← tappable, opens AssignSheet
└──────────────────────────────────────────┘

[ − Expense ]   [ + Income ]   [ ⇄ Transfer ]   ← 3 quick-action buttons

─── Savings ──────────────────────────────────  ← CategoryGroup header
┌──────────────────────────────────────────┐
│ 🛡️ Reserve           assigned: 5 000 ₽   │
│ ████████░░  available: 4 150 ₽  spent: 850 ₽ │  ← progress bar
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ 💛 Joy Fund          assigned: 2 000 ₽   │
│ ██░░░░░░░░  available: 1 600 ₽  spent: 400 ₽ │
└──────────────────────────────────────────┘

─── Fixed ────────────────────────────────────
┌──────────────────────────────────────────┐
│ 🏠 Rent              assigned: 25 000 ₽  │
│ ██████████  available: 0 ₽   spent: 25 000 ₽│
└──────────────────────────────────────────┘
... (all other buckets grouped by CategoryGroup)
```

#### Bucket card details

Each bucket card shows:
- **Name** + optional system icon
- **Assigned** amount (right-aligned)
- **Progress bar**: `progress = spent / assigned` (clamped 0–1), color:
  - `< 0.7` → `Colors.income` (green, comfortable)
  - `0.7–0.9` → `Colors.reserve` (orange, attention)
  - `> 0.9` → `Colors.expense` (red, near limit)
- **Available** (= `assigned − spent`), color red if negative
- **Spent** amount

Tapping the card opens `BucketSheet`.

#### BucketSheet (bottom modal, new component)

A bottom sheet with two tabs: **Assign** and **Move**.

**Assign tab** — add money from unassigned pool to this bucket:
```
Assign to: Groceries
Unassigned available: 1 200 ₽
[  320  ]  ← numeric input, pre-filled with current assigned
[ Assign ]
```
Calls `assignMoney(categoryId, newAmount)`.
Validation: if `newAmount > currentAssigned + unassignedMoney` → show error "Not enough unassigned".

**Move tab** — shift money between two buckets (unassigned pool unchanged):
```
From: [dropdown of all buckets with available > 0]
Amount: [  ]
To: Groceries (current bucket, locked)
[ Move ]
```
Calls:
```ts
await assignMoney(sourceId, source.assigned - delta)
await assignMoney(currentId, current.assigned + delta)
```
Both calls use `usePlanning.assignMoney` — no new repository methods needed.

#### AssignSheet (unassigned pool distributor)

Opened by tapping the "Unassigned" row in the balance card. Shows all buckets in a list with a `+` / `−` stepper or a text input per bucket. Calls `assignMoney` per bucket. Closes when unassigned reaches 0 or user dismisses.

This is optional for MVP — the per-bucket BucketSheet already covers the use case.

### 5. Delete `app/(tabs)/plan.tsx`

The file is fully replaced by the new `index.tsx`. Delete it to avoid dead code.

---

## Component Inventory

| Component | Status | Notes |
|---|---|---|
| `GlassCard` | reuse | already dark-ready (uses `Colors.card`) |
| `AnimatedProgressBar` | reuse | already accepts `color` prop |
| `BucketSheet` | **new** | bottom modal, Assign + Move tabs |
| `AssignSheet` | optional | multi-bucket distributor from unassigned pool |

---

## File Change Summary

| File | Action | Reason |
|---|---|---|
| `src/theme/colors.ts` | edit | dark palette |
| `src/theme/typography.ts` | edit | use `Colors.text` instead of hardcoded dark |
| `app/(tabs)/_layout.tsx` | edit | remove plan tab, rename index to Buckets |
| `app/(tabs)/index.tsx` | rewrite | bucket dashboard |
| `app/(tabs)/plan.tsx` | delete | absorbed into index |
| `src/components/BucketSheet.tsx` | new | bottom modal for assign/move |

Total: 4 edits, 1 new component, 1 delete. No changes to data layer.

---

## Mechanics Preservation Checklist

| Mechanic | Preserved via |
|---|---|
| Bucket assignment | `usePlanning.assignMoney` (same call) |
| Planned vs assigned distinction | `updatePlanned` still callable; removed from main UI (planning detail can live in a future settings sheet) |
| Unassigned pool calculation | `calculateUnassignedMoney` in domain layer, called by `usePlanning` |
| Spend tracking | `getSpentForCategory` (same filter on transactions by `category_id + monthKey`) |
| System buckets (Reserve, Joy) | shown in bucket list with `is_system` flag styling |
| Monthly scope | `monthKey` passed to `usePlanning`, same as before |
| Goals, Review, Behavior loops | untouched tabs, no changes |
| Transaction flows | `/transaction/new?type=...` routes unchanged |
| Weekly Review | unchanged |
| Practice Cycles | unchanged |
| SQLite migrations | unchanged |

---

## Implementation Order

1. `src/theme/colors.ts` — dark palette (instant visual feedback across all screens)
2. `src/theme/typography.ts` — fix text colors to match dark theme
3. `app/(tabs)/_layout.tsx` — remove plan tab
4. `src/components/BucketSheet.tsx` — new bottom modal
5. `app/(tabs)/index.tsx` — full rewrite as bucket dashboard
6. Delete `app/(tabs)/plan.tsx`
7. `make preflight` — verify no regressions

---

## Risk Notes

- `Typography.*` objects are spread inline in StyleSheets across multiple screens. After changing `color` in typography to use `Colors.text`, all screens automatically pick up the dark text color — no per-screen edits needed.
- `plan.tsx` uses a plain `Modal` (not a gesture-aware bottom sheet). `BucketSheet` should use the same `Modal` with `animationType="slide"` to avoid adding a new dependency (`@gorhom/bottom-sheet`).
- `usePlanning` internally runs an extra raw SQL query (`SELECT SUM(assigned_cents)`). This is unaffected by UI changes.
