# Word on the Street Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add a playable, single-screen Word on the Street adaptation for two high-school teams.

**Architecture:** Pure game state computes word composition, letter movement, review, and turn progression. A vanilla JS UI handles pointer gestures and rendering; CSS builds the board within the locked Hum system.

**Tech Stack:** Native ES modules, Pointer Events, Web Animations API, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-27-word-on-the-street-design.md`

## Global Constraints

- One shared smartboard; no host, accounts, or player devices.
- Use canonical `tokens.css` byte-for-byte in the new game.
- Keep the game isolated; modify no existing game's files.
- Keep on-screen copy minimal and all header actions available at phone width.
- Run `npm test` and inspect phone and desktop layouts.

## Review Focus

- Repeated consonants can move a tile several lanes and capture it once.
- Captured or absent letters can appear in the word without moving tiles.
- A challenge can restore provisional moves, including provisional captures.
- A turn expiring during a drag cannot submit or move letters.
- The board flips its view without changing canonical positions or ownership.

---

### Task 1: Game state and category deck

**Files:** Create `games/word-on-the-street/game-core.js`, `categories.js`, and their tests.

**Interfaces:** `createGame`, `startTurn`, `insertLetter`, `removeLetter`, `moveLetter`, `expireTurn`, `submitWord`, `acceptWord`, `challengeWord`, `resolveChallenge`, `viewRow`, `scoreFor`, `drawCategory`.

- [ ] Write tests for the five Review Focus behaviors and turn transitions.
- [ ] Run focused tests and verify the new functions are missing.
- [ ] Implement the pure functions and original high-school categories.
- [ ] Run focused tests, then `npm test`.

### Task 2: Shared-screen interaction and design

**Files:** Create `games/word-on-the-street/index.html`, `app.js`, `styles.css`, `tokens.css`; modify `design.md`.

**Interfaces:** UI consumes Task 1 functions; board state is canonical and view orientation is derived from active team.

- [ ] Add interaction tests where DOM-independent logic needs coverage; observe failure.
- [ ] Build setup, timer, draggable source copies, insertion/reorder/removal, review, challenge, and persistence UI.
- [ ] Build responsive Hum street board and dialogs; copy canonical tokens.
- [ ] Run tests and inspect phone and desktop views.

### Task 3: Shelf integration and verification

**Files:** Create `games/word-on-the-street/game.js`; modify `games/registry.js`, `index.html`, `package.json`, `README.md`, `.hallmark/log.json`.

- [ ] Add a failing shelf/registry test for the new game.
- [ ] Register the game and static shelf card; update test command and documentation.
- [ ] Run `npm test`, inspect game and shelf at phone and desktop widths, and check token copies.
