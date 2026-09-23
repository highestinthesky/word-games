# Game Shelf

Word games for one shared screen: a classroom smartboard, a TV, or a laptop
passed around a table. No accounts, no build step, no personal devices. Game
state lives in the browser's `localStorage`.

## Run it

```sh
npm run dev
```

Open `http://localhost:4173`. The server is Python's built-in `http.server`,
so you need `python3`. There's nothing to install.

## Games

| Game   | Folder               | Players    | Content        |
| ------ | -------------------- | ---------- | -------------- |
| Taboo  | `games/dont-say-it/` | 2–8 teams  | 683 cards      |
| Tapple | `games/tapple/`      | 2–8 players | 131 categories |

**Taboo:** describe the word on the card without saying any of its five
forbidden words. Rounds last 30–120 seconds.

| Key         | Action                |
| ----------- | --------------------- |
| `Space`     | Start or pause round  |
| `G` or `→`  | Got it                |
| `S` or `↓`  | Skip                  |
| `T` or `←`  | Taboo                 |

**Tapple:** name something in the category that starts with an unused
letter, take that letter, and pass the turn before the 10- or 15-second
timer runs out.

| Key       | Action                  |
| --------- | ----------------------- |
| `Space`   | Pause or resume turn    |
| `A`–`Z`   | Take a letter           |

The research and design brief behind Tapple is in
[docs/tapple-website-brief.md](docs/tapple-website-brief.md).

## Structure

```text
index.html, app.js, styles.css   # The shelf (home page / game selector)
tokens.css                       # Canonical design tokens
design.md                        # Locked design system
AGENTS.md                        # Rules for AI agents editing this repo
games/
  registry.js                    # List of games the shelf shows
  dont-say-it/                   # Taboo
  tapple/                        # Tapple
tests/                           # Shelf / registry tests
docs/                            # Design briefs
```

Each folder under `games/` is self-contained, with its own entry page,
scripts, styles, data, tests, and copy of `tokens.css`.

## Add a game

1. Create `games/<name>/` with an `index.html`, a `game.js` manifest, and
   whatever else the game needs. Don't import from another game's folder.
2. Copy `/tokens.css` into the folder unchanged.
3. Register the manifest in `games/registry.js` and add an entry to the
   `.game-index` list in `/index.html`.
4. Add the folder's tests to the `test` script in `package.json`.

Adding a game should never mean editing another game's files.

## Design rules

All pages share one theme, one token file, and one set of button, header,
and footer components, as defined in [design.md](design.md). Read it before
any visual change. If something new doesn't fit, amend `design.md` first.

`/tokens.css` is the source of truth. Each game's copy must stay
byte-identical to it, so edit the root file and copy it over every game.

## Test

```sh
npm test
```

Uses Node's built-in test runner with no dependencies. The tests cover the
game registry, the Taboo card deck and game logic, and Tapple categories,
turns, and scoring.
