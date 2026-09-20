# Design — Game Shelf

A locked design system for this app. Every page — the shelf and every game —
reads this file before any visual change. Do not re-pick a theme per game;
extend or amend this file when the system needs to grow. Built and enforced
with the Hallmark design skill; see `/AGENTS.md` for how future agents must
consult it.

## System

- Genre · playful
- Theme · catalog: **Hum** (cream paper, multi-accent: pear-yellow / sky-cyan / coral-red, rounded sans)
- Axes · paper-band: light · display-style: rounded-sans · accent-hue: multi
- Macrostructure family · every surface is app-shaped, not marketing-shaped:
  - **Shelf (home)** · Index-First — a single list of game entries, no hero enrichment
  - **Games** · Workbench — a live playable surface with persistent chrome (header, board, action dock); each game's internal board layout is its own (Don't Say It is a card workbench, Category Sprint is a multi-panel board), but the header, footer, buttons, and tokens are identical

## Tokens (canonical · `tokens.css` is the source of truth)

`/tokens.css` is the single source of truth. `/games/dont-say-it/tokens.css` and
`/games/tapple/tokens.css` must stay **byte-identical** to it (every isolated
game folder keeps its own copy so it has no cross-folder import, but the
content never diverges). If you need a new token, add it to `/tokens.css`
first, then copy the whole file over both game copies — never hand-edit one
copy only.

```css
:root {
  --color-paper:  oklch(97% 0.012 95);   --color-paper-2: oklch(94% 0.016 95);
  --color-ink:    oklch(20% 0.012 250);  --color-muted:   oklch(44% 0.015 250);
  --color-accent: oklch(86% 0.18 95);    /* pear — primary */
  --color-cyan:   oklch(72% 0.14 235);   /* secondary / informative */
  --color-coral:  oklch(70% 0.19 22);    /* serious / negative action */
  --color-mint:   oklch(81% 0.12 150);   /* positive */
  --color-lavender: oklch(82% 0.09 305); /* rare accent, ≤1 use per page */

  --font-wordmark: "Bricolage Grotesque", ...;  /* "Game Shelf" brand text ONLY, everywhere */
  --font-display:  "Plus Jakarta Sans", ...;    /* all other headings/numerals */
  --font-body:     "Plus Jakarta Sans", ...;
  --font-label:    "JetBrains Mono", ...;       /* uppercase mono-label / eyebrow */

  --radius-pill: 999px; --radius-card: 1.25rem; --radius-lg: 1.75rem; /* never square corners */
}
```

Full token list lives in `/tokens.css` — don't duplicate values inline anywhere.

## The button system (copy verbatim — do not re-improvise)

One `.btn` base, defined identically in every stylesheet on the site. This is
the single most important consistency rule in this file: two different button
shadow formulas is exactly how the site drifted out of sync before this pass.

```css
.btn {
  --btn-face: var(--color-accent); --btn-ink: var(--color-accent-ink);
  --btn-edge: var(--color-accent-deep); --btn-cast: var(--color-shadow-accent);
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs);
  min-height: var(--control-height); padding: var(--space-sm) var(--space-lg);
  border: 0; border-radius: var(--radius-pill);
  background: var(--btn-face); color: var(--btn-ink); font-weight: 700; white-space: nowrap;
  box-shadow: 0 var(--space-2xs) 0 0 var(--btn-edge), 0 var(--space-sm) var(--space-md) calc(var(--space-2xs) * -1) var(--btn-cast);
  transform: translateY(0);
  transition: transform 140ms cubic-bezier(0.2,0.7,0.3,1), box-shadow 140ms cubic-bezier(0.2,0.7,0.3,1), background-color 160ms;
}
.btn:hover:not(:disabled)  { transform: translateY(-2px); }
.btn:active                { transform: translateY(var(--space-2xs)); transition-duration: 70ms; }
.btn:disabled              { opacity: 0.5; cursor: not-allowed; pointer-events: none; transform: none; }
```

