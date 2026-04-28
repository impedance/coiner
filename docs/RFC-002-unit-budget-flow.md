# RFC 002: Unit Budget Flow — Income Allocation and Bucket-Based Spending

**Status:** Draft  
**Repository:** `impedance/coiner`  
**Scope:** Core budgeting flow redesign  
**Target platform:** iPhone-first Expo / React Native app  
**Primary goal:** Make Coiner work as a simple Unit Budget / YNAB-like local-first budgeting app.

---

## 1. Summary

This RFC defines the next product iteration for Coiner.

The app must become a focused bucket-based budgeting tool where the user can:

1. record income into real accounts;
2. see this income as money ready to assign;
3. distribute money into budget buckets;
4. spend from those buckets;
5. move available money between buckets when reality changes;
6. understand, at any moment, how much can still be safely spent from each bucket.

The core product loop should be:

```text
Income arrives -> Ready to Assign increases -> User assigns money to buckets -> User spends from buckets -> Available bucket balances update
```

The app should feel closer to YNAB / Unit Budget than to a generic expense tracker.

---

## 2. Current State Assessment

The existing implementation already contains several useful building blocks:

- accounts;
- income, expense, and transfer transactions;
- categories used as budget buckets;
- monthly bucket plans;
- assigned / spent / available values;
- a Ready to Assign calculation;
- an income distribution wizard;
- a bucket sheet with Spend, Assign, Move, and Top-up actions.

However, the current UX and domain model are not yet clean enough for a true unit-budget workflow.

### 2.1 What already works

The current app can already:

- record income;
- record expenses;
- assign money to categories/buckets;
- show assigned, spent, and available amounts;
- move assigned money between buckets;
- record an expense directly from a selected bucket through the bucket sheet.

### 2.2 Main gaps

The current implementation has several product and technical gaps:

1. **The budget flow is not the main user flow.**  
   The user can still behave like in a regular expense tracker: add an expense, choose a category, and move on. The app should instead reinforce: “I spend from money I intentionally assigned.”

2. **Expense entry does not clearly show bucket availability.**  
   When adding an expense, the user should see how much is available in each bucket before saving the transaction.

3. **Bucket move logic should use available money, not assigned money.**  
   Money that has already been spent should not be movable. The allowed amount to move from a bucket must be based on `available = assigned - spent`, not just `assigned`.

4. **The current flow has too many secondary product ideas visible too early.**  
   Goals, artifacts, cycles, practices, money steps, and weekly review are useful for the wider Moneywork system, but they should not compete with the core budget loop in this iteration.

5. **The language is mixed and inconsistent.**  
   The UI currently mixes terms such as `Ready to Assign`, `Distribution Wizard`, `Bucket`, `Category`, `Assign`, and Russian labels. This increases cognitive load.

6. **The month model needs explicit rules.**  
   The app uses `MonthlyBucketPlan`, but the user experience should make it clear whether bucket balances reset monthly or carry forward.

---

## 3. Product Goal

The goal of this iteration is to make the app answer one question better than anything else:

> “How much money do I have available for each purpose right now?”

The app must help the user move from passive expense tracking to active money assignment.

The user should not only see what happened. The user should decide what each ruble is supposed to do.

---

## 4. Product Principles

### 4.1 Give every ruble a job

Every income event should increase `Ready to Assign` until the user gives that money a job.

### 4.2 Accounts are where money lives; buckets are what money is for

Physical money location and money purpose must remain conceptually separate:

- **Account:** cash, debit card, savings account, credit card, etc.
- **Bucket:** groceries, mortgage, car payment, reserve, joy fund, travel, debt repayment, etc.

### 4.3 Spending always spends from a bucket

An expense must reduce:

1. the selected account balance;
2. the selected bucket’s available amount.

### 4.4 Budget first, reports second

The main screen should prioritize current decisions over historical analytics.

Reports are secondary. The primary UX is planning and spending safely.

### 4.5 No-shame budget correction

Overspending should be visible but not punitive. The app should help the user correct reality by moving money from another bucket or intentionally accepting overspending.

### 4.6 Local-first and simple

No backend, auth, bank sync, social mechanics, or AI coaching should be added in this iteration.

---

## 5. Target User Flow

### 5.1 First launch

The first launch should create a simple budget environment.

Flow:

```text
Open app -> Select currency -> Create first account -> Seed default buckets -> Land on Budget screen
```

Required default buckets:

- Housing / Mortgage
- Car
- Groceries
- Transport
- Health
- Debt repayment
- Reserve
- Joy Fund
- General Expense

The user must be able to edit these later.

---

### 5.2 Income flow

The income flow records new money into a physical account.

Flow:

```text
Tap + Income -> Enter amount -> Select account -> Select income source -> Save -> Ready to Assign increases -> Prompt to assign now
```

