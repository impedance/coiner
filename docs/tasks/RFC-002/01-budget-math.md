# Task 01: Budget Math Cleanup

## Goal
Create a single source of truth for all budget-related calculations (Ready to Assign, Available, Spent, etc.) to ensure consistency across the app.

## Requirements
- Create `src/domain/budget/calculators.ts`.
- Implement centralized functions for:
    - `getAccountBalance(account, transactions): number`
    - `getTotalAccountBalance(accounts, transactions): number`
    - `getIncomeTotal(transactions): number`
    - `getAssignedTotal(plans): number`
    - `getReadyToAssign(openingBalances, transactions, plans): number`
    - `getBucketSpent(categoryId, transactions, monthKey): number`
    - `getBucketAssigned(categoryId, plans): number`
    - `getBucketAvailable(categoryId, plans, transactions, monthKey): number`
    - `getBucketState(categoryId, plans, transactions, monthKey): BucketState`
    - `getBudgetSummary(accounts, transactions, plans, categories, monthKey): BudgetSummary`
- Replace local duplicated calculations in:
    - Budget screen (`app/(tabs)/index.tsx` / `plan.tsx`)
    - `BucketSheet` component
- All amounts must be handled as integer cents.

## Business Rules
- **Income**: Increases `Ready to Assign`.
- **Assignment**: Decreases `Ready to Assign`, increases bucket `assigned_cents`. Does NOT affect account balances.
- **Expense**: Decreases account balance, increases `spent` for the bucket.
- **Transfer**: Moves money between accounts, does NOT affect bucket balances.
- **Move**: Changes assigned amounts between buckets. Must only allow moving *available* money.

## Acceptance Criteria
- [ ] All bucket screens show the same available amounts.
- [ ] `Ready to Assign` is calculated correctly (Total Income - Total Assigned).
- [ ] Unit tests cover: income, assignment, expense, transfer, move, and overspending.
- [ ] `make smoke` passes.

## References
- RFC-002: Sections 8 (Calculations) and 9 (Business Rules).
