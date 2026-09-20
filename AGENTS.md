# Agents.md — rules for AI agents working in this repo

Read this before touching any file in this project. It exists because two
games were built independently by earlier agent sessions and drifted into
inconsistent themes, fonts, and button implementations — three different
`.btn` shadow formulas, a Rules button that vanished entirely on phone
widths, mismatched token values under the same theme name. `/design.md`
documents the fix and the system that now replaces all of that. This file
is the standing rule that keeps it from drifting again.

## 1. Consult the Hallmark design skill for any visual or UI work

Every visual change in this repo — a new game, a redesigned page, a new
component, even a single button — is governed by the **Hallmark** design
skill.

- Hallmark is **not** registered in this tool's skill list — it will not
  appear from a skill lookup or slash command. It lives on disk at:
  `~/.agents/skills/hallmark/SKILL.md` (+ `references/*.md` alongside it)
- To use it: read `SKILL.md` directly and follow it like a normal skill.
  Load files under `references/` only as `SKILL.md` itself tells you to at
  each step — it is written to be read incrementally, not all at once.
- If that path doesn't exist in your environment, say so explicitly and
  ask the user how to proceed. Don't silently invent your own design
  process instead.

## 2. `/design.md` is locked — read it before anything visual, and follow it

`/design.md` is this project's design system, produced by a Hallmark
multi-page redesign. On this project it overrides Hallmark's general
defaults:

- One theme (Hum), one token file, one `.btn` / `.nav-link` / `.icon-button`
  implementation, one wordmark treatment, one footer archetype — used
  identically by the shelf and every game.
- Hallmark's usual instinct to *diversify* each build is **inverted**
  here: pages must match the locked system, not differ from it. Don't
  pick a new theme, macrostructure, or button style "for variety" — that
  instinct is exactly what caused the original drift.
- If a genuinely new need doesn't fit `design.md` (a new interaction
  pattern, a new semantic button colour), **amend `design.md` first**,
  then build against the amended version. Never improvise a one-off
  component and leave the file stale — a stale system file is worse than
  no system file, because the next agent will trust it.
- `/tokens.css` is canonical. Copy it byte-for-byte into any new game's
  folder. Never hand-edit one game's copy independently — see § 4.

## 3. No extra text on the site

This project shipped with real bloat: a scrolling marquee that repeated
its own tagline, duplicate statements of the same idea across a page, and
copy that explained what the UI already showed. Keep it cut:

- Don't add a sentence to explain something the interface already makes
  obvious.
- No marketing language, no filler taglines, no restating the same claim
  twice on one page.
- Before adding any copy, ask: what does this tell the host that they
  don't already know? If nothing, cut it.
- No decorative scrolling/marquee text anywhere, ever — `design.md` § Shared
  chrome bans it outright.
- Follow the Hallmark `references/copy.md` rules: specific verbs, no stock
  phrases, no invented numbers.
- When unsure, ship less text, not more.

## 4. Keep the isolated-folder architecture

Every game owns its folder under `games/` — entry page, script, styles,
data, tests (see `/README.md` § Structure). Adding a game means creating a
new folder and registering it in `games/registry.js` plus the shelf's
`.game-index` in `/index.html`; it must never require editing another
game's files. The one exception, on purpose, is `tokens.css`: every game
keeps its own copy so the folder stays self-contained, but that copy must
never diverge from `/tokens.css`.

## 5. Before you call it done

- Run `npm test`.
- If you touched a game's CSS, HTML, or JS, open it at a phone width
  (~375px) and a normal desktop width and confirm nothing is clipped,
  overlapping, or removed by a breakpoint. A header control that exists on
  desktop must stay reachable on a phone — it may wrap to a second line,
  it must never `display: none`. (This is the exact bug that started this
  file: Category Sprint's Rules button disappeared below 640px.)
- If you ran a Hallmark build, append the entry to `.hallmark/log.json`
  per Hallmark's own convention.