After saving income, the app should show:

```text
Income recorded.
100,000 ₽ is ready to assign.

[Assign now]
[Later]
```

Rules:

- income increases account balance;
- income increases Ready to Assign;
- income does not automatically become available in spending buckets unless the user assigns it;
- optional quick suggestion: assign 10% to Reserve.

---

### 5.3 Assign money flow

The assignment flow is the heart of the app.

Flow:

```text
Open Budget -> See Ready to Assign -> Tap Assign -> Distribute money to buckets -> Save
```

Screen behavior:

```text
Ready to Assign: 100,000 ₽

Fixed
Mortgage          +84,000 ₽
Car payment       +34,000 ₽

Everyday
Groceries         +20,000 ₽
Transport         +5,000 ₽

Safety
Reserve           +10,000 ₽
Debt repayment    +15,000 ₽

Joy
Joy Fund          +3,000 ₽

Remaining: 0 ₽
[Save assignments]
```

Rules:

- assigning money decreases Ready to Assign;
- assigning money increases the selected bucket’s assigned amount;
- assignment must not change account balances;
- the app may allow partial assignment;
- if remaining amount is not zero, the app should clearly show the remaining amount;
- assigning more than Ready to Assign must be blocked unless explicitly supported later as a planned future feature.

---

### 5.4 Expense flow

The expense flow must make the selected bucket and its available balance obvious.

Flow:

```text
Tap - Expense -> Enter amount -> Select account -> Select bucket with visible available amount -> Save
```

Bucket selection must show:

```text
Groceries       Available: 18,750 ₽
Car             Available: 8,000 ₽
Joy Fund        Available: 3,000 ₽
Reserve         Available: 20,000 ₽
```

After the user selects a bucket, the app should preview:

```text
Expense: 1,250 ₽
From account: Debit Card
From bucket: Groceries
Available after save: 17,500 ₽
```

Rules:

- expense decreases account balance;
- expense increases `spent` for the selected bucket;
- bucket available becomes `assigned - spent`;
- expense must be allowed even if it creates overspending, but the app must clearly warn the user;
- overspending correction should be offered immediately.

Overspending prompt:

```text
This will overspend Groceries by 500 ₽.

What do you want to do?

[Move money from another bucket]
[Record overspending]
[Cancel]
```

---

### 5.5 Move money flow

Moving money between buckets should be a simple correction tool.

Flow:

```text
Open bucket -> Tap Move -> Select source bucket -> Enter amount -> Confirm
```

Rules:

- moving money must not create an income or expense transaction;
- moving money must not affect accounts;
- moving money decreases assigned amount in the source bucket;
- moving money increases assigned amount in the target bucket;
- the maximum movable amount must be the source bucket’s available amount, not its assigned amount.

Correct calculation:

```ts
available = assigned - spent
maxMovable = max(0, available)
```

---

### 5.6 Month transition flow

The app must explicitly handle month boundaries.

For this iteration, use a simple carry-forward model:

```text
At the beginning of a new month, positive available bucket balances carry forward.
Negative balances remain visible until corrected.
```

The app should not silently reset bucket balances.

At month change, show a lightweight prompt:

```text
New month started.
Your available bucket balances were carried forward.
Review your plan for this month?

[Review budget]
[Later]
```

---

## 6. Required UX Changes

### 6.1 Main navigation

For this iteration, simplify bottom tabs to:

1. **Budget**
2. **Transactions**
3. **Accounts**
4. **Settings**

Hide or move the following areas out of the main navigation:

- Goals
- Cycles
- Practices
- Weekly Review
- Money Steps
- Advanced Reports

They can remain in the codebase but should not distract from the core budget flow.

---

### 6.2 Budget screen

The Budget screen should be the primary home screen.

It should show:

- current month;
- Ready to Assign;
- total account balance;
- optional account summary;
- bucket groups;
- assigned amount;
- spent amount;
- available amount;
- quick actions: Income, Expense, Assign.

Recommended layout:

```text
Budget
April 2026

Ready to Assign
25,000 ₽
[Assign]

Accounts
Debit Card: 80,000 ₽
Cash: 5,000 ₽

Buckets
Fixed
Mortgage       Assigned 84,000 | Spent 0      | Available 84,000
Car            Assigned 34,000 | Spent 0      | Available 34,000

Everyday
Groceries      Assigned 20,000 | Spent 1,250  | Available 18,750
Transport      Assigned 5,000  | Spent 0      | Available 5,000

Safety
Reserve        Assigned 20,000 | Spent 0      | Available 20,000
Debt repayment Assigned 15,000 | Spent 0      | Available 15,000

Joy
Joy Fund       Assigned 3,000  | Spent 0      | Available 3,000
```

