# AGENTS.md

## 1) What this repo is

**Moneywork** — A financial behavior tracker for iPhone (Expo + React Native + TypeScript + Expo SQLite).

Local-first, offline-capable, single-user. Tracks transactions, bucket planning, goals, practice cycles, and weekly reviews.

System-of-record map: `docs/index.md`.

## 2) Fast commands (run these first)
- Smoke: `make smoke`
- Agent smoke (optional): `make agent-smoke`
- Preflight: `make preflight`
- Strict smoke: `make smoke STRICT=1`
- Run UI (Web): `make run`
- Start Expo: `make start`
- Harness info (optional): `make doctor`

## 3) Non-negotiable invariants
- Wire existing tooling first; do not migrate the stack just to satisfy the harness.
- Keep default verification offline and deterministic unless the repo documents an opt-in integration path.
- Never commit secrets or generated credentials.
- **RFC-first:** Implementation must follow `docs/RFC-001.md`.
- **Local-first:** No backend, auth, or network sync in MVP.
- **TypeScript strict mode:** All code must compile in strict mode.

## 4) Repo map
- **Entrypoints:** `app/` (Expo Router), `src/`
- **Core domain logic:** `src/domain/`
- **Boundaries / DTOs / config:** `src/types/`, `src/lib/`
- **Adapters (I/O):** `src/db/`

## 5) How to finish a task
- Make the change.
- Run `make smoke`.
- (If relevant) run `make agent-smoke`.
- Run `make preflight`.
- Summarize what changed and the commands you ran.
