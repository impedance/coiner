# Task 06: Navigation and Product Focus

## Goal
Clean up the main navigation to prioritize the budget flow and hide secondary features.

## Requirements
- Update `app/(tabs)/_layout.tsx`.
- Set the bottom tabs to:
    1. **Budget** (index)
    2. **Transactions**
    3. **Accounts**
    4. **Settings**
- Hide or move the following from the main tab bar:
    - Goals
    - Cycles
    - Practices
    - Weekly Review
    - Money Steps
- Ensure these features are still accessible via "Settings" or "Advanced" if needed, but they should not be in the primary UX.
- Implement the "Month Carry-forward" lightweight prompt if a new month starts.

## Acceptance Criteria
- [ ] Bottom tabs are limited to the 4 primary areas.
- [ ] The app feels like a focused "Unit Budget" tool.
- [ ] No broken links or inaccessible core features.
- [ ] `make smoke` passes.

## References
- RFC-002: Section 5.6 (Month transition) and 6.1 (Main navigation).