---

### 6.3 Bucket row behavior

Tapping a bucket should open a simplified bucket sheet.

Bucket sheet actions:

1. Spend
2. Assign
3. Move
4. View transactions

The current Top-up / Income action can remain as an advanced shortcut, but it should not be the main income flow.

---

### 6.4 Language normalization

Use one product language consistently.

Recommended English product terms in code and documentation:

| Concept | Product term |
|---|---|
| Unassigned money | Ready to Assign |
| Budget category | Bucket |
| Assign money to a bucket | Assign |
| Move money between buckets | Move |
| Money left in bucket | Available |
| Money spent from bucket | Spent |
| Physical money location | Account |

If the UI is Russian, translate consistently:

| English | Russian |
|---|---|
| Ready to Assign | Готово к распределению |
| Bucket | Бакет |
| Assign | Распределить |
| Move | Перенести |
| Available | Доступно |
| Spent | Потрачено |
| Account | Счёт |

---

## 7. Domain Model Requirements

The current data model can be reused for this iteration.

Required existing entities:

- `Account`
- `Category`
- `Transaction`
- `MonthlyBucketPlan`

Secondary entities should not be part of the main flow for this iteration:

- `Goal`
- `Artifact`
- `Cycle`
- `PracticeDefinition`
- `PracticeCheckin`
- `MoneyStep`
- `WeeklyReview`

They may stay in the database and codebase, but the UI should not depend on them for the main budgeting experience.

---

## 8. Calculation Requirements

Create a single source of truth for budget math.

Recommended file:

```text
src/domain/budget/calculators.ts
```

Required functions:

```ts
getAccountBalance(account, transactions): number
getTotalAccountBalance(accounts, transactions): number
getIncomeTotal(transactions): number
getAssignedTotal(plans): number
getReadyToAssign(openingBalances, transactions, plans): number
getBucketSpent(categoryId, transactions, monthKey): number
getBucketAssigned(categoryId, plans): number
getBucketAvailable(categoryId, plans, transactions, monthKey): number
getBucketState(categoryId, plans, transactions, monthKey): BucketState
getBudgetSummary(accounts, transactions, plans, categories, monthKey): BudgetSummary
```

Required types:

```ts
type BucketState = {
  categoryId: string;
  assignedCents: number;
  spentCents: number;
  availableCents: number;
  isOverspent: boolean;
};

type BudgetSummary = {
  totalBalanceCents: number;
  readyToAssignCents: number;
  bucketStates: BucketState[];
};
```

All screens must use these functions instead of re-implementing calculations locally.

---

## 9. Business Rules

### 9.1 Income

- Income must belong to an account.
- Income may have an income category/source.
- Income increases Ready to Assign.
- Income does not automatically increase any spending bucket unless the user chooses an explicit shortcut.

### 9.2 Assignment

- Assignment changes `MonthlyBucketPlan.assigned_cents`.
- Assignment does not create a transaction.
- Assignment does not change account balances.
- Assignment cannot exceed Ready to Assign unless future explicit overspending/planned debt support is added.

### 9.3 Expense

- Expense must belong to an account.
- Expense must belong to a bucket/category.
- Expense decreases account balance.
- Expense increases spent amount for the bucket.
- Expense may create overspending, but overspending must be visible.

### 9.4 Transfer

- Transfer moves money between accounts.
- Transfer must not count as income or expense.
- Transfer must not affect bucket balances.

### 9.5 Move between buckets

- Bucket move changes assigned amounts only.
- Bucket move must not create a transaction.
- Bucket move must not affect account balances.
- Bucket move must only allow moving available money.

### 9.6 Overspending

- Overspending should be shown as negative available.
- Overspending should be visually distinct.
- The user should be offered a correction path.

---

## 10. Implementation Plan

### Milestone 1 — Budget math cleanup

Deliver:

- create budget calculator module;
- centralize Ready to Assign, assigned, spent, available, and overspending calculations;
- replace local duplicated calculations in Budget screen and BucketSheet;
- add unit tests for all budget math.

Acceptance criteria:

- all bucket screens show the same available amounts;
- moving money uses available amount, not assigned amount;
- tests cover income, assignment, expense, transfer, move, and overspending cases.

---

### Milestone 2 — Main Budget screen redesign

Deliver:

- make Budget the primary home screen;
- show Ready to Assign as the main call-to-action;
- connect Assign button to a real assignment screen;
- show bucket groups with assigned, spent, and available;
- show overspent buckets clearly;
- simplify quick actions to Income, Expense, Assign.

Acceptance criteria:

- a new user can understand what money is available and what still needs assignment;
- the Assign button is functional;
- bucket availability is visible without opening reports.

---

### Milestone 3 — Assignment screen