- **Color modifiers** (pick by meaning, not by page): `.btn--pear` (default/primary — go), `.btn--mint` (positive), `.btn--coral` (serious / negative / penalizing action), `.btn--cyan` (secondary informative), `.btn--soft` (neutral secondary, flat, no colour edge), `.btn--outline` (tertiary ghost, hairline border). There is no separate "danger" colour — use `.btn--coral` for anything destructive or penalizing.
- **Size modifiers:** `.btn--sm` (2.75rem), default (3rem), `.btn--lg` (4.25rem).
- One push (`.btn--pear` or another filled colour) per primary moment. Don't stack more than one filled button in the same row.

## Shared chrome

- **Wordmark.** Every page's header starts with a link back to the shelf (`/` from the root, `../../` from a game folder), styled with `--font-wordmark`, weight 800, tracking `-0.035em`. A game page appends `/ <Game Name>` in the softer `--color-ink-soft` right after it, in `--font-display` — this suffix may hide below 30rem width, but the "Game Shelf" text itself is never hidden or clipped at any width.
- **Header actions.** Every game-page control (Rules, Setup, New game / Keys, Fullscreen) is a `.nav-link` pill (ghost background, fills on hover/press) or a `.btn--sm`. Header actions are **never** removed or `display: none`'d at any viewport width — they may wrap to a second row, but a control that exists on desktop must stay reachable on a phone. This was the concrete bug this pass fixed: Category Sprint's Rules button disappeared below 640px.
- **Footer.** Every page ends in the same **Statement** footer: one short display sentence (≤ 38ch), a hairline rule, then a muted meta row. No two pages repeat the same sentence. No scrolling/marquee text anywhere on the site — it reads as filler, not signal. **Exception:** a kiosk-style game screen (Category Sprint's board) may omit the footer while a round is active — the board's own min-heights already fill most laptop-height viewports, and the brief requires the timer, letter bank, and action dock to stay visible without scrolling. Show the footer on that game's welcome/setup screen only, where there's no time pressure and the room exists.
- **Mono-label / eyebrow.** `font-family: var(--font-label); font-size: var(--text-xs); letter-spacing: 0.075em; text-transform: uppercase;` — used for status words (`UP NOW`, `IN ROUND`, `FIRST TO 3`), never for full sentences.

## Per-surface allowances

- The shelf (root) lists games; it must not carry gameplay chrome (no timers, no scoreboards).
- Each game keeps its own board layout, its own JS state machine, and its own copy — those are the parts that make it a different game.
- A game MAY add its own small illustrative touches (Don't Say It's reacting brand-mark icon is one) — that's a per-surface accent, not a system component, so it doesn't need to be copied to other games.

## What every page MUST share

Tokens · the `.btn` system verbatim · the wordmark treatment · header actions that are never breakpoint-hidden · the Statement footer · the mono-label eyebrow style · type roles (wordmark / display / body / label) · spacing and radius scale.

## What pages MAY differ on

Internal board layout and mechanics · header action set (a game has Rules/Setup, the shelf doesn't need either) · a per-game illustrative accent · the footer's one sentence.

## Copy discipline

No filler. No repeated taglines across sections. No decorative scrolling text. State the mechanic once, plainly. See `/AGENTS.md` for the enforcement rule.

## Adding a new game

1. Read this file. Copy `/tokens.css` verbatim into the new game's folder (byte-identical, no edits).
2. Build its header, footer, and buttons from the "Shared chrome" and button system above — do not invent new component CSS for these.
3. Keep the game's own board, state, and copy in its own isolated folder (see `/README.md` § Structure).
4. Register it in `games/registry.js` and add its card to the shelf's `.game-index` in `/index.html`, following the existing `.game-entry` markup.
5. Append one entry to `.hallmark/log.json` recording the pick (macrostructure stays within the "Games" family above; theme stays Hum — do not diversify away from it).
