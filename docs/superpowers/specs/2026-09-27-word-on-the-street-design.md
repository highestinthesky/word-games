# Word on the Street smartboard design

Two teams play on one shared screen without a host or personal devices. The published game's 17 street consonants start in the median, move one lane per occurrence toward the active team, and are captured after a third step. The first team to hold eight wins.

## Turn

The active team always appears below the street. At the start of its turn, the board redraws from its perspective and a new high-school-suitable category appears. The team has 30 seconds by default to assemble one word. It drags copies of street letters into a bottom word tray; source letters remain available for repeats. A separate reusable strip provides A, E, I, O, U, J, Q, X, and Z. Captured consonants remain draggable sources but no longer move. Hovering during a drag shows the insertion position. Dragging a tray tile outside removes it. Tapping, keyboard activation, arrow-key reorder, and Delete provide alternatives. Each new game announces four unavailable letters (three street consonants and one vowel), which stay visibly disabled. The 140-category deck never repeats a prompt within a game; when exhausted, a new game is required.

The team must press “Valid word?” before the clock expires. The application moves all uncaptured street letters according to their occurrence counts; the moves are provisional. The other team accepts or challenges. A challenge pauses play for the group to decide whether the word is correctly spelled and fits the category. A rejected word restores all positions; an upheld word keeps the move. Both verdicts pass play to the other team as usual. Without submission, the turn passes. A win becomes final only after review.

## Interface and architecture

Use the locked Hum tokens, wordmark, buttons, and header actions. The seven-band street is a CSS board with simple lane markings, not a cartoon asset. On a smartboard, the header, category, clock, scores, street, supplemental letters, word tray, and actions fit one viewport. The street expands across the available width and height, with tile size capped so it retains its proportions. No active-game footer or explanatory text appears. Narrow viewports keep all header controls and reflow the board without clipping.

The game lives entirely under `games/word-on-the-street/`: pure game state, category data, UI, CSS, copied canonical tokens, and tests. Native Pointer Events and browser animations handle drag and movement; no external dependency is needed. State, the unavailable letters, and the per-game category history persist in localStorage. The shelf has one registry entry and one static game card. `design.md` records the tile interaction and responsive street rules.

## Verification

Unit tests cover repeated letters, missing and captured letters, capture, alternating perspective, timer expiration, tray insertion/removal/reorder, challenge outcomes, score and win, category draws, and persistence recovery. Run `npm test` and inspect the game at approximately 375px and desktop/smartboard widths.
