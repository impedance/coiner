# Task 02: Main Budget Screen Redesign

## Goal
Make the Budget screen the primary home screen and update its layout to emphasize "Ready to Assign" and bucket availability.

## Requirements
- Make `app/(tabs)/index.tsx` the primary Budget screen (rename/merge from `plan.tsx` if necessary).
- Display "Ready to Assign" as the main Call-to-Action at the top.
- Show current month and total account balance.
- List bucket groups with:
    - Assigned amount
    - Spent amount
    - Available amount (Assigned - Spent)
- Highlight overspent buckets (negative available) in red.
- Add quick actions: **Income**, **Expense**, **Assign**.
- Ensure the screen uses functions from `src/domain/budget/calculators.ts`.

## UI Mockup (Text-based)
```text
Budget - April 2026
Ready to Assign: 25,000 ₽ [Assign]

Accounts: 85,000 ₽

Fixed
Mortgage  | Assig: 84k | Spent: 0   | Avail: 84k
Everyday
Groceries | Assig: 20k | Spent: 5k  | Avail: 15k
```

## Acceptance Criteria
- [ ] Budget is the first tab the user sees.
- [ ] "Ready to Assign" matches the calculated value from Task 01.
- [ ] Tapping "Assign" (placeholder or route) leads to the assignment flow.
- [ ] All bucket amounts are visible and correct.
- [ ] `make smoke` passes.

## References
- RFC-002: Section 6.2 (Budget screen).
