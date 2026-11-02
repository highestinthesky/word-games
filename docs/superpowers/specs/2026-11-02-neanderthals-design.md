# Poetry for Neanderthals in Taboo

Add an optional Poetry for Neanderthals switch to Taboo's existing Setup dialog, off by default. Use one-syllable clues, a dedicated deck of harder concepts and phrases familiar to educated high school students, and no forbidden-word list. Keep Taboo's teams, timer, +1 correct / −1 violation scoring, optional skip penalty, and keyboard controls. Human players judge spoken clues.

## Approach

Extend the current app in place. A separate game would contradict the requested submode; reusing the familiar Taboo deck would miss the requested difficulty. Author 180 original targets across science, society, reasoning, language, and everyday systems. Do not reproduce commercial cards.

## State and interaction

Persist the switch with existing scores and settings. Missing or invalid saved switch values default to standard Taboo. Keep both decks' used-card IDs, with a namespace for the new deck. Switching between rounds clears the previous card and selects the other deck without changing scores or history. Disable the switch during a round (including paused rounds), with a short explanation. Canceling Setup changes nothing. New game clears scores and both histories, retaining the selected mode.

## Design

Follow locked `design.md`: Workbench, Hum, existing switch row and shared buttons, existing header and Statement footer. Show the selected mode before play and a single short one-syllable reminder on the active card. In this mode replace “Taboo” with “Rule break” in the penalty, rules, and summary. Never show the forbidden-word block, even during a card transition. Do not add tokens, artwork, or new shared components.

## Acceptance

Test selection, safe defaults, cancel/save, reload, no-repeat history across mode changes, new game, scoring, exhaustion, and the disabled in-round switch. Run `npm test`; inspect setup, play, rules, and summary at 375px and desktop, plus Hallmark's 320/414/768px widths. Create a PR from `neanderthals` to `main`.
