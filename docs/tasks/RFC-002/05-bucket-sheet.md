# Task 05: BucketSheet Simplification

## Goal
Simplify the bucket details sheet to focus on the core budget loop actions.

## Requirements
- Update `BucketSheet` (or equivalent component).
- Simplify actions to:
    1. **Spend** (opens expense form with this bucket pre-selected)
    2. **Assign** (opens assignment form for this bucket)
    3. **Move** (allows shifting available money to another bucket)
    4. **Transactions** (shows history for this bucket)
- Ensure the **Move** action uses `Available` balance as the maximum movable amount.
- Ensure all displayed numbers match the centralized calculators from Task 01.

## Acceptance Criteria
- [ ] User cannot move more money than is available in the bucket.
- [ ] Tapping "Spend" correctly pre-fills the bucket in the expense form.
- [ ] The sheet feels clean and focused.
- [ ] `make smoke` passes.

## References
- RFC-002: Section 5.5 (Move money flow) and 6.3 (Bucket row behavior).
