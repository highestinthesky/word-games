# Don’t Say It

A compact, local-first taboo word game for a shared phone, tablet, or laptop.

## Run it

```sh
npm run dev
```

Then open `http://localhost:4173`.

## What’s included

- 1,274 unique target cards generated from hand-authored semantic clusters
- five closely related forbidden words on every card
- configurable 30, 45, 60, 90, or 120 second rounds
- 2–8 editable teams with persistent scores
- automatic “got it,” skip, and taboo scoring
- optional skip penalties
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

The tests enforce the 1,000-card minimum, target uniqueness, five-word forbidden sets, cluster integrity, and score rules.