Deliver:

- create `/budget/assign` route;
- allow assigning Ready to Assign money to buckets;
- show remaining amount live;
- block over-assignment;
- allow partial assignment;
- support quick 10% reserve suggestion.

Acceptance criteria:

- user can distribute newly recorded income across multiple buckets;
- Ready to Assign decreases correctly;
- assigned amounts increase correctly;
- no account balance changes during assignment.

---

### Milestone 4 — Expense flow redesign

Deliver:

- simplify expense entry;
- show bucket availability during bucket selection;
- preview available amount after save;
- warn on overspending;
- offer correction by moving money from another bucket.

Acceptance criteria:

- user can record an expense from a selected account and bucket;
- account balance decreases;
- bucket available decreases;
- overspending is visible and correctable.

---

### Milestone 5 — BucketSheet simplification

Deliver:

- simplify BucketSheet actions to Spend, Assign, Move, Transactions;
- use centralized budget calculations;
- ensure Move uses source available amount;
- move Top-up / Income shortcut into advanced or remove from primary UI.

Acceptance criteria:

- user cannot move already-spent money;
- bucket details match the Budget screen;
- the sheet is useful but not overloaded.

---

### Milestone 6 — Navigation and product focus

Deliver:

- simplify bottom tabs to Budget, Transactions, Accounts, Settings;
- hide goals, cycles, practices, money steps, and weekly review from main navigation;
- keep advanced features accessible only if needed later.

Acceptance criteria:

- the app feels like a focused budgeting app;
- the primary user loop is not diluted by secondary coaching features.

---

## 11. Testing Requirements

Add or update automated tests for:

1. income increases Ready to Assign;
2. assignment decreases Ready to Assign and increases bucket assigned;
3. expense decreases account balance and bucket available;
4. transfer changes account balances but not budget totals;
5. move changes bucket assigned amounts but not account balances;
6. move cannot exceed source available;
7. overspending produces negative available;
8. month carry-forward behavior works as specified.

Manual QA checklist:

- clean install;
- create account;
- record income;
- assign income across buckets;
- record normal expense;
- record overspending expense;
- correct overspending by moving money;
- transfer between accounts;
- restart app and verify data persists;
- verify all displayed amounts stay consistent.

---

## 12. Non-Goals for This Iteration

Do not implement:

- bank sync;
- cloud sync;
- authentication;
- multi-user budgets;
- credit card float logic;
- debt payoff optimization;
- investment tracking;
- AI coach;
- full course content;
- advanced analytics;
- social mechanics;
- gamification beyond simple supportive feedback.

---

## 13. YNAB Similarity Target

This iteration should be approximately **70–80% similar to YNAB in the core workflow**, but much smaller in scope.

Similarities:

- Ready to Assign;
- give every unit of money a job;
- categories/buckets with assigned, spent, available;
- move money between categories when plans change;
- overspending visibility;
- account balances separated from budget categories.

Intentional differences:

- no bank sync;
- no cloud account;
- no multi-device sync;
- no complex credit-card handling yet;
- no heavy reporting;
- no subscription/business model assumptions;
- local-first and solo-user only.

The goal is not to clone YNAB. The goal is to borrow the core behavioral loop and make it lighter, calmer, and more suitable for the Moneywork project.

---

## 14. Value for the Moneywork Coaching Project

This redesign is highly useful for the Moneywork coaching context because it turns financial awareness into a daily operating system.

The app will support the user in three ways:

### 14.1 Contact with financial reality

The user sees:

- what money exists;
- what is already assigned;
- what is still unassigned;
- what can be safely spent;
- where overspending appears.

This directly reduces avoidance.

### 14.2 Adult money decisions

The user practices:

- assigning money intentionally;
- funding reserve;
- keeping joy visible but bounded;
- correcting overspending without shame;
- moving money consciously instead of ignoring reality.

This supports an adult financial position.

### 14.3 Small daily behavior loop

The app creates a simple repeatable practice:

```text
Open app -> Record money fact -> Assign or spend from bucket -> See available reality -> Make one small correction
```

This is more useful for coaching than abstract motivation because the user gets a daily money fact and a concrete next action.

---

## 15. Final Acceptance Criteria

This iteration is complete when a user can perform the following full loop without confusion:

1. Create an account.
2. Add income to the account.
3. See the income as Ready to Assign.
4. Assign that income to several buckets.
5. See each bucket’s available amount.
6. Add an expense from a specific account and bucket.
7. See the account balance and bucket available amount update.
8. Move available money from one bucket to another.
9. Handle overspending with a clear correction flow.
10. Restart the app and see all values preserved correctly.

If this loop is smooth, the app becomes a useful financial behavior tracker and a strong foundation for later coaching features.
