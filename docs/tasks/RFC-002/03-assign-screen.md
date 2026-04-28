# Task 03: Assignment Screen

## Goal
Implement a dedicated flow for distributing "Ready to Assign" money into buckets.

## Requirements
- Create/update route `/budget/assign` (or implement as a full-screen modal/sheet).
- Allow the user to input assignment amounts for each bucket.
- Show "Ready to Assign" balance updating in real-time as the user inputs amounts.
- Block assignment if it exceeds "Ready to Assign" (unless over-assignment is intentionally allowed with warnings).
- Allow partial assignment (leaving some money in "Ready to Assign").
- Add a "Quick 10% to Reserve" shortcut (optional but recommended).
- Saving must update `MonthlyBucketPlan.assigned_cents` in the database.

## Rules
- Assignment does NOT create a transaction.
- Assignment does NOT change account balances.

## Acceptance Criteria
- [ ] User can successfully distribute income across multiple buckets.
- [ ] "Ready to Assign" decreases correctly after saving.
- [ ] Bucket "Available" balances increase immediately after assignment.
- [ ] `make smoke` passes.

## References
- RFC-002: Section 5.3 (Assign money flow) and Milestone 3.
