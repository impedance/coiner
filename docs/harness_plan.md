# Harness Plan

- Harness version: 0.6
- Detected stacks: TypeScript, Expo, React Native

## Current tooling
- **Lint:** `npm run lint` (via package.json scripts, when wired)
- **Typecheck:** `npm run typecheck` (via package.json scripts, when wired)
- **Tests:** `npm test` (via package.json scripts, when wired)
- **CI:** `.github/workflows/agent-harness.yml`

## Open placeholders
- Code map paths: see `docs/index.md`
- Typing surfaces: see `docs/index.md`
- Test map wiring: via Makefile (npm-based)

## Stack Notes

This is an **Expo + React Native + TypeScript** project using **Expo SQLite** for local persistence.

Key constraints from RFC-001:
- iPhone-first (Expo / React Native)
- Local-first, fully offline-capable
- No backend, no auth, no cloud sync
- TypeScript strict mode
- SQLite for persistence with versioned migrations
- Expo Router for navigation

## Implementation Milestones (from RFC)

1. **Milestone 1 — Foundation and Capture:** SQLite, accounts, categories, transactions, Today screen
2. **Milestone 2 — Planning and Goals:** Buckets, goals, contributions, artifacts
3. **Milestone 3 — Behavior Layer:** Cycles, practices, check-ins, streaks
4. **Milestone 4 — Review, Reports, and Data Portability:** Weekly review, reports, export/import
