# Game Shelf

A local-first collection of shared-screen word games. The home page is a game selector; every game lives in its own folder so it can grow without changing another game’s implementation.

## Run it

```sh
npm run dev
```

Then open `http://localhost:4173`.

## Current games

- **Taboo** — a playable clue game with 323 reviewed cards, 2–8 editable teams, local persistence, keyboard controls, and responsive layouts.
- **Tapple** — a playable category game with 131 prompts for one shared screen. Its original research and design brief is in [docs/tapple-website-brief.md](docs/tapple-website-brief.md).

## Structure

```text
games/
  registry.js                 # The selector's small cross-game index
  dont-say-it/                # Fully isolated existing game
  tapple/                     # Isolated playable Tapple game
docs/
  tapple-website-brief.md     # Research, safety policy, and implementation plan
```

Each game owns its entry page, scripts, styles, data, and tests. Adding a game means creating a new folder and adding its lightweight manifest to `games/registry.js`; it does not require changing an existing game.

## Taboo keyboard controls

- `G` or `→`: got it
- `S` or `↓`: skip
- `T` or `←`: taboo
- `Space`: start or pause a round

## Verify it

```sh
npm test
```

The tests cover the game selector registry plus Taboo cards and Tapple turns, scoring, and categories.
