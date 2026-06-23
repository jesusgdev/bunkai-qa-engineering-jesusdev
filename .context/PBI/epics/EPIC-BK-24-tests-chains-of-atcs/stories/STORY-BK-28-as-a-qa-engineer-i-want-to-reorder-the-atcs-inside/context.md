# Context — BK-28

## Session Notes

- 2026-06-22: Sprint testing started. Pre-flight GO. Created 3 seed ATCs (B, C, D) + Test with 4-ATC chain [A,B,C,D] for reorder testing.
- BK-27 dependency resolved (QA Approved). PR #42 merged, migration 0026_tests_reorder.sql applied.
- API uses step_ids (test_steps.id), NOT atc_ids — because a chain may repeat an atc_id at multiple positions.

## Open Questions

- None blocking. All 12 TCs executable.

## Pre-Flight Check

**Verdict**: GO
**Date**: 2026-06-22
**Report**: pre-flight-check.md
**Smoke subset**: TC-1, TC-3, TC-5
**Deferred TCs**: none
