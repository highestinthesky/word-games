# Neanderthals Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for direct implementation. Track progress below.

**Goal:** Add an optional one-syllable clue mode inside Taboo.

**Architecture:** Keep the existing app, add a standalone namespaced deck, and select the deck through a persisted boolean setting. Share the existing score and timer logic.

**Tech Stack:** Vanilla HTML/CSS/JS; Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-02-neanderthals-design.md`

## Global constraints

Use branch `neanderthals`, locked Hum tokens and controls, isolated game folder, no dependencies, no forbidden words in the new mode, human judgment of speech.

## Review focus

Legacy and malformed saves; canceled settings; paused-round changes; independent exhaustion/history; long targets and reachable phone controls.

## Task 1: Mode, deck, and app flow

Files: add `games/dont-say-it/neanderthal-cards.js`, `tests/neanderthals.test.mjs`, and `tests/harness.mjs`; modify the game's `app.js`, `index.html`, and `styles.css`, plus `design.md` before implementing the board state.

- [x] Add behavior tests for mode save/cancel/reload, history, scoring/reset, blocked in-round changes, and deck quality; run them and confirm failures.
- [x] Author 180 original categorized targets, each with an empty forbidden list and namespaced ID.
- [x] Wire the persisted toggle and active deck; keep legacy saves and both histories; lock the mode while a round is in progress.
- [x] Render mode-specific card/rules/penalty/summary using existing styles and a full-width target in the new mode.
- [x] Run all tests and inspect responsive states.

## Task 2: Review and PR

Files: update `games/dont-say-it/README.md`, `.hallmark/log.json`, and this progress record.

- [x] Document mode behavior and content scope; append Hallmark record.
- [x] Review whole diff and resolve material findings; run final checks.
- [x] Commit, push `neanderthals`, and create PR to `main`: https://github.com/highestinthesky/word-games/pull/4

## Verification record

- Baseline: 77 passing tests. New behavior tests failed before implementation; final suite: 86 passing tests.
- Independent code review: no material findings. Fixed the nested summary-label styling identified during review.
- Browser checks: 320, 375, 414, 768, and 1280px; no horizontal overflow and all four header controls remain reachable. Checked setup, one-syllable card, mode-specific rules, and in-round disabled switch. Verified the phone summary with aligned rule-break tile and the return to standard Taboo with all five forbidden words.
- Hallmark: preserved Workbench/Hum, canonical tokens and shared controls; added no artwork, fonts, or dependencies. Tightened mode-setting spacing and scaled long targets on phones.
- Impeccable Lite: harden (legacy saves, mode lock, independent exhaustion and history, long labels) and clarify (short toggle label, clear rule/penalty and mode-change timing). Separate adapt, onboard, and optimize flows skipped: responsive checks are covered by Hallmark; no new onboarding or performance bottleneck.
- Branch: `neanderthals`; PR to `main` explicitly requested. Reused the clean current checkout rather than making another worktree.

GitHub confirms PR #4 is mergeable. The concurrent update to main changes only the root README.
