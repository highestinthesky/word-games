# Don’t Say It

A compact, local-first taboo word game for a shared phone, tablet, or laptop.

## Run it

```sh
npm run dev
```

Then open `http://localhost:4173`.

## What’s included

- 2,457 unique target cards generated from 530 hand-authored semantic clusters
- five closely related, familiar single-word forbidden clues on every card
- a no-repeat deck: a shown target cannot return until a new game begins, even after a refresh
- configurable 30, 45, 60, 90, or 120 second rounds
- 2–8 editable teams with persistent scores
- automatic “got it,” skip, and taboo scoring
- optional skip penalties
- a **New game** control that resets scores and reshuffles the complete deck while preserving team setup
- keyboard controls and mobile layouts down to 320 px
- local storage only; no account or backend

## Keyboard controls

- `G` or `→`: got it
- `S` or `↓`: skip
- `T` or `←`: taboo
- `Space`: start or pause a round

## Verify it

```sh
npm test
```

The tests enforce the 2,400-card minimum, the 300-set expansion, one-word/familiar card vocabulary, target uniqueness, five-word forbidden sets, cluster integrity, scoring, and the no-repeat deck behavior.
