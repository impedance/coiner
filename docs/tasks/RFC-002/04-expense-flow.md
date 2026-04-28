# Task 04: Expense Flow Redesign

## Goal
Improve the expense recording flow to show bucket availability and handle overspending.

## Requirements
- Update the Expense entry form (`app/transaction/new.tsx` or similar).
- When selecting a bucket (category), show its **Available** balance next to the name.
- After entering an amount, show a "Preview" of the remaining balance in that bucket after save.
- If the expense exceeds the available balance, show a clear warning.
- After saving an overspent expense, offer an immediate "Move money to cover" option.

## Acceptance Criteria
- [ ] User can see bucket availability during expense entry.
- [ ] Overspending is clearly warned about.
- [ ] Saving the expense correctly updates account balance and bucket "Spent" amount.
- [ ] `make smoke` passes.

## References
- RFC-002: Section 5.4 (Expense flow) and Milestone 4.
